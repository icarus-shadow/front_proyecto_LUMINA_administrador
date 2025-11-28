// @ts-ignore
import * as React from 'react';
import '../components/styles/modal.css';
import {
    Box, Typography, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, Avatar
} from "@mui/material";
import DinamicTable from '../components/DinamicTable';
import type {GridColDef, GridValueGetter} from "@mui/x-data-grid";
import { useAppSelector } from "../services/redux/hooks.tsx";
import QRCode from 'react-qr-code';
import type { RootState } from "../services/redux/store.tsx";
const Elementos = () => {

    const users = useAppSelector((state: RootState) => state.usersReducer.data);
    const elementos = useAppSelector((state) => state.elementsReducer.data)

    React.useEffect(() => {
    }, [elementos, users]);

    const [detailModalOpen, setDetailModalOpen] = React.useState(false);
    const [selectedRecord, setSelectedRecord] = React.useState<any>(null);


    // Columnas para la tabla de elementos
    const columnasElementos: GridColDef[] = [
        { field: 'qr_hash', headerName: 'Código QR', width: 150, renderCell: (params) => <QRCode value={params.value} size={50} /> },
        { field: 'marca', headerName: 'Marca',flex: 1 },
        { field: 'tipo_elemento', headerName: 'Tipo de elemento', width: 250 },
        {
            field: 'propietario',
            headerName: 'Propietario',
            flex: 1.5,
            valueGetter: ((_value, row) => {
                if (!row.usuarios || row.usuarios.length === 0) {
                    return 'Sin propietario';
                } else if (row.usuarios.length === 1) {
                    return row.usuarios[0].nombre + ' ' + row.usuarios[0].apellido ;
                } else {
                    return row.usuarios.length + ' propietarios';
                }
            }) as GridValueGetter<any>,
        }
    ];

    // Funciones básicas para editar y eliminar
    const handleEdit = (row: any) => {
    };

    const handleDelete = (id: number, codigo: string) => {
    };

    const handleView = (row: any) => {
        setSelectedRecord(row);
        setDetailModalOpen(true);
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 2,  color: "var(--text)"}}>
                Lista de Elementos
            </Typography>
            <Box>
                <DinamicTable
                    rows={elementos || []}
                    columns={columnasElementos}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </Box>
            <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="md" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 0 } }}>
                <DialogTitle sx={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>Detalles del Elemento</DialogTitle>
                <DialogContent sx={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>
                    {selectedRecord && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                            <Box sx={{ display: 'flex', gap: 3, p: 4 }}>
                                {/* Sección Elemento Izquierda */}
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', textAlign: 'left', alignItems: 'center', p: 3, backgroundColor: 'rgba(var(--primary-rgb), 0.1)', borderRadius: 2, border: '1px solid rgba(var(--primary-rgb), 0.3)' }}>
                                    <Typography variant="h6" sx={{ color: 'var(--primary)', mb: 2, alignSelf: 'flex-start', fontWeight: 'bold' }}>Elemento</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2, mb: 2, justifyContent: 'center' }}>
                                        {selectedRecord.path_foto_equipo_implemento && (
                                            <img src={selectedRecord.path_foto_equipo_implemento} alt="Imagen del Elemento" style={{ width: '100px', height: '100px', borderRadius: '8px' }} />
                                        )}
                                        <QRCode value={selectedRecord.qr_hash} size={100} />
                                    </Box>
                                    <Typography variant="body1" sx={{ mb: 1, alignSelf: 'flex-start' }}><strong>Marca:</strong> {selectedRecord.marca}</Typography>
                                    <Typography variant="body1" sx={{ mb: 1, alignSelf: 'flex-start' }}><strong>Tipo:</strong> {selectedRecord.tipo_elemento}</Typography>
                                    <Typography variant="body1" sx={{ mb: 1, alignSelf: 'flex-start' }}><strong>Serie:</strong> {selectedRecord.sn_equipo}</Typography>
                                    <Typography variant="body1" sx={{ mb: 1, alignSelf: 'flex-start' }}><strong>Color:</strong> {selectedRecord.color}</Typography>
                                    <Typography variant="body1" sx={{ mb: 1, alignSelf: 'flex-start' }}><strong>Descripción:</strong> {selectedRecord.descripcion}</Typography>
                                </Box>
                                {/* Sección Propietario Derecha */}
                                <Box sx={{ flex: 1, display: 'flex', textAlign: 'left', flexDirection: 'column', alignItems: 'center', p: 3, backgroundColor: 'rgba(var(--secondary-rgb), 0.1)', borderRadius: 2, border: '1px solid rgba(var(--secondary-rgb), 0.3)' }}>
                                    <Typography variant="h6" sx={{ color: 'var(--secondary)', mb: 2, fontWeight: 'bold', alignSelf: 'flex-start' }}>Propietario(s)</Typography>
                                    {selectedRecord.usuarios && selectedRecord.usuarios.length > 0 ? (
                                        <Box sx={{ maxHeight: '290px', overflowY: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
                                            {selectedRecord.usuarios.map((userWrapper: any, index: number) => {
                                                const user = userWrapper.user || userWrapper;
                                                if (!user) {
                                                    return null;
                                                }
                                                return (
                                                    <Box key={index} sx={{ display: 'flex', backgroundColor: 'rgba(var(--secondary-rgb), 0.2)', flexDirection: 'column', alignItems: 'center', mb: 2, textAlign: 'left', padding: 3, borderRadius: 5, marginBottom: 5 }}>
                                                        <Avatar src={user.path_foto} alt={user.nombre} sx={{ width: 50, height: 50, mb: 2, border: '2px solid var(--secondary)' }} />
                                                        <Box>
                                                            <Typography variant="body1" sx={{ mb: 1, alignSelf: 'flex-start' }}><strong>Nombre:</strong> {user.nombre} {user.apellido}</Typography>
                                                            <Typography variant="body1" sx={{ mb: 1, alignSelf: 'flex-start' }}><strong>Email:</strong> {user.email}</Typography>
                                                            <Typography variant="body1" sx={{ mb: 1, alignSelf: 'flex-start' }}><strong>Documento:</strong> {user.documento}</Typography>
                                                            <Typography variant="body1" sx={{ mb: 1, alignSelf: 'flex-start' }}><strong>Teléfono:</strong> {user.numero_telefono}</Typography>
                                                        </Box>
                                                    </Box>
                                                );
                                            })}
                                        </Box>
                                    ) : (
                                        <Typography variant="body1">Sin propietario asignado</Typography>
                                    )}
                                    {selectedRecord.usuarios && selectedRecord.usuarios.length > 1 && (
                                        <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>bajar para ver demas propietarios</Typography>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ backgroundColor: 'var(--background)' }}>
                    <Button onClick={() => setDetailModalOpen(false)} sx={{ color: 'white', backgroundColor: '#f44336', '&:hover': { backgroundColor: '#d32f2f' }, fontSize: '1.1rem', padding: '8px 16px' }}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Elementos;