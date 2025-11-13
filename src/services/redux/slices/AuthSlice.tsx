import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {Auth} from "../../api/Auth.tsx";
import type {responseLogin, userAuthState} from "./interfacesData.tsx";


export const login = createAsyncThunk('auth/login',
    async (
        credentials: {email: string; password: string}) => {
            const res = await Auth.login(credentials);
            return res.data as responseLogin;
    }
);

const  initialState: userAuthState = {
    user: null,
    token: null,
}

export const  authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) =>{
            state.user = null;
            state.token = null;
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
