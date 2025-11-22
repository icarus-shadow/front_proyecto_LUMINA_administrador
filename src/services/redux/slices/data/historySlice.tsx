import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import type {responseHistory} from "../../../../types/interfacesData.tsx";
import {history} from "../../../api/data/history.tsx";


const initialState: responseHistory = {
    success: null,
    data: null,
}

export const reloadHistory = createAsyncThunk(
    'reloadHistory',
    async () => {

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

export const historySlice = createSlice({
    name: 'history',
    initialState,
    reducers: {},
    extraReducers: (builder) =>{
        builder
            .addCase(fetchHistory.pending, (state) => {
                state.success = null;
            })
            .addCase(fetchHistory.fulfilled, (state, action) => {
                state.data = action.payload.data;
                state.success = action.payload.success;
            })
            .addCase(fetchHistory.rejected, (state) => {
                state.success = false;
            })
    }

})

export default historySlice.reducer