// @ts-ignore
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box, Typography, Select, MenuItem, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Avatar } from "@mui/material";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DinamicTable from '../components/DinamicTable';
import { history } from '../services/api/data/history';
import type { GridColDef } from "@mui/x-data-grid";
import type { historial } from '../types/interfacesData';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';

const Salidas = () => {
    const [historyData, setHistoryData] = useState<historial[]>([]);
    const [detailModalOpen, setDetailModalOpen] = React.useState(false);
    const [selectedRecord, setSelectedRecord] = React.useState<any>(null);

    // Estados para filtros
    const [userFilter, setUserFilter] = useState('');
    const [hourFrom, setHourFrom] = useState('');
    const [hourTo, setHourTo] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await history.getAll();
                setHistoryData(response.data || []);
            } catch (error) {
                console.error('Error al obtener datos de historial:', error);
            }
        };
        fetchData();
    }, []);

    // Función para obtener salidas del día actual
    const getTodaysExits = () => {
        const todayDate = new Date().toDateString();
        return historyData
            .filter(item => item.salida && new Date(item.salida).toDateString() === todayDate)
            .map(item => ({
                ...item,
                fecha_entrada: item.ingreso,
                fecha_salida: item.salida,
                usuarioNombre: item.usuario.nombre,
                equipoNombre: item.equipo.marca || item.equipo.sn_equipo,
                marcaEquipo: item.equipo.marca,
                descripcion: item.equipo.descripcion,
                usuarioNombreCompleto: `${item.usuario.nombre} ${item.usuario.apellido}`,
                tipoElemento: item.equipo.tipo_elemento,
            }));
    };

    // Obtener salidas del día actual
    const todaysExits = getTodaysExits();

    // Usuarios únicos para filtros
    const uniqueUsers = Array.from(new Set(todaysExits.map(exit => exit.usuarioNombre))).sort();

    // Filtrar salidas del día actual
    const filteredTodaysExits = todaysExits.filter(exit => {
        const matchesUser = !userFilter || exit.usuarioNombre === userFilter;
        const exitDate = new Date(exit.fecha_salida);
        const exitHour = exitDate.getHours();
        const exitMinute = exitDate.getMinutes();
        const exitTime = exitHour * 60 + exitMinute;
        let matchesHour = true;
        if (hourFrom) {
            const [h, m] = hourFrom.split(':').map(Number);
            const fromTime = h * 60 + m;
            matchesHour = matchesHour && exitTime >= fromTime;
        }
        if (hourTo) {
            const [h, m] = hourTo.split(':').map(Number);
            const toTime = h * 60 + m;
            matchesHour = matchesHour && exitTime <= toTime;
        }
        return matchesUser && matchesHour;
    });

    // Función para generar el reporte en PDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        const data = filteredTodaysExits;

        // Título centrado
        doc.setFontSize(18);
        doc.text('Reporte de Salidas', doc.internal.pageSize.width / 2, 20, { align: 'center' });

        // Fecha de generación
        const fechaGeneracion = new Date().toLocaleDateString('es-ES');
        doc.setFontSize(12);
        doc.text(`Fecha de generación: ${fechaGeneracion}`, 20, 35);

        // Columnas de la tabla
        const tableColumns = ['ID', 'Fecha de Salida', 'Usuario', 'Equipo', 'Descripción'];

        // Filas de la tabla
        const tableRows = data.map(row => [
            row.id,
            dayjs(row.fecha_salida).format('DD/MM/YYYY HH:mm'),
            row.usuarioNombre || '',
            row.equipoNombre || '',
            row.descripcion || '',
        ]);

        // Generar la tabla con autoTable
        autoTable(doc, {
            head: [tableColumns],
            body: tableRows,
            startY: 45,
            styles: {
                fontSize: 8,
                cellPadding: 3,
                lineColor: [0, 0, 0],
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245],
            },
            margin: { top: 45 },
        });

        // Guardar el PDF
        const currentDate = dayjs().format('YYYY-MM-DD');
        doc.save(`Reporte_Salidas_${currentDate}.pdf`);
    };

    // Columnas para la tabla de salidas
    const columnasSalidas: GridColDef[] = [
        { field: 'fecha_entrada', headerName: 'Fecha de Entrada', width: 200 },
        { field: 'fecha_salida', headerName: 'Fecha de Salida', width: 200 },
        { field: 'usuarioNombre', headerName: 'Usuario', width: 200 },
        { field: 'equipoNombre', headerName: 'Equipo', width: 200 },
        { field: 'descripcion', headerName: 'Descripción', width: 250 },
    ];

    const handleView = (row: any) => {
        setSelectedRecord(row);
        setDetailModalOpen(true);
    };

    return (
        <Box>
            <Button variant="contained" onClick={exportToPDF} disabled={filteredTodaysExits.length === 0} sx={{ mb: 2, marginTop: 5, '&.Mui-disabled': { backgroundColor: 'var(--primary)', border: '2px solid var(--accent)', color: 'white', opacity: 1 } }}>
                Generar Reporte PDF
            </Button>
            <Typography variant="h4" sx={{ mb: 2, color: 'var(--text)' }}>
                Salidas del Día Actual
            </Typography>
            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                <Select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    displayEmpty
                    sx={{
                        minWidth: 200,
                        color: 'var(--text)',
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'var(--text)' },
                            '&:hover fieldset': { borderColor: 'var(--text)' },
                            '&.Mui-focused fieldset': { borderColor: 'var(--text)' }
                        },
                        '& .MuiSelect-select': { color: 'var(--text)' },
                        '& .MuiSelect-icon': { color: 'var(--text)' }
                    }}
                >
                    <MenuItem value="" sx={{ color: 'var(--text)' }}>Todos los usuarios</MenuItem>
                    {uniqueUsers.map(user => <MenuItem key={user} value={user} sx={{ color: 'var(--text)' }}>{user}</MenuItem>)}
                </Select>
                <TextField
                    label="Hora desde"
                    type="time"
                    value={hourFrom}
                    onChange={(e) => setHourFrom(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    InputProps={{
                        endAdornment: <AccessTimeIcon sx={{ color: 'var(--text)' }} />
                    }}
                    sx={{
                        width: 150,
                        color: 'var(--text)',
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'var(--text)' },
                            '&:hover fieldset': { borderColor: 'var(--text)' },
                            '&.Mui-focused fieldset': { borderColor: 'var(--text)' }
                        },
                        '& .MuiInputLabel-root': { color: 'var(--text)' },
                        '& .MuiInputBase-input': { color: 'var(--text)' },
                        '& .MuiInputBase-input::placeholder': { color: 'var(--text)' },
                        '& .MuiInputAdornment-root': { color: 'var(--text)' }
                    }}
                />
                <TextField
                    label="Hora hasta"
                    type="time"
                    value={hourTo}
                    onChange={(e) => setHourTo(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    InputProps={{
                        endAdornment: <AccessTimeIcon sx={{ color: 'var(--text)' }} />
                    }}
                    sx={{
                        width: 150,
                        color: 'var(--text)',
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'var(--text)' },
                            '&:hover fieldset': { borderColor: 'var(--text)' },
                            '&.Mui-focused fieldset': { borderColor: 'var(--text)' }
                        },
                        '& .MuiInputLabel-root': { color: 'var(--text)' },
                        '& .MuiInputBase-input': { color: 'var(--text)' },
                        '& .MuiInputBase-input::placeholder': { color: 'var(--text)' },
                        '& .MuiInputAdornment-root': { color: 'var(--text)' }
                    }}
                />
            </Box>
            {filteredTodaysExits.length === 0 ? (
                <Box sx={{
                    textAlign: 'center',
                    mt: 4,
                    p: 3,
                    backgroundColor: 'var(--primary)',
                    color: 'var(--text)',
                    borderRadius: 2,
                    boxShadow: 3,
                    border: '2px solid var(--accent)',
                    width: "70vw",
                }}>
                    <Typography variant="h6">
                        elementos no sacados el dia de hoy
                    </Typography>
                </Box>
            ) : (
                <DinamicTable
                    rows={filteredTodaysExits}
                    columns={columnasSalidas}
                    onView={handleView}
                />
            )}
            <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="md" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 0 } }}>
                <DialogTitle sx={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>Detalles del Registro</DialogTitle>
                <DialogContent sx={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>
                    {selectedRecord && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                            <Box sx={{ display: 'flex', gap: 3 }}>
                                {/* Sección Usuario Izquierda */}
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, backgroundColor: 'rgba(var(--primary-rgb), 0.1)', borderRadius: 2, border: '1px solid rgba(var(--primary-rgb), 0.3)' }}>
                                    <Typography variant="h6" sx={{ color: 'var(--primary)', mb: 2, fontWeight: 'bold' }}>Usuario</Typography>
                                    <Avatar src={selectedRecord.usuario?.path_foto} alt={selectedRecord.usuarioNombreCompleto} sx={{ width: 100, height: 100, mb: 2, border: '2px solid var(--primary)' }} />
                                    <Typography variant="body1" sx={{ mb: 1 }}><strong>Nombre:</strong> {selectedRecord.usuarioNombreCompleto}</Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}><strong>Email:</strong> {selectedRecord.usuario?.email || 'N/A'}</Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}><strong>Documento:</strong> {selectedRecord.usuario?.documento || 'N/A'}</Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}><strong>Edad:</strong> {selectedRecord.usuario?.edad || 'N/A'}</Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}><strong>Número de Teléfono:</strong> {selectedRecord.usuario?.numero_telefono || 'N/A'}</Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}><strong>Tipo de Documento:</strong> {selectedRecord.usuario?.tipo_documento || 'N/A'}</Typography>
                                </Box>
                                {/* Sección Dispositivo Derecha */}
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, backgroundColor: 'rgba(var(--secondary-rgb), 0.1)', borderRadius: 2, border: '1px solid rgba(var(--secondary-rgb), 0.3)' }}>
                                    <Typography variant="h6" sx={{ color: 'var(--secondary)', mb: 2, fontWeight: 'bold' }}>Dispositivo</Typography>
                                    {selectedRecord.equipo?.path_foto_equipo_implemento && (
                                        <img src={selectedRecord.equipo.path_foto_equipo_implemento} alt="Imagen del Equipo" style={{ width: '100px', height: '100px', marginBottom: '16px', borderRadius: '8px' }} />
                                    )}
                                    <Typography variant="body1" sx={{ mb: 1 }}><strong>Marca:</strong> {selectedRecord.marcaEquipo}</Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}><strong>Modelo:</strong> {selectedRecord.equipo?.descripcion || 'N/A'}</Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}><strong>Serie:</strong> {selectedRecord.equipo?.sn_equipo || 'N/A'}</Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}><strong>Categoría:</strong> {selectedRecord.equipo?.tipo_elemento || 'N/A'}</Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}><strong>Color:</strong> {selectedRecord.equipo?.color || 'N/A'}</Typography>
                                </Box>
                            </Box>
                            {/* Fechas abajo */}
                            <Box sx={{ p: 3, backgroundColor: 'rgba(var(--accent-rgb), 0.1)', borderRadius: 2, border: '1px solid rgba(var(--accent-rgb), 0.3)', textAlign: 'center' }}>
                                <Typography variant="h6" sx={{ color: 'var(--accent)', mb: 2, fontWeight: 'bold' }}>Fechas</Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                                    <Typography variant="body1" sx={{ color: 'var(--success-color)' }}><strong>Ingreso:</strong> {dayjs(selectedRecord.ingreso).format('DD/MM/YYYY HH:mm')}</Typography>
                                    <Typography variant="body1" sx={{ color: selectedRecord.salida ? 'var(--error-color)' : 'var(--success-color)' }}><strong>Salida:</strong> {selectedRecord.salida ? dayjs(selectedRecord.salida).format('DD/MM/YYYY HH:mm') : 'Activo'}</Typography>
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

export default Salidas;