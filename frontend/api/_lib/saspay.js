// /api/_lib/saspay.js — SasPay REST client (https://api.saspay.me/api/v1)
// Spec: /api-reference/openapi.json at api.saspay.me (see project SKILL.md).
//
// Key facts from the spec that this client respects:
//   * Auth: `Authorization: Bearer sk_test_…` (sandbox) or `sk_live_…` (prod),
//     `sk_live_…` never in the browser / logs / git.
//   * Amounts are DECIMAL STRINGS ("4500.00"), never numbers.
//   * Server-side verify before delivering: `GET /payments/{id}/verify/`
//     (or `/checkout-sessions/{id}/status/`), and only `SUCCESS` delivers.
//   * Money-moving routes take an `Idempotency-Key` (same key, same body for retries).
//   * Webhooks: `X-Webhook-Signature` (HMAC-SHA256 hex of `{timestamp}.{raw_body}`
//     with the `signing_secret`), `X-Webhook-Timestamp` (unix seconds, ±300 s window).
//
// Env:
//   SASPAY_API_KEY          — required. sk_test_… in dev, sk_live_… in prod.
//   SASPAY_WEBHOOK_SECRET   — signing_secret shown once at webhook creation.
//   APP_URL                 — public base URL (https://, no trailing slash).
const SASPAY_BASE_URL = "https://api.saspay.me/api/v1";
import crypto from "node:crypto";

export function saspayConfig() {
  const apiKey = process.env.SASPAY_API_KEY;
  if (!apiKey) {
    throw new Error(
      "SASPAY_API_KEY is not configured. Generate a key in the SasPay dashboard (Développeur) and set it in .env / Vercel env vars."
    );
  }
  return { apiKey };
}

/** Authenticated fetch against the SasPay API. */
async function saspayFetch(path, { method = "GET", body, idempotencyKey } = {}) {
  const { apiKey } = saspayConfig();
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  const res = await fetch(`${SASPAY_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let payload;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }
  return { ok: res.ok, status: res.status, payload };
}

/** Create a hosted-checkout session (client picks Wave / Orange Money / card). */
export async function createCheckoutSession({
  amount,
  currency = "XOF",
  description,
  customerEmail,
  customerName,
  customerPhone,
  returnUrl,
  metadata,
  country = "SN",
  idempotencyKey,
}) {
  const { ok, status, payload } = await saspayFetch("/checkout-sessions/", {
    method: "POST",
    body: {
      amount: String(amount), // decimal string ("4500.00")
      currency,
      description,
      customer_email: customerEmail,
      customer_name: customerName,
      ...(customerPhone ? { customer_phone: customerPhone } : {}),
      country,
      ...(returnUrl ? { return_url: returnUrl } : {}),
      ...(metadata ? { metadata } : {}),
    },
    idempotencyKey,
  });
  return { ok: ok && payload?.success !== false, status, payload };
}

/** Checkout session status (suffix status, e.g. "PENDING", "SUCCESS"). */
export async function getCheckoutSessionStatus(id) {
  const { ok, status, payload } = await saspayFetch(`/checkout-sessions/${id}/status/`);
  return { ok: ok && payload?.success !== false, status, payload };
}

/** Verify a payment by id (authoritative for delivering a purchase). */
export async function verifyPayment(paymentId) {
  const { ok, status, payload } = await saspayFetch(`/payments/${paymentId}/verify/`);
  return { ok: ok && payload?.success !== false, status, payload };
}

// ─── Webhooks ────────────────────────────────────────────────────
export function webhookSecret() {
  const secret = process.env.SASPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("SASPAY_WEBHOOK_SECRET is not configured.");
  }
  return secret;
}

/**
 * Verify a SasPay webhook (raw body required).
 * Returns { ok: true, event, data } or { ok: false, error }.
 * Order: timestamp window → HMAC-SHA256 hex of `${timestamp}.${raw}` signed
 * with the webhook signing_secret → constant-time compare.
 */
export function verifyWebhook(rawBody, headers) {
  const signature =
    headers["x-webhook-signature"] ?? headers["X-Webhook-Signature"];
  const timestamp =
    headers["x-webhook-timestamp"] ?? headers["X-Webhook-Timestamp"];
  if (!signature || !timestamp) {
    return { ok: false, error: "Missing X-Webhook-Signature or X-Webhook-Timestamp." };
  }
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return { ok: false, error: "Bad timestamp." };
  if (Math.abs(Date.now() / 1000 - ts) > 300) {
    return { ok: false, error: "Webhook timestamp outside the 5-minute window." };
  }
  const signed = `${timestamp}.${rawBody.toString("utf8")}`;
  const secret = webhookSecret();
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signed)
    .digest("hex");
  const a = Buffer.from(String(signature), "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, error: "Signature mismatch." };
  }
  let event;
  let data;
  try {
    const parsed = JSON.parse(rawBody.toString("utf8"));
    event = parsed?.event ?? parsed?.data?.event ?? null;
    data = parsed?.data ?? null;
  } catch {
    return { ok: false, error: "Malformed JSON body." };
  }
  return { ok: true, event, data };
}

// ─── Plans (source of truth for prices; amounts in FCFA XOF) ─────
export const PLANS = {
  starter:  { name: "Starter",  amount: 4500,  limit: 10,  label: "MakeInvoice Starter — 10 factures" },
  pro:      { name: "Pro",      amount: 7500,  limit: 30,  label: "MakeInvoice Pro — 30 factures" },
  business: { name: "Business", amount: 12000, limit: 100, label: "MakeInvoice Business — 100 factures" },
};

/** Convert a plan amount to the decimal STRING SasPay expects. */
export function toDecimalString(amount) {
  return Number(amount || 0).toFixed(2);
}
