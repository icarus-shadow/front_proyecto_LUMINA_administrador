import { instance } from "../baseApi.tsx";
import type { formacion } from "../../../types/interfacesData.tsx";

const endpoint = "admin/formaciones"

export const formation = {
    getAll: async function () {
        try {
            const response = await instance.get(endpoint);
            if (response.data) {
                return response.data;
            }
            throw new Error('Invalid response format');
        } catch (e) {
            console.error("Error en obtener formaciones:", e);
            throw e;
        }
    },

    deleteFormation: async function (id: number) {
        try {
            const response = await instance.delete(`${endpoint}/${id}`);
            if (response.data) {
                return response.data;
            }
            throw new Error('Invalid response format');
        } catch (e) {
            console.error("Error en eliminar la formación:", e);
            throw e;
        }
    },

    addFormation: async function (data: formacion) {
        try {
            const response = await instance.post(endpoint, data);
            console.log(response);
            if (response.data) {
                return response.data;
            }
            throw new Error('Invalid response format');
        } catch (e) {
            console.error("Error al agregar la formación:", e);
            throw e;
        }
    }
}