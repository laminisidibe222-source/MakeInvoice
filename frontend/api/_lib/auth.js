// App-level auth for serverless functions (/api/*).
// No Supabase Auth: users live in public.users (bcrypt hashes), sessions are
// HS256 JWTs carrying { sub, email }, one-time tokens are SHA-256-hashed and
// single-use in public.auth_tokens.
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "./db.js";

const JWT_TTL = "7d";
export const TOKEN_TTL_MS = {
  magic: 15 * 60 * 1000, // 15 minutes
  reset: 60 * 60 * 1000, // 1 hour
};

export function requireJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET is not configured. Set a long random string in the environment (e.g. `openssl rand -hex 32`)."
    );
  }
  return secret;
}

export function signSessionToken(payload) {
  return jwt.sign(payload, requireJwtSecret(), {
    algorithm: "HS256",
    expiresIn: JWT_TTL,
  });
}

export function verifySessionToken(token) {
  try {
    const decoded = jwt.verify(token, requireJwtSecret(), {
      algorithms: ["HS256"],
    });
    if (typeof decoded?.sub !== "string" || typeof decoded?.email !== "string") {
      return null;
    }
    return { sub: decoded.sub, email: decoded.email };
  } catch {
    return null;
  }
}

export function bearerToken(req) {
  const raw = req.headers?.authorization ?? req.headers?.Authorization;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !value.startsWith("Bearer ")) return null;
  return value.slice(7).trim() || null;
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

export function generateOpaqueToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashOpaqueToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function tokenExpiresAt(ttlMs) {
  return new Date(Date.now() + ttlMs);
}

// ─── User / profile lookups ─────────────────────────────────────
export async function findUserByEmail(email) {
  const rows = await query(
    "select id, email, password_hash from public.users where lower(email) = lower($1) limit 1",
    [email]
  );
  return rows[0] ?? null;
}

export async function findUserById(id) {
  const rows = await query(
    "select id, email from public.users where id = $1 limit 1",
    [id]
  );
  return rows[0] ?? null;
}

export async function findProfileByUserId(userId) {
  const rows = await query(
    `select id, email, full_name, company_name, company_address, company_phone,
            plan, invoices_generated, invoices_limit, created_at, updated_at
       from public.profiles where id = $1 limit 1`,
    [userId]
  );
  return rows[0] ?? null;
}

export function sessionPayload(userId, email) {
  return {
    session: {
      access_token: signSessionToken({ sub: userId, email }),
      token_type: "bearer",
      user: { id: userId, email },
    },
    user: { id: userId, email },
  };
}

/** Verify the Authorization header; returns the caller's id + email. */
export async function requireAuth(req) {
  const token = bearerToken(req);
  if (!token) {
    return { ok: false, status: 401, error: "Missing Authorization header." };
  }
  if (!process.env.JWT_SECRET) {
    return {
      ok: false,
      status: 500,
      error: "JWT_SECRET is not configured on the server.",
    };
  }
  const payload = verifySessionToken(token);
  if (!payload) {
    return { ok: false, status: 401, error: "Session is expired or invalid." };
  }
  const user = await findUserById(payload.sub);
  if (!user) {
    return { ok: false, status: 401, error: "Account no longer exists." };
  }
  const profile = await findProfileByUserId(user.id);
  if (!profile) {
    return { ok: false, status: 401, error: "No profile found for this account." };
  }
  return { ok: true, user: { id: user.id, email: user.email }, profile };
}

/** Public base URL used for payment return/cancel URLs. */
export function appBaseUrl() {
  return (
    process.env.VITE_APP_URL ??
    process.env.APP_URL ??
    "http://localhost:5173"
  );
}

/** Whether to reveal one-time links (magic / reset) in API responses (dev). */
export function devLinksEnabled() {
  if (process.env.AUTH_DEV_EXPOSE_LINKS === "true") return true;
  return process.env.NODE_ENV !== "production";
}

/** Create a one-time token of `type` for `userId`; returns the raw token. */
export async function createAuthToken(userId, type) {
  const token = generateOpaqueToken();
  const expiresAt = tokenExpiresAt(TOKEN_TTL_MS[type]);
  await query(
    `insert into public.auth_tokens (user_id, type, token_hash, expires_at)
     values ($1, $2, $3, $4)`,
    [userId, type, hashOpaqueToken(token), expiresAt]
  );
  return { token, expiresAt };
}

/** Consume a one-time token of `type`; returns the owning user id or null. */
export async function consumeAuthToken(token, type) {
  const rows = await query(
    `update public.auth_tokens
        set used_at = now()
      where token_hash = $1
        and type = $2
        and used_at is null
        and expires_at > now()
      returning user_id`,
    [hashOpaqueToken(token), type]
  );
  return rows[0]?.user_id ?? null;
}
