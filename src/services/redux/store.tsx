import { configureStore } from '@reduxjs/toolkit';
import {authSlice, usersSlice} from './slices';
import {historySlice} from "./slices/data/historySlice.tsx";
import {elementsSlice} from "./slices/data/elementsSlice.tsx";

export const store = configureStore({
    reducer: {
        usersReducer: usersSlice.reducer,
        historyReduce: historySlice.reducer,
        authReducer: authSlice.reducer,
        elementsReducer: elementsSlice.reducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch