import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { subElementsApi } from "../../../api/data/SubElements.tsx";
import type { responseDelete, responseSubElements } from "../../../../types/interfacesData.tsx";

// Define the initial state using that type
const initialState: responseSubElements & {
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

export const fetchSubElements = createAsyncThunk(
    'subElements/list',
    async () => {
        try {
            const response = await subElementsApi.getAll();
            if (!response.data) {
                throw new Error('Respuesta inválida del servidor');
            }
            return response as responseSubElements;
        } catch (error) {
            console.error("[subElementsSlice] error al obtener sub-elementos", error)
            throw error;
        }
    })

export const deleteSubElement = createAsyncThunk(
    'subElements/delete',
    async (id: number, { dispatch }) => {
        try {
            const response = await subElementsApi.deleteSubElement(id);
            if (!response) {
                throw new Error('Respuesta inválida del servidor');
            }
            dispatch(fetchSubElements());

            return response as responseDelete;
        } catch (error) {
            console.error("[subElementsSlice] error al eliminar el sub-elemento", error)
            throw error;
        }
    }
)

export const subElementsSlice = createSlice({
    name: 'subElements',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            //fetch
            .addCase(fetchSubElements.pending, (state) => {
                state.fetchSuccess = null;
            })
            .addCase(fetchSubElements.fulfilled, (state, action) => {
                state.data = action.payload.data;
                state.fetchSuccess = action.payload.success
                state.count = state.data?.length || 0;
            })

            //delete
            .addCase(deleteSubElement.pending, (state) => {
                state.deleteSuccess = null;
            })
            .addCase(deleteSubElement.fulfilled, (state, action) => {
                state.deleteSuccess = action.payload.success
                state.count = state.data?.length || 0;
            })
    }
})

export default subElementsSlice.reducer
