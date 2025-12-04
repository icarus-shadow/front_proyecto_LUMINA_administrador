import React, { useState, useEffect, useRef } from "react";
import { animate as anime, stagger } from 'animejs';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { FileUpload } from 'primereact/fileupload';
import { useAlert } from './AlertSystem';
import { Checkbox } from 'primereact/checkbox';
import './styles/ModalForm.css';

// =============================
// Types
// =============================
export type FieldConfig = {
    name: string;
    label: string;
    type: "text" | "number" | "email" | "textarea" | "select" | "file" | "password" | "multiSelect";
    placeholder?: string;
    required?: boolean;
    options?: { label: string; value: any }[];
    accept?: string;
    maxSize?: number; // en KB
} | {
    name?: string;
    label: string;
    type: "button";
    onClick?: () => void;
    required?: boolean;
    maxSize?: number;
};

interface ModalFormProps {
    isOpen: boolean;
    title: string;
    fields?: FieldConfig[];
    leftFields?: FieldConfig[];
    rightFields?: FieldConfig[];
    leftTitle?: string;
    rightTitle?: string;
    initialValue?: Record<string, any>;
    onClose: () => void;
    onSubmit: (data: Record<string, any>) => void;
    customButton?: { label: string; action: () => void; variant?: 'primary' | 'secondary' };
    bannerMessage?: string;
    bannerSeverity?: 'success' | 'info' | 'warn' | 'error';
    onFieldChange?: (name: string, value: any) => void;
    rightAdditionalContent?: (formData: Record<string, any>) => React.ReactNode;
}

// =============================
// Reusable Modal Form Component
// =============================

