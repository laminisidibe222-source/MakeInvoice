// /api/pay/webhook — SasPay IPN webhook.
// SasPay signs every request with X-Webhook-Signature + X-Webhook-Timestamp:
//   HMAC-SHA256(`{timestamp}.{raw_body}`, signing_secret) — hex, constant-time.
// This function MUST see the raw body (bodyParser disabled) to verify it.
// Delivery is idempotent: the payments row flips pending → completed exactly once.
export const config = { api: { bodyParser: false } };

import { query } from "../_lib/db.js";
import { verifyWebhook } from "../_lib/saspay.js";
import { upgradePlan } from "../_lib/plans.js";

export const runtime = "nodejs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: "DATABASE_URL is not configured on the server." });
  }

  // ── Read the raw body (signature covers the bytes as received) ──
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const rawBody = Buffer.concat(chunks);

  const check = verifyWebhook(rawBody, req.headers ?? {});
  if (!check.ok) {
    console.error("[pay/webhook] rejected:", check.error);
    return res.status(401).json({ error: check.error });
  }

  const { event, data } = check;
  console.log("[pay/webhook] event:", event);

  // Test ping: acknowledge without touching anything.
  if (event === "webhook.test") {
    return res.status(200).json({ received: true, test: true });
  }

  if (event === "transaction.success") {
    // Prefer identifying by checkout session id stored at creation time.
    const sessionId =
      data?.checkout_session_id ?? data?.id ?? data?.payment?.checkout_session_id ?? null;
    const metadata = data?.metadata ?? data?.payment?.metadata ?? null;
    const userId = metadata?.user_id ?? data?.user_id ?? null;
    const plan = metadata?.plan ?? null;

    try {
      if (sessionId) {
        const updated = await query(
          `update public.payments
              set status = 'completed', updated_at = now()
            where provider_token = $1 and status <> 'completed'
            returning user_id, plan`,
          [sessionId]
        );
        if (updated.length > 0) {
          await upgradePlan(updated[0].user_id, updated[0].plan);
          console.log(`[pay/webhook] user ${updated[0].user_id} upgraded to ${updated[0].plan}`);
          return res.status(200).json({ received: true, status: "completed" });
        }
        // Already completed or unknown — check the table by id.
        const rows = await query(
          `select user_id, plan, status from public.payments where provider_token = $1 limit 1`,
          [sessionId]
        );
        if (rows[0]) {
          return res.status(200).json({ received: true, status: rows[0].status ?? "completed" });
        }
      }

      // Fallback: upgrade by (user_id, plan) from event metadata — only if the
      // user still has the plan's quota unspent and it isn't already that plan.
      if (userId && plan) {
        await upgradePlan(userId, plan);
        await query(
          `update public.payments
              set status = 'completed', updated_at = now()
            where user_id = $1 and plan = $2 and status <> 'completed'`,
          [userId, plan]
        );
        return res.status(200).json({ received: true, status: "completed", source: "metadata" });
      }

      console.warn("[pay/webhook] transaction.success without identifiable payment:", JSON.stringify(data));
      return res.status(200).json({ received: true, unmatched: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Webhook error.";
      console.error("[pay/webhook] error:", err);
      return res.status(500).json({ error: message });
    }
  }

  if (event === "transaction.failed" || event === "transaction.cancelled") {
    const sessionId =
      data?.checkout_session_id ?? data?.id ?? data?.payment?.checkout_session_id ?? null;
    if (sessionId) {
      await query(
        `update public.payments
            set status = $2, updated_at = now()
          where provider_token = $1 and status <> 'completed'`,
        [sessionId, event === "transaction.failed" ? "failed" : "cancelled"]
      );
    }
    return res.status(200).json({ received: true, status: event });
  }

  // Unknown/other events: acknowledge so SasPay stops retrying.
  return res.status(200).json({ received: true });
}
