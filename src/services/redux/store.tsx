import { configureStore } from '@reduxjs/toolkit';
import {authSlice, usersSlice} from './slices';
import {historySlice} from "./slices/data/historySlice.tsx";

export const store = configureStore({
    reducer: {
        usersReducer: usersSlice.reducer,
        historyReduce: historySlice.reducer,
        authReducer: authSlice.reducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch