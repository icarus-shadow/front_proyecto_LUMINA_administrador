// @ts-ignore
import * as React from 'react';
import { Box, Typography, TextField, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import DinamicTable from '../components/DinamicTable';
import { elementos } from '../mockData';
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
    const [filters, setFilters] = React.useState({
        specificDate: null as Dayjs | null,
        period: '' as 'dia' | 'semana' | 'mes' | 'año' | '',
        dateRange: [null, null] as [Dayjs | null, Dayjs | null],
        userId: null as number | null,
    });

    // Función para obtener el historial completo con filtros
    const getHistorialCompleto = () => {
        let filteredHistorial = (historyData || []).map(entry => {
            const usuario = (users || []).filter(u => u != null).find(u => u.id === entry.usuario_id);
            const elemento = elementos.find(e => e.id === entry.equipos_o_elementos_id);
            return {
                ...entry,
                usuarioNombre: usuario ? usuario.nombre : 'Desconocido',
                elementoNombre: elemento ? elemento.nombre : 'Desconocido',
                elementoCategoria: elemento ? elemento.categoria : '',
                fechaFormateada: new Date(entry.fechaFormateada).toLocaleDateString('es-ES')
            };
        });

        // Aplicar filtros
        if (filters.specificDate) {
            const dateStr = filters.specificDate.format('YYYY-MM-DD');
            filteredHistorial = filteredHistorial.filter(entry => {
                const entryDate = new Date(entry.fechaFormateada).toISOString().split('T')[0];
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
                const entryDate = dayjs(entry.fechaFormateada);
                return entryDate.isAfter(startDate) || entryDate.isSame(startDate, 'day');
            });
        }

        if (filters.dateRange[0] && filters.dateRange[1]) {
            const start = filters.dateRange[0].startOf('day');
            const end = filters.dateRange[1].endOf('day');
            filteredHistorial = filteredHistorial.filter(entry => {
                const entryDate = dayjs(entry.fechaFormateada);
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
        { field: 'id', headerName: 'ID', minWidth: 70 },
        { field: 'fechaFormateada', headerName: 'Fecha', width: 120 },
        { field: 'usuarioNombre', headerName: 'Usuario', width: 200 },
        { field: 'elementoNombre', headerName: 'Elemento', width: 200 },
        { field: 'elementoCategoria', headerName: 'Categoría', width: 150 },
        { field: 'tipo', headerName: 'Tipo', width: 100 },
        { field: 'observaciones', headerName: 'Observaciones', width: 250 },
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
        const tableColumns = ['ID', 'Fecha', 'Usuario', 'Elemento', 'Categoría', 'Tipo', 'Observaciones'];

        // Filas de la tabla
        const tableRows = data.map(row => [
            row.id?.toString() || '',
            row.fechaFormateada || '',
            row.usuarioNombre || '',
            row.elementoNombre || '',
            row.elementoCategoria || '',
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
        doc.save('reporte_horarios.pdf');
    };

    // Funciones básicas para editar y eliminar
    // const handleEdit = (row: any) => {
    //     console.log('Editar:', row);
    // };
    //
    // const handleDelete = (id: number, codigo: string) => {
    //     console.log('Eliminar:', id, 'y código:', codigo);
    // };

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
        </Box>
    );
};

export default Historial;