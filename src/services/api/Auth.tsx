import {instance} from "./baseApi.tsx";

const endpoint = "auth/login";

interface Credentials {
    email: string;
    password: string;
}

export const Auth = {
    login: async function (credentials: Credentials) {
        try {
            const response = await instance.post(endpoint, credentials);
            if (response.data.data && response.data.data.token && response.data.data.user) {
                localStorage.setItem("token", response.data.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.data.user));
                return response.data;
            }
            throw new Error('Invalid response format');
        } catch (error) {
            console.error("Error en login:", error);
            throw error;
        }
    },
    logout: async function () {
        try {
            // El token ya se incluye automáticamente por el interceptor de axios
            const response = await instance.post('auth/logout');
            return response.data;
        } catch (error) {
            console.error("Error en logout:", error);
            throw error;
        }
    },
}