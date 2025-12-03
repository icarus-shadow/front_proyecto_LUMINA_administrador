import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { responseHistory, historial } from "../../../../types/interfacesData.tsx";
import { history } from "../../../api/data/history.tsx";


const initialState: responseHistory = {
    success: null,
    data: null,
    count: 0,
}

export const reloadHistory = createAsyncThunk(
    'reloadHistory',
    async (historyData: historial[]) => {
        return historyData;
    }
)

export const fetchHistory = createAsyncThunk(
    'fetchHistory',
    async () => {
        try {
            const response = await history.getAll();
            console.log(response);
            if (!response.data) {
                throw new Error('Respuesta inválida del servidor');
            }
            return response;
        } catch (error) {
            console.error("[historySlice] error al obtener historial", error)
            throw error;
        }
    }
)

// Selectores personalizados para filtrar historial
import { createSelector } from "@reduxjs/toolkit";
import dayjs from "dayjs";

// 1. Historiales sin fecha de salida definida
export const selectHistorialSinSalida = createSelector(
    (state: any) => state.history.data as historial[] | null,
    () => dayjs().format("YYYY-MM-DD"),
    (data, today) => {
        if (!data) return { hoy: [], otros: [] };
        const sinSalida = data.filter(h => !h.salida);
        return {
            hoy: sinSalida.filter(h => h.ingreso && h.ingreso.slice(0, 10) === today),
            otros: sinSalida.filter(h => h.ingreso && h.ingreso.slice(0, 10) !== today)
        };
    }
);

// 2. Historiales con salida definida y de la fecha actual
export const selectHistorialConSalidaHoy = createSelector(
    (state: any) => state.history.data as historial[] | null,
    () => dayjs().format("YYYY-MM-DD"),
    (data, today) => {
        if (!data) return [];
        return data.filter(h => h.salida && h.salida.slice(0, 10) === today);
    }
);

export const historySlice = createSlice({
    name: 'history',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(reloadHistory.fulfilled, (state, action) => {
                state.data = action.payload;
                state.count = action.payload.length;
            })
            .addCase(fetchHistory.pending, (state) => {
                state.success = null;
            })
            .addCase(fetchHistory.fulfilled, (state, action) => {
                state.data = action.payload.data;
                state.success = action.payload.success;
                state.count = state.data?.length || 0;
            })
            .addCase(fetchHistory.rejected, (state) => {
                state.success = false;
            })
    }

})

export default historySlice.reducer