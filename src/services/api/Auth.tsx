import {instance} from "./baseApi.tsx";

const endpoint = "auth/login";

interface credentials {
    email: string;
    password: string;
}

export const Auth = {
    login: async function(credentials: credentials) {
        try {
            const resp = await instance.post(endpoint, {credentials});

            const token = resp.data.token;

            localStorage.setItem("token", token);
            return token;
        } catch (error) {
            console.error("Error en login:", error);
            throw error;
        }
    },
}