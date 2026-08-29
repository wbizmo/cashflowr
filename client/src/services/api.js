import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15_000,
});

const requestId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cashflowr_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers["X-Request-Id"] ||= requestId();
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = String(error.config?.url || "");
      const isCredentialAttempt = path.includes("/auth/login") || path.includes("/auth/register");
      if (!isCredentialAttempt) window.dispatchEvent(new Event("cashflowr:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export const makeIdempotencyKey = (scope = "request") => `${scope}:${requestId()}`;
export default api;
