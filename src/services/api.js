import axios from "axios";

// ✅ Axios instance with correct base URL
const api = axios.create({
  baseURL: "http://localhost:8080/api", // only /api, NOT /api/auth
});

// ✅ Attach JWT token to every request + log it
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        "✅ Outgoing request:",
        config.method.toUpperCase(),
        config.url,
        "Token:",
        token
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
          "http://localhost:8080/api/auth/refresh",
          null,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const newToken = refreshRes.data.token;

        if (newToken) {
          console.log("✅ Token refreshed:", newToken);
          localStorage.setItem("token", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest); // retry original request
        }
      } catch (refreshError) {
        console.error("❌ Token refresh failed", refreshError);
        // Only redirect if truly unauthorized
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
