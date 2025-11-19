// @ts-ignore
import * as React from 'react';
import { Box, Typography } from "@mui/material";
import DinamicTable from '../components/DinamicTable';
import type { GridColDef,  GridValueGetter} from "@mui/x-data-grid";
import {useAppDispatch, useAppSelector } from '../services/redux/hooks';
import {deleteUser, fetchUsers} from "../services/redux/slices/data/UsersSlice.tsx";
import {useAlert} from "../components/AlertSystem.tsx";

const Usuarios = () => {
    const { showAlert } = useAlert()

    const dispatch = useAppDispatch();
    const data = useAppSelector((state) => state.usersReducer.data);
    const fetchSuccess = useAppSelector((state) => state.usersReducer.fetchSuccess);
    const deleteSuccess = useAppSelector((state) => state.usersReducer.deleteSuccess);


    React.useEffect(() => {
        dispatch(fetchUsers())
    }, []);

    React.useEffect (()=> {
        if (fetchSuccess == true){
            showAlert("success", "usuarios actualizados");
        } else if (fetchSuccess == false) {
            showAlert("error", "error al actualizar la información")
        }
    }, [fetchSuccess]);

    React.useEffect(() => {
        if (deleteSuccess == true) {
            showAlert("success", "usuario eliminado correctamente")
        } else if (deleteSuccess == false) {
            showAlert("error", "error al eliminar el usuario")
        }
    }, [deleteSuccess])

    const columnasUsuarios: GridColDef[] = [
        { field: 'nombre', headerName: 'Nombre', flex: 1 },
        { field: 'apellido', headerName: 'Apellido', flex: 1 },
        { field: 'tipo_documento', headerName: 'Tipo Doc', flex: 0.5 },
        { field: 'documento', headerName: 'Documento', flex: 1 },
        { field: 'edad', headerName: 'Edad', flex: 0.3 },
        { field: 'email', headerName: 'Email', flex: 1.5 },
        { field: 'numero_telefono', headerName: 'Teléfono', flex: 0.6 },
        {
            field: 'ficha',
            headerName: 'ficha',
            flex: 0.7,
            valueGetter: ((_value, row) => row.formacion?.ficha) as GridValueGetter<any>,
        },
        {
            field: 'formacion',
            headerName: 'nombre formación',
            flex: 1.3,
            valueGetter: ((_value, row) => row.formacion?.nombre_programa) as GridValueGetter<any>,
        },
        {
            field: 'role',
            headerName: 'Rol',
            flex: 0.5,
            valueGetter: ((_value, row) => row.role?.nombre_rol) as GridValueGetter<any>,
        },
    ];

    // Funciones básicas para editar y eliminar
    const handleEdit = (row: any) => {
        console.log('Editar:', row);
    };

    const handleDelete = (id: number) => {
        dispatch(deleteUser(id));
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 2, color: 'var(--text)' }}>
                Lista de Usuarios
            </Typography>
            <DinamicTable
                rows={data}
                columns={columnasUsuarios}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </Box>
    );
};

export default Usuarios;