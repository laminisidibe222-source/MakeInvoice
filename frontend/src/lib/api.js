// ─── Frontend API helper ──────────────────────────────────────
// The browser never talks to Neon directly. Every request goes to
// http(s)://<same-origin>/api/* with the user's session JWT attached;
// those serverless functions hold the Neon connection string.
const SESSION_KEY = "makeinvoice.session";

export function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY);
}

/** Fetch JSON with bearer auth; returns { data, error }. */
export async function apiFetch(path, options = {}) {
  const { method = "POST", body, requireAuth = true } = options;
  const headers = { "Content-Type": "application/json" };
  if (requireAuth) {
    const token = getStoredSession()?.access_token;
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  try {
    const res = await fetch(path, {
      method,
      headers,
      body: method === "GET" ? undefined : JSON.stringify(body ?? {}),
    });
    let payload = null;
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }
    if (!res.ok) {
      const message =
        payload?.error?.message ??
        payload?.error ??
        `Request failed (${res.status}).`;
      return { data: null, error: { message: String(message) } };
    }
    return { data: payload, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network request failed.";
    return { data: null, error: { message } };
  }
}
