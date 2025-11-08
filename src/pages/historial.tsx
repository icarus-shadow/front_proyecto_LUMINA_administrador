// @ts-ignore
import * as React from 'react';
import { Box, Typography, TextField, Button, ButtonGroup } from "@mui/material";
import DinamicTable from '../components/DinamicTable';
import { usuarios, elementos, historial } from '../mockData';
import type { GridColDef } from "@mui/x-data-grid";

const Historial = () => {
    const [fechaFiltro, setFechaFiltro] = React.useState('');
    const [periodoFiltro, setPeriodoFiltro] = React.useState<'dia' | 'semana' | 'mes' | ''>('');

    const handleFechaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFechaFiltro(event.target.value);
    };

    const handlePeriodoChange = (periodo: 'dia' | 'semana' | 'mes') => {
        setPeriodoFiltro(periodo);
    };

    // Función para obtener el historial completo con filtros
    const getHistorialCompleto = () => {
        let filteredHistorial = historial.map(entry => {
            const usuario = usuarios.find(u => u.id === entry.usuarioId);
            const elemento = elementos.find(e => e.id === entry.elementoId);
            return {
                ...entry,
                usuarioNombre: usuario ? usuario.nombre : 'Desconocido',
                elementoNombre: elemento ? elemento.nombre : 'Desconocido',
                elementoCategoria: elemento ? elemento.categoria : '',
                fechaFormateada: new Date(entry.fecha).toLocaleDateString('es-ES')
            };
        });

        // Aplicar filtros
        if (fechaFiltro) {
            // Filtro por fecha específica
            filteredHistorial = filteredHistorial.filter(entry => {
                const entryDate = new Date(entry.fecha).toISOString().split('T')[0];
                return entryDate === fechaFiltro;
            });
        }

        if (periodoFiltro) {
            const now = new Date();
            let startDate: Date;
            switch (periodoFiltro) {
                case 'dia':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'semana':
                    startDate = new Date(now);
                    startDate.setDate(now.getDate() - now.getDay());
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'mes':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                default:
                    startDate = new Date(0);
            }
            filteredHistorial = filteredHistorial.filter(entry => {
                const entryDate = new Date(entry.fecha);
                return entryDate >= startDate;
            });
        }

        return filteredHistorial;
    };

    // Columnas para la tabla de historial
    const columnasHistorial: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'fechaFormateada', headerName: 'Fecha', width: 120 },
        { field: 'usuarioNombre', headerName: 'Usuario', width: 200 },
        { field: 'elementoNombre', headerName: 'Elemento', width: 200 },
        { field: 'elementoCategoria', headerName: 'Categoría', width: 150 },
        { field: 'tipo', headerName: 'Tipo', width: 100 },
        { field: 'observaciones', headerName: 'Observaciones', width: 250 },
    ];

    // Funciones básicas para editar y eliminar
    const handleEdit = (row: any) => {
        console.log('Editar:', row);
    };

    const handleDelete = (id: number, codigo: string) => {
        console.log('Eliminar:', id, 'y código:', codigo);
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
                    <TextField
                        label="Fecha específica"
                        type="date"
                        value={fechaFiltro}
                        onChange={handleFechaChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        size="small"
                    />
                    <ButtonGroup variant="outlined" size="small">
                        <Button
                            variant={periodoFiltro === 'dia' ? 'contained' : 'outlined'}
                            onClick={() => handlePeriodoChange('dia')}
                        >
                            Día
                        </Button>
                        <Button
                            variant={periodoFiltro === 'semana' ? 'contained' : 'outlined'}
                            onClick={() => handlePeriodoChange('semana')}
                        >
                            Semana
                        </Button>
                        <Button
                            variant={periodoFiltro === 'mes' ? 'contained' : 'outlined'}
                            onClick={() => handlePeriodoChange('mes')}
                        >
                            Mes
                        </Button>
                    </ButtonGroup>
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => {
                            setFechaFiltro('');
                            setPeriodoFiltro('');
                        }}
                    >
                        Limpiar filtros
                    </Button>
                </Box>
                <DinamicTable
                    rows={getHistorialCompleto()}
                    columns={columnasHistorial}
                />
            </Box>
        </Box>
    );
};

export default Historial;