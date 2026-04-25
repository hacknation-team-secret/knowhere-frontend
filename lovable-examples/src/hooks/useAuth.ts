// Auth hook — wraps the Knowhere backend OAuth2 flow.
// Anonymous by default; calling signIn/signUp persists a bearer token.

import { useCallback, useEffect, useState } from "react";
import { api, getToken, setToken, type ApiUser } from "@/lib/api";

export interface AuthState {
  user: ApiUser | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: !!getToken(),
    error: null,
  });

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setState({ user: null, loading: false, error: null });
      return null;
    }
    try {
      const me = await api.me();
      setState({ user: me, loading: false, error: null });
      return me;
    } catch (e) {
      setToken(null);
      setState({ user: null, loading: false, error: (e as Error).message });
      return null;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signIn = useCallback(
    async (username: string, password: string) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        await api.login(username, password);
        const me = await api.me();
        setState({ user: me, loading: false, error: null });
        return me;
      } catch (e) {
        const msg = (e as Error).message || "Login failed";
        setState({ user: null, loading: false, error: msg });
        throw e;
      }
    },
    [],
  );

  const signUp = useCallback(
    async (username: string, password: string, email?: string) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        await api.signup(username, password, email);
        await api.login(username, password);
        const me = await api.me();
        setState({ user: me, loading: false, error: null });
        return me;
      } catch (e) {
        const msg = (e as Error).message || "Signup failed";
        setState({ user: null, loading: false, error: msg });
        throw e;
      }
    },
    [],
  );

  const signOut = useCallback(() => {
    api.logout();
    setState({ user: null, loading: false, error: null });
  }, []);

  return { ...state, signIn, signUp, signOut, refresh };
}
