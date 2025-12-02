import { configureStore } from '@reduxjs/toolkit';
import {authSlice, usersSlice} from './slices';
import {historySlice} from "./slices/data/historySlice.tsx";
import {elementsSlice} from "./slices/data/elementsSlice.tsx";
import {formationSlice} from "./slices/data/formationSlice";
import {subElementsSlice} from "./slices/data/subElementsSlice.tsx";
import { levelFormationSlice } from './slices/data/LevelFormationSlice.tsx';

export const store = configureStore({
    reducer: {
        usersReducer: usersSlice.reducer,
        historyReduce: historySlice.reducer,
        authReducer: authSlice.reducer,
        elementsReducer: elementsSlice.reducer,
        formationsReducer: formationSlice.reducer,
        subElementsReducer: subElementsSlice.reducer,
        levelFormationReducer: levelFormationSlice.reducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch