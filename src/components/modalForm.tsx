import React, { useState, useEffect } from "react";

// =============================
// Color Variables (Editable)
// =============================
export const COLORS = {
    backdrop: "rgba(0,0,0,0.5)",
    modalBg: "white",
    title: "#1f2937",
    text: "#374151",
    primary: "#3b82f6",
    primaryHover: "#2563eb",
    border: "#e5e7eb",
};

// =============================
// Types
// =============================
export interface FieldConfig {
    name: string;
    label: string;
    type: "text" | "number" | "email" | "textarea";
    placeholder?: string;
    required?: boolean;
}

interface ModalFormProps {
    isOpen: boolean;
    title: string;
    fields: FieldConfig[];
    initialValues?: Record<string, any>;
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
                                                 initialValues = {},
                                                 onClose,
                                                 onSubmit,
                                             }) => {
    const [formData, setFormData] = useState<Record<string, any>>({});

    useEffect(() => {
        setFormData(initialValues);
    }, [initialValues]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ background: COLORS.backdrop }}
        >
            <div
                className="rounded-2xl shadow-xl w-full max-w-lg p-6"
                style={{ background: COLORS.modalBg }}
            >
                <h2
                    className="text-2xl font-semibold mb-4"
                    style={{ color: COLORS.title }}
                >
                    {title}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {fields.map((field) => (
                        <div key={field.name} className="flex flex-col gap-1">
                            <label className="font-medium" style={{ color: COLORS.text }}>
                                {field.label}
                            </label>

                            {field.type === "textarea" ? (
                                <textarea
                                    name={field.name}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    value={formData[field.name] || ""}
                                    onChange={handleChange}
                                    className="border rounded-lg p-2"
                                    style={{ borderColor: COLORS.border }}
                                />
                            ) : (
                                <input
                                    type={field.type}
                                    name={field.name}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    value={formData[field.name] || ""}
                                    onChange={handleChange}
                                    className="border rounded-lg p-2"
                                    style={{ borderColor: COLORS.border }}
                                />
                            )}
                        </div>
                    ))}

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border"
                            style={{ borderColor: COLORS.border, color: COLORS.text }}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg text-white"
                            style={{ background: COLORS.primary }}
                            onMouseOver={(e) =>
                                (e.currentTarget.style.background = COLORS.primaryHover)
                            }
                            onMouseOut={(e) =>
                                (e.currentTarget.style.background = COLORS.primary)
                            }
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalForm;
