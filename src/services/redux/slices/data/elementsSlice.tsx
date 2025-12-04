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

export const addElement = createAsyncThunk(
    'elements/add',
    async(formData: FormData, {dispatch}) => {
        try {
            const response = await elements.agregar(formData);
            if (!response.data) {
                throw new Error('Respuesta invalida del servidor');
            }
            dispatch(fetchElements());
            return response.data;
        } catch (error) {
            console.error("[elementsSlice] error al agregar elemento", error);
            throw error;
        }
    })

export const deleteElement = createAsyncThunk(
    'elements/delete',
    async(id: string, {dispatch}) => {
        try {
            const response = await elements.eliminar(id);
            if (!response.data) {
                throw new Error('Respuesta invalida del servidor');
            }
            dispatch(fetchElements());
            return response.data;
        } catch (error) {
            console.error("[elementsSlice] error al eliminar elemento", error);
            throw error;
        }
    })

export const editElement = createAsyncThunk(
    'elements/edit',
    async({id, formData}: {id: string, formData: FormData}, {dispatch}) => {
        try {
            const response = await elements.editar(id, formData);
            if (!response.data) {
                throw new Error('Respuesta invalida del servidor');
            }
            dispatch(fetchElements());
            return response.data;
        } catch (error) {
            console.error("[elementsSlice] error al editar elemento", error);
            throw error;
        }
    })

export const assignElements = createAsyncThunk(
    'elements/assign',
    async({equipoId, elementosIds}: {equipoId: number, elementosIds: number[]}) => {
        try {
            const response = await elements.asignarElementos(equipoId, elementosIds);
            if (!response.data) {
                throw new Error('Respuesta invalida del servidor');
            }
            return response.data;
        } catch (error) {
            console.error("[elementsSlice] error al asignar elementos", error);
            throw error;
        }
    })

export const removeElements = createAsyncThunk(
    'elements/remove',
    async({equipoId, elementosIds}: {equipoId: number, elementosIds: number[]}) => {
        try {
            const response = await elements.quitarElementos(equipoId, elementosIds);
            if (!response.data) {
                throw new Error('Respuesta invalida del servidor');
            }
            return response.data;
        } catch (error) {
            console.error("[elementsSlice] error al quitar elementos", error);
            throw error;
        }
    })

export const fetchElementAssignments = createAsyncThunk(
    'elements/assignments',
    async(equipoId: number) => {
        try {
            const response = await elements.obtenerAsignaciones(equipoId);
            if (!response.data) {
                throw new Error('Respuesta invalida del servidor');
            }
            return response.data;
        } catch (error) {
            console.error("[elementsSlice] error al obtener asignaciones", error);
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
                state.data = action.payload.data;
                state.count = state.data?.length || 0;
            })

    }
})

export  default elementsSlice.reducer;

    