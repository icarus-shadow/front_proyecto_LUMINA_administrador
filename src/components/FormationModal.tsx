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

interface FormationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const FormationModal: React.FC<FormationModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();
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
        if (isOpen) {
            console.log('Iniciando carga de formaciones y niveles de formación');
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
        setFormData({
            tipos_programas_id: formation.tipos_programas_id,
            ficha: formation.ficha,
            nombre_programa: formation.nombre_programa,
            fecha_inicio_programa: formation.fecha_inicio_programa,
            fecha_fin_programa: formation.fecha_fin_programa
        });
        setEditingId(formation.id);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar esta formación?')) {
            dispatch(deleteFormation(id));
        }
    };

    const handleSave = () => {
        console.log('formData antes de validación:', formData);
        if (!formData.tipos_programas_id || !formData.ficha || !formData.nombre_programa || !formData.fecha_inicio_programa || !formData.fecha_fin_programa) {
            showAlert('warning', 'Todos los campos son obligatorios');
            return;
        }

        if (new Date(formData.fecha_fin_programa) <= new Date(formData.fecha_inicio_programa)) {
            showAlert('warning', 'La fecha de fin debe ser posterior a la fecha de inicio');
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
        console.log('data a enviar:', data);

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
        return rowData.fecha_inicio_programa ? new Date(rowData.fecha_inicio_programa).toLocaleDateString('es-ES') : '';
    };

    const fechaFinTemplate = (rowData: formacion) => {
        return rowData.fecha_fin_programa ? new Date(rowData.fecha_fin_programa).toLocaleDateString('es-ES') : '';
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
                        <Card title="Formulario de Formación" className="p-mb-3 p-shadow-4 p-p-3" style={{ border: '2px solid #007bff' }}>
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
                                    value={formData.fecha_inicio_programa ? new Date(formData.fecha_inicio_programa) : null}
                                    onChange={(e) => setFormData({ ...formData, fecha_inicio_programa: e.value ? e.value.toISOString().split('T')[0] : '' })}
                                    dateFormat="yyyy-mm-dd"
                                />
                            </div>
                            <div className="p-field p-mb-5">
                                <label htmlFor="fecha_fin_programa">Fecha Fin Programa</label>
                                <Calendar
                                    id="fecha_fin_programa"
                                    value={formData.fecha_fin_programa ? new Date(formData.fecha_fin_programa) : null}
                                    onChange={(e) => setFormData({ ...formData, fecha_fin_programa: e.value ? e.value.toISOString().split('T')[0] : '' })}
                                    dateFormat="yyyy-mm-dd"
                                />
                            </div>
                            <div className="p-mt-5 p-pt-3" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
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