import axios from "axios";
import { getToken, setToken, clearToken, getRefreshToken } from "../utils/tokenStorage";

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  // Fallback to same hostname to prevent cross-origin SameSite cookie blocking
  return `http://${window.location.hostname}:5008/api/v1`;
};

const API_BASE_URL = getApiUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (Token Expired)
    // IMPORTANT: Skip refresh for auth routes — a 401 from /login or /register
    // means wrong credentials, NOT an expired token. Without this guard, the
    // user would see "No refresh token" instead of "Invalid email or password".
    const isAuthRoute = originalRequest.url?.includes("/auth/login") ||
                        originalRequest.url?.includes("/auth/register") ||
                        originalRequest.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token using the same dynamic base URL
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken: getRefreshToken() },
          { withCredentials: true }
        );

        const newAccessToken = res.data.data.accessToken;
        setToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Only force-logout if the server explicitly rejected the refresh token
        // due to it being invalid/expired (400, 401, 403).
        // If it's a 429 (rate limit) or 5xx (server error), keep the session alive.
        const status = refreshError.response?.status;
        if (status === 400 || status === 401 || status === 403) {
          clearToken();
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
