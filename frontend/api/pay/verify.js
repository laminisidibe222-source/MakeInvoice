// /api/pay/verify — confirm the latest pending payment (or a given token)
// with Saspay, complete it, and upgrade the plan. Idempotent.
// Used by the /payment/success page as a fallback when the IPN is delayed.
import { query } from "../_lib/db.js";
import { requireAuth } from "../_lib/auth.js";
import { saspayConfirmCheckout } from "../_lib/saspay.js";
import { completePayment } from "../_lib/plans.js";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed." });
  }
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: "DATABASE_URL is not configured on the server." });
  }
  const auth = await requireAuth(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

  // Token from query string or body, else the user's latest pending payment.
  const url = new URL(req.url ?? "http://localhost/", "http://localhost/");
  const tokenParam =
    url.searchParams.get("token") ??
    String(req.body?.token ?? req.query?.token ?? "").trim() ??
    "";
  const token = String(tokenParam ?? "").trim();

  try {
    let targetToken = token;
    if (!targetToken) {
      const rows = await query(
        `select provider_token from public.payments
          where user_id = $1 and status = 'pending'
          order by created_at desc`,
        [auth.user.id]
      );
      // Pick the most recent attempt that actually produced a Saspay token.
      targetToken = rows.find((r) => r.provider_token)?.provider_token ?? "";
    }
    if (!targetToken) {
      return res.status(200).json({ status: "no_pending_payment" });
    }

    // Make sure the token belongs to this user (if one was supplied).
    if (token) {
      const rows = await query(
        `select id from public.payments where provider_token = $1 and user_id = $2 limit 1`,
        [targetToken, auth.user.id]
      );
      if (rows.length === 0) return res.status(404).json({ error: "Payment not found." });
    }

    const verifyData = await saspayConfirmCheckout(targetToken);
    const status = String(verifyData?.status ?? "").toLowerCase();
    console.log("[pay/verify] status:", status, "token:", targetToken);

    if (status === "completed") {
      const result = await completePayment(targetToken);
      return res.status(200).json({ status: "completed", already: result.alreadyCompleted === true });
    }
    return res.status(200).json({ status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error.";
    console.error("[pay/verify] error:", err);
    return res.status(500).json({ error: message });
  }
}
