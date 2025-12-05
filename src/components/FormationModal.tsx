import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../services/redux/hooks';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { InputText as FilterInput } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Card } from 'primereact/card';
import type { formacion, nivelFormacion } from '../types/interfacesData';
import { fetchFormations, addFormation, updateFormation, deleteFormation } from '../services/redux/slices/data/formationSlice';
import { fetchLevelFormations } from '../services/redux/slices/data/LevelFormationSlice';
import CustomAlert from './CustomAlert';
import { useAlert } from './AlertSystem';

// Formatea una fecha Date a YYYY-MM-DD sin alterar por zona horaria
const formatDateToYMD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

interface FormationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const FormationModal: React.FC<FormationModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();
    const { showAlert: showConfirmAlert } = useAlert();
    const { data: formations, addSuccess, updateSuccess, deleteSuccess } = useSelector((state: any) => state.formationsReducer);
    const { data: levelFormations } = useSelector((state: any) => state.levelFormationReducer);

    const [formData, setFormData] = useState<Partial<formacion>>({
        tipos_programas_id: undefined,
        ficha: '',
        nombre_programa: '',
        fecha_inicio_programa: '',
        fecha_fin_programa: ''
    });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState<'error' | 'success' | 'warning' | 'info'>('info');
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
    }, [formData.fecha_inicio_programa, formData.fecha_fin_programa]);

    useEffect(() => {
        if (isOpen) {
            dispatch(fetchFormations());
            dispatch(fetchLevelFormations());
        }
    }, [isOpen, dispatch]);

    useEffect(() => {
        if (addSuccess === true) {
            showAlert('success', 'Formación agregada exitosamente');
            resetForm();
        } else if (addSuccess === false) {
            showAlert('error', 'Error al agregar la formación');
        }
    }, [addSuccess]);

    useEffect(() => {
        if (updateSuccess === true) {
            showAlert('success', 'Formación actualizada exitosamente');
            resetForm();
        } else if (updateSuccess === false) {
            showAlert('error', 'Error al actualizar la formación');
        }
    }, [updateSuccess]);

    useEffect(() => {
        if (deleteSuccess === true) {
            showAlert('success', 'Formación eliminada exitosamente');
        } else if (deleteSuccess === false) {
            showAlert('error', 'Error al eliminar la formación');
        }
    }, [deleteSuccess]);

    const showAlert = (severity: 'error' | 'success' | 'warning' | 'info', message: string) => {
        setAlertSeverity(severity);
        setAlertMessage(message);
        setAlertVisible(true);
    };

    const normalizeDateString = (value?: string) => {
        if (!value) return '';
        // Busca el primer patrón válido YYYY-MM-DD y lo devuelve
        const match = value.match(/\d{4}-\d{2}-\d{2}/);
        if (match && match[0]) return match[0];
        // Si llegara algo como 20252025-12-14, intenta recortar los últimos 10 caracteres
        const tail = value.slice(-10);
        if (/\d{4}-\d{2}-\d{2}/.test(tail)) return tail;
        return value;
    };

    const parseDateInput = (value: string | undefined) => {
        if (!value) return null;
        const dateOnly = normalizeDateString(value).split('T')[0];
        const [y, m, d] = dateOnly.split('-').map(Number);
        return new Date(y, (m || 1) - 1, d || 1);
    };

    const resetForm = () => {
        setFormData({
            tipos_programas_id: undefined,
            ficha: '',
            nombre_programa: '',
            fecha_inicio_programa: '',
            fecha_fin_programa: ''
        });
        setEditingId(null);
    };

    const handleEdit = (formation: formacion) => {
        const safeInicio = normalizeDateString(formation.fecha_inicio_programa);
        const safeFin = normalizeDateString(formation.fecha_fin_programa);

        setFormData({
            tipos_programas_id: formation.tipos_programas_id || formation.nivel_formacion?.id,
            ficha: formation.ficha,
            nombre_programa: formation.nombre_programa,
            fecha_inicio_programa: safeInicio,
            fecha_fin_programa: safeFin
        });
        setEditingId(formation.id);
    };

    const handleDelete = (id: number) => {
        showConfirmAlert(
            'confirm',
            '¿Estás seguro de eliminar esta formación?',
            { yesText: 'Eliminar', noText: 'Cancelar' },
            (confirmed) => {
                if (confirmed) {
                    dispatch(deleteFormation(id));
                }
            }
        );
    };

    const handleSave = () => {
        if (!formData.tipos_programas_id || !formData.ficha || !formData.nombre_programa || !formData.fecha_inicio_programa || !formData.fecha_fin_programa) {
            showAlert('error', 'Todos los campos son obligatorios');
            return;
        }

        if (new Date(formData.fecha_fin_programa) <= new Date(formData.fecha_inicio_programa)) {
            showAlert('error', 'La fecha de fin debe ser posterior a la fecha de inicio');
            return;
        }

        const data: formacion = {
            id: editingId || 0,
            tipos_programas_id: formData.tipos_programas_id,
            ficha: formData.ficha,
            nombre_programa: formData.nombre_programa,
            fecha_inicio_programa: formData.fecha_inicio_programa,
            fecha_fin_programa: formData.fecha_fin_programa
        };

        if (editingId) {
            dispatch(updateFormation({ id: editingId, data }));
        } else {
            dispatch(addFormation(data));
        }
    };

    const handleCancel = () => {
        resetForm();
    };

    const actionTemplate = (rowData: formacion) => {
        return (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button icon="pi pi-pencil" label="Editar" className="p-button" onClick={() => handleEdit(rowData)} />
                <Button icon="pi pi-trash" label="Eliminar" className="p-button" onClick={() => handleDelete(rowData.id)} />
            </div>
        );
    };

    const fechaInicioTemplate = (rowData: formacion) => {
        return rowData.fecha_inicio_programa ? (rowData.fecha_inicio_programa.split('T')[0]) : '';
    };

    const fechaFinTemplate = (rowData: formacion) => {
        return rowData.fecha_fin_programa ? (rowData.fecha_fin_programa.split('T')[0]) : '';
    };

    const levelFormationOptions = levelFormations?.map((lf: nivelFormacion) => ({
        label: lf.nivel_formacion,
        value: lf.id
    })) || [];

    const isDropdownEmpty = levelFormationOptions.length === 0;

    const header = (
        <div className="table-header">
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <FilterInput
                    type="search"
                    onInput={(e) => setGlobalFilter(e.currentTarget.value)}
                    placeholder="Buscar..."
                />
            </IconField>
        </div>
    );

    return (
        <>
            <Dialog
                header="Gestión de Formaciones"
                visible={isOpen}
                onHide={onClose}
                style={{ width: '80vw' }}
                modal
                className="p-fluid"
            >
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 2 }}>
                        <DataTable
                            value={formations}
                            paginator
                            rows={10}
                            globalFilter={globalFilter}
                            header={header}
                            emptyMessage="No se encontraron formaciones"
                        >
                            <Column field="ficha" header="Ficha" sortable />
                            <Column field="nombre_programa" header="Nombre Programa" sortable />
                            <Column body={fechaInicioTemplate} header="Fecha Inicio" sortable />
                            <Column body={fechaFinTemplate} header="Fecha Fin" sortable />
                            <Column body={actionTemplate} header="Acciones" />
                        </DataTable>
                    </div>
                    <div style={{ flex: 1 }}>
                        <Card title="Formulario de Formación" className="p-mb-3 p-shadow-4 p-p-3" style={{ border: '2px solid #007bff', padding: '1.5rem' }}>
                            <div className="p-field p-mb-3">
                                <label htmlFor="tipos_programas_id">Tipo de Programa</label>
                                {isDropdownEmpty && <p>No hay tipos de programa disponibles</p>}
                                <Dropdown
                                    id="tipos_programas_id"
                                    value={formData.tipos_programas_id}
                                    options={levelFormationOptions}
                                    onChange={(e) => setFormData({ ...formData, tipos_programas_id: e.value })}
                                    placeholder="Seleccione un tipo"
                                    disabled={isDropdownEmpty}
                                />
                            </div>
                            <div className="p-field p-mb-3">
                                <label htmlFor="ficha">Ficha</label>
                                <InputText
                                    id="ficha"
                                    value={formData.ficha}
                                    onChange={(e) => setFormData({ ...formData, ficha: e.target.value })}
                                />
                            </div>
                            <div className="p-field p-mb-3">
                                <label htmlFor="nombre_programa">Nombre Programa</label>
                                <InputText
                                    id="nombre_programa"
                                    value={formData.nombre_programa}
                                    onChange={(e) => setFormData({ ...formData, nombre_programa: e.target.value })}
                                />
                            </div>
                            <div className="p-field p-mb-3">
                                <label htmlFor="fecha_inicio_programa">Fecha Inicio Programa</label>
                                <Calendar
                                    id="fecha_inicio_programa"
                                    value={parseDateInput(formData.fecha_inicio_programa)}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        fecha_inicio_programa: e.value ? formatDateToYMD(e.value as Date) : ''
                                    })}
                                    dateFormat="yy-mm-dd"
                                    readOnlyInput
                                    showIcon
                                    showOnFocus={false}
                                />
                            </div>
                            <div className="p-field p-mb-5">
                                <label htmlFor="fecha_fin_programa">Fecha Fin Programa</label>
                                <Calendar
                                    id="fecha_fin_programa"
                                    value={parseDateInput(formData.fecha_fin_programa)}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        fecha_fin_programa: e.value ? formatDateToYMD(e.value as Date) : ''
                                    })}
                                    dateFormat="yy-mm-dd"
                                    readOnlyInput
                                    showIcon
                                    showOnFocus={false}
                                />
                            </div>
                            <div className="p-mt-5 p-pt-3" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                                <Button label="Guardar" icon="pi pi-check" onClick={handleSave} />
                                <Button label="Cancelar" icon="pi pi-times" className="p-button-secondary" onClick={handleCancel} />
                            </div>
                        </Card>
                    </div>
                </div>
            </Dialog>
            <CustomAlert
                visible={alertVisible}
                severity={alertSeverity}
                message={alertMessage}
                onClose={() => setAlertVisible(false)}
            />
        </>
    );
};

export default FormationModal;