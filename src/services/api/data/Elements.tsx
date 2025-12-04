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
            const token = localStorage.getItem('token');
            const response = await fetch(`https://lumina-testing.onrender.com/api/admin/equipos-elementos/asignar-elementos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    equipos_o_elementos_id: equipoId,
                    elementos_adicionales_ids: elementosIds
                })
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return { data: await response.json() };
        } catch (error) {
            console.error("Error al asignar elementos:", error);
            throw error;
        }
    },
    quitarElementos: async function(equipoId: number, elementosIds: number[]) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://lumina-testing.onrender.com/api/admin/equipos-elementos/quitar-elementos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    equipos_o_elementos_id: equipoId,
                    elementos_adicionales_ids: elementosIds
                })
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return { data: await response.json() };
        } catch (error) {
            console.error("Error al quitar elementos:", error);
            throw error;
        }
    },
    obtenerAsignaciones: async function(equipoId: number) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://lumina-testing.onrender.com/api/admin/equipos-elementos/asignaciones/${equipoId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return { data: await response.json() };
        } catch (error) {
            console.error("Error al obtener asignaciones:", error);
            throw error;
        }
    }
}