import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {users} from "../../api/Users.tsx";
import type {usersState} from "./interfacesData";

// Define the initial state using that type
const initialState: usersState[] = []

export const fetchUsers = createAsyncThunk('users/list', async() =>{
    const res = await users.getAll();
    return res.data as usersState[]
})

export const usersSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
    },
    extraReducers: (builder) =>{
        builder.addCase(
            fetchUsers.fulfilled, (_state, action) => {
            return action.payload
        })
    }
})

export const { } = usersSlice.actions
export default usersSlice.reducer
