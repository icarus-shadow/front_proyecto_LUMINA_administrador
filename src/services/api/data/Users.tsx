import {instance} from "../baseApi.tsx";

const endpoint = "admin/users"

export const users = {
    getAll: async function() {
        try{
            const response = await instance.get(endpoint);
            if (response.data) {
                return response.data;
            }
            throw new Error('Invalid response format');
        } catch (e) {
            console.error("Error en obtener usuarios:", e);
            throw e;
        }
    },

    deleteUser: async function(id: number) {
        try {
            const response = await instance.delete(`${endpoint}/${id}`);
            if (response.data) {
                return response.data;
            }
            throw new Error('Invalid response format');
        } catch (e) {
            console.error("Error en elimiar el usuario:", e);
            throw e;
        }
    }
}