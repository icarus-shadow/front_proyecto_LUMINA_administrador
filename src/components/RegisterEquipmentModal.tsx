import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import './styles/RegisterEquipmentModal.css';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';

import { Checkbox } from 'primereact/checkbox';
import { FileUpload } from 'primereact/fileupload';
import { Tag } from 'primereact/tag';
import CustomAlert from './CustomAlert';
import { subElementsApi } from '../services/api/data/SubElements';

import { useAppDispatch, useAppSelector } from '../services/redux/hooks';
import { fetchUsers } from '../services/redux/slices/data/UsersSlice';
import { fetchSubElements } from '../services/redux/slices/data/subElementsSlice';
import { addElement, fetchElements, assignElements, removeElements, fetchElementAssignments } from '../services/redux/slices/data/elementsSlice';
import type { RootState } from '../services/redux/store';

interface RegisterEquipmentModalProps {
    visible: boolean;
    onHide: () => void;
    isEdit?: boolean;
    initialElement?: {
        id: number;
        sn_equipo?: string;
        marca?: string;
        color?: string;
        tipo_elemento?: string;
        descripcion?: string;
    } | null;
}

const RegisterEquipmentModal: React.FC<RegisterEquipmentModalProps> = ({ visible, onHide, isEdit = false, initialElement = null }) => {
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
    const [originalSubElements, setOriginalSubElements] = useState<number[]>([]); // Track original for comparison
    const [subElementSearch, setSubElementSearch] = useState('');
    const [newSubElementName, setNewSubElementName] = useState('');
    const [editingSubId, setEditingSubId] = useState<number | null>(null);
    const [editingSubName, setEditingSubName] = useState('');
    const [loadingAssignedElements, setLoadingAssignedElements] = useState(false);


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

            // Prefill when editing
            if (isEdit && initialElement) {
                setSnEquipo(initialElement.sn_equipo || '');
                setMarca(initialElement.marca || '');
                setColor(initialElement.color || '');
                setTipoElemento(initialElement.tipo_elemento || null);
                setDescripcion(initialElement.descripcion || '');

                // Preselect assigned users
                const assignedUsers = (initialElement as any).usuarios || [];
                const userIds = Array.isArray(assignedUsers)
                    ? assignedUsers.map((u: any) => {
                        // Support possible shapes: {user: {...}} or plain user
                        const candidate = u?.user ?? u;
                        return candidate?.id;
                    }).filter((id: number | undefined) => typeof id === 'number')
                    : [];
                setSelectedUsers(userIds as number[]);

                // Fetch assigned additional elements from API using Redux
                const equipoId = initialElement.id;
                if (equipoId) {
                    setLoadingAssignedElements(true);
                    console.log('Fetching assigned elements for equipoId:', equipoId);
                    dispatch(fetchElementAssignments(equipoId))
                        .unwrap()
                        .then((response) => {
                            console.log('Response from asignaciones API:', response);
                            console.log('Full data object:', response?.data);
                            console.log('JSON keys:', Object.keys(response?.data || {}));

                            // Try different possible paths
                            let elementosAdicionales = response?.data?.elementosAdicionales || [];
                            console.log('Path 1 (elementosAdicionales):', elementosAdicionales);

                            if (elementosAdicionales.length === 0) {
                                elementosAdicionales = response?.data?.elementos_adicionales || [];
                                console.log('Path 2 (elementos_adicionales):', elementosAdicionales);
                            }

                            if (elementosAdicionales.length === 0) {
                                elementosAdicionales = response?.data?.elementosAsignados || [];
                                console.log('Path 3 (elementosAsignados):', elementosAdicionales);
                            }

                            const ids = elementosAdicionales.map((el: any) => el.id).filter((id: any) => typeof id === 'number');
                            console.log('Extracted IDs:', ids);
                            setSelectedSubElements(ids);
                            setOriginalSubElements(ids); // Save original IDs for later comparison
                        })
                        .catch(e => console.error('Error fetching assigned elements:', e))
                        .finally(() => setLoadingAssignedElements(false));
                }
            }
        }
    }, [visible, isEdit, initialElement, dispatch, users?.length, subElements?.length]);

    // Este useEffect ya no es necesario porque consultamos la API en el primer useEffect
    // que tiene prioridad y devuelve los IDs correctos desde elementosAdicionales

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
    )?.sort((a, b) => {
        // Selected users first
        const aSelected = a && selectedUsers.includes(a.id);
        const bSelected = b && selectedUsers.includes(b.id);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return 0;
    }) || [];

    const handleSubElementToggle = async (subElementId: number) => {
        const isCurrentlySelected = selectedSubElements.includes(subElementId);
        const subElement = subElements?.find(se => se.id === subElementId);

        if (isCurrentlySelected) {
            // Uncheck: if already assigned to an equipment, call unassign endpoint
            if (subElement?.equipos_o_elementos_id) {
                try {
                    await dispatch(removeElements({
                        equipoId: subElement.equipos_o_elementos_id,
                        elementosIds: [subElementId]
                    })).unwrap();
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
    )?.sort((a, b) => {
        // Selected elements first
        const aSelected = a && selectedSubElements.includes(a.id!);
        const bSelected = b && selectedSubElements.includes(b.id!);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return 0;
    }) || [];

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
        // Validations: In edit mode, photo is optional
        if (!snEquipo || !tipoElemento || (!isEdit && !selectedFile)) {
            showAlert('error', `Por favor complete los campos obligatorios (SN, Tipo${isEdit ? '' : ', Foto'})`);
            return;
        }

        setLoading(true);

        try {
            if (isEdit && initialElement) {
                // UPDATE MODE: Use PUT to update existing equipment
                const formData = new FormData();
                formData.append('sn_equipo', snEquipo);
                if (marca) formData.append('marca', marca);
                if (color) formData.append('color', color);
                formData.append('tipo_elemento', tipoElemento);
                if (descripcion) formData.append('descripcion', descripcion);
                if (selectedFile) formData.append('path_foto_equipo_implemento', selectedFile as Blob);

                // Add _method=PUT for FormData submission
                formData.append('_method', 'PUT');

                // Append users array (backend uses sync() to replace all)
                selectedUsers.forEach(id => formData.append('id_usuario[]', id.toString()));
                // NO incluir elementos_adicionales en FormData - se manejan por endpoint separado


                console.log('Updating equipment with users:', selectedUsers);

                // POST request with _method=PUT to handle FormData with file
                const response = await fetch(`https://lumina-testing.onrender.com/api/admin/equipos-elementos/${initialElement.id}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al actualizar el equipo');
                }

                const result = await response.json();
                const equipoId = result.data?.id || initialElement.id;

                console.log('Equipment updated successfully, equipoId:', equipoId);

                // Get currently assigned elements from originalSubElements state (not from initialElement)
                if (equipoId) {
                    console.log('Original elements:', originalSubElements, 'New selected elements:', selectedSubElements);

                    // First, remove ALL currently assigned elements
                    if (originalSubElements.length > 0) {
                        console.log('Removing all original elements:', originalSubElements);
                        await dispatch(removeElements({
                            equipoId: equipoId,
                            elementosIds: originalSubElements
                        })).unwrap();
                        console.log('Removed all original elements');
                    }

                    // Then, assign ONLY the selected elements
                    if (selectedSubElements.length > 0) {
                        console.log('Assigning new elements:', selectedSubElements);
                        const assignResult = await dispatch(assignElements({
                            equipoId: equipoId,
                            elementosIds: selectedSubElements
                        })).unwrap();
                        console.log('Assign elements response:', assignResult);
                    }
                }

                dispatch(fetchSubElements());
                dispatch(fetchElements()); // Recargar la tabla de equipos
                showAlert('success', 'Equipo actualizado correctamente');
            } else {
                // CREATE MODE: Use POST with addElement thunk
                const formData = new FormData();
                formData.append('sn_equipo', snEquipo);
                if (marca) formData.append('marca', marca);
                if (color) formData.append('color', color);
                formData.append('tipo_elemento', tipoElemento);
                if (descripcion) formData.append('descripcion', descripcion);
                if (selectedFile) formData.append('path_foto_equipo_implemento', selectedFile as Blob);
                const qrHash = `${snEquipo}-${Date.now()}`;
                formData.append('qr_hash', qrHash);

                // Append arrays
                selectedUsers.forEach(id => formData.append('id_usuario[]', id.toString()));
                selectedSubElements.forEach(id => formData.append('elementos_adicionales[]', id.toString()));

                const result = await dispatch(addElement(formData)).unwrap();

                // Assign selected additional elements to the equipment
                if (result.data?.id && selectedSubElements.length > 0) {
                    const equipoId = result.data.id;
                    await dispatch(assignElements({
                        equipoId: equipoId,
                        elementosIds: selectedSubElements
                    })).unwrap();
                    dispatch(fetchSubElements());
                }

                showAlert('success', 'Equipo registrado correctamente');
            }

            resetForm();
            setTimeout(() => onHide(), 1500);
        } catch (error) {
            console.error(error);
            showAlert('error', error instanceof Error ? error.message : 'Error al procesar el equipo. Por favor intente nuevamente.');
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
        <>
            <Dialog
                header={isEdit ? "Editar Equipo" : "Registrar Nuevo Equipo"}
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
                            <label style={{ color: 'var(--text)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                                Foto del Equipo {!isEdit && '*'}
                            </label>
                            <FileUpload
                                mode="basic"
                                name="foto_equipo"
                                accept="image/jpeg,image/png,image/jpg"
                                maxFileSize={2048 * 1024}
                                onSelect={(e) => setSelectedFile(e.files[0])}
                                chooseLabel="Seleccionar archivo"
                                className="w-full"
                            />
                            {selectedFile && (
                                <small className="block mt-1" style={{ color: 'var(--text)' }}>
                                    Archivo seleccionado: {selectedFile.name}
                                </small>
                            )}
                            {isEdit && !selectedFile && (initialElement as any)?.path_foto_equipo_implemento && (
                                (() => {
                                    const filename = (initialElement as any).path_foto_equipo_implemento.split('/').pop() || (initialElement as any).path_foto_equipo_implemento;
                                    const imageUrl = `https://lumina-testing.onrender.com/api/images/${filename}`;
                                    return (
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <img src={imageUrl} alt="Foto actual" style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                            <small style={{ display: 'block', marginTop: '0.25rem', color: 'rgba(var(--text-rgb), 0.7)' }}>
                                                Imagen actual (opcional cambiarla)
                                            </small>
                                        </div>
                                    );
                                })()
                            )}
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
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ color: 'var(--secondary)', fontWeight: 'bold', margin: 0 }}>Elementos Adicionales</h3>
                    </div>
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
                                {(!subElements || subElements.length === 0 || loadingAssignedElements) && (
                                    <div style={{ textAlign: 'center', padding: '1rem', color: 'rgba(var(--text-rgb), 0.7)' }}>
                                        {loadingAssignedElements ? 'Cargando elementos asignados...' : 'Cargando elementos adicionales...'}
                                    </div>
                                )}
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
                                                    <Button
                                                        type="button"
                                                        icon="pi pi-pencil"
                                                        className="p-button-text p-button-sm"
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); startEditSubElement(subElement.id!, subElement.nombre_elemento!); }}
                                                    />
                                                    <Button
                                                        type="button"
                                                        icon="pi pi-trash"
                                                        className="p-button-text p-button-sm p-button-danger"
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteSubElement(subElement.id!); }}
                                                    />
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
                                            {subElements?.filter(s => selectedSubElements.includes(s.id!)).map(se => (
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
        </>
    );
};

export default RegisterEquipmentModal;
