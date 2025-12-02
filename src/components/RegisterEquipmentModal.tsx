import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import './styles/RegisterEquipmentModal.css';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { MultiSelect } from 'primereact/multiselect';
import { Checkbox } from 'primereact/checkbox';
import { FileUpload } from 'primereact/fileupload';
import CustomAlert from './CustomAlert';

import { useAppDispatch, useAppSelector } from '../services/redux/hooks';
import { fetchUsers } from '../services/redux/slices/data/UsersSlice';
import { fetchSubElements } from '../services/redux/slices/data/subElementsSlice';
import { addElement } from '../services/redux/slices/data/elementsSlice';
import type { RootState } from '../services/redux/store';

interface RegisterEquipmentModalProps {
    visible: boolean;
    onHide: () => void;
}

const RegisterEquipmentModal: React.FC<RegisterEquipmentModalProps> = ({ visible, onHide }) => {
    const dispatch = useAppDispatch();

    // Redux Data
    const users = useAppSelector((state: RootState) => state.usersReducer.data);
    const subElements = useAppSelector((state: RootState) => state.subElementsReducer.data);

    // Form State
    const [snEquipo, setSnEquipo] = useState('');
    const [marca, setMarca] = useState('');
    const [color, setColor] = useState('');
    const [tipoElemento, setTipoElemento] = useState<string | null>(null);
    const [descripcion, setDescripcion] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // User Selection State
    const [userSearch, setUserSearch] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

    // Additional Elements State
    const [selectedSubElements, setSelectedSubElements] = useState<number[]>([]);

    // Loading State
    const [loading, setLoading] = useState(false);

    // Alert State
    const [alert, setAlert] = useState<{
        visible: boolean;
        severity: 'error' | 'success' | 'warning' | 'info';
        message: string;
    }>({ visible: false, severity: 'info', message: '' });

    const showAlert = (severity: 'error' | 'success' | 'warning' | 'info', message: string) => {
        setAlert({ visible: true, severity, message });
    };

    useEffect(() => {
        if (visible) {
            if (!users || users.length === 0) dispatch(fetchUsers());
            if (!subElements || subElements.length === 0) dispatch(fetchSubElements());
        }
    }, [visible, dispatch, users?.length, subElements?.length]);

    const onFileSelect = (e: any) => {
        if (e.files && e.files.length > 0) {
            setSelectedFile(e.files[0]);
        }
    };

    const handleUserToggle = (userId: number) => {
        let _selectedUsers = [...selectedUsers];
        if (_selectedUsers.includes(userId)) {
            _selectedUsers = _selectedUsers.filter(id => id !== userId);
        } else {
            _selectedUsers.push(userId);
        }
        setSelectedUsers(_selectedUsers);
    };

    const filteredUsers = users?.filter(user =>
        user &&
        user.nombre &&
        user.documento &&
        (user.nombre.toLowerCase().includes(userSearch.toLowerCase()) ||
            user.documento.includes(userSearch))
    ) || [];

    const handleSubmit = async () => {
        // Validations
        if (!snEquipo || !tipoElemento || !selectedFile) {
            showAlert('error', 'Por favor complete los campos obligatorios (SN, Tipo, Foto)');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('sn_equipo', snEquipo);
        if (marca) formData.append('marca', marca);
        if (color) formData.append('color', color);
        formData.append('tipo_elemento', tipoElemento);
        if (descripcion) formData.append('descripcion', descripcion);
        formData.append('path_foto_equipo_implemento', selectedFile);

        // Append arrays
        selectedUsers.forEach(id => formData.append('id_usuario[]', id.toString()));
        selectedSubElements.forEach(id => formData.append('elementos_adicionales[]', id.toString()));

        try {
            await dispatch(addElement(formData)).unwrap();
            showAlert('success', 'Equipo registrado correctamente');
            resetForm();
            setTimeout(() => onHide(), 1500);
        } catch (error) {
            console.error(error);
            showAlert('error', 'Error al registrar el equipo. Por favor intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSnEquipo('');
        setMarca('');
        setColor('');
        setTipoElemento(null);
        setDescripcion('');
        setSelectedFile(null);
        setSelectedUsers([]);
        setSelectedSubElements([]);
        setUserSearch('');
    };

    const tipoElementoOptions = [
        { label: 'Computador', value: 'Computador' },
        { label: 'Tablet', value: 'Tablet' },
        { label: 'Celular', value: 'Celular' },
        { label: 'Otro', value: 'Otro' }
    ];

    return (
        <Dialog
            header="Registrar Nuevo Equipo"
            visible={visible}
            style={{ width: '90vw', maxWidth: '1200px' }}
            onHide={onHide}
            modal
            className="p-fluid register-equipment-modal"
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
            <CustomAlert
                visible={alert.visible}
                severity={alert.severity}
                message={alert.message}
                onClose={() => setAlert({ ...alert, visible: false })}
            />

            <div className="grid" style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                {/* Left Column: Equipment Form */}
                <div style={{
                    flex: 1,
                    padding: '1.5rem',
                    backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(var(--primary-rgb), 0.3)'
                }}>
                    <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontWeight: 'bold' }}>Información del Equipo</h3>

                    <div className="field mb-3">
                        <label htmlFor="sn_equipo" style={{ color: 'var(--text)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Serial Number (SN) *</label>
                        <InputText id="sn_equipo" value={snEquipo} onChange={(e) => setSnEquipo(e.target.value)} className="w-full" />
                    </div>

                    <div className="field mb-3">
                        <label htmlFor="marca" style={{ color: 'var(--text)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Marca</label>
                        <InputText id="marca" value={marca} onChange={(e) => setMarca(e.target.value)} className="w-full" />
                    </div>

                    <div className="field mb-3">
                        <label htmlFor="color" style={{ color: 'var(--text)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Color</label>
                        <InputText id="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full" />
                    </div>

                    <div className="field mb-3">
                        <label htmlFor="tipo_elemento" style={{ color: 'var(--text)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Tipo de Elemento *</label>
                        <Dropdown
                            id="tipo_elemento"
                            value={tipoElemento}
                            options={tipoElementoOptions}
                            onChange={(e) => setTipoElemento(e.value)}
                            placeholder="Seleccione un tipo"
                            className="w-full"
                        />
                    </div>

                    <div className="field mb-3">
                        <label htmlFor="descripcion" style={{ color: 'var(--text)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Descripción</label>
                        <InputTextarea id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} className="w-full" />
                    </div>

                    <div className="field mb-3">
                        <label style={{ color: 'var(--text)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Foto del Equipo *</label>
                        <FileUpload
                            mode="basic"
                            name="path_foto_equipo_implemento"
                            accept="image/*"
                            maxFileSize={1000000}
                            onSelect={onFileSelect}
                            chooseLabel="Subir Foto"
                            className="w-full"
                        />
                        {selectedFile && <small className="block mt-1">Archivo seleccionado: {selectedFile.name}</small>}
                    </div>
                </div>

                {/* Right Column: User Assignment */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1.5rem',
                    backgroundColor: 'rgba(var(--secondary-rgb), 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(var(--secondary-rgb), 0.3)'
                }}>
                    <h3 style={{ color: 'var(--secondary)', marginBottom: '1.5rem', fontWeight: 'bold' }}>Asignar Usuarios</h3>

                    <div className="mb-3">
                        <span className="p-input-icon-left w-full">
                            <i className="pi pi-search" />
                            <InputText
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                placeholder="Buscar por nombre o documento..."
                                className="w-full"
                            />
                        </span>
                    </div>

                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        border: '1px solid rgba(var(--text-rgb), 0.2)',
                        borderRadius: '6px',
                        padding: '1rem',
                        maxHeight: '500px',
                        backgroundColor: 'rgba(var(--background-rgb), 0.5)'
                    }}>
                        {filteredUsers.map(user => {
                            if (!user) return null;
                            return (
                                <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(var(--text-rgb), 0.1)', padding: '0.5rem', marginBottom: '0.75rem' }}>
                                    <Checkbox
                                        inputId={`user-${user.id}`}
                                        value={user.id}
                                        onChange={() => handleUserToggle(user.id)}
                                        checked={selectedUsers.includes(user.id)}
                                    />
                                    <label htmlFor={`user-${user.id}`} style={{ cursor: 'pointer', flex: 1, color: 'var(--text)' }}>
                                        <div style={{ fontWeight: 'bold', color: 'var(--text)' }}>{user.nombre} {user.apellido}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'rgba(var(--text-rgb), 0.7)' }}>{user.documento} - {user.role?.nombre_rol || 'Sin rol'}</div>
                                    </label>
                                </div>
                            )
                        })}
                        {filteredUsers.length === 0 && <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text)' }}>No se encontraron usuarios</div>}
                    </div>
                </div>
            </div>

            {/* Bottom Section: Additional Elements */}
            <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                backgroundColor: 'rgba(var(--accent-rgb), 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(var(--accent-rgb), 0.3)'
            }}>
                <h3 style={{ color: 'var(--accent)', marginBottom: '1.5rem', fontWeight: 'bold' }}>Elementos Adicionales</h3>
                <div className="field">
                    <MultiSelect
                        value={selectedSubElements}
                        options={subElements || []}
                        onChange={(e) => setSelectedSubElements(e.value)}
                        optionLabel="nombre_elemento"
                        optionValue="id"
                        placeholder="Seleccione elementos adicionales"
                        display="chip"
                        className="w-full"
                        filter
                    />
                </div>
            </div>

            <div className="flex justify-content-end gap-2 mt-5" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
                <Button label="Guardar Equipo" icon="pi pi-check" onClick={handleSubmit} loading={loading} autoFocus />
            </div>
        </Dialog>
    );
};

export default RegisterEquipmentModal;
