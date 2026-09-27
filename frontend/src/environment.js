/**
 * API base URL. Set VITE_API_URL in .env for production (e.g. https://api.yourschool.com/api).
 */
const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
export { baseUrl };
