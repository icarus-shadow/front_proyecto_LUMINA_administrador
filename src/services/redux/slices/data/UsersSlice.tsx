import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {users} from "../../../api/data/Users.tsx";
import type {responseDelete, responseUsersSlice, AddUserPayload, EditUserPayload} from "../../../../types/interfacesData.tsx";

// Define the initial state using that type
const initialState: responseUsersSlice = {
    fetchSuccess:  null,
    deleteSuccess: null,
    addSuccess: null,
    updateSuccess: null,
    success: null,
    data: [],
    count: 0,
}

export const fetchUsers = createAsyncThunk(
    'users/list',
    async() => {
    try {
        const response = await users.getAll();
        if (!response.data) {
            throw new Error('Respuesta inválida del servidor');
        }
        return response as responseUsersSlice;
    } catch (error) {
        console.error("[usersSlice] error al obtener usuarios", error)
        throw error;
    }
})

export const deleteUser = createAsyncThunk(
    'users/delete',
    async(id: number, {dispatch}) => {
        try {
            const response = await  users.deleteUser(id);
            console.log(response);
            if (!response){
                throw new Error('Respuesta inválida del servidor');
            }
            dispatch(fetchUsers());

            return response as responseDelete;
        } catch (error) {
            console.error("[usersSlice] error al eliminar el usuario", error)
            throw error;
        }
    }
)

export const addUser = createAsyncThunk(
    'users/add',
    async(payload: AddUserPayload, {dispatch}) => {
        try {
            const response = await users.addUser(payload);
            if (!response){
                throw new Error('Respuesta inválida del servidor');
            }
            dispatch(fetchUsers());

            return response as responseDelete;
        } catch (error) {
            console.error("[usersSlice] error al agregar usuario", error)
            throw error;
        }
    }
)

export const editUSer = createAsyncThunk(
    'users/edit',
    async (payload: EditUserPayload, {dispatch} ) => {
        try {
            const {id, ...userData} = payload;
            const response = await users.editUser(id, userData);
            if (!response){
                throw new Error('Respuesta inválida del servidor');
            }
            dispatch(fetchUsers());

            return response as responseDelete;
        } catch (error) {
            console.error("[usersSlice] error al editar usuario", error)
            throw error;
        }
    }
)

export const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {},
    extraReducers: (builder) =>{
        builder
            //fetch
            .addCase(fetchUsers.pending, (state) => {
                state.fetchSuccess = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.data = action.payload.data;
                state.fetchSuccess = action.payload.success
                state.count = state.data?.length || 0;
            })

            //delete
            .addCase(deleteUser.pending, (state) => {
                state.deleteSuccess = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.deleteSuccess = action.payload.success
                state.count = state.data?.length || 0;
            })

            //add
            .addCase(addUser.pending, (state) => {
                state.addSuccess = null;
            })
            .addCase(addUser.fulfilled, (state, action) => {
                state.addSuccess = action.payload.success
            })

            //edit
            .addCase(editUSer.pending, (state) => {
                state.updateSuccess = null;
            })
            .addCase(editUSer.fulfilled, (state, action) => {
                state.updateSuccess = action.payload.success
            })
    }
})

export default usersSlice.reducer
