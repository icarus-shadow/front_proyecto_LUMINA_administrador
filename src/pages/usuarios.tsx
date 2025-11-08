// @ts-ignore
import * as React from 'react';
import { Box, Typography } from "@mui/material";
import DinamicTable from '../components/DinamicTable';
import { usuarios } from '../mockData';
import type { GridColDef } from "@mui/x-data-grid";

const Usuarios = () => {
    // Columnas para la tabla de usuarios
    const columnasUsuarios: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'nombre', headerName: 'Nombre', width: 200 },
        { field: 'email', headerName: 'Email', width: 250 },
        { field: 'departamento', headerName: 'Departamento', width: 200 },
    ];

    // Funciones básicas para editar y eliminar
    const handleEdit = (row: any) => {
        console.log('Editar:', row);
    };

    const handleDelete = (id: number, codigo: string) => {
        console.log('Eliminar:', id, 'y código:', codigo);
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 2 }}>
                Lista de Usuarios
            </Typography>
            <DinamicTable
                rows={usuarios}
                columns={columnasUsuarios}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </Box>
    );
};

export default Usuarios;