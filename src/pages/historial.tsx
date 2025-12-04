import { useState, useEffect } from 'react';
import {
    Box, Typography, Button,
    Dialog as MuiDialog, DialogTitle, DialogContent, DialogActions, Avatar
} from "@mui/material";
import DinamicTable from '../components/DinamicTable';
import type { GridColDef } from "@mui/x-data-grid";
import { useAppSelector } from "../services/redux/hooks.tsx";

import type { RootState } from "../services/redux/store.tsx";
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
import Reportes from '../components/Reportes';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';

// * Defino los rangos de horas para los turnos
const TURNOS = [
    { label: 'Mañana', value: 'mañana' },
    { label: 'Tarde', value: 'tarde' },
    { label: 'Noche', value: 'noche' }
];

// ! Defino los rangos de horas para cada turno
const RANGOS_TURNOS = {
    mañana: { inicio: '06:00', fin: '12:00' },
    tarde: { inicio: '12:00', fin: '18:00' },
    noche: { inicio: '18:00', fin: '24:00' }
};


const Historial = () => {

    const usersList = useAppSelector((state: RootState) => state.usersReducer.data);
    const historyData = useAppSelector((state: RootState) => state.historyReducer.data);

    useEffect(() => {
    }, []);

    // * Estado para el modal de detalles
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);

    // * Estado para los filtros
    const [filtros, setFiltros] = useState({
        fechaEspecifica: null as Date | null,
        rangoFechasInicio: null as Date | null,
        rangoFechasFin: null as Date | null,
        usuario: null as number | null,
        turno: null as string | null
    });

    // * Estado para el modal de filtros
    const [modalFiltrosVisible, setModalFiltrosVisible] = useState(false);

    // * Estado para el modal de reportes
    const [reportesModalOpen, setReportesModalOpen] = useState(false);

    const handleView = (row: any) => {
        setSelectedRecord(row);
        setDetailModalOpen(true);
    }
    // * Función que obtiene el historial completo aplicando los filtros seleccionados
    const getHistorialCompleto = () => {
        let filteredHistorial = (historyData || []).map(entry => {
            return {
                ...entry,
                usuarioNombreCompleto: entry.usuario ? `${entry.usuario.nombre} ${entry.usuario.apellido}` : 'Desconocido',
                marcaEquipo: entry.equipo ? entry.equipo.marca : 'Desconocido',
                elementoCategoria: entry.equipo ? entry.equipo.tipo_elemento : 'Desconocido',
                tipoElemento: entry.equipo ? entry.equipo.tipo_elemento : 'Desconocido',
                observaciones: entry.equipo ? entry.equipo.descripcion : 'Desconocido',
                horaIngreso: dayjs(entry.ingreso)
            };
        });

        // * Aplicar filtros
        // * Filtro por fecha específica
        if (filtros.fechaEspecifica) {
            const fechaFiltro = dayjs(filtros.fechaEspecifica);
            filteredHistorial = filteredHistorial.filter(entry => {
                return entry.horaIngreso.isSame(fechaFiltro, 'day');
            });
        }

        // * Filtro por rango de fechas
        if (filtros.rangoFechasInicio && filtros.rangoFechasFin) {
            const fechaInicio = dayjs(filtros.rangoFechasInicio);
            const fechaFin = dayjs(filtros.rangoFechasFin);
            filteredHistorial = filteredHistorial.filter(entry => {
                return entry.horaIngreso.isBetween(fechaInicio, fechaFin, 'day', '[]');
            });
        }

        // * Filtro por usuario
        if (filtros.usuario) {
            filteredHistorial = filteredHistorial.filter(entry => entry.usuario?.id === filtros.usuario);
        }

        // * Filtro por turno
        if (filtros.turno) {
            filteredHistorial = filteredHistorial.filter(entry => {
                const rango = RANGOS_TURNOS[filtros.turno as keyof typeof RANGOS_TURNOS];
                const [horaInicioStr, minInicioStr] = rango.inicio.split(':');
                const [horaFinStr, minFinStr] = rango.fin.split(':');
                const horaInicio = parseInt(horaInicioStr);
                const minInicio = parseInt(minInicioStr);
                const horaFin = parseInt(horaFinStr);
                const minFin = parseInt(minFinStr);
                const inicio = entry.horaIngreso.clone().hour(horaInicio).minute(minInicio).second(0);
                const fin = entry.horaIngreso.clone().hour(horaFin).minute(minFin).second(0);
                if (filtros.turno === 'noche') {
                    // ! Para turno noche, verifico si está entre 22:00 y 06:00
                    return !entry.horaIngreso.isBefore(entry.horaIngreso.clone().hour(22).minute(0), 'minute') || !entry.horaIngreso.isAfter(entry.horaIngreso.clone().hour(6).minute(0), 'minute');
                } else {
                    return entry.horaIngreso.isBetween(inicio, fin, 'minute', '[)');
                }
            });
        }

        return filteredHistorial;
    };

    // * Manejo cambios en filtros
    const handleFiltroChange = (campo: string, valor: any) => {
        setFiltros(prev => ({ ...prev, [campo]: valor }));
    };

    // * Funciones para limpiar filtros individuales
    const limpiarFechaEspecifica = () => {
        setFiltros(prev => ({ ...prev, fechaEspecifica: null }));
    };

    const limpiarRangoFechas = () => {
        setFiltros(prev => ({ ...prev, rangoFechasInicio: null, rangoFechasFin: null }));
    };

    const limpiarUsuario = () => {
        setFiltros(prev => ({ ...prev, usuario: null }));
    };

    const limpiarTurno = () => {
        setFiltros(prev => ({ ...prev, turno: null }));
    };

    // * Abro modal de filtros
    const abrirModalFiltros = () => {
        setModalFiltrosVisible(true);
    };

    // * Cierro modal de filtros
    const cerrarModalFiltros = () => {
        setModalFiltrosVisible(false);
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
        { field: 'usuarioNombreCompleto', headerName: 'Usuario', flex: 1 },
        { field: 'marcaEquipo', headerName: 'Marca del Equipo', flex: 0.7 },
    ];

    // * Variable que contiene los datos filtrados
    const filteredData = getHistorialCompleto();

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 2, color: "var(--text)" }}>
                Historial General
            </Typography>
            <Box>
                <Typography variant="h6" sx={{ mb: 2, color: "var(--text)" }}>
                    Filtros de Historial
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={abrirModalFiltros}
                        sx={{
                            color: 'var(--primary)',
                            borderColor: 'var(--primary)',
                            '&:hover': { backgroundColor: 'var(--primary)', color: 'white' }
                        }}
                    >
                        Filtros
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setFiltros({
                                fechaEspecifica: null,
                                rangoFechasInicio: null,
                                rangoFechasFin: null,
                                usuario: null,
                                turno: null
                            });
                        }}
                        sx={{
                            backgroundColor: 'var(--secondary)',
                            '&:hover': { backgroundColor: 'var(--primary-hover)' }
                        }}
                    >
                        Limpiar Filtros
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => setReportesModalOpen(true)}
                        disabled={filteredData.length === 0}
                    >
                        Generar Reportes
                    </Button>
                </Box>
                <DinamicTable
                    rows={filteredData}
                    columns={columnasHistorial}
                    onView={handleView}
                />
            </Box>
            <Dialog
                header="Filtros de Historial"
                visible={modalFiltrosVisible}
                onHide={cerrarModalFiltros}
                style={{ backgroundColor: 'var(--background)', width: '50vw' }}
                modal
                className="p-fluid modal-form"
                contentStyle={{
                    backgroundColor: 'var(--background)',
                    color: 'var(--text)',
                    border: '1px solid rgba(var(--secondary-rgb), 0.3)'
                }}
                headerStyle={{
                    backgroundColor: 'var(--background)',
                    color: 'var(--secondary)',
                    borderBottom: '2px solid var(--secondary)'
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <style dangerouslySetInnerHTML={{ __html: `.custom-dropdown .p-dropdown { background-color: var(--background); color: var(--text); border: 1px solid rgba(var(--secondary-rgb), 0.3); } .custom-dropdown .p-dropdown:hover, .custom-dropdown .p-dropdown:focus-within { border-color: var(--primary); } .custom-dropdown .p-dropdown-panel { background-color: var(--background); color: var(--text); border: 1px solid rgba(var(--secondary-rgb), 0.3); }` }} />
                    <Box>
                        <Typography variant="subtitle1" sx={{ marginBottom: 1, color: 'var(--text)' }}>Fecha Específica</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Calendar
                                value={filtros.fechaEspecifica}
                                onChange={(e) => handleFiltroChange('fechaEspecifica', e.value)}
                                placeholder="Selecciona fecha"
                            />
                            <Button variant="outlined" onClick={limpiarFechaEspecifica} size="small">Limpiar</Button>
                        </Box>
                    </Box>

                    <Box>
                        <Typography variant="subtitle1" sx={{ marginBottom: 1, color: 'var(--text)' }}>Rango de Fechas</Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Calendar
                                value={filtros.rangoFechasInicio}
                                onChange={(e) => handleFiltroChange('rangoFechasInicio', e.value)}
                                placeholder="Fecha inicio"
                            />
                            <Calendar
                                value={filtros.rangoFechasFin}
                                onChange={(e) => handleFiltroChange('rangoFechasFin', e.value)}
                                placeholder="Fecha fin"
                            />
                            <Button variant="outlined" onClick={limpiarRangoFechas} size="small">Limpiar</Button>
                        </Box>
                    </Box>

                    <Box>
                        <Typography variant="subtitle1" sx={{ marginBottom: 1, color: 'var(--text)' }}>Turno</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Dropdown
                                value={filtros.turno}
                                options={TURNOS}
                                onChange={(e) => handleFiltroChange('turno', e.value)}
                                placeholder="Selecciona turno"
                                showClear
                                className="custom-dropdown"
                                style={{ backgroundColor: 'var(--background)', color: 'var(--text)', border: '1px solid rgba(var(--secondary-rgb), 0.3)' }}
                                panelStyle={{ backgroundColor: 'var(--background)', color: 'var(--text)', border: '1px solid rgba(var(--secondary-rgb), 0.3)' }}
                            />
                            <Button variant="outlined" onClick={limpiarTurno} size="small">Limpiar</Button>
                        </Box>
                    </Box>

                    <Box>
                        <Typography variant="subtitle1" sx={{ marginBottom: 1, color: 'var(--text)' }}>Usuario</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Dropdown
                                filter={true}
                                options={(usersList || []).filter(user => user != null).map(user => ({ label: `${user.nombre} ${user.apellido}`, value: user.id }))}
                                value={filtros.usuario}
                                onChange={(e) => handleFiltroChange('usuario', e.value)}
                                placeholder="Selecciona usuario"
                                showClear
                                className="custom-dropdown"
                                style={{ backgroundColor: 'var(--background)', color: 'var(--text)', border: '1px solid rgba(var(--secondary-rgb), 0.3)' }}
                                panelStyle={{ backgroundColor: 'var(--background)', color: 'var(--text)', border: '1px solid rgba(var(--secondary-rgb), 0.3)' }}
                            />
                            <Button variant="outlined" onClick={limpiarUsuario} size="small">Limpiar</Button>
                        </Box>
                    </Box>
                </Box>
            </Dialog>
            <MuiDialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="md" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 0 } }}>
                <DialogTitle sx={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>Detalles del Registro</DialogTitle>
                <DialogContent sx={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>
                    {selectedRecord && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                            <Box sx={{ display: 'flex', gap: 3, p: 3 }}>
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
            </MuiDialog>
            <Dialog
                header="Reportes de Historial"
                visible={reportesModalOpen}
                onHide={() => setReportesModalOpen(false)}
                style={{ width: '90vw', height: '90vh' }}
                modal
                maximizable
            >
                <Reportes titleSeccion1="Historial" dataSeccion1={filteredData} />
            </Dialog>
        </Box>
    );
};

export default Historial;