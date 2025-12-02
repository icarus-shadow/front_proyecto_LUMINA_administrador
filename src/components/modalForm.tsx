import React, { useState, useEffect, useRef } from "react";
import { animate as anime, stagger } from 'animejs';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem,
    Grid, Typography, FormControl, InputLabel, FormHelperText, Alert, IconButton, InputAdornment
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

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
    const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

    const resetForm = () => {
        setFormData(initialValue);
        setErrors({});
        setTouched({});
        setIsFormValid(false);
        setShowAlert(false);
        setShowPassword({});
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
            setShowPassword({});
            prevInitialValuesRef.current = initialValue;
        }
    }, [isOpen, initialValue]);

    // Ref para el diálogo
    const dialogRef = useRef<HTMLDivElement>(null);

    // Animación de entrada
    useEffect(() => {
        if (isOpen && dialogRef.current) {
            // Esperar a que el diálogo se monte
            setTimeout(() => {
                if (dialogRef.current) {
                    const dialogPaper = dialogRef.current.querySelector('.MuiDialog-paper');

                    if (dialogPaper) {
                        // Animar el contenedor del diálogo
                        anime(dialogPaper, {
                            scale: [0.8, 1],
                            opacity: [0, 1],
                            duration: 400,
                            easing: 'easeOutCubic',
                        });

                        // Animar los campos
                        const fields = dialogPaper.querySelectorAll('.MuiFormControl-root, .MuiTextField-root');
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
                <FormControl key={key} fullWidth error={touched[field.name!] && !!errors[field.name!]} sx={{ margin: 1 }}>
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
                    {touched[field.name!] && errors[field.name!] && <FormHelperText sx={{ color: 'red' }}>{errors[field.name!]}</FormHelperText>}
                </FormControl>
            );
        }
        if (field.type === "select") {
            return (
                <FormControl key={key} fullWidth error={touched[field.name!] && !!errors[field.name!]} sx={{ margin: 1 }}>
                    <InputLabel sx={{ color: 'var(--text)' }}>{field.label}</InputLabel>
                    <Select
                        name={field.name}
                        value={formData[field.name!] || ""}
                        onChange={handleChange}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: 'var(--text)' },
                                '&:hover fieldset': { borderColor: 'var(--secondary)' },
                                '&.Mui-focused fieldset': { borderColor: 'var(--primary)' },
                                backgroundColor: 'var(--text)',
                                color: 'var(--text)',
                            },
                            '& .MuiInputBase-input': {
                                color: 'var(--text)',
                                backgroundColor: 'var(--background)',
                            },
                            borderColor: 'var(--text)',
                            width: '96%',
                        }}
                    >
                        {field.options?.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                    {touched[field.name!] && errors[field.name!] && <FormHelperText sx={{ color: 'red' }}>{errors[field.name!]}</FormHelperText>}
                </FormControl>
            );
        } else if (field.type === "multiSelect") {
            return (
                <FormControl key={key} fullWidth sx={{ margin: 1 }}>
                    <Typography sx={{ color: 'var(--text)', mb: 1 }}>{field.label}</Typography>
                    {field.options?.map((option) => (
                        <div key={option.value} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <input
                                type="checkbox"
                                id={`${field.name}-${option.value}`}
                                name={field.name}
                                value={option.value}
                                checked={(formData[field.name!] || []).includes(option.value)}
                                onChange={(e) => {
                                    const { checked, value } = e.target;
                                    setFormData((prev) => {
                                        const current = prev[field.name!] || [];
                                        if (checked) {
                                            return { ...prev, [field.name!]: [...current, value] };
                                        } else {
                                            return { ...prev, [field.name!]: current.filter((v: any) => v !== value) };
                                        }
                                    });
                                    setTouched((prev) => ({ ...prev, [field.name!]: true }));
                                }}
                                style={{ marginRight: '8px' }}
                            />
                            <label htmlFor={`${field.name}-${option.value}`} style={{ color: 'var(--text)' }}>
                                {option.label}
                            </label>
                        </div>
                    ))}
                </FormControl>
            );
        } else if (field.type === "button") {
            return (
                <FormControl key={key} fullWidth sx={{ margin: 1 }}>
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
        } else if (field.type === "password") {
            return (
                <TextField
                    key={key}
                    label={field.label}
                    name={field.name}
                    type={showPassword[field.name!] ? "text" : "password"}
                    placeholder={field.placeholder}
                    required={field.required}
                    value={formData[field.name!] || ""}
                    onChange={handleChange}
                    error={touched[field.name!] && !!errors[field.name!]}
                    helperText={touched[field.name!] ? errors[field.name!] : ''}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowPassword(prev => ({ ...prev, [field.name!]: !prev[field.name!] }))}
                                    edge="end"
                                    sx={{ color: 'var(--text)' }}
                                >
                                    {showPassword[field.name!] ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
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
        } else {
            return (
                <TextField
                    key={key}
                    label={field.label}
                    name={field.name}
                    type={field.type === "textarea" ? undefined : field.type}
                    placeholder={field.placeholder}
                    required={field.required}
                    value={formData[field.name!] || ""}
                    onChange={handleChange}
                    multiline={field.type === "textarea"}
                    rows={field.type === "textarea" ? 4 : undefined}
                    error={touched[field.name!] && !!errors[field.name!]}
                    helperText={touched[field.name!] ? errors[field.name!] : ''}
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
        <Dialog ref={dialogRef} open={isOpen} onClose={onClose} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 0 } }}>
            <DialogTitle sx={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>{title}</DialogTitle>
            {bannerMessage && <Alert severity={bannerSeverity || 'info'} sx={{ margin: 2 }}>{bannerMessage}</Alert>}
            {showAlert && <Alert severity="error" sx={{ margin: 2 }}>Por favor, complete los campos requeridos antes de enviar.</Alert>}
            <DialogContent sx={{ backgroundColor: 'var(--background)', justifyContent: "center", maxWidth: 1400, color: 'var(--text)' }}>
                <form onSubmit={handleSubmit}>
                    <Grid sx={{ minWidth: 950, justifyContent: 'space-around', p: 4 }} container spacing={4}>
                        <Grid md={5} sx={{ maxHeight: 500, overflowY: 'auto', '&::-webkit-scrollbar': { display: 'none' }, display: 'flex', flexDirection: 'column', p: 2, backgroundColor: 'rgba(var(--secondary-rgb), 0.2)', borderRadius: 5, }}>
                            <Typography variant="h6" sx={{ color: 'var(--secondary)', mb: 2, fontWeight: 'bold', alignSelf: 'flex-start' }}>{effectiveLeftTitle}</Typography>
                            {effectiveLeftFields.map(renderField)}
                        </Grid>
                        <Grid md={5} sx={{ maxHeight: 500, overflowY: 'auto', '&::-webkit-scrollbar': { display: 'none' }, display: 'flex', flexDirection: 'column', p: 2, backgroundColor: 'rgba(var(--secondary-rgb), 0.2)', borderRadius: 5, }}>
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

export default React.memo(ModalForm);
