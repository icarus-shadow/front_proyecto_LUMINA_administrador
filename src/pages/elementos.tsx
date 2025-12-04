// @ts-ignore
import * as React from 'react';
import '../components/styles/modal.css';
import {
    Box, Typography, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, Avatar
} from "@mui/material";
import DinamicTable from '../components/DinamicTable';
import RegisterEquipmentModal from '../components/RegisterEquipmentModal';
import type { GridColDef } from "@mui/x-data-grid";
import { useAppDispatch, useAppSelector } from "../services/redux/hooks.tsx";
import { fetchUsers } from '../services/redux/slices/data/UsersSlice';
import { fetchSubElements } from '../services/redux/slices/data/subElementsSlice';
import { deleteElement, fetchElementAssignments } from '../services/redux/slices/data/elementsSlice';
import QRCode from 'react-qr-code';
import type { RootState } from "../services/redux/store.tsx";
const Elementos = () => {

    const dispatch = useAppDispatch();
    const users = useAppSelector((state: RootState) => state.usersReducer.data);
    const elementos = useAppSelector((state) => state.elementsReducer.data)

    React.useEffect(() => {
    }, [elementos, users]);

    const [detailModalOpen, setDetailModalOpen] = React.useState(false);
    const [selectedRecord, setSelectedRecord] = React.useState<any>(null);
    const [editModalOpen, setEditModalOpen] = React.useState(false);
    const [editElement, setEditElement] = React.useState<any>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [elementToDelete, setElementToDelete] = React.useState<{ id: number; sn_equipo?: string; marca?: string; tipo_elemento?: string } | null>(null);


    // Columnas para la tabla de elementos
    const columnasElementos: GridColDef[] = [
        { field: 'qr_hash', headerName: 'Código QR', width: 150, renderCell: (params) => <QRCode value={params.value} size={50} /> },
        { field: 'marca', headerName: 'Marca', flex: 1 },
        { field: 'tipo_elemento', headerName: 'Tipo de elemento', width: 250 },
        {
            field: 'propietario',
            headerName: 'Propietario',
            flex: 1.5,
            valueGetter: (params) => {
                const row = params.row;
                if (!row || !row.usuarios || row.usuarios.length === 0) {
                    return 'Sin propietario';
                } else if (row.usuarios.length === 1) {
                    return row.usuarios[0].nombre + ' ' + row.usuarios[0].apellido;
                } else {
                    return row.usuarios.length + ' propietarios';
                }
            },
        }
    ];

    // Funciones básicas para editar y eliminar
    const handleEdit = async (row: any) => {
        // Ensure catalogs are loaded before opening the modal
        await Promise.all([
            dispatch(fetchUsers()).unwrap?.() ?? dispatch(fetchUsers()),
            dispatch(fetchSubElements()).unwrap?.() ?? dispatch(fetchSubElements()),
        ]);
        setEditElement(row);
        setEditModalOpen(true);
    };

    const handleDelete = (id: number, row: any) => {
        console.log('handleDelete - row completo:', row);
        console.log('handleDelete - sn_equipo:', row?.sn_equipo);
        console.log('handleDelete - marca:', row?.marca);
        console.log('handleDelete - tipo_elemento:', row?.tipo_elemento);
        setElementToDelete({ 
            id, 
            sn_equipo: row?.sn_equipo,
            marca: row?.marca,
            tipo_elemento: row?.tipo_elemento
        });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!elementToDelete) return;
        try {
            await dispatch(deleteElement(elementToDelete.id.toString())).unwrap();
            setDeleteDialogOpen(false);
            setElementToDelete(null);
        } catch (error) {
            console.error('Error al eliminar elemento:', error);
            alert('Error al eliminar el elemento. Por favor intente nuevamente.');
        }
    };

    const handleView = async (row: any) => {
        console.log('handleView - row completo:', row);
        
        // Obtener los elementos adicionales del equipo usando Redux
        try {
            const result = await dispatch(fetchElementAssignments(row.id)).unwrap();
            console.log('Datos completos con elementos adicionales:', result);
            console.log('result.data:', result.data);
            console.log('result.data.elementos_adicionales:', result.data?.elementos_adicionales);
            // Combinar los datos del row con los elementos adicionales
            setSelectedRecord({
                ...row,
                elementos_adicionales: result.data?.elementos_adicionales || []
            });
        } catch (error) {
            console.error('Error al obtener elementos adicionales:', error);
            setSelectedRecord(row);
        }
        
        setDetailModalOpen(true);
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 2, color: "var(--text)" }}>
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
            <RegisterEquipmentModal
                visible={editModalOpen}
                onHide={() => setEditModalOpen(false)}
                isEdit
                initialElement={editElement || null}
            />
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
                                        {selectedRecord.path_foto_equipo_implemento && (() => {
                                            // Extraer solo el nombre del archivo de la ruta
                                            const filename = selectedRecord.path_foto_equipo_implemento.split('/').pop() || selectedRecord.path_foto_equipo_implemento;
                                            const imageUrl = `https://lumina-testing.onrender.com/api/images/${filename}`;

                                            return (
                                                <img
                                                    src={imageUrl}
                                                    alt="Imagen del Elemento"
                                                    style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        console.error('Error cargando imagen. URL intentada:', imageUrl);
                                                        console.error('Path original:', selectedRecord.path_foto_equipo_implemento);
                                                    }}
                                                />
                                            );
                                        })()}
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
                            
                            {/* Sección Elementos Adicionales */}
                            {selectedRecord.elementos_adicionales && selectedRecord.elementos_adicionales.length > 0 && (
                                <Box sx={{ 
                                    mx: 4,
                                    mb: 2,
                                    p: 3, 
                                    backgroundColor: 'rgba(var(--primary-rgb), 0.05)', 
                                    borderRadius: 2, 
                                    border: '1px solid rgba(var(--primary-rgb), 0.2)' 
                                }}>
                                    <Typography variant="h6" sx={{ color: 'var(--primary)', mb: 2.5, fontWeight: 'bold' }}>
                                        Elementos Adicionales
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                        {selectedRecord.elementos_adicionales.map((elemento: any, index: number) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    backgroundColor: 'var(--primary)',
                                                    color: 'white',
                                                    padding: '8px 16px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 500,
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                {elemento.elemento_adicional?.nombre_elemento || elemento.nombre_elemento || 'Sin nombre'}
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ backgroundColor: 'var(--background)' }}>
                    <Button onClick={() => setDetailModalOpen(false)} sx={{ color: 'white', backgroundColor: '#f44336', '&:hover': { backgroundColor: '#d32f2f' }, fontSize: '1.1rem', padding: '8px 16px' }}>Cerrar</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog 
                open={deleteDialogOpen} 
                onClose={() => setDeleteDialogOpen(false)} 
                maxWidth="sm" 
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: 'var(--background)',
                        border: '2px solid rgba(var(--secondary-rgb), 0.3)',
                        borderRadius: '12px'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    backgroundColor: 'var(--background)', 
                    color: 'var(--secondary)',
                    borderBottom: '1px solid rgba(var(--secondary-rgb), 0.2)',
                    fontWeight: 'bold',
                    fontSize: '1.5rem',
                    pb: 2
                }}>
                    ⚠️ Confirmar Eliminación
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: 'var(--background)', color: 'var(--text)', mt: 3 }}>
                    <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem' }}>
                        ¿Está seguro que desea eliminar el siguiente elemento?
                    </Typography>
                    <Box sx={{ 
                        p: 3, 
                        backgroundColor: 'rgba(var(--primary-rgb), 0.08)', 
                        borderRadius: '8px',
                        border: '1px solid rgba(var(--primary-rgb), 0.2)'
                    }}>
                        {elementToDelete?.sn_equipo?.trim() && (
                            <Typography sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <strong style={{ minWidth: '80px', color: 'var(--primary)' }}>Serial:</strong> 
                                <span style={{ color: 'var(--text)' }}>{elementToDelete.sn_equipo}</span>
                            </Typography>
                        )}
                        {elementToDelete?.marca?.trim() && (
                            <Typography sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <strong style={{ minWidth: '80px', color: 'var(--primary)' }}>Marca:</strong> 
                                <span style={{ color: 'var(--text)' }}>{elementToDelete.marca}</span>
                            </Typography>
                        )}
                        {elementToDelete?.tipo_elemento?.trim() && (
                            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <strong style={{ minWidth: '80px', color: 'var(--primary)' }}>Tipo:</strong> 
                                <span style={{ color: 'var(--text)' }}>{elementToDelete.tipo_elemento}</span>
                            </Typography>
                        )}
                    </Box>
                    <Box sx={{ 
                        mt: 3, 
                        p: 2, 
                        backgroundColor: 'rgba(244, 67, 54, 0.1)', 
                        borderRadius: '8px',
                        border: '1px solid rgba(244, 67, 54, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                        <Typography sx={{ color: '#f44336', fontWeight: 600, fontSize: '0.95rem' }}>
                            Esta acción no se puede deshacer y eliminará permanentemente el elemento del sistema.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ 
                    backgroundColor: 'var(--background)', 
                    p: 3, 
                    gap: 2,
                    borderTop: '1px solid rgba(var(--secondary-rgb), 0.2)'
                }}>
                    <Button 
                        onClick={() => setDeleteDialogOpen(false)} 
                        variant="outlined"
                        sx={{ 
                            color: 'var(--text)',
                            borderColor: 'rgba(var(--text-rgb), 0.3)',
                            px: 3,
                            py: 1,
                            fontSize: '1rem',
                            textTransform: 'none',
                            '&:hover': {
                                borderColor: 'var(--text)',
                                backgroundColor: 'rgba(var(--text-rgb), 0.05)'
                            }
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={confirmDelete} 
                        variant="contained"
                        sx={{ 
                            color: 'white', 
                            backgroundColor: '#f44336',
                            px: 3,
                            py: 1,
                            fontSize: '1rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            boxShadow: '0 4px 6px rgba(244, 67, 54, 0.3)',
                            '&:hover': { 
                                backgroundColor: '#d32f2f',
                                boxShadow: '0 6px 8px rgba(244, 67, 54, 0.4)'
                            }
                        }}
                    >
                        Eliminar Elemento
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Elementos;