import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, type SelectChangeEvent } from "@mui/material";

// =============================
// Types
// =============================
export interface FieldConfig {
    name: string;
    label: string;
    type: "text" | "number" | "email" | "textarea" | "select";
    placeholder?: string;
    required?: boolean;
    options?: { label: string; value: any }[];
}

interface ModalFormProps {
    isOpen: boolean;
    title: string;
    fields: FieldConfig[];
    initialValue?: Record<string, any>;
    onClose: () => void;
    onSubmit: (data: Record<string, any>) => void;
}

// =============================
// Reusable Modal Form Component
// =============================
const ModalForm: React.FC<ModalFormProps> = ({
                                                    isOpen,
                                                    title,
                                                    fields,
                                                    initialValue = {},
                                                    onClose,
                                                    onSubmit,
                                                }) => {
    const [formData, setFormData] = useState<Record<string, any>>(initialValue);
    const prevInitialValuesRef = useRef<Record<string, any> | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<any>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    useEffect(() => {
        if (isOpen && JSON.stringify(initialValue) !== JSON.stringify(prevInitialValuesRef.current)) {
            setFormData(initialValue);
            prevInitialValuesRef.current = initialValue;
        }
    }, [isOpen, initialValue]);

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: 0 } }}>
            <DialogTitle sx={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>{title}</DialogTitle>
            <DialogContent sx={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {fields.map((field) => (
                        field.type === "select" ? (
                            <Select
                                key={field.name}
                                label={field.label}
                                name={field.name}
                                value={formData[field.name] || ""}
                                onChange={handleChange}
                                required={field.required}
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
                                    width: '100%',
                                }}
                            >
                                {field.options?.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        ) : (
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
                                }}
                            />
                        )
                    ))}
                </form>
            </DialogContent>
            <DialogActions sx={{ backgroundColor: 'var(--background)' }}>
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg border"
                    style={{
                        background: 'var(--text)',
                        color: 'var(--background)',
                        borderColor: 'var(--text)'
                    }}
                    onMouseOver={(e) =>
                        (e.currentTarget.style.background = 'var(--accent)')
                    }
                    onMouseOut={(e) =>
                        (e.currentTarget.style.background = 'var(--text)')
                    }
                >
                    Cancelar
                </button>

                <button
                    type="button"
                    onClick={() => handleSubmit(new Event('submit') as any)}
                    className="px-4 py-2 rounded-lg text-white"
                    style={{ background: 'var(--primary)' }}
                    onMouseOver={(e) =>
                        (e.currentTarget.style.background = 'var(--primaryHover)')
                    }
                    onMouseOut={(e) =>
                        (e.currentTarget.style.background = 'var(--primary)')
                    }
                >
                    Guardar
                </button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalForm;
