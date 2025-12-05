import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Auth } from "../../api/Auth.tsx";
import type { responseLogin, userAuthState } from "../../../types/interfacesData.tsx";

// Logout asíncrono con manejo robusto de errores
export const logoutAsync = createAsyncThunk(
    'auth/logout',
    async () => {
        try {
            const token = localStorage.getItem('token');

            // Si no hay token, simplemente limpiamos y retornamos
            if (!token) {
                return { success: true, message: 'Sesión cerrada (sin token)' };
            }

            // Intentar hacer logout en el servidor
            await Auth.logout();
            return { success: true, message: 'Sesión cerrada correctamente' };
        } catch (error: any) {
            console.error('❌ Error al cerrar sesión:', error);

            // Si el error es 401 (token inválido/expirado), considerarlo como éxito
            // porque de todas formas vamos a limpiar la sesión local
            if (error?.response?.status === 401) {
                return {
                    success: true,
                    message: 'Token inválido o expirado. Sesión cerrada localmente.'
                };
            }

            // Para otros errores, también cerramos sesión localmente
            // pero retornamos el error para que se pueda mostrar
            return {
                success: true,
                message: 'Error al cerrar sesión en el servidor. Sesión cerrada localmente.',
                error: error instanceof Error ? error.message : 'Error desconocido'
            };
        }
    }
);


export const login = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
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
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(login.fulfilled, (state, action) => {
                state.user = action.payload.data.user;
                state.token = action.payload.data.token;
            })
            .addCase(logoutAsync.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            });
    },
});