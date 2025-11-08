import * as React from 'react';
import {IconButton, Paper} from "@mui/material";
import {Edit, Delete } from '@mui/icons-material';
import {DataGrid} from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import type {GridColDef} from "@mui/x-data-grid";


interface DinamicTableProps{
    rows: any[];
    columns: GridColDef[];
    onDelete: (id: number, codigo: string) => void;
    onEdit: (row: any) => void;
}


export const DinamicTable:React.FC<DinamicTableProps> = ({rows, columns, onDelete, onEdit}) => {

    const [tableRows, setTableRows] = React.useState<any[]>([]);

    React.useEffect(()=>{
        setTableRows(rows)
    },[rows])

    const columnasBotones = [
        ...columns.map(col =>
            col.field === 'url_ruta_img'
                ? {
                    ...col,
                    renderCell: (params: any) => (
                        <img
                            src={`${params.value}`}
                            alt=""
                            style={{width: '100%', height: 'auto', maxHeight: '50px', objectFit: 'contain'}}
                        />
                    )
                }
                : col
        ), {
            field: "actions",
            headerName: "Acciones",
            width: 100,
            renderCell:(params: any)=>(
                <>
                    <IconButton color="primary" onClick={()=> onEdit(params.row)}>
                        <Edit />
                    </IconButton>

                    <IconButton color="primary" onClick={()=> onDelete(params.row.id, params.row.codigo)}>
                        <Delete />
                    </IconButton>
                </>
            )
        }
    ]

    const paginationModel = {page: 0, pageSize: 8}

    return(
        <Paper sx={{height: 800, width: "73vw", marginLeft: 4, backgroundColor: "var(--background)"}} role="region" aria-label="tabla dinamica">
            <DataGrid
                rows={tableRows}
                columns={columnasBotones}
                localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                initialState={{pagination:{paginationModel}}}
                pageSizeOptions={[5,8,10,50,100]}
                checkboxSelection
                disableRowSelectionOnClick
                sx={{
                    backgroundColor: 'rgba(var(--secondary-rgb), 0.1)',
                    border: 0,
                    marginTop: 5,
                    '& .MuiDataGrid-Headers': {
                        backgroundColor: 'var(--background)',
                        color: 'var(--background)',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                    },
                    '& .MuiDataGrid-row': {
                        backgroundColor: 'rgba(var(--secondary-rgb), 0.3)',
                        '&:hover': {
                            backgroundColor: 'var(--background)',
                        },
                        '&.Mui-selected': {
                            backgroundColor: 'rgba(var(--secondary-rgb), 0.4)',
                            '&:hover': {
                                backgroundColor: 'var(--background)',
                            },
                        },
                    },
                    '& .MuiDataGrid-cell': {
                        fontFamily: 'Roboto, sans-serif',
                        fontSize: '1rem',
                        color: 'var(--text)',
                        borderBottom: '1px solid var(--background)',
                    },
                }}
            />
        </Paper>
    )
}

