import { instance } from "../baseApi.tsx";
import type { subElements } from "../../../types/interfacesData.tsx";

const endpoint = "admin/elementos-adicionales"

export const subElementsApi = {
    getAll: async function () {
        try {
            const response = await instance.get(endpoint);
            if (response.data) {
                return response.data;
            }
            throw new Error('Invalid response format');
        } catch (e) {
            console.error("Error en obtener elementos adicionales:", e);
            throw e;
        }
    },

    deleteSubElement: async function (id: number) {
        try {
            const response = await instance.delete(`${endpoint}/${id}`);
            if (response.data) {
                return response.data;
            }
            throw new Error('Invalid response format');
        } catch (e) {
            console.error("Error en eliminar el elemento adicional:", e);
            throw e;
        }
    },

    addSubElement: async function (data: subElements) {
        try {
            const response = await instance.post(endpoint, data);
            console.log(response);
            if (response.data) {
                return response.data;
            }
            throw new Error('Invalid response format');
        } catch (e) {
            console.error("Error al agregar el elemento adicional:", e);
            throw e;
        }
    }
}
