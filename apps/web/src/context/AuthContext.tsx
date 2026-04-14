import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { PublicUser, LoginRequest } from "@client-control/shared";
import { apiLogin, apiLogout, apiRefreshToken } from "../services/api";
import api from "../services/api";

interface AuthContextValue {
  user: PublicUser | null;
  accessToken: string | null;
  initializing: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  setTokens: (token: string, user: PublicUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  // Access token lives only in memory — never in localStorage/sessionStorage
  const [accessToken, setAccessToken] = useState<string | null>(null);
  // True while the initial silent refresh attempt is in flight
  const [initializing, setInitializing] = useState(true);
  // Prevents StrictMode's double-invocation from sending two concurrent
  // refresh requests (rotating tokens: second call would consume an already-used token).
  const refreshStarted = useRef(false);

  const setTokens = useCallback((token: string, u: PublicUser) => {
    setAccessToken(token);
    setUser(u);
  }, []);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const data = await apiLogin(credentials);
      setAccessToken(data.accessToken);
      setUser(data.user);
    },
    []
  );

  const logout = useCallback(async () => {
    if (accessToken) {
      await apiLogout(accessToken);
    }
    setAccessToken(null);
    setUser(null);
  }, [accessToken]);

  // Expose refresh so the API service can silently renew the token
  const refresh = useCallback(async (): Promise<string | null> => {
    try {
      const data = await apiRefreshToken();
      setAccessToken(data.accessToken);
      return data.accessToken;
    } catch {
      setAccessToken(null);
      setUser(null);
      return null;
    }
  }, []);

  // Attempt silent refresh on mount so reloads preserve auth state via cookie.
  // We use a ref flag (not `ignore`) so that StrictMode's second effect invocation
  // skips the API call entirely — preventing a second request from consuming the
  // already-rotated refresh token and getting a 401.
  useEffect(() => {
    registerRefreshFn(refresh);

    if (refreshStarted.current) return;
    refreshStarted.current = true;

    apiRefreshToken()
      .then(async (data) => {
        setAccessToken(data.accessToken);
        // Fetch user info directly with the fresh token (TokenRegistrar
        // hasn't re-rendered yet so the Axios interceptor still has null).
        try {
          const res = await api.get<{ id: number; username: string }>(
            "/api/auth/me",
            { headers: { Authorization: `Bearer ${data.accessToken}` } }
          );
          setUser(res.data);
        } catch {
          // Non-critical — user display will just be empty
        }
      })
      .catch(() => {
        // No valid session — leave accessToken as null; user will go to login.
      })
      .finally(() => {
        setInitializing(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, initializing, login, logout, setTokens }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

// Exported for use by the API service interceptor (avoids prop drilling)
let _refresh: (() => Promise<string | null>) | null = null;

export function registerRefreshFn(fn: () => Promise<string | null>) {
  _refresh = fn;
}

export async function refreshAccessToken(): Promise<string | null> {
  return _refresh ? _refresh() : null;
}
