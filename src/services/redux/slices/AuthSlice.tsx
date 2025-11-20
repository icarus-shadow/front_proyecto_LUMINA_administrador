import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {Auth} from "../../api/Auth.tsx";
import type {responseLogin, userAuthState} from "../../../types/interfacesData.tsx";


export const login = createAsyncThunk(
    'auth/login',
    async (credentials: {email: string; password: string}, { rejectWithValue }) => {
        try {
            // Validación básica
            if (!credentials.email || !credentials.password) {
                throw new Error('Email y contraseña son requeridos');
            }

            const response = await Auth.login(credentials);

            if (!response.data) {
                throw new Error('Respuesta inválida del servidor');
            }

            return response as responseLogin;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Error en el inicio de sesión');
        }
    }
);

const initialState: userAuthState = {
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null,
    token: localStorage.getItem('token') || null,
}


export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) =>{
            state.user = null;
            state.token = null;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        },
    },
    extraReducers: (builder) => {
        builder

            .addCase(login.fulfilled, (state, action) => {
                state.user = action.payload.data.user;
                state.token = action.payload.data.token;
            });
    },
});

export const { logout } = authSlice.actions;