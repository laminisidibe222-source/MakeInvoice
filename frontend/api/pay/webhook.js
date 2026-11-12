// /api/pay/webhook — Saspay IPN (Instant Payment Notification).
// Saspay POSTs here when the checkout state changes. The authoritative
// source of truth is always the /checkout-invoice/confirm endpoint, never
// the webhook body itself. Upgrades are idempotent.
import { query } from "../_lib/db.js";
import { saspayConfirmCheckout } from "../_lib/saspay.js";
import { completePayment } from "../_lib/plans.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: "DATABASE_URL is not configured on the server." });
  }

  // Saspay posts { data: { token } } (PayDunya-style IPN).
  const data = req.body?.data ?? req.body ?? {};
  const token = String(data?.token ?? "").trim();
  if (!token) {
    return res.status(400).json({ error: "Invalid webhook payload." });
  }

  try {
    // Authoritative check with Saspay.
    const verifyData = await saspayConfirmCheckout(token);
    const status = String(verifyData?.status ?? "").toLowerCase();
    console.log("[pay/webhook] confirm status:", status, "token:", token);

    if (status !== "completed") {
      return res.status(200).json({ received: true, status });
    }

    // Find the pending payment. Prefer the exact token the user owns.
    const [pending] = await query(
      `select user_id, plan from public.payments
        where provider_token = $1 limit 1`,
      [token]
    );
    if (!pending) {
      console.error("[pay/webhook] unknown provider token:", token);
      return res.status(200).json({ received: true, unknown: true });
    }

    await completePayment(token);
    console.log(`[pay/webhook] user ${pending.user_id} upgraded to ${pending.plan}`);
    return res.status(200).json({ received: true, status: "completed" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook error.";
    console.error("[pay/webhook] error:", err);
    return res.status(500).json({ error: message });
  }
}
