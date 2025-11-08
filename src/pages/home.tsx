// @ts-ignore
import * as React from 'react';
import {Box} from "@mui/material";
import DinamicTable from '../components/DinamicTable';
import type {GridColDef} from "@mui/x-data-grid";

const Home = () => {
    // Datos de prueba para productos
    const productos = [
        { id: 1, nombre: 'Producto 1', precio: 100, descripcion: 'Descripción del producto 1', url_ruta_img: 'imagen1.jpg', codigo: 'P001' },
        { id: 2, nombre: 'Producto 2', precio: 200, descripcion: 'Descripción del producto 2', url_ruta_img: 'imagen2.jpg', codigo: 'P002' },
        { id: 3, nombre: 'Producto 3', precio: 300, descripcion: 'Descripción del producto 3', url_ruta_img: 'imagen3.jpg', codigo: 'P003' },
    ];

    // Columnas para la tabla
    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', flex: 1 },
        { field: 'nombre', headerName: 'Nombre', flex: 1 },
        { field: 'precio', headerName: 'Precio', flex: 1 },
        { field: 'descripcion', headerName: 'Descripción', flex: 1 },
        { field: 'url_ruta_img', headerName: 'Imagen', flex: 1 },
    ];

    // Funciones básicas para editar y eliminar
    const handleEdit = (row: any) => {
        console.log('Editar producto:', row);
    };

    const handleDelete = (id: number, codigo: string) => {
        console.log('Eliminar producto con ID:', id, 'y código:', codigo);
    };

    return (
        <Box>
            <DinamicTable
                rows={productos}
                columns={columns}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </Box>
    )
}

export default Home;