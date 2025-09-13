// @ts-ignore
import * as React from 'react';
import {Box} from "@mui/material";
import DinamicTable from "../components/DinamicTable.tsx";
import type {GridColDef} from "@mui/x-data-grid";


const Home = () => {
    let rows: Array<any> = [{
        id: 5,
        name:'juan',
        status: 'good'
    }, {
        id: 3,
        name: 'pepe',
        status: 'bad'
    }];

    let columns: GridColDef[] = [
        {field: 'name'},
        {field: 'status'}
    ]

    function ondelete(id: number) {
        alert('delete ' + id)
    }

    function onedit() {
        alert('edit ')
    }

    return (<Box>
            <DinamicTable rows={rows} columns={columns} onDelete={ondelete} onEdit={onedit}/>
        </Box>)
}

export default Home;