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
import { Tag } from 'primereact/tag';
import CustomAlert from './CustomAlert';
import { subElementsApi } from '../services/api/data/SubElements';

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
    const [newSubElements, setNewSubElements] = useState<string[]>([]); // deprecated pending list; will create immediately
    const [subElementSearch, setSubElementSearch] = useState('');
    const [newSubElementName, setNewSubElementName] = useState('');
    const [editingSubId, setEditingSubId] = useState<number | null>(null);
    const [editingSubName, setEditingSubName] = useState('');
    

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

    const handleSubElementToggle = async (subElementId: number) => {
        const isCurrentlySelected = selectedSubElements.includes(subElementId);
        const subElement = subElements?.find(se => se.id === subElementId);
        
        if (isCurrentlySelected) {
            // Uncheck: if already assigned to an equipment, call unassign endpoint
            if (subElement?.equipos_o_elementos_id) {
                try {
                    await fetch(`https://lumina-testing.onrender.com/api/admin/equipos-elementos/quitar-elementos`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({
                            equipos_o_elementos_id: subElement.equipos_o_elementos_id,
                            elementos_adicionales_ids: [subElementId]
                        })
                    });
                    showAlert('success', 'Elemento desasignado');
                    dispatch(fetchSubElements());
                } catch (e) {
                    console.error(e);
                    showAlert('error', 'No se pudo desasignar el elemento');
                    return; // Don't update state if API call failed
                }
            }
            setSelectedSubElements(selectedSubElements.filter(id => id !== subElementId));
        } else {
            // Check: just add to selection (assignment happens on submit)
            setSelectedSubElements([...selectedSubElements, subElementId]);
        }
    };

    const filteredSubElements = subElements?.filter(subElement =>
        subElement &&
        subElement.nombre_elemento &&
        subElement.nombre_elemento.toLowerCase().includes(subElementSearch.toLowerCase())
    ) || [];

    const handleAddNewSubElement = async () => {
        const nombre = newSubElementName.trim();
        if (!nombre) return;
        try {
            const created = await subElementsApi.addSubElement({ nombre_elemento: nombre });
            const createdId = created?.data?.id as number | undefined;
            // Refresh catalog
            await dispatch(fetchSubElements());
            // Auto-select created element for current equipment
            if (createdId) {
                setSelectedSubElements(prev => [...prev, createdId]);
            }
            setNewSubElementName('');
            showAlert('success', 'Elemento adicional creado');
        } catch (e) {
            console.error(e);
            showAlert('error', 'No se pudo crear el elemento');
        }
    };

    const handleRemoveNewSubElement = (name: string) => {
        setNewSubElements(newSubElements.filter(n => n !== name));
    };

    const startEditSubElement = (id: number, currentName: string) => {
        setEditingSubId(id);
        setEditingSubName(currentName);
    };

    const cancelEditSubElement = () => {
        setEditingSubId(null);
        setEditingSubName('');
    };

    const saveEditSubElement = async () => {
        if (!editingSubId || !editingSubName.trim()) return;
        try {
            await subElementsApi.updateSubElement(editingSubId, { nombre_elemento: editingSubName.trim() });
            showAlert('success', 'Elemento actualizado');
            cancelEditSubElement();
            dispatch(fetchSubElements());
        } catch (e) {
            console.error(e);
            showAlert('error', 'No se pudo actualizar el elemento');
        }
    };

    const deleteSubElement = async (id: number) => {
        try {
            await subElementsApi.deleteSubElement(id);
            showAlert('success', 'Elemento eliminado');
            dispatch(fetchSubElements());
            setSelectedSubElements(selectedSubElements.filter(sid => sid !== id));
        } catch (e) {
            console.error(e);
            showAlert('error', 'No se pudo eliminar el elemento');
        }
    };

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
        formData.append('path_foto_equipo_implemento', selectedFile as Blob);
        const qrHash = `${snEquipo}-${Date.now()}`;
        formData.append('qr_hash', qrHash);

        // Append arrays
        selectedUsers.forEach(id => formData.append('id_usuario[]', id.toString()));
        selectedSubElements.forEach(id => formData.append('elementos_adicionales[]', id.toString()));

        try {
            const result = await dispatch(addElement(formData)).unwrap();
            
            // Assign selected additional elements to the equipment
            if (result.data?.id && selectedSubElements.length > 0) {
                const equipoId = result.data.id;
                await fetch(`https://lumina-testing.onrender.com/api/admin/equipos-elementos/asignar-elementos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        equipos_o_elementos_id: equipoId,
                        elementos_adicionales_ids: selectedSubElements
                    })
                });
                dispatch(fetchSubElements());
            }
            
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
        setNewSubElements([]);
        setUserSearch('');
        setSubElementSearch('');
        setNewSubElementName('');
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
                    border: '1px solid rgba(var(--primary-rgb), 0.3)',
                    marginTop: "2%"
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
                        <label htmlFor="foto_equipo" style={{ color: 'var(--text)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Foto del Equipo *</label>
                        <input
                            id="foto_equipo"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files && e.target.files[0];
                                setSelectedFile(file || null);
                            }}
                            className="w-full"
                        />
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
                    border: '1px solid rgba(var(--secondary-rgb), 0.3)',
                    marginTop: "2%"

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

            <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                backgroundColor: 'rgba(var(--background-rgb), 0.7)',
                borderRadius: '8px',
                border: '1px solid rgba(var(--secondary-rgb), 0.3)'
            }}>
                <h3 style={{ color: 'var(--secondary)', marginBottom: '1.5rem', fontWeight: 'bold' }}>Elementos Adicionales</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Left Column: Available Elements */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h4 style={{ margin: 0, color: 'var(--text)', fontWeight: 600 }}>Disponibles</h4>
                        <span className="p-input-icon-left w-full">
                            <i className="pi pi-search" />
                            <InputText
                                value={subElementSearch}
                                onChange={(e) => setSubElementSearch(e.target.value)}
                                placeholder="Buscar para agregar..."
                                className="w-full"
                            />
                        </span>
                        <div style={{
                            overflowY: 'auto',
                            border: '1px solid rgba(var(--text-rgb), 0.2)',
                            borderRadius: '6px',
                            padding: '0.5rem',
                            height: '250px',
                            backgroundColor: 'var(--background)'
                        }}>
                            {filteredSubElements.length > 0 ? filteredSubElements.map(subElement => {
                                if (!subElement) return null;
                                return (
                                    <div
                                        key={subElement.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            borderBottom: '1px solid rgba(var(--text-rgb), 0.1)',
                                            padding: '0.75rem 0.5rem'
                                        }}
                                    >
                                        <Checkbox
                                            inputId={`subelement-${subElement.id}`}
                                            value={subElement.id}
                                            onChange={() => handleSubElementToggle(subElement.id!)}
                                            checked={selectedSubElements.includes(subElement.id!)}
                                        />
                                        <div style={{ flex: 1 }}>
                                            {editingSubId === subElement.id ? (
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <InputText
                                                        value={editingSubName}
                                                        onChange={(e) => setEditingSubName(e.target.value)}
                                                        className="w-full"
                                                    />
                                                    <Button icon="pi pi-check" onClick={saveEditSubElement} className="p-button-success p-button-sm" />
                                                    <Button icon="pi pi-times" onClick={cancelEditSubElement} className="p-button-text p-button-sm" />
                                                </div>
                                            ) : (
                                                <label
                                                    htmlFor={`subelement-${subElement.id}`}
                                                    style={{
                                                        cursor: 'pointer',
                                                        color: 'var(--text)',
                                                        fontWeight: selectedSubElements.includes(subElement.id!) ? 'bold' : 'normal',
                                                    }}
                                                >
                                                    {subElement.nombre_elemento}
                                                </label>
                                            )}
                                        </div>
                                        {editingSubId !== subElement.id && (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <Button icon="pi pi-pencil" className="p-button-text p-button-sm" onClick={() => startEditSubElement(subElement.id!, subElement.nombre_elemento!)} />
                                                <Button icon="pi pi-trash" className="p-button-text p-button-sm p-button-danger" onClick={() => deleteSubElement(subElement.id!)} />
                                            </div>
                                        )}
                                    </div>
                                );
                            }) : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(var(--text-rgb), 0.7)' }}>
                                    No se encontraron elementos existentes.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Selected and New Elements */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Create New Element */}
                        <div>
                            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text)', fontWeight: 600 }}>Crear Nuevo</h4>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <InputText
                                    value={newSubElementName}
                                    onChange={(e) => setNewSubElementName(e.target.value)}
                                    placeholder="Nombre del nuevo elemento"
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddNewSubElement(); }}
                                    style={{ flex: 1 }}
                                />
                                <Button
                                    icon="pi pi-plus"
                                    onClick={handleAddNewSubElement}
                                    disabled={!newSubElementName.trim()}
                                    tooltip="Añadir a la lista"
                                    tooltipOptions={{ position: 'top' }}
                                />
                            </div>
                        </div>

                        {/* Lists of selected and new */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* New Elements to Create */}
                            {/* Pending list removed: elements are created immediately */}

                            {/* Selected Existing Elements */}
                            {selectedSubElements.length > 0 && (
                                <div>
                                    <h5 style={{
                                        margin: '0 0 0.75rem 0',
                                        color: 'var(--primary)',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <i className="pi pi-check-square" /> Seleccionados ({selectedSubElements.length})
                                    </h5>
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '0.5rem',
                                        padding: '0.75rem',
                                        borderRadius: '6px',
                                        backgroundColor: 'rgba(var(--primary-rgb), 0.1)'
                                    }}>
                                        {subElements.filter(s => selectedSubElements.includes(s.id!)).map(se => (
                                             <Tag
                                                 key={`selected-${se.id}`}
                                                 style={{ backgroundColor: 'var(--primary)', color: 'white', cursor: 'pointer' }}
                                                 icon="pi pi-times-circle"
                                                 onClick={() => handleSubElementToggle(se.id!)}
                                             >
                                                 {se.nombre_elemento}
                                             </Tag>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>            <div className="flex justify-content-end gap-2 mt-5" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <Button label="Cancelar" icon="pi pi-times" onClick={onHide} className="p-button-text" />
                <Button label="Guardar Equipo" icon="pi pi-check" onClick={handleSubmit} loading={loading} autoFocus />
            </div>
        </Dialog>
    );
};

export default RegisterEquipmentModal;
