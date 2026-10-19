import axios from "axios";

// Vite exposes only environment variables beginning with VITE_ to frontend code.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Add the current JWT to protected API calls, if the user is logged in.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("shoplite_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
