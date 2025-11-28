import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {elements} from "../../../api/data/Elements.tsx";
import type {responseElements} from "../../../../types/interfacesData.tsx";

const initialState: responseElements = {
    success: null,
    data: [],
    count: 0,
}

export const  fetchElements = createAsyncThunk(
    'elements/list',
    async() => {
        try {
            const response = await elements.getAll();
            if (!response.data) {
                throw new Error('Respuesta invalida del servidor');
            }
            return response.data as responseElements;
        } catch (error) {
            console.error("[elementsSlice] error al obtener los elementos", error);
            throw error;
        }
    })

export const elementsSlice = createSlice({
    name: 'elements',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchElements.fulfilled, (state, action) => {
                state.success = action.payload.success;
                state.data = action.payload.data;
                state.count = state.data?.length || 0;
            })
    }
})

export  default elementsSlice.reducer;

    