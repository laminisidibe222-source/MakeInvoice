// /api/auth — app-level auth (replaces Supabase Auth).
// POST { action, ... } with action in:
//   signup | signin | magic | magic-consume | reset | update-password | me
// Sessions are HS256 JWTs in public.users + public.profiles.
import { query } from "./_lib/db.js";
import {
  createAuthToken,
  consumeAuthToken,
  devLinksEnabled,
  hashPassword,
  findProfileByUserId,
  findUserByEmail,
  appBaseUrl,
  requireAuth,
  sessionPayload,
  verifyPassword,
} from "./_lib/auth.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LEN = 6;

function json(res, status, body) {
  return res.status(status).json(body);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed. Use POST." });
  }
  if (!process.env.DATABASE_URL) {
    return json(res, 500, { error: "DATABASE_URL is not configured on the server." });
  }
  if (!process.env.JWT_SECRET) {
    return json(res, 500, { error: "JWT_SECRET is not configured on the server." });
  }

  const body = req.body ?? {};
  const action = String(body.action ?? "").trim().toLowerCase();

  switch (action) {
    // ── Create account: user + profile in one flow ─────────────────
    case "signup": {
      const email = String(body.email ?? "").trim().toLowerCase();
      const password = String(body.password ?? "");
      const fullName = String(body.fullName ?? body.full_name ?? "").trim();

      if (!EMAIL_RE.test(email)) return json(res, 400, { error: "Enter a valid email address." });
      if (password.length < MIN_PASSWORD_LEN)
        return json(res, 400, { error: "Password must be at least 6 characters." });
      if (!fullName) return json(res, 400, { error: "Full name is required." });

      const existing = await findUserByEmail(email);
      if (existing) return json(res, 409, { error: "An account already exists for this email." });

      const passwordHash = await hashPassword(password);
      const [user] = await query(
        "insert into public.users (email, password_hash) values ($1, $2) returning id",
        [email, passwordHash]
      );
      if (!user?.id) return json(res, 500, { error: "Failed to create your account." });
      const userId = user.id;

      await query(
        `insert into public.profiles (id, email, full_name, plan, invoices_generated, invoices_limit)
         values ($1, $2, $3, 'starter', 0, 10)`,
        [userId, email, fullName]
      );

      const result = sessionPayload(userId, email);
      return json(res, 200, { ...result, profile: await findProfileByUserId(userId) });
    }

    // ── Email + password sign in ─────────────────────────────────────
    case "signin": {
      const email = String(body.email ?? "").trim().toLowerCase();
      const password = String(body.password ?? "");
      if (!EMAIL_RE.test(email) || !password)
        return json(res, 400, { error: "Enter a valid email and password." });

      const user = await findUserByEmail(email);
      const ok = user ? await verifyPassword(password, user.password_hash) : false;
      if (!user || !ok) return json(res, 401, { error: "Invalid email or password." });

      const profile = await findProfileByUserId(user.id);
      const result = sessionPayload(user.id, user.email);
      return json(res, 200, { ...result, profile });
    }

    // ── Magic link: issue one-time sign-in link ──────────────────────
    case "magic": {
      const email = String(body.email ?? "").trim().toLowerCase();
      if (!EMAIL_RE.test(email)) return json(res, 400, { error: "Enter a valid email address." });

      const user = await findUserByEmail(email);
      if (user) {
        const { token } = await createAuthToken(user.id, "magic");
        const link = `${appBaseUrl()}/login?magic=${token}`;
        if (devLinksEnabled()) {
          return json(res, 200, { ok: true, devLink: link });
        }
        // TODO: wire an email provider (Resend/SendGrid/SES) to deliver `link`.
        console.log(`[auth] magic link for ${email}: ${link}`);
      }
      return json(res, 200, { ok: true });
    }

    // ── Magic link: consume token, sign in ────────────────────────────
    case "magic-consume": {
      const token = String(body.token ?? "").trim();
      if (!token) return json(res, 400, { error: "Missing token." });
      const userId = await consumeAuthToken(token, "magic");
      if (!userId) return json(res, 400, { error: "This link has expired or was already used." });
      const profile = await findProfileByUserId(userId);
      const email = String(profile?.email ?? "");
      const result = sessionPayload(userId, email);
      return json(res, 200, { ...result, profile });
    }

    // ── Password reset: issue one-time link ───────────────────────────
    case "reset": {
      const email = String(body.email ?? "").trim().toLowerCase();
      if (!EMAIL_RE.test(email)) return json(res, 400, { error: "Enter a valid email address." });

      const user = await findUserByEmail(email);
      if (user) {
        const { token } = await createAuthToken(user.id, "reset");
        const link = `${appBaseUrl()}/update-password?token=${token}`;
        if (devLinksEnabled()) {
          return json(res, 200, { ok: true, devLink: link });
        }
        // TODO: wire an email provider (Resend/SendGrid/SES) to deliver `link`.
        console.log(`[auth] password reset link for ${email}: ${link}`);
      }
      return json(res, 200, { ok: true });
    }

    // ── Password reset: consume token, set new password ───────────────
    case "update-password": {
      const password = String(body.password ?? "");
      if (password.length < MIN_PASSWORD_LEN)
        return json(res, 400, { error: "Password must be at least 6 characters." });

      const token = String(body.token ?? "").trim();
      const newHash = await hashPassword(password);

      if (token) {
        const userId = await consumeAuthToken(token, "reset");
        if (!userId)
          return json(res, 400, { error: "This reset link has expired or was already used." });
        await query("update public.users set password_hash = $1 where id = $2", [newHash, userId]);
        return json(res, 200, { ok: true });
      }

      // Session-mode: change the password for the currently signed-in user.
      const auth = await requireAuth(req);
      if (!auth.ok) return json(res, auth.status, { error: auth.error });
      await query("update public.users set password_hash = $1 where id = $2", [
        newHash,
        auth.user.id,
      ]);
      return json(res, 200, { ok: true });
    }

    // ── Current session: refresh user + profile ───────────────────────
    case "me": {
      const auth = await requireAuth(req);
      if (!auth.ok) return json(res, auth.status, { error: auth.error });
      const result = sessionPayload(auth.user.id, auth.user.email);
      return json(res, 200, { ...result, profile: auth.profile });
    }

    default:
      return json(res, 400, { error: `Unknown auth action "${action}".` });
  }
}
