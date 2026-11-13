// /api/pay — create a SasPay hosted-checkout session for a plan.
// The browser gets { checkout_url } and redirects there; the webhook
// (/api/pay/webhook) upgrades the plan automatically (verified server-side).
import { query } from "./_lib/db.js";
import { requireAuth, appBaseUrl } from "./_lib/auth.js";
import { PLANS, createCheckoutSession, toDecimalString } from "./_lib/saspay.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: "DATABASE_URL is not configured on the server." });
  }
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: "JWT_SECRET is not configured on the server." });
  }
  if (!process.env.SASPAY_API_KEY) {
    return res.status(503).json({ error: "SasPay is not configured on this deployment yet." });
  }
  const auth = await requireAuth(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

  const plan = String(req.body?.plan ?? "").trim().toLowerCase();
  const planConfig = PLANS[plan];
  if (!planConfig) {
    return res.status(400).json({ error: "Invalid plan." });
  }

  const base = appBaseUrl();

  try {
    // Log the pending attempt first so the webhook can reconcile it.
    const [pending] = await query(
      `insert into public.payments (user_id, plan, amount, currency, provider, status, metadata)
       values ($1, $2, $3, 'XOF', 'saspay', 'pending', '{}'::jsonb)
       returning id`,
      [auth.user.id, plan, planConfig.amount]
    );

    const { ok, payload } = await createCheckoutSession({
      amount: toDecimalString(planConfig.amount),
      currency: "XOF",
      country: "SN",
      description: planConfig.label,
      customerEmail: auth.user.email,
      customerName: auth.profile?.full_name ?? auth.user.email,
      returnUrl: `${base}/payment/success`,
      metadata: { user_id: auth.user.id, plan },
    });

    const sessionId = payload?.data?.id ?? null;
    const checkoutUrl = payload?.data?.checkout_url ?? null;

    if (!ok || !sessionId || !checkoutUrl) {
      console.error("[pay] SasPay create-session failed:", JSON.stringify(payload));
      await query(`update public.payments set status = 'failed', updated_at = now() where id = $1`, [pending.id]);
      return res.status(502).json({
        error: "Payment could not be created. Please try again.",
        details: payload,
      });
    }

    await query(
      `update public.payments
          set provider_token = $1,
              metadata = $2::jsonb,
              updated_at = now()
        where id = $3`,
      [
        sessionId,
        JSON.stringify({ checkout_session_id: sessionId, ...(payload?.data ?? {}) }),
        pending.id,
      ]
    );

    return res.status(200).json({ checkout_url: checkoutUrl, session_id: sessionId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error.";
    console.error("[pay] error:", err);
    return res.status(500).json({ error: message });
  }
}
