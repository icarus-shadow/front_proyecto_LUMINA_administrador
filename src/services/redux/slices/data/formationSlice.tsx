import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { formation } from "../../../api/data/Formation.tsx";
import type { formacion, responseDelete, responseFormation } from "../../../../types/interfacesData.tsx";

// Define the initial state using that type
const initialState: responseFormation & {
    fetchSuccess: boolean | null;
    deleteSuccess: boolean | null;
    addSuccess: boolean | null;
    updateSuccess: boolean | null;
} = {
    fetchSuccess: null,
    deleteSuccess: null,
    addSuccess: null,
    updateSuccess: null,
    success: null,
    data: [],
    count: 0,
}

export const fetchFormations = createAsyncThunk(
    'formaciones/list',
    async () => {
        try {
            const response = await formation.getAll();
            if (!response.data) {
                throw new Error('Respuesta inválida del servidor');
            }
            return response as responseFormation;
        } catch (error) {
            console.error("[formationSlice] error al obtener formaciones", error)
            throw error;
        }
    })

export const deleteFormation = createAsyncThunk(
    'formaciones/delete',
    async (id: number, { dispatch }) => {
        try {
            const response = await formation.deleteFormation(id);
            console.log(response);
            if (!response) {
                throw new Error('Respuesta inválida del servidor');
            }
            dispatch(fetchFormations());

            return response as responseDelete;
        } catch (error) {
            console.error("[formationSlice] error al eliminar la formación", error)
            throw error;
        }
    }
)

export const addFormation = createAsyncThunk(
    'formaciones/add',
    async (data: formacion, { dispatch }) => {
        try {
            console.log('data en thunk addFormation:', data);
            const response = await formation.addFormation(data);
            console.log(response);
            if (!response) {
                throw new Error('Respuesta inválida del servidor');
            }
            dispatch(fetchFormations());

            return response as responseDelete; // assuming similar response
        } catch (error) {
            console.error("[formationSlice] error al agregar la formación", error)
            throw error;
        }
    }
)

export const updateFormation = createAsyncThunk(
    'formaciones/update',
    async ({ id, data }: { id: number; data: formacion }, { dispatch }) => {
        try {
            const response = await formation.updateFormation(id, data);
            console.log(response);
            if (!response) {
                throw new Error('Respuesta inválida del servidor');
            }
            dispatch(fetchFormations());

            return response as responseDelete; // assuming similar response
        } catch (error) {
            console.error("[formationSlice] error al actualizar la formación", error)
            throw error;
        }
    }
)

export const formationSlice = createSlice({
    name: 'formaciones',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            //fetch
            .addCase(fetchFormations.pending, (state) => {
                state.fetchSuccess = null;
            })
            .addCase(fetchFormations.fulfilled, (state, action) => {
                state.data = action.payload.data;
                state.fetchSuccess = action.payload.success
                state.count = state.data?.length || 0;
            })

            //add
            .addCase(addFormation.pending, (state) => {
                state.addSuccess = null;
            })
            .addCase(addFormation.fulfilled, (state, action) => {
                state.addSuccess = action.payload.success
                state.count = state.data?.length || 0;
            })

            //delete
            .addCase(deleteFormation.pending, (state) => {
                state.deleteSuccess = null;
            })
            .addCase(deleteFormation.fulfilled, (state, action) => {
                state.deleteSuccess = action.payload.success
                state.count = state.data?.length || 0;
            })

            //update
            .addCase(updateFormation.pending, (state) => {
                state.updateSuccess = null;
            })
            .addCase(updateFormation.fulfilled, (state, action) => {
                state.updateSuccess = action.payload.success
                state.count = state.data?.length || 0;
            })
    }
})

export default formationSlice.reducer
