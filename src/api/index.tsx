import axios from "axios";


const api = axios.create({
    baseURL:'http://localhost:8080/api'
})

api.interceptors.request.use(
    //async (config) => {
    //     // Add Authorization token to the headers
    //     if (token) {
    //         config.headers['authToken'] = authToken;
    //     }
    //     return config;
    // },
    // (error) => {
    //     // Handle request errors
    //     console.error('Request error:', error.message);
    //     return Promise.reject(error);
    // }
);


api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Handle request errors
        return Promise.reject(error.response.data);
    }   
);

export default api;