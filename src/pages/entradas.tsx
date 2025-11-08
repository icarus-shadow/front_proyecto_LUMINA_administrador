// @ts-ignore
import * as React from 'react';
import { Box, Typography } from "@mui/material";
import DinamicTable from '../components/DinamicTable';
import { usuarios, elementos } from '../mockData';
import type { GridColDef } from "@mui/x-data-grid";

const Entradas = () => {
    // Función para obtener elementos dentro de la institución
    const getElementosDentro = () => {
        return elementos
            .filter(elemento => elemento.estado === 'dentro')
            .map(elemento => {
                const usuario = usuarios.find(u => u.id === elemento.asignadoA);
                return {
                    ...elemento,
                    usuarioNombre: usuario ? usuario.nombre : 'Desconocido',
                    usuarioEmail: usuario ? usuario.email : '',
                    usuarioDepartamento: usuario ? usuario.departamento : ''
                };
            });
    };

    // Columnas para la tabla de entradas
    const columnasEntradas: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'nombre', headerName: 'Nombre', width: 200 },
        { field: 'descripcion', headerName: 'Descripción', width: 250 },
        { field: 'categoria', headerName: 'Categoría', width: 150 },
        { field: 'usuarioNombre', headerName: 'Asignado a', width: 200 },
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
                Elementos Dentro de la Institución
            </Typography>
            <DinamicTable
                rows={getElementosDentro()}
                columns={columnasEntradas}
            />
        </Box>
    );
};

export default Entradas;