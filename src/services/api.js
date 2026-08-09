import axios from "axios";

// ✅ Axios instance with correct base URL (from .env / .env.production)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL, // only /api, NOT /api/auth
});

// ✅ Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        "✅ Outgoing request:",
        config.method.toUpperCase(),
        config.url
      );
    } else {
      console.log(
        "⚠️ Outgoing request without token:",
        config.method.toUpperCase(),
        config.url
      );
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor with proper 401 handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is not from server, reject
    if (!error.response) {
      console.error("❌ Network or CORS error:", error);
      return Promise.reject(error);
    }

    console.error("❌ API error:", error.response.data || error.message);

    // Handle 401 Unauthorized
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("🔄 Attempting token refresh...");
        const refreshRes = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          null,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const newToken = refreshRes.data.token;

        if (newToken) {
          console.log("✅ Token refreshed");
          localStorage.setItem("token", newToken);
          
          // ✅ FIX: Also update userId and role from the new token
          try {
            const payload = JSON.parse(atob(newToken.split('.')[1]));
            localStorage.setItem('userId', payload.userId.toString());
            localStorage.setItem('role', payload.role);
          } catch (decodeError) {
            console.error('Failed to decode refreshed token:', decodeError);
          }
          
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest); // retry original request
        }
      } catch (refreshError) {
        console.error("❌ Token refresh failed", refreshError);
        // ✅ FIX: Clear all localStorage items including userId and role
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;