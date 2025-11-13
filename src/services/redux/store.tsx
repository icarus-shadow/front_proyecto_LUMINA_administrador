import { configureStore } from '@reduxjs/toolkit';
import {authSlice, usersSlice} from './slices';

export const store = configureStore({
    reducer: {
        userReducer: usersSlice.reducer,
        authReducer: authSlice.reducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch