import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/auth",
  withCredentials: true,
});

// ========================================
// ✅ REQUEST INTERCEPTOR
// ========================================
// Runs BEFORE every request
api.interceptors.request.use(
  (config) => {
    // Get accesstoken from localStorage
    const token = localStorage.getItem("accesstoken");

    // If token exists, add it to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ========================================
// ✅ RESPONSE INTERCEPTOR
// ========================================
// Runs AFTER every response
api.interceptors.response.use(
  (response) => response, // If successful, return as-is
  async (error) => {
    const originalRequest = error.config;

    // ✅ If error is 401 (token expired) AND haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark as retried

      try {
        // Call refresh endpoint to get new accesstoken
        const response = await axios.get(
          "http://localhost:8080/api/auth/refreshtoken",
          { withCredentials: true }, // Include refreshtoken cookie
        );

        // Update accesstoken in localStorage
        localStorage.setItem("accesstoken", response.data.accesstoken);

        // Add new token to original request header
        originalRequest.headers.Authorization = `Bearer ${response.data.accesstoken}`;

        // Retry the original request with new token
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout user
        localStorage.removeItem("accesstoken");
        window.location.href = "/login"; // Redirect to login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// ========================================
// ✅ REGISTER FUNCTION
// ========================================
export async function register({ name, username, email, password }) {
  try {
    const response = await api.post("/register", {
      name,
      username,
      email,
      password,
    });

    // Store accesstoken in localStorage
    localStorage.setItem("accesstoken", response.data.accesstoken);

    return response.data;
  } catch (error) {
    console.log(
      "Register error:",
      error.response?.data?.message || error.message,
    );
    throw error;
  }
}

// ========================================
// ✅ LOGIN FUNCTION
// ========================================
export async function login({ username, password }) {
  try {
    const response = await api.post("/login", {
      username,
      password,
    });

    // Store accesstoken in localStorage
    localStorage.setItem("accesstoken", response.data.accesstoken);

    return response.data;
  } catch (error) {
    console.log("Login error:", error.response?.data?.message || error.message);
    throw error;
  }
}

// ========================================
// ✅ GET ME FUNCTION (Get current user)
// ========================================
export async function getme() {
  try {
    // Request interceptor automatically adds accesstoken
    const response = await api.get("/get_me");
    return response.data;
  } catch (error) {
    console.log("GetMe error:", error.response?.data?.message || error.message);
    throw error;
  }
}

// ========================================
// ✅ REFRESH TOKEN FUNCTION
// ========================================
export async function refreshtoken() {
  try {
    // Automatically sends refreshtoken cookie
    const response = await api.get("/refreshtoken");

    // Update accesstoken in localStorage
    localStorage.setItem("accesstoken", response.data.accesstoken);

    return response.data;
  } catch (error) {
    console.log(
      "Refresh error:",
      error.response?.data?.message || error.message,
    );
    throw error;
  }
}

// ========================================
// ✅ LOGOUT FUNCTION (Single device)
// ========================================
export async function logout() {
  try {
    const response = await api.get("/logout");

    // Clear accesstoken from localStorage
    localStorage.removeItem("accesstoken");

    return response.data;
  } catch (error) {
    console.log(
      "Logout error:",
      error.response?.data?.message || error.message,
    );
    // Clear token anyway even if request fails
    localStorage.removeItem("accesstoken");
    throw error;
  }
}

// ========================================
// ✅ LOGOUT ALL FUNCTION (All devices)
// ========================================
export async function logoutall() {
  try {
    const response = await api.get("/logout_all");

    // Clear accesstoken from localStorage
    localStorage.removeItem("accesstoken");

    return response.data;
  } catch (error) {
    console.log(
      "LogoutAll error:",
      error.response?.data?.message || error.message,
    );
    // Clear token anyway even if request fails
    localStorage.removeItem("accesstoken");
    throw error;
  }
}

export default api;