const ModalForm: React.FC<ModalFormProps> = ({
    isOpen,
    title,
    fields,
    leftFields,
    rightFields,
    leftTitle,
    rightTitle,
    initialValue = {},
    onClose,
    onSubmit,
    customButton,
    bannerMessage,
    bannerSeverity,
    onFieldChange,
    rightAdditionalContent,
}) => {
    // Retrocompatibilidad: si no se pasan leftFields/rightFields, usar fields
    const effectiveLeftFields = leftFields || (fields ? fields.slice(0, Math.ceil(fields.length / 2)) : []);
    const effectiveRightFields = rightFields || (fields ? fields.slice(Math.ceil(fields.length / 2)) : []);
    const effectiveLeftTitle = leftTitle || 'Campos Izquierda';
    const effectiveRightTitle = rightTitle || 'Campos Derecha';

    const [formData, setFormData] = useState<Record<string, any>>(initialValue);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const prevInitialValuesRef = useRef<Record<string, any> | null>(null);
    const { showAlert } = useAlert();

    const resetForm = () => {
        setFormData(initialValue);
        setErrors({});
        setTouched({});
    };

    // Funciones de validación
    const validateRequired = (value: any, required: boolean): string => {
        if (required && (!value || value.toString().trim() === '')) {
            return 'Este campo es requerido';
        }
        return '';
    };

    const validateNumeric = (value: any, type: string): string => {
        if (type === 'number' && value && isNaN(Number(value))) {
            return 'Debe ser un número válido';
        }
        return '';
    };

    const validateFile = (file: File | null, field: FieldConfig): string => {
        if (!file) {
            if (field.required) return 'Este campo es requerido';
            return '';
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            return 'Solo se permiten imágenes JPEG, PNG o JPG';
        }
        const maxSize = field.maxSize || 2048; // KB
        if (file.size > maxSize * 1024) {
            return `El archivo no debe superar ${maxSize} KB`;
        }
        return '';
    };

    const validatePassword = (value: any): string => {
        if (value && value.length < 8) {
            return 'La contraseña debe tener al menos 8 caracteres';
        }
        return '';
    };

    const validateField = (_name: string, value: any, field: FieldConfig): string => {
        if (field.type === 'file') {
            return validateFile(value, field);
        }
        if (field.type === 'password') {
            let error = validateRequired(value, field.required || false);
            if (!error) {
                error = validatePassword(value);
            }
            return error;
        }
        let error = validateRequired(value, field.required || false);
        if (!error) {
            error = validateNumeric(value, field.type);
        }
        return error;
    };

    const handleChange = (name: string, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setTouched((prev) => ({ ...prev, [name]: true }));
        if (onFieldChange) {
            onFieldChange(name, value);
        }
        const allFields = [...effectiveLeftFields, ...effectiveRightFields];
        const field = allFields.find((f) => f.name === name);
        if (field) {
            const error = validateField(name, value, field);
            setErrors((prev) => {
                const newErrors = { ...prev, [name]: error };
                validateAllFields(newErrors);
                return newErrors;
            });
        }
    };

    const validateAllFields = (currentErrors?: Record<string, string>) => {
        const allFields = [...effectiveLeftFields, ...effectiveRightFields];
        const errorsToCheck = currentErrors || errors;

        // Verificar si hay errores en los campos ya validados
        const hasErrors = Object.values(errorsToCheck).some((e) => e !== '');

        // Verificar si todos los campos requeridos tienen valor
        const allRequiredFieldsFilled = allFields.every((field) => {
            if (field.type === 'button') return true;
            if (!field.required) return true;
            const value = formData[field.name!];
            return value !== undefined && value !== null && value !== '';
        });

        return !hasErrors && allRequiredFieldsFilled;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validar todos los campos antes de enviar
        const allFields = [...effectiveLeftFields, ...effectiveRightFields];
        const newErrors: Record<string, string> = {};
        const newTouched: Record<string, boolean> = {};

        allFields.forEach((field) => {
            if (field.type !== 'button' && field.name) {
                const value = formData[field.name];
                const error = validateField(field.name, value, field);
                newErrors[field.name] = error;
                newTouched[field.name] = true;
            }
        });

        setErrors(newErrors);
        setTouched(newTouched);

        // Verificar si hay errores
        const hasErrors = Object.values(newErrors).some((e) => e !== '');

        if (hasErrors) {
            showAlert('error', 'Por favor, complete los campos requeridos antes de enviar.');
            return;
        }

        onSubmit(formData);
        resetForm();
    };

    useEffect(() => {
        if (isOpen && JSON.stringify(initialValue) !== JSON.stringify(prevInitialValuesRef.current)) {
            setFormData(initialValue);
            setErrors({});
            setTouched({});
            prevInitialValuesRef.current = initialValue;
        }
    }, [isOpen, initialValue]);

    // Mostrar alerta del banner cuando cambia
    useEffect(() => {
        if (isOpen && bannerMessage) {
            const severity = bannerSeverity === 'warn' ? 'error' : (bannerSeverity as 'success' | 'error') || 'error';
            showAlert(severity, bannerMessage);
        }
    }, [isOpen, bannerMessage, bannerSeverity, showAlert]);

    // Ref para el diálogo
    const dialogRef = useRef<HTMLDivElement>(null);

    // Animación de entrada
    useEffect(() => {
        if (isOpen && dialogRef.current) {
            // Esperar a que el diálogo se monte
            setTimeout(() => {
                if (dialogRef.current) {
                    const dialogPaper = dialogRef.current.querySelector('.p-dialog');

                    if (dialogPaper) {
                        // Animar el contenedor del diálogo
                        anime(dialogPaper, {
                            scale: [0.8, 1],
                            opacity: [0, 1],
                            duration: 400,
                            easing: 'easeOutCubic',
                        });

                        // Animar los campos
                        const fields = dialogPaper.querySelectorAll('.field');
                        if (fields.length > 0) {
                            anime(fields, {
                                translateY: [20, 0],
                                opacity: [0, 1],
                                duration: 400,
                                delay: stagger(50, { start: 200 }),
                                easing: 'easeOutQuad',
                            });
                        }
                    }
                }
            }, 50);
        }
    }, [isOpen]);

    const renderField = (field: FieldConfig, index: number) => {
        const key = field.name || `field-${index}`;

        if (field.type === "file") {
            return (
                <div key={key} className="field mb-3">
                    <label style={{ color: 'var(--text)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                        {field.label} {field.required && '*'}
                    </label>
                    <FileUpload
                        mode="basic"
                        name={field.name}
                        accept={field.accept || "image/jpeg,image/png,image/jpg"}
                        maxFileSize={(field.maxSize || 2048) * 1024}
                        onSelect={(e) => handleChange(field.name!, e.files[0])}
                        chooseLabel="Seleccionar archivo"
                        className="w-full"
                    />
                    {formData[field.name!] && <small className="block mt-1">Archivo seleccionado: {formData[field.name!].name}</small>}
                    {touched[field.name!] && errors[field.name!] && (
                        <small className="field-error">{errors[field.name!]}</small>
                    )}
                </div>
            );
        }

        if (field.type === "select") {
            return (
                <div key={key} className="field mb-3">
                    <label htmlFor={field.name} style={{ color: 'var(--text)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                        {field.label} {field.required && '*'}
                    </label>
                    <Dropdown
                        id={field.name}
                        value={formData[field.name!] || ""}
                        options={field.options || []}
                        onChange={(e) => handleChange(field.name!, e.value)}
                        placeholder={field.placeholder || `Seleccione ${field.label}`}
                        className="w-full"
                    />
                    {touched[field.name!] && errors[field.name!] && (
                        <small className="field-error">{errors[field.name!]}</small>
                    )}
                </div>
            );
        }

        if (field.type === "multiSelect") {
            return (
                <div key={key} className="field mb-3">
                    <label style={{ color: 'var(--text)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                        {field.label}
                    </label>
                    {field.options?.map((option) => (
                        <div key={option.value} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <Checkbox
                                inputId={`${field.name}-${option.value}`}
                                value={option.value}
                                onChange={(e) => {
                                    const checked = e.checked;
                                    const value = option.value;
                                    const current = formData[field.name!] || [];
                                    if (checked) {
                                        handleChange(field.name!, [...current, value]);
                                    } else {
                                        handleChange(field.name!, current.filter((v: any) => v !== value));
                                    }
                                }}
                                checked={(formData[field.name!] || []).includes(option.value)}
                            />
                            <label htmlFor={`${field.name}-${option.value}`} style={{ marginLeft: '8px', color: 'var(--text)', cursor: 'pointer' }}>
                                {option.label}
                            </label>
                        </div>
                    ))}
                </div>
            );
        }

        if (field.type === "button") {
            return (
                <div key={key} className="field mb-3">
                    <Button
                        label={field.label}
                        onClick={field.onClick}
                        className="w-full"
                        type="button"
                    />
                </div>
            );
        }

        if (field.type === "password") {
            return (
                <div key={key} className="field mb-3">
                    <label htmlFor={field.name} style={{ color: 'var(--text)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                        {field.label} {field.required && '*'}
                    </label>
                    <Password
                        id={field.name}
                        value={formData[field.name!] || ""}
                        onChange={(e) => handleChange(field.name!, e.target.value)}
                        placeholder={field.placeholder}
                        toggleMask
                        className="w-full"
                    />
                    {touched[field.name!] && errors[field.name!] && (
                        <small className="field-error">{errors[field.name!]}</small>
                    )}
                </div>
            );
        }

        if (field.type === "textarea") {
            return (
                <div key={key} className="field mb-3">
                    <label htmlFor={field.name} style={{ color: 'var(--text)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                        {field.label} {field.required && '*'}
                    </label>
                    <InputTextarea
                        id={field.name}
                        value={formData[field.name!] || ""}
                        onChange={(e) => handleChange(field.name!, e.target.value)}
                        placeholder={field.placeholder}
                        rows={4}
                        className="w-full"
                    />
                    {touched[field.name!] && errors[field.name!] && (
                        <small className="field-error">{errors[field.name!]}</small>
                    )}
                </div>
            );
        }

        // Default: text, number, email
        return (
            <div key={key} className="field mb-3">
                <label htmlFor={field.name} style={{ color: 'var(--text)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                    {field.label} {field.required && '*'}
                </label>
                <InputText
                    id={field.name}
                    value={formData[field.name!] || ""}
                    onChange={(e) => handleChange(field.name!, e.target.value)}
                    placeholder={field.placeholder}
                    type={field.type}
                    className="w-full"
                />
                {touched[field.name!] && errors[field.name!] && (
                    <small className="field-error">{errors[field.name!]}</small>
                )}
            </div>
        );
    };

    const footer = (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            {customButton && (
                <Button
                    label={customButton.label}
                    onClick={customButton.action}
                    className={customButton.variant === 'secondary' ? 'p-button-secondary' : ''}
                    type="button"
                />
            )}
            <Button
                label="Cancelar"
                icon="pi pi-times"
                onClick={() => { resetForm(); onClose(); }}
                className="p-button-text"
            />
            <Button
                label="Guardar"
                icon="pi pi-check"
                onClick={(e) => handleSubmit(e as any)}
                autoFocus
            />
        </div>
    );

    return (
        <div ref={dialogRef}>
            <Dialog
                header={title}
                visible={isOpen}
                style={{ width: '90vw', maxWidth: '1400px' }}
                onHide={onClose}
                modal
                className="p-fluid modal-form"
                footer={footer}
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

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        {/* Left Column */}
                        <div className="modal-form-column" style={{
                            flex: 1,
                            padding: '1rem',
                            backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
                            borderRadius: '8px',
                            border: '1px solid rgba(var(--primary-rgb), 0.3)',
                            maxHeight: '500px',
                            overflowY: 'auto',
                            marginTop: "1%"
                        }}>
                            <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontWeight: 'bold' }}>
                                {effectiveLeftTitle}
                            </h3>
                            {effectiveLeftFields.map(renderField)}
                        </div>

                        {/* Right Column */}
                        <div className="modal-form-column modal-form-column-right" style={{
                            flex: 1,
                            padding: '1rem',
                            backgroundColor: 'rgba(var(--secondary-rgb), 0.1)',
                            borderRadius: '8px',
                            border: '1px solid rgba(var(--secondary-rgb), 0.3)',
                            maxHeight: '500px',
                            overflowY: 'auto',
                            marginTop: "1%"

                        }}>
                            <h3 style={{ color: 'var(--secondary)', marginBottom: '1.5rem', fontWeight: 'bold' }}>
                                {effectiveRightTitle}
                            </h3>
                            {effectiveRightFields.map(renderField)}
                            {rightAdditionalContent ? rightAdditionalContent(formData) : null}
                        </div>
                    </div>
                </form>
            </Dialog>
        </div>
    );
};

export default React.memo(ModalForm);
