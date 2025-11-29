// @ts-ignore
import * as React from 'react';
import { Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, Avatar } from "@mui/material";
import DinamicTable from '../components/DinamicTable';
import ModalForm, { type FieldConfig } from '../components/modalForm';
import type { GridColDef, GridValueGetter } from "@mui/x-data-grid";
import { useAppDispatch, useAppSelector } from '../services/redux/hooks';
import { deleteUser, editUSer, addUser } from "../services/redux/slices/data/UsersSlice.tsx";
import { fetchFormations } from '../services/redux/slices/data/formationSlice';
import type { RootState } from '../services/redux/store';
import type { EditUserPayload, AddUserPayload } from '../types/interfacesData';
import '../components/styles/modal.css';

const Usuarios = () => {

    const dispatch = useAppDispatch();
    const data = useAppSelector((state) => state.usersReducer.data);
    const elements = useAppSelector((state) => state.elementsReducer.data);
    const formations = useAppSelector((state: RootState) => state.formationsReducer.data);

    const [selectedUser, setSelectedUser] = React.useState<any>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedUserForEdit, setSelectedUserForEdit] = React.useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);


    React.useEffect(() => {
        if (formations && formations.length === 0) {
            dispatch(fetchFormations());
        }
    }, [dispatch, formations?.length]);



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
            valueGetter: ((_value, row) => row && row.formacion && row.formacion.ficha ? row.formacion.ficha : '') as GridValueGetter<any>,
        },
        {
            field: 'formacion',
            headerName: 'nombre formación',
            flex: 1.3,
            valueGetter: ((_value, row) => row && row.formacion && row.formacion.nombre_programa ? row.formacion.nombre_programa : '') as GridValueGetter<any>,
        },
        {
            field: 'role',
            headerName: 'Rol',
            flex: 0.5,
            valueGetter: ((_value, row) => row && row.role && row.role.nombre_rol ? row.role.nombre_rol : '') as GridValueGetter<any>,
        },
    ];

    // Campos para edición
    const editLeftFields: FieldConfig[] = [
        { name: 'role_id', label: 'Rol', type: 'select', required: true, options: [{value:1, label:'usuario'}, {value:2, label:'admin'}, {value:3, label:'portero'}] },
        { name: 'nombre', label: 'Nombre', type: 'text', required: true },
        { name: 'apellido', label: 'Apellido', type: 'text', required: true },
        { name: 'tipo_documento', label: 'Tipo Documento', type: 'text', required: true },
        { name: 'documento', label: 'Documento', type: 'text', required: true },
        { name: 'edad', label: 'Edad', type: 'number', required: true },
        { name: 'numero_telefono', label: 'Número Teléfono', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'path_foto', label: 'Foto', type: 'file', accept: 'image/*' },
    ];

    const editRightFields: FieldConfig[] = [
        { name: 'formacion_id', label: 'Formación', type: 'select', options: formations?.map(f => ({value: f.id, label: f.nombre_programa})) || [] },
    ];

    const editLeftTitle = 'Información del Usuario';
    const editRightTitle = 'Formación';
    const editBannerMessage = formations?.length === 0 ? 'No hay formaciones disponibles' : undefined;

    // Campos para agregar usuario
    const addLeftFields: FieldConfig[] = [
        { name: 'role_id', label: 'Rol', type: 'select', required: true, options: [{value:1, label:'usuario'}, {value:2, label:'admin'}, {value:3, label:'portero'}] },
        { name: 'nombre', label: 'Nombre', type: 'text', required: true },
        { name: 'apellido', label: 'Apellido', type: 'text', required: true },
        { name: 'tipo_documento', label: 'Tipo Documento', type: 'text', required: true },
        { name: 'documento', label: 'Documento', type: 'text', required: true },
        { name: 'edad', label: 'Edad', type: 'number', required: true },
        { name: 'numero_telefono', label: 'Número Teléfono', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'password', label: 'Contraseña', type: 'password', required: true },
        { name: 'path_foto', label: 'Foto', type: 'file', accept: 'image/*' },
    ];

    const addRightFields: FieldConfig[] = [
        { name: 'formacion_id', label: 'Formación', type: 'select', options: formations?.map(f => ({value: f.id, label: f.nombre_programa})) || [] },
    ];

    const addLeftTitle = 'Información del Usuario';
    const addRightTitle = 'Formación';
    const addBannerMessage = formations?.length === 0 ? 'No hay formaciones disponibles' : undefined;

    // Funciones básicas para editar y eliminar
    const handleEdit = (row: any) => {
        setSelectedUserForEdit(row);
        setIsEditModalOpen(true);
    };

    const handleDelete = (id: number) => {
        dispatch(deleteUser(id));
    };

    const handleView = (row: any) => {
        setSelectedUser(row);
        setIsModalOpen(true);
    }

    const handleEditSubmit = (data: Record<string, any>) => {
        const payload: EditUserPayload = {
            id: selectedUserForEdit.id,
            role_id: data.role_id,
            formacion_id: data.formacion_id || null,
            nombre: data.nombre,
            apellido: data.apellido,
            tipo_documento: data.tipo_documento,
            documento: data.documento,
            edad: data.edad,
            numero_telefono: data.numero_telefono,
            email: data.email,
            path_foto: data.path_foto,
        };
        dispatch(editUSer(payload));
        setIsEditModalOpen(false);
    }

    const handleAddSubmit = (data: Record<string, any>) => {
        const payload: AddUserPayload = {
            role_id: data.role_id,
            formacion_id: data.formacion_id || null,
            nombre: data.nombre,
            apellido: data.apellido,
            tipo_documento: data.tipo_documento,
            documento: data.documento,
            edad: data.edad,
            numero_telefono: data.numero_telefono,
            email: data.email,
            password: data.password,
            path_foto: data.path_foto,
        };
        dispatch(addUser(payload));
        setIsAddModalOpen(false);
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 2, color: 'var(--text)' }}>
                Lista de Usuarios
            </Typography>
            <Button
                variant="contained"
                onClick={() => setIsAddModalOpen(true)}
                sx={{ mb: 2, backgroundColor: 'var(--primary)', color: 'var(--text)' }}
            >
                Agregar Usuario
            </Button>
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
                                        <Avatar src={`https://lumina-testing.onrender.com/api/images/${selectedUser.path_foto}`} alt={selectedUser.nombre} sx={{ width: 100, height: 100, mb: 2, border: '4px solid var(--secondary)', borderRadius: '50%' }} />
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
            <ModalForm
                isOpen={isEditModalOpen}
                title="Editar Usuario"
                leftFields={editLeftFields}
                rightFields={editRightFields}
                leftTitle={editLeftTitle}
                rightTitle={editRightTitle}
                bannerMessage={editBannerMessage}
                initialValue={selectedUserForEdit ? {
                    role_id: selectedUserForEdit.role_id,
                    nombre: selectedUserForEdit.nombre,
                    apellido: selectedUserForEdit.apellido,
                    tipo_documento: selectedUserForEdit.tipo_documento,
                    documento: selectedUserForEdit.documento,
                    edad: selectedUserForEdit.edad,
                    numero_telefono: selectedUserForEdit.numero_telefono,
                    email: selectedUserForEdit.email,
                    formacion_id: selectedUserForEdit.formacion_id,
                } : {}}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditSubmit}
            />
            <ModalForm
                isOpen={isAddModalOpen}
                title="Agregar Usuario"
                leftFields={addLeftFields}
                rightFields={addRightFields}
                leftTitle={addLeftTitle}
                rightTitle={addRightTitle}
                bannerMessage={addBannerMessage}
                initialValue={{}}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddSubmit}
            />
        </Box>
    );
};

export default Usuarios;