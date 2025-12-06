// @ts-ignore
import * as React from 'react';
import '../components/styles/modal.css';
import {
    Box, Typography, Button as MuiButton,
    Dialog, DialogTitle, DialogContent, DialogActions, Avatar
} from "@mui/material";
import DinamicTable from '../components/DinamicTable';
import RegisterEquipmentModal from '../components/RegisterEquipmentModal';
import type { GridColDef } from "@mui/x-data-grid";
import { useAppDispatch, useAppSelector } from "../services/redux/hooks.tsx";
import { useAlert } from '../components/AlertSystem';
import { fetchUsers } from '../services/redux/slices/data/UsersSlice';
import { fetchSubElements } from '../services/redux/slices/data/subElementsSlice';
import { deleteElement, fetchElementAssignments } from '../services/redux/slices/data/elementsSlice';
import { fetchFormations } from '../services/redux/slices/data/formationSlice';
import QRCode from 'react-qr-code';
import type { RootState } from "../services/redux/store.tsx";
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';

const Elementos = () => {

    const dispatch = useAppDispatch();
    const { showAlert } = useAlert();
    const users = useAppSelector((state: RootState) => state.usersReducer.data);
    const elementos = useAppSelector((state) => state.elementsReducer.data);
    const formations = useAppSelector((state: RootState) => state.formationsReducer.data);

    const [userDocSearch, setUserDocSearch] = React.useState('');
    const [selectedFormation, setSelectedFormation] = React.useState<any>(null);

    React.useEffect(() => {
        if (!formations || formations.length === 0) {
            dispatch(fetchFormations());
        }
    }, [dispatch, formations?.length]);

    React.useEffect(() => {
    }, [elementos, users]);

    const [detailModalOpen, setDetailModalOpen] = React.useState(false);
    const [selectedRecord, setSelectedRecord] = React.useState<any>(null);
    const [editModalOpen, setEditModalOpen] = React.useState(false);
    const [editElement, setEditElement] = React.useState<any>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [elementToDelete, setElementToDelete] = React.useState<{ id: number; sn_equipo?: string; marca?: string; tipo_elemento?: string } | null>(null);
    const qrRef = React.useRef<HTMLDivElement>(null);

    // Filter logic
    const filteredElementos = React.useMemo(() => {
        return elementos?.filter((elemento: any) => {
            // Check owner document filter
            const matchesDoc = userDocSearch
                ? elemento.usuarios && elemento.usuarios.some((u: any) => {
                    const userDoc = u.user?.documento || u.documento; // Handle potentially nested user object
                    return userDoc && userDoc.toLowerCase().includes(userDocSearch.toLowerCase());
                })
                : true;

            // Check owner formation filter
            const matchesFormation = selectedFormation
                ? elemento.usuarios && elemento.usuarios.some((u: any) => {
                    const userFormationId = u.user?.formacion_id || u.formacion_id;
                    return userFormationId === selectedFormation.id;
                })
                : true;

            return matchesDoc && matchesFormation;
        }) || [];
    }, [elementos, userDocSearch, selectedFormation]);


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
                    const user = row.usuarios[0].user || row.usuarios[0];
                    return user.nombre + ' ' + user.apellido;
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
            showAlert("error", 'Error al eliminar el elemento. Por favor intente nuevamente.');
        }
    };

    const handleView = async (row: any) => {
        // Obtener los elementos adicionales del equipo usando Redux
        try {
            const result = await dispatch(fetchElementAssignments(row.id)).unwrap();
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

    const handleDownloadQR = () => {
        if (!qrRef.current || !selectedRecord) return;

        const svg = qrRef.current.querySelector('svg');
        if (!svg) return;

        // Crear un canvas para convertir el SVG a imagen
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Configurar el tamaño del canvas
        const svgSize = 300; // Tamaño más grande para mejor calidad
        canvas.width = svgSize;
        canvas.height = svgSize;

        // Convertir SVG a string
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        // Crear una imagen desde el SVG
        const img = new Image();
        img.onload = () => {
            // Dibujar la imagen en el canvas con fondo blanco
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, svgSize, svgSize);
            ctx.drawImage(img, 0, 0, svgSize, svgSize);

            // Convertir canvas a blob y descargar
            canvas.toBlob((blob) => {
                if (blob) {
                    const link = document.createElement('a');
                    const downloadUrl = URL.createObjectURL(blob);
                    link.href = downloadUrl;
                    link.download = `QR_${selectedRecord.qr_hash || 'codigo'}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(downloadUrl);
                }
            }, 'image/png');

            URL.revokeObjectURL(url);
        };
        img.src = url;
    };

    const handlePrintQR = () => {
        if (!qrRef.current || !selectedRecord) return;

        const svg = qrRef.current.querySelector('svg');
        if (!svg) return;

        // Crear ventana de impresión
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const svgData = new XMLSerializer().serializeToString(svg);

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Imprimir QR - ${selectedRecord.marca || 'Elemento'}</title>
                <style>
                    body {
                        margin: 0;
                        padding: 20px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        font-family: Arial, sans-serif;
                    }
                    .qr-container {
                        text-align: center;
                    }
                    svg {
                        width: 300px;
                        height: 300px;
                        margin: 20px 0;
                    }
                    h2 {
                        margin: 10px 0;
                        color: #333;
                    }
                    p {
                        margin: 5px 0;
                        color: #666;
                    }
                    @media print {
                        body {
                            padding: 0;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="qr-container">
                    <h2>${selectedRecord.marca || 'Elemento'}</h2>
                    <p><strong>Tipo:</strong> ${selectedRecord.tipo_elemento || 'N/A'}</p>
                    <p><strong>Serie:</strong> ${selectedRecord.sn_equipo || 'N/A'}</p>
                    ${svgData}
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();

        // Esperar a que se cargue antes de imprimir
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };

    const formationOptionTemplate = (option: any) => {
        return (
            <div className="flex align-items-center">
                <div>{option.nombre_programa} - {option.ficha}</div>
            </div>
        );
    };

    const selectedFormationTemplate = (option: any, props: any) => {
        if (option) {
            return (
                <div className="flex align-items-center">
                    <div>{option.nombre_programa} - {option.ficha}</div>
                </div>
            );
        }
        return <span>{props.placeholder}</span>;
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 2, color: "var(--text)" }}>
                Lista de Elementos
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" style={{ color: 'var(--primary)' }} />
                    <InputText
                        value={userDocSearch}
                        onChange={(e) => setUserDocSearch(e.target.value)}
                        placeholder="Buscar por doc. propietario"
                        style={{
                            backgroundColor: 'var(--background)',
                            color: 'var(--text)',
                            borderColor: 'var(--secondary)',
                            borderRadius: 'var(--button-border-radius)'
                        }}
                    />
                </span>
                <Dropdown
                    value={selectedFormation}
                    onChange={(e) => setSelectedFormation(e.value)}
                    options={formations || []}
                    optionLabel="nombre_programa"
                    placeholder="Filtrar por Formación (prop.)"
                    filter
                    filterBy="nombre_programa,ficha"
                    showClear
                    itemTemplate={formationOptionTemplate}
                    valueTemplate={selectedFormationTemplate}
                    style={{
                        width: '300px',
                        backgroundColor: 'var(--background)',
                        color: 'var(--text)',
                        borderColor: 'var(--secondary)',
                        borderRadius: 'var(--button-border-radius)'
                    }}
                    pt={{
                        root: { style: { backgroundColor: 'var(--background)' } },
                        input: { style: { color: 'var(--text)' } },
                        trigger: { style: { color: 'var(--secondary)' } },
                        panel: { style: { backgroundColor: 'var(--background)', border: '1px solid var(--secondary)' } },
                        item: { style: { color: 'var(--text)' } }
                    }}
                />
            </Box>

            <Box>
                <DinamicTable
                    rows={filteredElementos}
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
                                                    }}
                                                />
                                            );
                                        })()}
                                        <div ref={qrRef}>
                                            <QRCode value={selectedRecord.qr_hash} size={100} />
                                        </div>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'center' }}>
                                        <Button
                                            icon="pi pi-download"
                                            label="Descargar QR"
                                            onClick={handleDownloadQR}
                                            style={{
                                                backgroundColor: 'var(--primary)',
                                                color: 'white',
                                                border: 'none',
                                                padding: '0.5rem 1rem',
                                                borderRadius: 'var(--button-border-radius)',
                                                fontSize: '0.9rem',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.3s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                                        />
                                        <Button
                                            icon="pi pi-print"
                                            label="Imprimir QR"
                                            onClick={handlePrintQR}
                                            style={{
                                                backgroundColor: 'var(--secondary)',
                                                color: 'white',
                                                border: 'none',
                                                padding: '0.5rem 1rem',
                                                borderRadius: 'var(--button-border-radius)',
                                                fontSize: '0.9rem',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.3s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary)'}
                                        />
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
                                                        {(() => {
                                                            const filename = user.path_foto ? (user.path_foto.split('/').pop() || user.path_foto) : '';
                                                            const imageUrl = filename ? `https://lumina-testing.onrender.com/api/images/${filename}` : '';
                                                            return <Avatar src={imageUrl} alt={user.nombre} sx={{ width: 50, height: 50, mb: 2, border: '2px solid var(--secondary)' }} />;
                                                        })()}
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
                    <MuiButton onClick={() => setDetailModalOpen(false)} sx={{ color: 'white', backgroundColor: '#f44336', '&:hover': { backgroundColor: '#d32f2f' }, fontSize: '1.1rem', padding: '8px 16px' }}>Cerrar</MuiButton>
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
                    <MuiButton
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
                    </MuiButton>
                    <MuiButton
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
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Elementos;