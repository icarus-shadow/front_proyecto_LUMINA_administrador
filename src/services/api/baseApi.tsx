import axios from 'axios'

const BASE_URL = "https://lumina-testing.onrender.com/api/"

export const instance = axios.create({
    baseURL: BASE_URL,
});

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Evitar redirigir si el error proviene del login
            if (!error.config.url.includes('auth/login')) {
                localStorage.removeItem("token");
                window.location.href = "/";
            }
        }
        return Promise.reject(error);
    }
);