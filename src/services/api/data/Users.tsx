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
            console.error("Error en eliminar el usuario:", e);
            throw e;
        }
    },

    addUser: async function(userData: any) {
        try {
            const formData = new FormData();
            for (const key in userData) {
                formData.append(key, userData[key]);
            }
            const response = await instance.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.data) {
                return response.data;
            }
            throw new Error('Invalid response format');
        } catch (e) {
            console.error("Error en agregar usuario:", e);
            throw e;
        }
    },

    editUser: async function(id: number, userData: any) {
        try {
            const formData = new FormData();
            for (const key in userData) {
                formData.append(key, userData[key]);
            }
            const response = await instance.put(`${endpoint}/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.data) {
                return response.data;
            }
            throw new Error('Invalid response format');
        } catch (e) {
            console.error("Error en editar usuario:", e);
            throw e;
        }
    },

}