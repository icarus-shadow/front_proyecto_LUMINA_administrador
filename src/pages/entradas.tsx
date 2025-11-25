// @ts-ignore
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Avatar, Select, MenuItem, TextField } from "@mui/material";
import DinamicTable from '../components/DinamicTable';
import { history } from '../services/api/data/history';
import type { GridColDef } from "@mui/x-data-grid";
import type { historial } from '../types/interfacesData';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';

const Entradas = () => {
    const [historyData, setHistoryData] = useState<historial[]>([]);
    const [detailModalOpen, setDetailModalOpen] = React.useState(false);
    const [selectedRecord, setSelectedRecord] = React.useState<any>(null);

    // Estados para filtros de la tabla de hoy
    const [userFilterToday, setUserFilterToday] = useState('');
    const [hourFromToday, setHourFromToday] = useState('');
    const [hourToToday, setHourToToday] = useState('');

    // Estados para filtros de la tabla de otras fechas
    const [userFilterOther, setUserFilterOther] = useState('');
    const [hourFromOther, setHourFromOther] = useState('');
    const [hourToOther, setHourToOther] = useState('');

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

    // Función para obtener entradas activas
    const getActiveEntries = () => {
        return historyData
            .filter(item => !item.salida)
            .map(item => ({
                ...item,
                fecha_entrada: item.ingreso,
                usuarioNombre: item.usuario.nombre,
                equipoNombre: item.equipo.marca || item.equipo.sn_equipo,
                descripcion: item.equipo.descripcion,
                usuarioNombreCompleto: `${item.usuario.nombre} ${item.usuario.apellido}`,
                tipoElemento: item.equipo.tipo_elemento,
            }));
    };

    // Separar entradas activas en dos grupos: hoy y otras fechas
    const activeEntries = getActiveEntries();
    const todayDate = new Date().toDateString();
    const todaysEntries = activeEntries.filter(entry => new Date(entry.fecha_entrada).toDateString() === todayDate);
    const otherEntries = activeEntries.filter(entry => new Date(entry.fecha_entrada).toDateString() !== todayDate);

    // Usuarios únicos para filtros
    const uniqueUsers = Array.from(new Set(activeEntries.map(entry => entry.usuarioNombre))).sort();

    // Filtrar entradas de hoy
    const filteredTodaysEntries = todaysEntries.filter(entry => {
        const matchesUser = !userFilterToday || entry.usuarioNombre === userFilterToday;
        const entryDate = new Date(entry.fecha_entrada);
        const entryHour = entryDate.getHours();
        const entryMinute = entryDate.getMinutes();
        const entryTime = entryHour * 60 + entryMinute;
        let matchesHour = true;
        if (hourFromToday) {
            const [h, m] = hourFromToday.split(':').map(Number);
            const fromTime = h * 60 + m;
            matchesHour = matchesHour && entryTime >= fromTime;
        }
        if (hourToToday) {
            const [h, m] = hourToToday.split(':').map(Number);
            const toTime = h * 60 + m;
            matchesHour = matchesHour && entryTime <= toTime;
        }
        return matchesUser && matchesHour;
    });

    // Filtrar entradas de otras fechas
    const filteredOtherEntries = otherEntries.filter(entry => {
        const matchesUser = !userFilterOther || entry.usuarioNombre === userFilterOther;
        const entryDate = new Date(entry.fecha_entrada);
        const entryHour = entryDate.getHours();
        const entryMinute = entryDate.getMinutes();
        const entryTime = entryHour * 60 + entryMinute;
        let matchesHour = true;
        if (hourFromOther) {
            const [h, m] = hourFromOther.split(':').map(Number);
            const fromTime = h * 60 + m;
            matchesHour = matchesHour && entryTime >= fromTime;
        }
        if (hourToOther) {
            const [h, m] = hourToOther.split(':').map(Number);
            const toTime = h * 60 + m;
            matchesHour = matchesHour && entryTime <= toTime;
        }
        return matchesUser && matchesHour;
    });

    // Función para generar el reporte en PDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        const data = activeEntries;

        // Título centrado
        doc.setFontSize(18);
        doc.text('Reporte de Entradas Activas', doc.internal.pageSize.width / 2, 20, { align: 'center' });

        // Fecha de generación
        const fechaGeneracion = new Date().toLocaleDateString('es-ES');
        doc.setFontSize(12);
        doc.text(`Fecha de generación: ${fechaGeneracion}`, 20, 35);

        // Columnas de la tabla
        const tableColumns = ['ID', 'Fecha de Entrada', 'Usuario', 'Equipo', 'Descripción'];

        // Filas de la tabla
        const tableRows = data.map(row => [
            row.id,
            dayjs(row.fecha_entrada).format('DD/MM/YYYY HH:mm'),
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
        doc.save('entradas_activas.pdf');
    };

    // Columnas para la tabla de entradas
    const columnasEntradas: GridColDef[] = [
        { field: 'fecha_entrada', headerName: 'Fecha de Entrada', width: 200 },
        { field: 'usuarioNombre', headerName: 'Usuario', width: 200 },
        { field: 'equipoNombre', headerName: 'Equipo', width: 200, filterable: false },
        { field: 'descripcion', headerName: 'Descripción', width: 250, filterable: false },
        {
            field: 'acciones',
            headerName: 'Acciones',
            flex: 1.5,
            renderCell: (params) => (
                <Button variant="outlined" onClick={() => {
                    setSelectedRecord(params.row);
                    setDetailModalOpen(true);
                }}>
                    Ver más información
                </Button>
            )
        },
    ];

    // Funciones básicas para editar y eliminar
    // const handleEdit = (row: any) => {
    //     console.log('Editar:', row);
    // };
    //
    // const handleDelete = (id: number) => {
    //     console.log('Eliminar:', id);
    // };

    return (
        <Box>
            <Button variant="contained" onClick={exportToPDF} sx={{ mb: 2, marginTop: 5 }}>
                Generar Reporte PDF
            </Button>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ mb: 1, color: "var(--text)"}}>
                    Entradas Activas de Hoy
                </Typography>
                <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Select
                        value={userFilterToday}
                        onChange={(e) => setUserFilterToday(e.target.value)}
                        displayEmpty
                        sx={{ minWidth: 200, color: 'var(--text)' }}
                    >
                        <MenuItem value="">Todos los usuarios</MenuItem>
                        {uniqueUsers.map(user => <MenuItem key={user} value={user}>{user}</MenuItem>)}
                    </Select>
                    <TextField
                        label="Hora desde"
                        type="time"
                        value={hourFromToday}
                        onChange={(e) => setHourFromToday(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: 150, color: 'var(--text)' }}
                    />
                    <TextField
                        label="Hora hasta"
                        type="time"
                        value={hourToToday}
                        onChange={(e) => setHourToToday(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: 150, color: 'var(--text)' }}
                    />
                </Box>
                <DinamicTable
                    rows={filteredTodaysEntries}
                    columns={columnasEntradas}
                />
            </Box>
            <Box>
                <Typography variant="h5" sx={{ mb: 1, color: "var(--text)"}}>
                    Entradas Activas de Otras Fechas
                </Typography>
                <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Select
                        value={userFilterOther}
                        onChange={(e) => setUserFilterOther(e.target.value)}
                        displayEmpty
                        sx={{ minWidth: 200, color: 'var(--text)' }}
                    >
                        <MenuItem value="">Todos los usuarios</MenuItem>
                        {uniqueUsers.map(user => <MenuItem key={user} value={user}>{user}</MenuItem>)}
                    </Select>
                    <TextField
                        label="Hora desde"
                        type="time"
                        value={hourFromOther}
                        onChange={(e) => setHourFromOther(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: 150, color: 'var(--text)' }}
                    />
                    <TextField
                        label="Hora hasta"
                        type="time"
                        value={hourToOther}
                        onChange={(e) => setHourToOther(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: 150, color: 'var(--text)' }}
                    />
                </Box>
                <DinamicTable
                    rows={filteredOtherEntries}
                    columns={columnasEntradas}
                />
            </Box>
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

export default Entradas;