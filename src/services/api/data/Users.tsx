import {instance} from "../baseApi.tsx";
import type {User} from "../../../types/interfacesData.tsx";

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
            console.error("Error en eliminar el usuario:", e);
            throw e;
        }
    },

    addUser: async function(data: User) {
        try {
            const response = await instance.post(endpoint, data);
            console.log(response);
            if (response.data) {
                return response.data;
            }
            throw new Error('Invalid response format');
        } catch (e) {
            console.error("Error al agregar el usuario:", e);
            throw e;
        }
    }
}