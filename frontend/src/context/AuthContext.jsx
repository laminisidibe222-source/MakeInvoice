// ─── Auth state (Neon-backed JWT session) ───────────────────────
// Mirrors the UnivEstu app-level auth: HS256 JWTs issued by /api/auth,
// persisted in localStorage, verified on every /api call.
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiFetch, getStoredSession, setStoredSession, clearStoredSession } from "../lib/api.js";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  function applyResponse(payload) {
    // Accept both wire shapes: nested { session: {...} } and flat { access_token, ... }.
    const sess =
      payload?.session?.access_token && payload.session.user?.id
        ? payload.session
        : payload?.access_token && payload.user?.id
        ? {
            access_token: payload.access_token,
            token_type: payload.token_type ?? "bearer",
            user: payload.user,
          }
        : null;
    if (!sess) return { error: "Unexpected auth response." };
    setStoredSession(sess);
    setSession(sess);
    setProfile(payload?.profile ?? null);
    return { error: null };
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = getStoredSession();
      if (stored?.access_token) {
        const { data } = await apiFetch("/api/auth", { body: { action: "me" } });
        if (cancelled) return;
        if (data && !data.error) applyResponse(data);
        else {
          clearStoredSession();
          setSession(null);
          setProfile(null);
        }
      } else {
        setSession(null);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await apiFetch("/api/auth", {
      body: { action: "signin", email, password },
      requireAuth: false,
    });
    if (error) return { error: error.message };
    return applyResponse(data);
  };

  const signUp = async (email, password, fullName) => {
    const { data, error } = await apiFetch("/api/auth", {
      body: { action: "signup", email, password, fullName },
      requireAuth: false,
    });
    if (error) return { error: error.message };
    return applyResponse(data);
  };

  const signOut = async () => {
    clearStoredSession();
    setProfile(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (!session) return;
    const { data, error } = await apiFetch("/api/auth", {
      body: { action: "me" },
    });
    if (!error && data?.profile) setProfile(data.profile);
  };

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
