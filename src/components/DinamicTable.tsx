import * as React from 'react';
import {IconButton, Paper} from "@mui/material";
import {Edit, Delete, Visibility } from '@mui/icons-material';
import {DataGrid} from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import type {GridColDef} from "@mui/x-data-grid";
import './styles/DinamicTable.css';


interface DinamicTableProps{
    rows: any[];
    columns: GridColDef[];
    onDelete?: (id: number, codigo: string) => void;
    onEdit?: (row: any) => void;
    onView?: (row: any) => void;
}


const DinamicTable:React.FC<DinamicTableProps> = ({rows, columns, onDelete, onEdit, onView}) => {

    const [tableRows, setTableRows] = React.useState<any[]>([]);

    React.useEffect(()=>{
        setTableRows(rows)
    },[rows])

    const columnasBotones = [
        ...columns.map(col =>
            col.field === 'path_foto'
                ? {
                    ...col,
                    renderCell: (params: any) => (
                        <img
                            src={`https://lumina-testing.onrender.com/api/${params.value}`}
                            alt="image"
                            style={{width: '100%', height: 'auto', maxHeight: '50px', objectFit: 'contain'}}
                        />
                    )
                }
                : col
        ),
        ...(onView || onEdit || onDelete ? [{
            field: "actions",
            headerName: "Acciones",
            flex: 1.1,
            renderCell:(params: any)=>(
                <>
                    {onView && (
                        <IconButton color="primary" onClick={()=> onView(params.row)}>
                            <Visibility />
                        </IconButton>
                    )}
                    {onEdit && (
                        <IconButton color="primary" onClick={()=> onEdit(params.row)}>
                            <Edit />
                        </IconButton>
                    )}
                    {onDelete && (
                        <IconButton color="primary" onClick={()=> onDelete(params.row.id, params.row.codigo)}>
                            <Delete />
                        </IconButton>
                    )}
                </>
            )
        }] : [])
    ]

    const paginationModel = {page: 0, pageSize: 8}

    return(
        <Paper className="dinamic-table-container" sx={{height: 700, width: "75vw"}} role="region" aria-label="tabla dinamica">
            <DataGrid
                rows={tableRows}
                columns={columnasBotones}
                localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                initialState={{pagination:{paginationModel}}}
                pageSizeOptions={[5,8,10,50,100]}
                sx={{border: 0}}
            />
        </Paper>
    )
}

export default DinamicTable;