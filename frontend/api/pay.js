// /api/pay — create a Saspay checkout for a plan.
// The browser sends { plan }; we return { checkout_url, token }.
// The webhook (/api/pay/webhook) and the confirm endpoint (/api/pay/verify)
// complete the upgrade idempotently.
import { query } from "./_lib/db.js";
import { requireAuth, appBaseUrl } from "./_lib/auth.js";
import { PLANS, saspayCreateCheckout } from "./_lib/saspay.js";

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

    const baseUrl = process.env.BACKEND_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : base);

    const payload = {
      invoice: {
        total_amount: planConfig.amount,
        description: planConfig.label,
      },
      store: {
        name: "MakeInvoice",
        tagline: "Générateur de factures professionnel",
        website_url: base,
      },
      custom_data: {
        user_id: auth.user.id,
        user_email: auth.user.email,
        plan,
      },
      actions: {
        // Saspay calls this URL (IPN) when the payment state changes.
        callback_url: `${baseUrl}/api/pay/webhook`,
        // The success page polls /api/pay/verify (no token needed) to
        // complete/confirm the pending payment for this user.
        return_url: `${base}/payment/success`,
        cancel_url: `${base}/payment/cancel`,
      },
    };

    const data = await saspayCreateCheckout(payload);

    if (data?.response_code !== "00") {
      console.error("[pay] Saspay create response:", JSON.stringify(data));
      await query(
        `update public.payments set status = 'failed', updated_at = now() where id = $1`,
        [pending.id]
      );
      return res.status(502).json({
        error: "Payment could not be created. Please try again.",
        details: data,
      });
    }

    await query(
      `update public.payments
          set provider_token = $1,
              metadata = $2::jsonb,
              updated_at = now()
        where id = $3`,
      [
        data.token,
        JSON.stringify({ ...(typeof data === "object" ? data : {}), checkout_url: data.response_text }),
        pending.id,
      ]
    );

    return res.status(200).json({
      checkout_url: data.response_text,
      token: data.token,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error.";
    console.error("[pay] error:", err);
    return res.status(500).json({ error: message });
  }
}
