// @ts-ignore
import * as React from 'react';
import { Box, Typography } from "@mui/material";
import DinamicTable from '../components/DinamicTable';
import type { GridColDef } from "@mui/x-data-grid";
import { useAppDispatch, useAppSelector } from "../services/redux/hooks.tsx";

const Elementos = () => {
    const dispatch = useAppDispatch();
    const elementos = useAppSelector((state) => state.elementsReducer.data)
    const usuarios = useAppSelector((state) => state.usersReducer.data)


    // Función para combinar datos de elementos con usuarios
    const getElementosConUsuario = () => {
        if (!elementos) return [];
        return elementos.map(elemento => {
            const usuario = usuarios.find(u => u.id === elemento.usuarios.id);
            return {
                ...elemento,
                usuarioNombre: usuario ? usuario.nombre : 'Desconocido',
            };
        });
    };

    // Columnas para la tabla de elementos
    const columnasElementos: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'nombre', headerName: 'Nombre', width: 200 },
        { field: 'descripcion', headerName: 'Descripción', width: 250 },
        { field: 'categoria', headerName: 'Categoría', width: 150 },
        { field: 'usuarioNombre', headerName: 'Asignado a', width: 200 },
        { field: 'usuarioEmail', headerName: 'Email Usuario', width: 250 },
        { field: 'estado', headerName: 'Estado', width: 100 },
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
                Lista de Elementos
            </Typography>
            <DinamicTable
                rows={getElementosConUsuario()}
                columns={columnasElementos}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </Box>
    );
};

export default Elementos;