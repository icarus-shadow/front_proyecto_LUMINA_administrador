// @ts-ignore
import * as React from 'react';
import { Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, Avatar } from "@mui/material";
import DinamicTable from '../components/DinamicTable';
import type { GridColDef, GridValueGetter } from "@mui/x-data-grid";
import { useAppDispatch, useAppSelector } from '../services/redux/hooks';
import { deleteUser } from "../services/redux/slices/data/UsersSlice.tsx";
import '../components/styles/modal.css';

const Usuarios = () => {

    const dispatch = useAppDispatch();
    const data = useAppSelector((state) => state.usersReducer.data);
    const elements = useAppSelector((state) => state.elementsReducer.data);

    const [selectedUser, setSelectedUser] = React.useState<any>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);


    React.useEffect(() => {
    }, []);



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
    };

    const handleDelete = (id: number) => {
        dispatch(deleteUser(id));
    };

    const handleView = (row: any) => {
        setSelectedUser(row);
        setIsModalOpen(true);
    }

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
                onView={handleView}
            />
            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="md" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 0 } }}>
                <DialogTitle sx={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>Detalles del Usuario</DialogTitle>
                <DialogContent sx={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>
                    {selectedUser && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                            <Box sx={{ display: 'flex', gap: 3, p: 4 }}>
                                {/* Sección Izquierda: Información del Usuario */}
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', textAlign: 'left', alignItems: 'center', p: 3, backgroundColor: 'rgba(var(--secondary-rgb), 0.2)', borderRadius: 5 }}>
                                    <Typography variant="h6" sx={{ color: 'var(--secondary)', mb: 2, alignSelf: 'flex-start', fontWeight: 'bold' }}>Información del Usuario</Typography>
                                    {selectedUser.path_foto && (
                                        <Avatar src={selectedUser.path_foto} alt={selectedUser.nombre} sx={{ width: 100, height: 100, mb: 2, border: '4px solid var(--secondary)', borderRadius: '50%' }} />
                                    )}
                                    <Typography variant="body1" sx={{ mb: 1, alignSelf: 'flex-start' }}><strong>Nombre:</strong> {selectedUser.nombre}</Typography>
                                    <Typography variant="body1" sx={{ mb: 1, alignSelf: 'flex-start' }}><strong>Apellido:</strong> {selectedUser.apellido}</Typography>
                                    <Typography variant="body1" sx={{ mb: 1, alignSelf: 'flex-start' }}><strong>Tipo Documento:</strong> {selectedUser.tipo_documento}</Typography>
                                    <Typography variant="body1" sx={{ mb: 1, alignSelf: 'flex-start' }}><strong>Documento:</strong> {selectedUser.documento}</Typography>
                                    <Typography variant="body1" sx={{ mb: 1, alignSelf: 'flex-start' }}><strong>Edad:</strong> {selectedUser.edad}</Typography>
                                    <Typography variant="body1" sx={{ mb: 1, alignSelf: 'flex-start' }}><strong>Email:</strong> {selectedUser.email}</Typography>
                                    <Typography variant="body1" sx={{ mb: 1, alignSelf: 'flex-start' }}><strong>Teléfono:</strong> {selectedUser.numero_telefono}</Typography>
                                    <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(var(--secondary-rgb), 0.2)', borderRadius: 5, alignSelf: 'stretch' }}>
                                        <Typography variant="body1"><strong>Equipos asignados:</strong> {elements ? elements.filter((el: any) => el.usuarios && el.usuarios.some((u: any) => u.id === selectedUser.id)).length : 0}</Typography>
                                    </Box>
                                </Box>
                                {/* Sección Derecha: Información de la Formación */}
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', textAlign: 'left', alignItems: 'center', p: 3, backgroundColor: 'rgba(var(--secondary-rgb), 0.2)', borderRadius: 5 }}>
                                    <Typography variant="h6" sx={{ color: 'var(--secondary)', mb: 2, fontWeight: 'bold', alignSelf: 'flex-start' }}>Formación</Typography>
                                    {selectedUser.formacion ? (
                                        <Box>
                                            <Typography variant="body1" sx={{ mb: 1, alignSelf: 'flex-start' }}><strong>Ficha:</strong> {selectedUser.formacion.ficha}</Typography>
                                            <Typography variant="body1" sx={{ mb: 1, alignSelf: 'flex-start' }}><strong>Programa:</strong> {selectedUser.formacion.nombre_programa}</Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{ p: 2, backgroundColor: 'rgba(var(--secondary-rgb), 0.2)', borderRadius: 5 }}>
                                            <Typography variant="body1">FUNCIONARIO</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ backgroundColor: 'var(--background)' }}>
                    <Button onClick={() => setIsModalOpen(false)} sx={{ color: 'white', backgroundColor: '#f44336', '&:hover': { backgroundColor: '#d32f2f' }, fontSize: '1.1rem', padding: '8px 16px' }}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Usuarios;