import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_URL}`,
});

api.interceptors.request.use(
  async (config) => {
    // const token = sessionStorage.getItem('token');
    const token = localStorage.getItem("token");
    // Redirect if token does not exist
    if (!token) {
      window.location.href = "/login";
      return Promise.reject(new Error("No token found"));
    }
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error.message);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // optionally clear all
      // localStorage.clear();
      window.location.href = "/login"; // Redirect to login page
    }
    if (error.response?.status === 403) {
      if (
        error.response?.data?.code === "CLIENT_SUSPENDED" ||
        error.response?.data?.message?.includes("suspended")
      ) {
        toast.error(
          error.response?.data?.message ||
            "Your account has been suspended. Please contact administrator.",
        );
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(error.response?.data || error.message);
      }
      window.location.href = "/forbidden"; // Redirect to forbidden
    }

    return Promise.reject(error.response?.data || error.message);
  },
);

export default api;
