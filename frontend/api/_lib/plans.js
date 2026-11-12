// Plan / quota helpers shared by payment endpoints.
import { query } from "./db.js";
import { PLANS } from "./saspay.js";

export function planAmount(plan) {
  return PLANS[plan]?.amount ?? null;
}
export function planLimit(plan) {
  return PLANS[plan]?.limit ?? null;
}
export function planLabel(plan) {
  return PLANS[plan]?.label ?? null;
}

/** Upgrade a user's plan (idempotent): plan + limit, quota counter resets. */
export async function upgradePlan(userId, plan) {
  const limit = planLimit(plan);
  if (!limit) throw new Error(`Unknown plan "${plan}"`);
  await query(
    `update public.profiles
        set plan = $1, invoices_limit = $2, invoices_generated = 0, updated_at = now()
      where id = $3`,
    [plan, limit, userId]
  );
}

/**
 * Mark a pending payment as completed and upgrade the buyer's plan.
 * Idempotent: a payment already marked completed is a no-op.
 * Returns { alreadyCompleted: boolean }.
 */
export async function completePayment(providerToken) {
  const updated = await query(
    `update public.payments
        set status = 'completed', updated_at = now()
      where provider_token = $1 and status <> 'completed'
      returning user_id, plan`,
    [providerToken]
  );
  if (updated.length > 0) {
    const { user_id, plan } = updated[0];
    await upgradePlan(user_id, plan);
    return { user_id, plan, alreadyCompleted: false };
  }
  // Was already completed (or never existed) — no double upgrade.
  const rows = await query(
    `select user_id, plan, status from public.payments where provider_token = $1 limit 1`,
    [providerToken]
  );
  return { alreadyCompleted: rows[0]?.status === "completed", missing: rows.length === 0 };
}
