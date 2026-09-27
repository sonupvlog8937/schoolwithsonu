import axios from "axios";

/**
 * Global axios defaults and interceptors.
 * Base URL is set WITHOUT /api suffix — individual calls include /api/...
 */
export function setupAxios() {
  // Base URL points to the server root, NOT /api
  const serverRoot = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
  axios.defaults.baseURL = serverRoot;

  axios.defaults.headers.common.Accept = "application/json";

  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      const url = String(config.url || "");
      
      // Skip token for public routes
      const isPublicRoute = 
        url.includes("/api/school/public/") ||
        url.includes("/api/students/dropdown-options-public") ||
        url.includes("/login") ||
        url.includes("/register");
      
      console.log('🔍 Axios Request:', { url, isPublicRoute, hasToken: !!token });
      
      if (token && !isPublicRoute) {
        config.headers.Authorization = token;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const url = String(error.config?.url || "");

      const isAuthRoute =
        url.includes("/login") ||
        url.includes("/register");
      
      const isPublicRoute = 
        url.includes("/api/school/public/") ||
        url.includes("/api/students/dropdown-options-public");

      console.log('❌ Axios Error:', { status, url, isAuthRoute, isPublicRoute });

      // Only redirect to login if NOT a public route or auth route
      if ((status === 401 || status === 403) && !isAuthRoute && !isPublicRoute) {
        console.log('🔄 Redirecting to login...');
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        const reason = status === 403 ? "forbidden" : "expired";
        const login = `/login?session=${reason}`;
        if (!window.location.pathname.includes("/login")) {
          window.location.assign(login);
        }
      }

      return Promise.reject(error);
    }
  );
}
