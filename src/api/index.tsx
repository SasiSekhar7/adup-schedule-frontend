import axios from "axios";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_URL}`
});

api.interceptors.request.use(
    async (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error.message);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            window.location.href = "/login"; // Redirect to login page
        }
        if (error.response?.status === 403) {
            window.location.href = "/forbidden"; // Redirect to dashboard
        }

        return Promise.reject(error.response?.data || error.message);
    }
);

export default api;
