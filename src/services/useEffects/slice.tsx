import React from 'react';
import { useAppDispatch } from '../redux/hooks';
import { fetchUsers } from '../redux/slices/data/UsersSlice';
import { fetchElements } from '../redux/slices/data/elementsSlice';
import { fetchHistory } from '../redux/slices/data/historySlice';
import {fetchSubElements} from "../redux/slices/data/subElementsSlice.tsx";
import {fetchLevelFormations} from "../redux/slices/data/LevelFormationSlice.tsx";
import {fetchFormations} from "../redux/slices/data/formationSlice.tsx";

export default function SliceEffects() {
    const dispatch = useAppDispatch();

    React.useEffect(() => {
        dispatch(fetchElements())
        dispatch(fetchUsers())
        dispatch(fetchHistory())
        dispatch(fetchSubElements())
        dispatch(fetchFormations())
        dispatch(fetchLevelFormations())
    }, []);

    return (
        <></>
    )
}