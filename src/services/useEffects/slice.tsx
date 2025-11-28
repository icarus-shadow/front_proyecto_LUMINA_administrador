import React from 'react';
import { useAppDispatch } from '../redux/hooks';
import { fetchUsers } from '../redux/slices/data/UsersSlice';
import { fetchElements } from '../redux/slices/data/elementsSlice';
import { fetchHistory } from '../redux/slices/data/historySlice';
import {fetchSubElements} from "../redux/slices/data/subElementsSlice.tsx";

export default function SliceEffects() {
    const dispatch = useAppDispatch();

    React.useEffect(() => {
        dispatch(fetchUsers())
        dispatch(fetchHistory())
        dispatch(fetchElements())
        dispatch(fetchSubElements())
    }, []);

    return (
        <></>
    )
}