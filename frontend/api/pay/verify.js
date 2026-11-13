// /api/pay/verify — confirm the checkout session against SasPay and complete it.
// Used by the /payment/success page as a fallback when the IPN is delayed.
// Idempotent: a session already marked completed is a no-op.
import { query } from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";
import { getCheckoutSessionStatus } from "../_lib/saspay.js";
import { upgradePlan } from "../_lib/plans.js";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed." });
  }
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: "DATABASE_URL is not configured on the server." });
  }
  if (!process.env.SASPAY_API_KEY) {
    return res.status(503).json({ error: "SasPay is not configured on this deployment yet." });
  }
  const auth = await requireAuth(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

  const url = new URL(req.url ?? "http://localhost/", "http://localhost/");
  const tokenParam =
    url.searchParams.get("token") ??
    url.searchParams.get("session") ??
    String(req.body?.token ?? req.query?.token ?? "").trim() ??
    "";
  const token = String(tokenParam ?? "").trim();

  try {
    // Token = checkout session id; default to the user's latest pending payment.
    let target = token;
    if (!target) {
      const rows = await query(
        `select provider_token from public.payments
          where user_id = $1 and status = 'pending'
          order by created_at desc`,
        [auth.user.id]
      );
      // Pick the most recent attempt that actually produced a SasPay session.
      target = rows.find((r) => r.provider_token)?.provider_token ?? "";
    }
    if (!target) {
      return res.status(200).json({ status: "no_pending_payment" });
    }

    // Make sure the session belongs to this user (if a token was supplied).
    if (token) {
      const rows = await query(
        `select id from public.payments
          where provider_token = $1 and user_id = $2 limit 1`,
        [target, auth.user.id]
      );
      if (rows.length === 0) return res.status(404).json({ error: "Payment not found." });
    }

    const { ok, payload } = await getCheckoutSessionStatus(target);
    const rawStatus = String(payload?.data?.status ?? payload?.status ?? "").toUpperCase();
    console.log("[pay/verify] status:", ok ? rawStatus : "(request failed)", "session:", target);

    if (ok && rawStatus === "SUCCESS") {
      const updated = await query(
        `update public.payments
            set status = 'completed', updated_at = now()
          where provider_token = $1 and status <> 'completed'
          returning user_id, plan`,
        [target]
      );
      if (updated.length > 0) {
        await upgradePlan(updated[0].user_id, updated[0].plan);
        console.log(`[pay/verify] user ${updated[0].user_id} upgraded to ${updated[0].plan}`);
      }
      return res.status(200).json({ status: "completed", already: updated.length === 0 });
    }

    if (rawStatus) {
      return res.status(200).json({ status: rawStatus });
    }
    return res.status(502).json({ error: "SasPay could not confirm this session.", details: payload });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error.";
    console.error("[pay/verify] error:", err);
    return res.status(500).json({ error: message });
  }
}
