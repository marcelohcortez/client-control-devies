import axios from "axios";
import type {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  Client,
  CreateClientInput,
  UpdateClientInput,
  PaginatedResponse,
  ClientFilters,
} from "@client-control/shared";
import { refreshAccessToken } from "../context/AuthContext";

const BASE_URL = import.meta.env["VITE_API_URL"] as string ?? "";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send httpOnly refresh token cookie
});

// ── Request interceptor — attach access token ──────────────────────────────
let _getAccessToken: (() => string | null) | null = null;

export function registerTokenGetter(fn: () => string | null) {
  _getAccessToken = fn;
}

api.interceptors.request.use((config) => {
  const token = _getAccessToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — silent refresh on 401 ───────────────────────────
let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const originalRequest = error.config;
    // Do not retry auth endpoints — 401 on login means bad credentials;
    // 401 on /refresh means the refresh token has expired.
    const requestUrl = originalRequest?.url ?? "";
    const isAuthEndpoint =
      requestUrl.includes("/api/auth/login") ||
      requestUrl.includes("/api/auth/refresh");

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !isAuthEndpoint &&
      !(originalRequest as { _retry?: boolean })._retry
    ) {
      (originalRequest as { _retry?: boolean })._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;

      if (newToken) {
        pendingRequests.forEach((cb) => cb(newToken));
        pendingRequests = [];
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }

      pendingRequests = [];
    }

    return Promise.reject(error);
  }
);

// ── Auth endpoints ─────────────────────────────────────────────────────────

export async function apiLogin(credentials: LoginRequest): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/api/auth/login", credentials);
  return res.data;
}

export async function apiLogout(accessToken: string): Promise<void> {
  await api.post("/api/auth/logout", {}, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function apiRefreshToken(): Promise<RefreshResponse> {
  const res = await api.post<RefreshResponse>("/api/auth/refresh");
  return res.data;
}

// ── Client endpoints ────────────────────────────────────────────────────────

export async function apiGetClients(
  filters: ClientFilters = {}
): Promise<PaginatedResponse<Client>> {
  const res = await api.get<PaginatedResponse<Client>>("/api/clients", {
    params: filters,
  });
  return res.data;
}

export async function apiGetClient(id: number): Promise<Client> {
  const res = await api.get<Client>(`/api/clients/${id}`);
  return res.data;
}

export async function apiCreateClient(
  input: CreateClientInput
): Promise<Client> {
  const res = await api.post<Client>("/api/clients", input);
  return res.data;
}

export async function apiUpdateClient(
  id: number,
  input: UpdateClientInput
): Promise<Client> {
  const res = await api.put<Client>(`/api/clients/${id}`, input);
  return res.data;
}

export async function apiDeleteClient(id: number): Promise<void> {
  await api.delete(`/api/clients/${id}`);
}

export default api;
