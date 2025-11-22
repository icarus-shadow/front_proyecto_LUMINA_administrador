import {instance} from "../baseApi.tsx";

const endpoint = "admin/historial"

export const history = {
    getAll: async function() {
        try {
            const response = await instance.get(endpoint)
            if (response.data) {
                return response.data
            }
            throw new Error('Invalid response format');
        } catch (e) {
            console.error("Error en obtener horarios:", e);
            throw e;
        }
    }
}