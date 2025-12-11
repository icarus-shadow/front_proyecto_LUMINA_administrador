// * Importo las dependencias necesarias para el componente
import React, { useRef, useMemo } from 'react';
import { Button } from '@mui/material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';
import html2canvas from 'html2canvas';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// * Registro los componentes necesarios para Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
);

// * Defino la interfaz para las props del componente Reportes
interface ReportesProps {
    titleSeccion1: string; // * Título de la primera sección
    titleSeccion2?: string; // ? Título opcional de la segunda sección
    dataSeccion1: any[]; // * Datos para la primera sección
    dataSeccion2?: any[]; // ? Datos opcionales para la segunda sección
    fileName?: string; // ? Nombre personalizado del archivo
    mainTitle?: string; // ? Título principal del PDF
    subtitle?: string; // ? Subtítulo del PDF
}

// * Componente Reportes que genera PDFs con información proporcionada
const Reportes: React.FC<ReportesProps> = ({ titleSeccion1, titleSeccion2, dataSeccion1, dataSeccion2, fileName, mainTitle, subtitle }) => {
    // * Refs para capturar los gráficos con html2canvas
    const barChartRef = useRef<HTMLDivElement>(null);
    const pieChartRef = useRef<HTMLDivElement>(null);
    const lineChartRef = useRef<HTMLDivElement>(null);

    // * Combino los datos de ambas secciones si existen
    const allData = useMemo(() => {
        return [...(dataSeccion1 || []), ...(dataSeccion2 || [])];
    }, [dataSeccion1, dataSeccion2]);

    // * Proceso datos para gráfico de barras: frecuencia de equipos por marca
    const barData = useMemo(() => {
        const marcaCount: { [key: string]: number } = {};
        allData.forEach(item => {
            marcaCount[item.marcaEquipo] = (marcaCount[item.marcaEquipo] || 0) + 1;
        });
        return {
            labels: Object.keys(marcaCount),
            datasets: [{
                label: 'Frecuencia de Equipos',
                data: Object.values(marcaCount),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }],
        };
    }, [allData]);

    // * Proceso datos para gráfico de pie: distribución de propietarios
    const pieData = useMemo(() => {
        const usuarioCount: { [key: string]: number } = {};
        allData.forEach(item => {
            usuarioCount[item.usuarioNombreCompleto] = (usuarioCount[item.usuarioNombreCompleto] || 0) + 1;
        });
        return {
            labels: Object.keys(usuarioCount),
            datasets: [{
                label: 'Distribución de Propietarios',
                data: Object.values(usuarioCount),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 205, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
            }],
        };
    }, [allData]);

    // * Proceso datos para gráfico de línea: entradas y salidas por fecha
    const lineData = useMemo(() => {
        const dateCount: { [key: string]: { entradas: number; salidas: number } } = {};
        allData.forEach(item => {
            const date = dayjs(item.ingreso).format('YYYY-MM-DD');
            if (!dateCount[date]) {
                dateCount[date] = { entradas: 0, salidas: 0 };
            }
            dateCount[date].entradas += 1;
            if (item.salida) {
                dateCount[date].salidas += 1;
            }
        });
        const sortedDates = Object.keys(dateCount).sort();
        return {
            labels: sortedDates,
            datasets: [
                {
                    label: 'Entradas',
                    data: sortedDates.map(date => dateCount[date].entradas),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1,
                },
                {
                    label: 'Salidas',
                    data: sortedDates.map(date => dateCount[date].salidas),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.1,
                },
            ],
        };
    }, [allData]);

    // * Función para generar el PDF con las secciones y gráficos
    const generarPDF = async () => {
        const doc = new jsPDF();
        let yPos = 20;

        // * Título Principal
        if (mainTitle) {
            doc.setFontSize(22);
            doc.text(mainTitle, 105, yPos, { align: 'center' });
            yPos += 10;
        }

        // * Subtítulo
        if (subtitle) {
            doc.setFontSize(14);
            doc.setTextColor(100);
            doc.text(subtitle, 105, yPos, { align: 'center' });
            doc.setTextColor(0); // Reset color
            yPos += 15;
        } else if (mainTitle) {
            yPos += 10;
        }


        // * Agrego la primera sección si hay datos
        if (dataSeccion1 && dataSeccion1.length > 0) {
            doc.setFontSize(16);
            doc.text(titleSeccion1, 20, yPos);
            yPos += 5;

            const rows1 = dataSeccion1.map(item => [
                dayjs(item.ingreso).format('DD/MM/YYYY HH:mm'),
                item.salida ? dayjs(item.salida).format('DD/MM/YYYY HH:mm') : 'Activo',
                item.marcaEquipo,
                item.usuarioNombreCompleto,
                item.descripcion
            ]);

            autoTable(doc, {
                head: [['Fecha y hora entrada', 'Fecha y hora salida', 'Equipo nombre', 'Propietario', 'Descripción del equipo']],
                body: rows1,
                startY: yPos
            });
            yPos = (doc as any).lastAutoTable.finalY + 10;
        }


        // * Si hay segunda sección, agrego su título y tabla
        if (titleSeccion2 && dataSeccion2 && dataSeccion2.length > 0) {
            doc.setFontSize(16);
            doc.text(titleSeccion2, 20, yPos);
            yPos += 10;

            const rows2 = dataSeccion2.map(item => [
                dayjs(item.ingreso).format('DD/MM/YYYY HH:mm'),
                item.salida ? dayjs(item.salida).format('DD/MM/YYYY HH:mm') : 'Activo',
                item.marcaEquipo,
                item.usuarioNombreCompleto,
                item.descripcion
            ]);

            autoTable(doc, {
                head: [['Fecha y hora entrada', 'Fecha y hora salida', 'Equipo nombre', 'Propietario', 'Descripción del equipo']],
                body: rows2,
                startY: yPos
            });

            yPos = (doc as any).lastAutoTable.finalY + 10;
        }

        // * Agrego sección de gráficos
        // Check conditions to start a new page if not enough space
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }


        doc.setFontSize(16);
        doc.text('Gráficos', 20, yPos);
        yPos += 10;

        // * Capturo y agrego gráfico de barras
        if (barChartRef.current) {
            const barCanvas = await html2canvas(barChartRef.current);
            const barImgData = barCanvas.toDataURL('image/png');
            if (yPos + 60 > 280) { doc.addPage(); yPos = 20; }
            doc.addImage(barImgData, 'PNG', 20, yPos, 80, 60);
            yPos += 70;
        }

        // * Capturo y agrego gráfico de pie
        if (pieChartRef.current) {
            const pieCanvas = await html2canvas(pieChartRef.current);
            const pieImgData = pieCanvas.toDataURL('image/png');
            if (yPos + 60 > 280) { doc.addPage(); yPos = 20; }
            doc.addImage(pieImgData, 'PNG', 20, yPos, 80, 60);
            yPos += 70;
        }

        // * Capturo y agrego gráfico de línea
        if (lineChartRef.current) {
            const lineCanvas = await html2canvas(lineChartRef.current);
            const lineImgData = lineCanvas.toDataURL('image/png');
            if (yPos + 60 > 280) { doc.addPage(); yPos = 20; }
            doc.addImage(lineImgData, 'PNG', 20, yPos, 80, 60);
        }

        // * Guardo el PDF con nombre personalizado o por defecto
        const finalFileName = fileName ? (fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`) : 'reporte.pdf';
        doc.save(finalFileName);
    };

    // * Renderizo los gráficos y el botón para generar el PDF
    return (
        <div>
            {/* * Contenedor de gráficos con layout flexbox para responsividad */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                {/* * Gráfico de barras para frecuencia de equipos */}
                <div ref={barChartRef} style={{ flex: '1 1 400px', maxWidth: '400px', height: '300px' }}>
                    <h3>Frecuencia de Equipos por Marca</h3>
                    <Bar data={barData} />
                </div>

                {/* * Gráfico de pie para distribución de propietarios */}
                <div ref={pieChartRef} style={{ flex: '1 1 400px', maxWidth: '400px', height: '300px' }}>
                    <h3>Distribución de Propietarios</h3>
                    <Pie data={pieData} />
                </div>

                {/* * Gráfico de línea para entradas/salidas por fecha */}
                <div ref={lineChartRef} style={{ flex: '1 1 400px', maxWidth: '400px', height: '300px' }}>
                    <h3>Entradas y Salidas por Fecha</h3>
                    <Line data={lineData} />
                </div>
            </div>

            <Button variant="contained" onClick={generarPDF}>
                Generar PDF
            </Button>
        </div>
    );
};

export default Reportes;