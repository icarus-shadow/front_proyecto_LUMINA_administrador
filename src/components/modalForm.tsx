import React, { useState, useEffect, useRef } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem,
    Grid, Typography, FormControl, InputLabel, FormHelperText, Alert
} from "@mui/material";

// =============================
// Types
// =============================
export type FieldConfig = {
    name: string;
    label: string;
    type: "text" | "number" | "email" | "textarea" | "select" | "file";
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
    fields?: FieldConfig[]; // Mantener para compatibilidad, pero usar leftFields y rightFields
    leftFields?: FieldConfig[];
    rightFields?: FieldConfig[];
    leftTitle?: string;
    rightTitle?: string;
    initialValue?: Record<string, any>;
    onClose: () => void;
    onSubmit: (data: Record<string, any>) => void;
    customButton?: { label: string; action: () => void; variant?: 'primary' | 'secondary' };
    bannerMessage?: string;
    bannerSeverity?: 'success' | 'info' | 'warning' | 'error';
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
}) => {
    // Retrocompatibilidad: si no se pasan leftFields/rightFields, usar fields
    const effectiveLeftFields = leftFields || (fields ? fields.slice(0, Math.ceil(fields.length / 2)) : []);
    const effectiveRightFields = rightFields || (fields ? fields.slice(Math.ceil(fields.length / 2)) : []);
    const effectiveLeftTitle = leftTitle || 'Campos Izquierda';
    const effectiveRightTitle = rightTitle || 'Campos Derecha';

    const [formData, setFormData] = useState<Record<string, any>>(initialValue);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [isFormValid, setIsFormValid] = useState<boolean>(false);
    const prevInitialValuesRef = useRef<Record<string, any> | null>(null);
    const [showAlert, setShowAlert] = useState<boolean>(false);

    const resetForm = () => {
        setFormData(initialValue);
        setErrors({});
        setTouched({});
        setIsFormValid(false);
        setShowAlert(false);
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

    const validateField = (_name: string, value: any, field: FieldConfig): string => {
        if (field.type === 'file') {
            return validateFile(value, field);
        }
        let error = validateRequired(value, field.required || false);
        if (!error) {
            error = validateNumeric(value, field.type);
        }
        return error;
    };

    const handleChange = (e: any) => {
        const { name, value, files } = e.target;
        const actualValue = files ? files[0] : value;
        setFormData((prev) => ({ ...prev, [name]: actualValue }));
        setTouched((prev) => ({ ...prev, [name]: true }));
        const allFields = [...effectiveLeftFields, ...effectiveRightFields];
        const field = allFields.find((f) => f.name === name);
        if (field) {
            const error = validateField(name, actualValue, field);
            setErrors((prev) => {
                const newErrors = { ...prev, [name]: error };
                const hasErrors = Object.values(newErrors).some((e) => e !== '');
                setIsFormValid(!hasErrors);
                if (!hasErrors) setShowAlert(false);
                return newErrors;
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) {
            setShowAlert(true);
            // Marcar todos los campos como touched para mostrar errores
            const allFields = [...effectiveLeftFields, ...effectiveRightFields];
            const newTouched: Record<string, boolean> = {};
            allFields.forEach((f) => {
                if (f.name) {
                    newTouched[f.name] = true;
                }
            });
            setTouched(newTouched);
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
            setIsFormValid(false);
            setShowAlert(false);
            prevInitialValuesRef.current = initialValue;
        }
    }, [isOpen, initialValue]);

    const renderField = (field: FieldConfig) => {
        if (field.type === "file") {
            return (
                <FormControl fullWidth error={touched[field.name] && !!errors[field.name]} sx={{ margin: 1 }}>
                    <Typography sx={{ color: 'var(--text)', mb: 1 }}>{field.label}</Typography>
                    <input
                        type="file"
                        name={field.name}
                        accept={field.accept || "image/jpeg,image/png,image/jpg"}
                        onChange={handleChange}
                        style={{
                            color: 'var(--text)',
                            backgroundColor: 'var(--background)',
                            border: '1px solid var(--text)',
                            padding: '10px',
                            borderRadius: '4px',
                            width: '93%'
                        }}
                    />
                    {touched[field.name] && errors[field.name] && <FormHelperText sx={{ color: 'red' }}>{errors[field.name]}</FormHelperText>}
                </FormControl>
            );
        }
        if (field.type === "select") {
            return (
                <FormControl fullWidth error={touched[field.name] && !!errors[field.name]} sx={{ margin: 1 }}>
                    <InputLabel sx={{ color: 'var(--text)' }}>{field.label}</InputLabel>
                    <Select
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: 'var(--text)' },
                                '&:hover fieldset': { borderColor: 'var(--accent)' },
                                '&.Mui-focused fieldset': { borderColor: 'var(--primary)' },
                                backgroundColor: 'var(--background)',
                                color: 'var(--text)',
                            },
                            '& .MuiInputBase-input': { color: 'var(--text)' },
                        }}
                    >
                        {field.options?.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                    {touched[field.name] && errors[field.name] && <FormHelperText sx={{ color: 'red' }}>{errors[field.name]}</FormHelperText>}
                </FormControl>
            );
        } else if (field.type === "button") {
            return (
                <FormControl fullWidth sx={{ margin: 1 }}>
                    <button
                        type="button"
                        onClick={field.onClick}
                        style={{
                            color: 'var(--text)',
                            backgroundColor: 'var(--primary)',
                            border: 'none',
                            padding: '10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            width: '100%'
                        }}
                    >
                        {field.label}
                    </button>
                </FormControl>
            );
        } else {
            return (
                <TextField
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    type={field.type === "textarea" ? undefined : field.type}
                    placeholder={field.placeholder}
                    required={field.required}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    multiline={field.type === "textarea"}
                    rows={field.type === "textarea" ? 4 : undefined}
                    error={touched[field.name] && !!errors[field.name]}
                    helperText={touched[field.name] ? errors[field.name] : ''}
                    sx={{
                        '& .MuiInputLabel-root': { color: 'var(--text)' },
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'var(--text)' },
                            '&:hover fieldset': { borderColor: 'var(--accent)' },
                            '&.Mui-focused fieldset': { borderColor: 'var(--primary)' },
                            backgroundColor: 'var(--background)',
                            color: 'var(--text)',
                        },
                        '& .MuiInputBase-input': { color: 'var(--text)' },
                        margin: 1,
                    }}
                />
            );
        }

    };

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 0 } }}>
            <DialogTitle sx={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>{title}</DialogTitle>
            {bannerMessage && <Alert severity={bannerSeverity || 'info'} sx={{ margin: 2 }}>{bannerMessage}</Alert>}
            {showAlert && <Alert severity="error" sx={{ margin: 2 }}>Por favor, complete los campos requeridos antes de enviar.</Alert>}
            <DialogContent sx={{ backgroundColor: 'var(--background)', justifyContent: "center", maxWidth: 1400, color: 'var(--text)' }}>
                <form onSubmit={handleSubmit}>
                    <Grid sx={{ minWidth: 950, justifyContent: 'space-around', p: 4 }} container spacing={4}>
                        <Grid md={5} sx={{ maxHeight: 500, overflowY: 'auto', '&::-webkit-scrollbar': { display: 'none' }, display: 'flex', flexDirection: 'column', p: 2,  backgroundColor: 'rgba(var(--secondary-rgb), 0.2)', borderRadius: 5,}}>
                            <Typography variant="h6" sx={{ color: 'var(--secondary)', mb: 2, fontWeight: 'bold', alignSelf: 'flex-start' }}>{effectiveLeftTitle}</Typography>
                            {effectiveLeftFields.map(renderField)}
                        </Grid>
                        <Grid md={5} sx={{ maxHeight: 500, overflowY: 'auto', '&::-webkit-scrollbar': { display: 'none' }, display: 'flex', flexDirection: 'column', p: 2,  backgroundColor: 'rgba(var(--secondary-rgb), 0.2)', borderRadius: 5,}}>
                            <Typography variant="h6" sx={{ color: 'var(--secondary)', mb: 2, fontWeight: 'bold', alignSelf: 'flex-start' }}>{effectiveRightTitle}</Typography>
                            {effectiveRightFields.map(renderField)}
                        </Grid>
                    </Grid>
                </form>
            </DialogContent>
            <DialogActions sx={{ backgroundColor: 'var(--background)' }}>
                {customButton && (
                    <button
                        type="button"
                        onClick={customButton.action}
                        className={`btn-${customButton.variant || 'primary'}`}
                    >
                        {customButton.label}
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => { resetForm(); onClose(); }}
                    className="btn-cancel"
                >
                    Cancelar
                </button>

                <button
                    type="button"
                    onClick={() => handleSubmit(new Event('submit') as any)}
                    className="btn-save"
                >
                    Guardar
                </button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalForm;
