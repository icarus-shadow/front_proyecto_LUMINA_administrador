import { instance } from "../baseApi.tsx";
import type { nivelFormacion } from "../../../types/interfacesData.tsx";

const endpoint = "admin/tipos-programa"

export const levelFormationApi = {
    getAll: async function () {
        try {
            const response = await instance.get(endpoint);
            if (response.data) {
                return response.data;
            }
            throw new Error('Invalid response format');
        } catch (e) {
            console.error("Error en obtener tipos de programa:", e);
            throw e;
        }
    },

    deleteLevelFormation: async function (id: number) {
        try {
            const response = await instance.delete(`${endpoint}/${id}`);
            if (response.data) {
                return response.data;
            }
            throw new Error('Invalid response format');
        } catch (e) {
            console.error("Error en eliminar el tipo de programa:", e);
            throw e;
        }
    },

    addLevelFormation: async function (data: nivelFormacion) {
        try {
            const response = await instance.post(endpoint, data);
            console.log(response);
            if (response.data) {
                return response.data;
            }
            throw new Error('Invalid response format');
        } catch (e) {
            console.error("Error al agregar el tipo de programa:", e);
            throw e;
        }
    }
}
