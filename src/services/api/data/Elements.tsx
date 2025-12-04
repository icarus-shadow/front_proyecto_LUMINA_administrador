import {instance} from "../baseApi.tsx";

const endpoint = "admin/equipos-elementos"

export const elements = {
    getAll: async function() {
        try {
            const response = await instance.get(endpoint);
            return response;
        } catch (error) {
            console.error("Error al obtener elementos:", error);
            throw error;
        }
    },
    agregar: async function(formData: FormData) {
        console.log(formData.getAll("usuarios_asignados[]"));
        try {
            const response = await instance.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response;
        } catch (error) {
            console.error("Error al agregar elemento:", error);
            throw error;
        }
    },
    eliminar: async function(id: string) {
        try {
            const response = await instance.delete(`${endpoint}/${id}`);
            return response;
        } catch (error) {
            console.error("Error al eliminar elemento:", error);
            throw error;
        }
    },
    editar: async function(id: string, formData: FormData) {
        try {
            const response = await instance.put(`${endpoint}/${id}`, formData);
            return response;

        } catch (error) {
            console.error("Error al editar elemento:", error);
            throw error;
        }
    },
    asignarElementos: async function(equipoId: number, elementosIds: number[]) {
        try {
            const response = await instance.post(`${endpoint}/asignar-elementos`, {
                equipo_elemento_id: equipoId,
                elementos_adicionales_ids: elementosIds
            });
            return response;
        } catch (error) {
            console.error("Error al asignar elementos:", error);
            throw error;
        }
    },
    quitarElementos: async function(equipoId: number, elementosIds: number[]) {
        try {
            const response = await instance.post(`${endpoint}/quitar-elementos`, {
                equipo_elemento_id: equipoId,
                elementos_adicionales_ids: elementosIds
            });
            return response;
        } catch (error) {
            console.error("Error al quitar elementos:", error);
            throw error;
        }
    },
    obtenerAsignaciones: async function(equipoId: number) {
        try {
            const response = await instance.get(`${endpoint}/asignaciones/${equipoId}`);
            return response;
        } catch (error) {
            console.error("Error al obtener asignaciones:", error);
            throw error;
        }
    }
}