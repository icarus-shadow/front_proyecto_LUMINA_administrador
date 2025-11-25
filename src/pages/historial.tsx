// @ts-ignore
import * as React from 'react';
import { Box, Typography, TextField, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, FormControl, InputLabel, Select, MenuItem, Avatar } from "@mui/material";
import DinamicTable from '../components/DinamicTable';
import type { GridColDef } from "@mui/x-data-grid";
import {useAppDispatch, useAppSelector} from "../services/redux/hooks.tsx";
import {useEffect} from "react";
import {fetchHistory} from "../services/redux/slices/data/historySlice.tsx";
import {fetchUsers} from "../services/redux/slices/data/UsersSlice.tsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {RootState} from "../services/redux/store.tsx";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);


const Historial = () => {
    const dispatch = useAppDispatch();
    const users = useAppSelector((state: RootState) => state.usersReducer.data);
    const historyData = useAppSelector((state: RootState) => state.historyReduce.data);

    useEffect(() => {
        dispatch(fetchHistory())
        dispatch(fetchUsers())
    }, []);

    const [modalOpen, setModalOpen] = React.useState(false);
    const [detailModalOpen, setDetailModalOpen] = React.useState(false);
    const [selectedRecord, setSelectedRecord] = React.useState<any>(null);
    const [filters, setFilters] = React.useState({
        specificDate: null as Dayjs | null,
        period: '' as 'dia' | 'semana' | 'mes' | 'año' | '',
        dateRange: [null, null] as [Dayjs | null, Dayjs | null],
        userId: null as number | null,
    });
    const [filename, setFilename] = React.useState('reporte_horarios');

    // Función para obtener el historial completo con filtros
    const getHistorialCompleto = () => {
        let filteredHistorial = (historyData || []).map(entry => {
            return {
                ...entry,
                usuarioNombreCompleto: entry.usuario ? `${entry.usuario.nombre} ${entry.usuario.apellido}` : 'Desconocido',
                marcaEquipo: entry.equipo ? entry.equipo.marca : 'Desconocido',
                elementoCategoria: entry.equipo ? entry.equipo.tipo_elemento : 'Desconocido',
                tipoElemento: entry.equipo ? entry.equipo.tipo_elemento : 'Desconocido',
                observaciones: entry.equipo ? entry.equipo.descripcion : 'Desconocido',
            };
        });

        // Aplicar filtros
        if (filters.specificDate) {
            const dateStr = filters.specificDate.format('YYYY-MM-DD');
            filteredHistorial = filteredHistorial.filter(entry => {
                const entryDate = new Date(entry.ingreso).toISOString().split('T')[0];
                return entryDate === dateStr;
            });
        }

        if (filters.period) {
            const now = dayjs();
            let startDate: Dayjs;
            switch (filters.period) {
                case 'dia':
                    startDate = now.startOf('day');
                    break;
                case 'semana':
                    startDate = now.startOf('week');
                    break;
                case 'mes':
                    startDate = now.startOf('month');
                    break;
                case 'año':
                    startDate = now.startOf('year');
                    break;
                default:
                    startDate = dayjs(0);
            }
            filteredHistorial = filteredHistorial.filter(entry => {
                const entryDate = dayjs(entry.ingreso);
                return entryDate.isAfter(startDate) || entryDate.isSame(startDate, 'day');
            });
        }

        if (filters.dateRange[0] && filters.dateRange[1]) {
            const start = filters.dateRange[0].startOf('day');
            const end = filters.dateRange[1].endOf('day');
            filteredHistorial = filteredHistorial.filter(entry => {
                const entryDate = dayjs(entry.ingreso);
                return entryDate.isBetween(start, end, null, '[]');
            });
        }

        if (filters.userId) {
            filteredHistorial = filteredHistorial.filter(entry => entry.usuario_id === filters.userId);
        }

        return filteredHistorial;
    };

    // Columnas para la tabla de historial
    const columnasHistorial: GridColDef[] = [
        {
            field: 'ingreso',
            headerName: 'Fecha de Entrada',
            flex: 1,
            renderCell: (params) => dayjs(params.value).format('DD/MM/YYYY HH:mm')
        },
        {
            field: 'salida',
            headerName: 'Fecha de Salida',
            flex: 1,
            renderCell: (params) => {
                if (!params.value) {
                    return <span style={{ color: 'green' }}>activo</span>;
                }
                return dayjs(params.value).format('DD/MM/YYYY HH:mm');
            }
        },
        { field: 'usuarioNombreCompleto', headerName: 'Usuario',  flex: 1 },
        { field: 'marcaEquipo', headerName: 'Marca del Equipo',  flex: 0.7 },
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

    // Función para generar el reporte en PDF
    const generarReporte = () => {
        const doc = new jsPDF();
        const data = getHistorialCompleto();

        // Título centrado
        doc.setFontSize(18);
        doc.text('Reporte de Horarios', doc.internal.pageSize.width / 2, 20, { align: 'center' });

        // Fecha de generación
        const fechaGeneracion = new Date().toLocaleDateString('es-ES');
        doc.setFontSize(12);
        doc.text(`Fecha de generación: ${fechaGeneracion}`, 20, 35);

        // Columnas de la tabla
        const tableColumns = ['Fecha Ingreso', 'Fecha Salida', 'Usuario', 'Elemento'];

        // Filas de la tabla
        const tableRows = data.map(row => [
            dayjs(row.ingreso).format('DD/MM/YYYY HH:mm'),
            row.salida ? dayjs(row.salida).format('DD/MM/YYYY HH:mm') : 'activo',
            row.usuarioNombreCompleto || '',
            row.marcaEquipo || '',
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
        doc.save(`${filename}.pdf`);
    };


    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 2 }}>
                Historial General
            </Typography>
            <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Filtros de Historial
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                    <Button
                        variant="contained"
                        onClick={() => setModalOpen(true)}
                    >
                        Filtrar
                    </Button>
                    <Button
                        variant="text"
                        onClick={() => {
                            setFilters({
                                specificDate: null,
                                period: '',
                                dateRange: [null, null],
                                userId: null,
                            });
                        }}
                    >
                        Limpiar filtros
                    </Button>
                    <TextField
                        label="Nombre del archivo"
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                        size="small"
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={generarReporte}
                    >
                        Generar Reporte
                    </Button>
                </Box>
                <DinamicTable
                    rows={getHistorialCompleto()}
                    columns={columnasHistorial}
                />
            </Box>
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Filtros de Historial</DialogTitle>
                <DialogContent>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <DatePicker
                                label="Fecha específica"
                                value={filters.specificDate}
                                onChange={(newValue) => setFilters(prev => ({ ...prev, specificDate: newValue }))}
                            />
                            <FormControl fullWidth>
                                <InputLabel>Período</InputLabel>
                                <Select
                                    value={filters.period}
                                    label="Período"
                                    onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value as any }))}
                                >
                                    <MenuItem value=""><em>Ninguno</em></MenuItem>
                                    <MenuItem value="dia">Día</MenuItem>
                                    <MenuItem value="semana">Semana</MenuItem>
                                    <MenuItem value="mes">Mes</MenuItem>
                                    <MenuItem value="año">Año</MenuItem>
                                </Select>
                            </FormControl>
                            <DateRangePicker
                                label="Rango de fechas"
                                value={filters.dateRange}
                                onChange={(newValue) => setFilters(prev => ({ ...prev, dateRange: newValue }))}
                            />
                            <Autocomplete
                                options={(users || []).filter(u => u != null).map(u => ({ label: u.nombre, id: u.id }))}
                                getOptionLabel={(option) => option.label}
                                value={filters.userId ? { label: (users || []).filter(u => u != null).find(u => u.id === filters.userId)?.nombre || '', id: filters.userId } : null}
                                onChange={(_event, newValue) => setFilters(prev => ({ ...prev, userId: newValue ? newValue.id : null }))}
                                renderInput={(params) => <TextField {...params} label="Usuario" />}
                            />
                        </Box>
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
                    <Button onClick={() => setModalOpen(false)} variant="contained">Aplicar</Button>
                </DialogActions>
            </Dialog>
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

export default Historial;