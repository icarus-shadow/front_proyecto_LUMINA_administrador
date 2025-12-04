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
            const { tipos_programas_id, ...rest } = data;
            const payload = {
                ...rest,
                nivel_formacion_id: tipos_programas_id,
            };
            console.log('data enviado a API addFormation:', payload);
            const response = await instance.post(endpoint, payload);
            console.log(response);
            if (response.data) {
                return response.data;
            }
            throw new Error('Invalid response format');
        } catch (e) {
            console.error("Error al agregar la formación:", e);
            throw e;
        }
    },

    updateFormation: async function (id: number, data: formacion) {
        try {
            const response = await instance.put(`${endpoint}/${id}`, data);
            console.log(response);
            if (response.data) {
                return response.data;
            }
            throw new Error('Invalid response format');
        } catch (e) {
            console.error("Error al actualizar la formación:", e);
            throw e;
        }
    }
}