// @ts-ignore
import * as React from 'react';
import { useState, useMemo } from 'react';
import { Box, Button, Typography, Dialog as MuiDialog, DialogTitle, DialogContent, DialogActions, Avatar, TextField } from "@mui/material";
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
import { useAppSelector } from "../services/redux/hooks.tsx";
import { selectHistorialSinSalida } from "../services/redux/slices/data/historySlice.tsx";
import DinamicTable from '../components/DinamicTable';
import type { historial } from '../types/interfacesData';
import type { GridColDef } from "@mui/x-data-grid";
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import Reportes from '../components/Reportes.tsx';

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

const Entradas = () => {
    const historialSinSalida = useAppSelector(selectHistorialSinSalida);
    const usersList = useAppSelector((state) => state.usersReducer.data);

    // * Estado para el modal de detalles
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);

    // * Estado para los filtros de hoy
    const [filtrosHoy, setFiltrosHoy] = useState({
        horaEspecifica: null as Date | null,
        rangoHorasInicio: null as Date | null,
        rangoHorasFin: null as Date | null,
        usuario: null as number | null,
        turno: null as string | null
    });

    // * Estado para los filtros de otros
    const [filtrosOtros, setFiltrosOtros] = useState({
        horaEspecifica: null as Date | null,
        rangoHorasInicio: null as Date | null,
        rangoHorasFin: null as Date | null,
        usuario: null as number | null,
        turno: null as string | null
    });

    // * Estado para el modal de filtros de hoy
    const [modalFiltrosHoyVisible, setModalFiltrosHoyVisible] = useState(false);

    // * Estado para el modal de filtros de otros
    const [modalFiltrosOtrosVisible, setModalFiltrosOtrosVisible] = useState(false);

    // * Estado para el modal de reportes
    const [modalReportesVisible, setModalReportesVisible] = useState(false);

    // * Obtengo los datos de hoy
    const datosHoy = useMemo(() => {
        if (!historialSinSalida) return [];
        return historialSinSalida.hoy;
    }, [historialSinSalida]);

    // * Obtengo los datos de otros
    const datosOtros = useMemo(() => {
        if (!historialSinSalida) return [];
        return historialSinSalida.otros;
    }, [historialSinSalida]);

    // * Transformo los datos de hoy
    const datosTransformadosHoy = useMemo(() => {
        return datosHoy.map((item: historial) => ({
            ...item,
            usuarioNombreCompleto: `${item.usuario?.nombre || ''} ${item.usuario?.apellido || ''}`.trim(),
            equipoNombre: item.equipo?.marca || item.equipo?.sn_equipo || 'N/A',
            fechaEntradaFormateada: dayjs(item.ingreso).format('DD/MM/YYYY HH:mm'),
            marcaEquipo: item.equipo?.marca || 'N/A',
            horaIngreso: dayjs(item.ingreso)
        }));
    }, [datosHoy]);

    // * Transformo los datos de otros
    const datosTransformadosOtros = useMemo(() => {
        return datosOtros.map((item: historial) => ({
            ...item,
            usuarioNombreCompleto: `${item.usuario?.nombre || ''} ${item.usuario?.apellido || ''}`.trim(),
            equipoNombre: item.equipo?.marca || item.equipo?.sn_equipo || 'N/A',
            fechaEntradaFormateada: dayjs(item.ingreso).format('DD/MM/YYYY HH:mm'),
            marcaEquipo: item.equipo?.marca || 'N/A',
            horaIngreso: dayjs(item.ingreso)
        }));
    }, [datosOtros]);

    // * Aplico los filtros a los datos de hoy
    const datosFiltradosHoy = useMemo(() => {
        return datosTransformadosHoy.filter(item => {
            // * Filtro por hora específica
            if (filtrosHoy.horaEspecifica && item.horaIngreso) {
                const horaFiltro = dayjs(filtrosHoy.horaEspecifica);
                if (!item.horaIngreso.isSame(horaFiltro, 'minute')) return false;
            }

            // * Filtro por rango de horas
            if (filtrosHoy.rangoHorasInicio && filtrosHoy.rangoHorasFin && item.horaIngreso) {
                const horaInicio = dayjs(filtrosHoy.rangoHorasInicio);
                const horaFin = dayjs(filtrosHoy.rangoHorasFin);
                if (!item.horaIngreso.isBetween(horaInicio, horaFin, 'minute', '[]')) return false;
            }

            // * Filtro por usuario
            if (filtrosHoy.usuario && item.usuario?.id !== filtrosHoy.usuario) return false;

            // * Filtro por turno
            if (filtrosHoy.turno && item.horaIngreso) {
                const rango = RANGOS_TURNOS[filtrosHoy.turno as keyof typeof RANGOS_TURNOS];
                const [horaInicioStr, minInicioStr] = rango.inicio.split(':');
                const [horaFinStr, minFinStr] = rango.fin.split(':');
                const horaInicio = parseInt(horaInicioStr);
                const minInicio = parseInt(minInicioStr);
                const horaFin = parseInt(horaFinStr);
                const minFin = parseInt(minFinStr);
                const inicio = item.horaIngreso.clone().hour(horaInicio).minute(minInicio).second(0);
                const fin = item.horaIngreso.clone().hour(horaFin).minute(minFin).second(0);
                if (filtrosHoy.turno === 'noche') {
                    // ! Para turno noche, verifico si está entre 22:00 y 06:00
                    if (!(!item.horaIngreso.isBefore(item.horaIngreso.clone().hour(22).minute(0), 'minute') || !item.horaIngreso.isAfter(item.horaIngreso.clone().hour(6).minute(0), 'minute'))) return false;
                } else {
                    if (!item.horaIngreso.isBetween(inicio, fin, 'minute', '[)')) return false;
                }
            }

            return true;
        });
    }, [datosTransformadosHoy, filtrosHoy]);

    // * Aplico los filtros a los datos de otros
    const datosFiltradosOtros = useMemo(() => {
        return datosTransformadosOtros.filter(item => {
            // * Filtro por hora específica
            if (filtrosOtros.horaEspecifica && item.horaIngreso) {
                const horaFiltro = dayjs(filtrosOtros.horaEspecifica);
                if (!item.horaIngreso.isSame(horaFiltro, 'minute')) return false;
            }

            // * Filtro por rango de horas
            if (filtrosOtros.rangoHorasInicio && filtrosOtros.rangoHorasFin && item.horaIngreso) {
                const horaInicio = dayjs(filtrosOtros.rangoHorasInicio);
                const horaFin = dayjs(filtrosOtros.rangoHorasFin);
                if (!item.horaIngreso.isBetween(horaInicio, horaFin, 'minute', '[]')) return false;
            }

            // * Filtro por usuario
            if (filtrosOtros.usuario && item.usuario?.id !== filtrosOtros.usuario) return false;

            // * Filtro por turno
            if (filtrosOtros.turno && item.horaIngreso) {
                const rango = RANGOS_TURNOS[filtrosOtros.turno as keyof typeof RANGOS_TURNOS];
                const [horaInicioStr, minInicioStr] = rango.inicio.split(':');
                const [horaFinStr, minFinStr] = rango.fin.split(':');
                const horaInicio = parseInt(horaInicioStr);
                const minInicio = parseInt(minInicioStr);
                const horaFin = parseInt(horaFinStr);
                const minFin = parseInt(minFinStr);
                const inicio = item.horaIngreso.clone().hour(horaInicio).minute(minInicio).second(0);
                const fin = item.horaIngreso.clone().hour(horaFin).minute(minFin).second(0);
                if (filtrosOtros.turno === 'noche') {
                    // ! Para turno noche, verifico si está entre 22:00 y 06:00
                    if (!(!item.horaIngreso.isBefore(item.horaIngreso.clone().hour(22).minute(0), 'minute') || !item.horaIngreso.isAfter(item.horaIngreso.clone().hour(6).minute(0), 'minute'))) return false;
                } else {
                    if (!item.horaIngreso.isBetween(inicio, fin, 'minute', '[)')) return false;
                }
            }

            return true;
        });
    }, [datosTransformadosOtros, filtrosOtros]);

    // * Defino dataSeccion1 para entradas de hoy filtradas
    const dataSeccion1 = datosFiltradosHoy;

    // * Defino dataSeccion2 para entradas de otras fechas filtradas
    const dataSeccion2 = datosFiltradosOtros;

    // * Defino las columnas con tipos correctos
    const columnasEntradas: GridColDef[] = [
        {
            field: 'ingreso',
            headerName: 'Fecha de Entrada',
            flex: 1,
            renderCell: (params) => dayjs(params.value).format('DD/MM/YYYY HH:mm')
        },
        {
            field: 'salida',
            headerName: 'Estado',
            flex: 1,
            renderCell: () => <span style={{ color: 'green' }}>activo</span>
        },
        { field: 'usuarioNombreCompleto', headerName: 'Usuario', flex: 1 },
        { field: 'marcaEquipo', headerName: 'Marca del Equipo', flex: 0.7 },
    ];

    // * Manejo cambios en filtros de hoy
    const handleFiltroChangeHoy = (campo: string, valor: any) => {
        setFiltrosHoy(prev => ({ ...prev, [campo]: valor }));
    };

    // * Manejo cambios en filtros de otros
    const handleFiltroChangeOtros = (campo: string, valor: any) => {
        setFiltrosOtros(prev => ({ ...prev, [campo]: valor }));
    };

    // * Funciones para limpiar filtros individuales de hoy
    const limpiarHoraEspecificaHoy = () => {
        setFiltrosHoy(prev => ({ ...prev, horaEspecifica: null }));
    };

    const limpiarRangoHorasHoy = () => {
        setFiltrosHoy(prev => ({ ...prev, rangoHorasInicio: null, rangoHorasFin: null }));
    };

    const limpiarUsuarioHoy = () => {
        setFiltrosHoy(prev => ({ ...prev, usuario: null }));
    };

    const limpiarTurnoHoy = () => {
        setFiltrosHoy(prev => ({ ...prev, turno: null }));
    };

    // * Funciones para limpiar filtros individuales de otros
    const limpiarHoraEspecificaOtros = () => {
        setFiltrosOtros(prev => ({ ...prev, horaEspecifica: null }));
    };

    const limpiarRangoHorasOtros = () => {
        setFiltrosOtros(prev => ({ ...prev, rangoHorasInicio: null, rangoHorasFin: null }));
    };

    const limpiarUsuarioOtros = () => {
        setFiltrosOtros(prev => ({ ...prev, usuario: null }));
    };

    const limpiarTurnoOtros = () => {
        setFiltrosOtros(prev => ({ ...prev, turno: null }));
    };

    // * Abro modal de filtros de hoy
    const abrirModalFiltrosHoy = () => {
        setModalFiltrosHoyVisible(true);
    };

    // * Cierro modal de filtros de hoy
    const cerrarModalFiltrosHoy = () => {
        setModalFiltrosHoyVisible(false);
    };

    // * Abro modal de filtros de otros
    const abrirModalFiltrosOtros = () => {
        setModalFiltrosOtrosVisible(true);
    };

    // * Cierro modal de filtros de otros
    const cerrarModalFiltrosOtros = () => {
        setModalFiltrosOtrosVisible(false);
    };

    // * Abro modal de reportes
    const abrirModalReportes = () => {
        setModalReportesVisible(true);
    };

    // * Cierro modal de reportes
    const cerrarModalReportes = () => {
        setModalReportesVisible(false);
    };

    // * Manejo la vista de detalles
    const handleView = (row: any) => {
        setSelectedRecord(row);
        setDetailModalOpen(true);
    };

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h4" sx={{ mb: 2, color: "var(--text)" }}>
                Entradas
            </Typography>
            {/* * Botones de acción */}
            <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                <Button
                    variant="contained"
                    onClick={abrirModalReportes}
                    sx={{
                        backgroundColor: 'var(--secondary)',
                        '&:hover': { backgroundColor: 'var(--primary-hover)' }
                    }}
                >
                    Generar Reportes
                </Button>
            </Box>

            {/* * Contenedor principal para las tablas en layout vertical */}
            <Box sx={{ display: 'block' }}>
                {/* * Sección de entradas de hoy */}
                <Box sx={{ marginBottom: 4 }}>
                    <Typography variant="h5" sx={{ mb: 2, color: "var(--text)" }}>
                        Entradas de Fechas Actuales
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={abrirModalFiltrosHoy}
                            sx={{
                                color: 'var(--primary)',
                                borderColor: 'var(--primary)',
                                '&:hover': { backgroundColor: 'var(--primary)', color: 'white' }
                            }}
                        >
                            Filtros Hoy
                        </Button>
                    </Box>
                    <DinamicTable
                        rows={datosFiltradosHoy}
                        columns={columnasEntradas}
                        onView={handleView}
                    />
                </Box>

                {/* * Sección de entradas de otras fechas */}
                <Box sx={{ marginBottom: 4 }}>
                    <Typography variant="h5" sx={{ mb: 2, color: "var(--text)" }}>
                        Entradas de Otras Fechas
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={abrirModalFiltrosOtros}
                            sx={{
                                color: 'var(--primary)',
                                borderColor: 'var(--primary)',
                                '&:hover': { backgroundColor: 'var(--primary)', color: 'white' }
                            }}
                        >
                            Filtros Otros
                        </Button>
                    </Box>
                    <DinamicTable
                        rows={datosFiltradosOtros}
                        columns={columnasEntradas}
                        onView={handleView}
                    />
                </Box>
            </Box>

            {/* * Modal de filtros de hoy con PrimeReact */}
            <Dialog
                header="Filtros de Entradas Hoy"
                visible={modalFiltrosHoyVisible}
                onHide={cerrarModalFiltrosHoy}
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
                    {/* * Filtro hora específica */}
                    <style dangerouslySetInnerHTML={{ __html: `.custom-dropdown .p-dropdown { background-color: var(--background); color: var(--text); border: 1px solid rgba(var(--secondary-rgb), 0.3); } .custom-dropdown .p-dropdown:hover, .custom-dropdown .p-dropdown:focus-within { border-color: var(--primary); } .custom-dropdown .p-dropdown-panel { background-color: var(--background); color: var(--text); border: 1px solid rgba(var(--secondary-rgb), 0.3); }` }} />
                    <Box>
                        <Typography variant="subtitle1" sx={{ marginBottom: 1, color: 'var(--text)' }}>Hora Específica</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Calendar
                                value={filtrosHoy.horaEspecifica}
                                onChange={(e) => handleFiltroChangeHoy('horaEspecifica', e.value)}
                                timeOnly
                                hourFormat="24"
                                placeholder="Selecciona hora"
                            />
                            <Button variant="outlined" onClick={limpiarHoraEspecificaHoy} size="small">Limpiar</Button>
                        </Box>
                    </Box>

                    {/* * Filtro rango de horas */}
                    <Box>
                        <Typography variant="subtitle1" sx={{ marginBottom: 1, color: 'var(--text)' }}>Rango de Horas</Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Calendar
                                value={filtrosHoy.rangoHorasInicio}
                                onChange={(e) => handleFiltroChangeHoy('rangoHorasInicio', e.value)}
                                timeOnly
                                hourFormat="24"
                                placeholder="Hora inicio"
                            />
                            <Calendar
                                value={filtrosHoy.rangoHorasFin}
                                onChange={(e) => handleFiltroChangeHoy('rangoHorasFin', e.value)}
                                timeOnly
                                hourFormat="24"
                                placeholder="Hora fin"
                            />
                            <Button variant="outlined" onClick={limpiarRangoHorasHoy} size="small">Limpiar</Button>
                        </Box>
                    </Box>

                    {/* * Filtro turno */}
                    <Box>
                        <Typography variant="subtitle1" sx={{ marginBottom: 1, color: 'var(--text)' }}>Turno</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Dropdown
                                value={filtrosHoy.turno}
                                options={TURNOS}
                                onChange={(e) => handleFiltroChangeHoy('turno', e.value)}
                                placeholder="Selecciona turno"
                                showClear
                                className="custom-dropdown"
                                style={{ backgroundColor: 'var(--background)', color: 'var(--text)', border: '1px solid rgba(var(--secondary-rgb), 0.3)' }}
                                panelStyle={{ backgroundColor: 'var(--background)', color: 'var(--text)', border: '1px solid rgba(var(--secondary-rgb), 0.3)' }}
                            />
                            <Button variant="outlined" onClick={limpiarTurnoHoy} size="small">Limpiar</Button>
                        </Box>
                    </Box>

                    {/* * Filtro usuario */}
                    <Box>
                        <Typography variant="subtitle1" sx={{ marginBottom: 1, color: 'var(--text)' }}>Usuario</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Dropdown
                                filter={true}
                                options={(usersList || []).filter(user => user != null).map(user => ({ label: `${user.nombre} ${user.apellido}`, value: user.id }))}
                                value={filtrosHoy.usuario}
                                onChange={(e) => handleFiltroChangeHoy('usuario', e.value)}
                                placeholder="Selecciona usuario"
                                showClear
                                className="custom-dropdown"
                                style={{ backgroundColor: 'var(--background)', color: 'var(--text)', border: '1px solid rgba(var(--secondary-rgb), 0.3)' }}
                                panelStyle={{ backgroundColor: 'var(--background)', color: 'var(--text)', border: '1px solid rgba(var(--secondary-rgb), 0.3)' }}
                            />
                            <Button variant="outlined" onClick={limpiarUsuarioHoy} size="small">Limpiar</Button>
                        </Box>
                    </Box>
                </Box>
            </Dialog>

            {/* * Modal de filtros de otros con PrimeReact */}
            <Dialog
                header="Filtros de Entradas Otros"
                visible={modalFiltrosOtrosVisible}
                onHide={cerrarModalFiltrosOtros}
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
                    {/* * Filtro hora específica */}
                    <style dangerouslySetInnerHTML={{ __html: `.custom-dropdown .p-dropdown { background-color: var(--background); color: var(--text); border: 1px solid rgba(var(--secondary-rgb), 0.3); } .custom-dropdown .p-dropdown:hover, .custom-dropdown .p-dropdown:focus-within { border-color: var(--primary); } .custom-dropdown .p-dropdown-panel { background-color: var(--background); color: var(--text); border: 1px solid rgba(var(--secondary-rgb), 0.3); }` }} />
                    <Box>
                        <Typography variant="subtitle1" sx={{ marginBottom: 1, color: 'var(--text)' }}>Hora Específica</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Calendar
                                value={filtrosOtros.horaEspecifica}
                                onChange={(e) => handleFiltroChangeOtros('horaEspecifica', e.value)}
                                timeOnly
                                hourFormat="24"
                                placeholder="Selecciona hora"
                            />
                            <Button variant="outlined" onClick={limpiarHoraEspecificaOtros} size="small">Limpiar</Button>
                        </Box>
                    </Box>

                    {/* * Filtro rango de horas */}
                    <Box>
                        <Typography variant="subtitle1" sx={{ marginBottom: 1, color: 'var(--text)' }}>Rango de Horas</Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Calendar
                                value={filtrosOtros.rangoHorasInicio}
                                onChange={(e) => handleFiltroChangeOtros('rangoHorasInicio', e.value)}
                                timeOnly
                                hourFormat="24"
                                placeholder="Hora inicio"
                            />
                            <Calendar
                                value={filtrosOtros.rangoHorasFin}
                                onChange={(e) => handleFiltroChangeOtros('rangoHorasFin', e.value)}
                                timeOnly
                                hourFormat="24"
                                placeholder="Hora fin"
                            />
                            <Button variant="outlined" onClick={limpiarRangoHorasOtros} size="small">Limpiar</Button>
                        </Box>
                    </Box>

                    {/* * Filtro turno */}
                    <Box>
                        <Typography variant="subtitle1" sx={{ marginBottom: 1, color: 'var(--text)' }}>Turno</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Dropdown
                                value={filtrosOtros.turno}
                                options={TURNOS}
                                onChange={(e) => handleFiltroChangeOtros('turno', e.value)}
                                placeholder="Selecciona turno"
                                showClear
                                className="custom-dropdown"
                                style={{ backgroundColor: 'var(--background)', color: 'var(--text)', border: '1px solid rgba(var(--secondary-rgb), 0.3)' }}
                                panelStyle={{ backgroundColor: 'var(--background)', color: 'var(--text)', border: '1px solid rgba(var(--secondary-rgb), 0.3)' }}
                            />
                            <Button variant="outlined" onClick={limpiarTurnoOtros} size="small">Limpiar</Button>
                        </Box>
                    </Box>

                    {/* * Filtro usuario */}
                    <Box>
                        <Typography variant="subtitle1" sx={{ marginBottom: 1, color: 'var(--text)' }}>Usuario</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Dropdown
                                filter={true}
                                options={(usersList || []).filter(user => user != null).map(user => ({ label: `${user.nombre} ${user.apellido}`, value: user.id }))}
                                value={filtrosOtros.usuario}
                                onChange={(e) => handleFiltroChangeOtros('usuario', e.value)}
                                placeholder="Selecciona usuario"
                                showClear
                                className="custom-dropdown"
                                style={{ backgroundColor: 'var(--background)', color: 'var(--text)', border: '1px solid rgba(var(--secondary-rgb), 0.3)' }}
                                panelStyle={{ backgroundColor: 'var(--background)', color: 'var(--text)', border: '1px solid rgba(var(--secondary-rgb), 0.3)' }}
                            />
                            <Button variant="outlined" onClick={limpiarUsuarioOtros} size="small">Limpiar</Button>
                        </Box>
                    </Box>
                </Box>
            </Dialog>

            {/* * Modal de reportes */}
            <Dialog
                header="Reportes de Entradas"
                visible={modalReportesVisible}
                onHide={cerrarModalReportes}
                style={{ width: '80vw', height: '80vh' }}
                modal
                maximizable
            >
                {/* * Paso datos separados: hoy y otras fechas */}
                <Reportes
                    titleSeccion1="Entradas Hoy"
                    dataSeccion1={dataSeccion1}
                    titleSeccion2="Entradas Otras Fechas"
                    dataSeccion2={dataSeccion2}
                />
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
                                    <Avatar src={`https://lumina-testing.onrender.com/api/images/${selectedRecord.usuario?.path_foto}`} alt={selectedRecord.usuarioNombreCompleto} sx={{ width: 100, height: 100, mb: 2, border: '2px solid var(--primary)' }} />
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
                                        <img src={`https://lumina-testing.onrender.com/api/images/${selectedRecord.equipo?.path_foto_equipo_implemento}`} alt="Imagen del Equipo" style={{ width: '100px', height: '100px', marginBottom: '16px', borderRadius: '8px' }} />
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
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Typography variant="body1" sx={{ color: 'var(--success-color)' }}><strong>Ingreso:</strong> {dayjs(selectedRecord.ingreso).format('DD/MM/YYYY HH:mm')}</Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ backgroundColor: 'var(--background)' }}>
                    <Button onClick={() => setDetailModalOpen(false)} sx={{ color: 'white', backgroundColor: '#f44336', '&:hover': { backgroundColor: '#d32f2f' }, fontSize: '1.1rem', padding: '8px 16px' }}>Cerrar</Button>
                </DialogActions>
            </MuiDialog>
        </Box >
    );
};

export default Entradas;