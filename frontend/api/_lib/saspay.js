// /api/_lib/saspay.js — Saspay REST client (PayDunya-compatible contract).
//
// Saspay (like PayDunya) is a West-African mobile-money checkout gateway.
// The merchant flow is:
//   1. POST {base}/checkout-invoice/create  → { response_code: "00", response_text: <url>, token }
//   2. User pays on the hosted page.
//   3. Saspay calls your callback (IPN) with { data: { token } }  (or nothing — poll fallback below)
//   4. GET  {base}/checkout-invoice/confirm/:token → { status: "completed" | "pending" | … }
//
// The exact endpoint paths are env-tunable in case your Saspay dashboard says
// otherwise: SASPAY_BASE_URL overrides the mode-derived base entirely.
//
// Headers are the Saspay merchant keys (same shape as PayDunya):
//   SASPAY-MASTER-KEY, SASPAY-PRIVATE-KEY, SASPAY-TOKEN
//
// If your SASpay dashboard issues a different webhook signature scheme,
// adapt verifyWebhookSignature() below — currently we confirm by fetching
// the /confirm endpoint server-side (source of truth), which is how the
// previous PayDunya integration verified payments as well.
const MODE = process.env.SASPAY_MODE === "production" ? "production" : "test";

export const SASPAY_MODE = MODE;

const DEFAULT_BASE =
  MODE === "production"
    ? "https://app.saspay.com/api/v1"
    : "https://app.saspay.com/sandbox-api/v1";

export const SASPAY_BASE = (process.env.SASPAY_BASE_URL ?? DEFAULT_BASE).replace(/\/+$/, "");

function saspayHeaders() {
  if (!process.env.SASPAY_MASTER_KEY || !process.env.SASPAY_PRIVATE_KEY || !process.env.SASPAY_TOKEN) {
    throw new Error(
      "Saspay keys are not configured (SASPAY_MASTER_KEY / SASPAY_PRIVATE_KEY / SASPAY_TOKEN)."
    );
  }
  return {
    "Content-Type": "application/json",
    "SASPAY-MASTER-KEY": process.env.SASPAY_MASTER_KEY,
    "SASPAY-PRIVATE-KEY": process.env.SASPAY_PRIVATE_KEY,
    "SASPAY-TOKEN": process.env.SASPAY_TOKEN,
  };
}

/** Create a checkout invoice. Returns the raw decoded response. */
export async function saspayCreateCheckout(payload) {
  const res = await fetch(`${SASPAY_BASE}/checkout-invoice/create`, {
    method: "POST",
    headers: saspayHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

/** Confirm a previously created checkout by its token. Returns the raw decoded response. */
export async function saspayConfirmCheckout(token) {
  const res = await fetch(`${SASPAY_BASE}/checkout-invoice/confirm/${encodeURIComponent(token)}`, {
    method: "GET",
    headers: saspayHeaders(),
  });
  return res.json();
}

/** Plan configuration — amounts in FCFA (XOF), no decimals. */
export const PLANS = {
  starter: { name: "Starter", amount: 4500, limit: 10, label: "MakeInvoice Starter — 10 factures" },
  pro: { name: "Pro", amount: 7500, limit: 30, label: "MakeInvoice Pro — 30 factures" },
  business: { name: "Business", amount: 12000, limit: 100, label: "MakeInvoice Business — 100 factures" },
};
