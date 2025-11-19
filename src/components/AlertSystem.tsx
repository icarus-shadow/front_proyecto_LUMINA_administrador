// =============================
//  CONFIGURACIÓN DE COLORES
// =============================
export const AlertColors = {
    success: "#4caf50",
    error: "#f44336",
    confirm: "#2196f3",

    btn: {
        success: "#388e3c",
        error: "#d32f2f",
        confirm: "#1976d2",
        cancel: "#9e9e9e",
    }
};

// =============================
// LIBRERÍA DE ALERTAS
// =============================
import React, {
    createContext,
    useContext,
    useState,
    type ReactNode,
    useCallback,
} from "react";

type AlertType = "success" | "error" | "confirm";

interface AlertOptions {
    yesText?: string;
    noText?: string;
    okText?: string;
    duration?: number; // 0 = modal
}

interface AlertData {
    id: number;
    type: AlertType;
    message: string;
    options: AlertOptions;
    onConfirm?: (value?: boolean) => void;
}

interface AlertContextType {
    showAlert: (
        type: AlertType,
        message: string,
        options?: AlertOptions,
        onConfirm?: (value?: boolean) => void
    ) => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export const useAlert = () => {
    const ctx = useContext(AlertContext);
    if (!ctx) throw new Error("useAlert must be used within AlertProvider");
    return ctx;
};

// =============================
// PROVIDER
// =============================
export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [alerts, setAlerts] = useState<AlertData[]>([]);

    const showAlert = useCallback(
        (
            type: AlertType,
            message: string,
            options: AlertOptions = {},
            onConfirm?: (value?: boolean) => void
        ) => {
            const id = Date.now();

            const alert: AlertData = {
                id,
                type,
                message,
                options,
                onConfirm,
            };

            setAlerts((prev) => [...prev, alert]);

            // Auto-cerrar si no es modal
            if (options.duration !== 0 && type !== "confirm") {
                const duration = (options.duration ?? 3) * 1000;
                setTimeout(() => {
                    setAlerts((prev) => prev.filter((a) => a.id !== id));
                }, duration);
            }
        },
        []
    );

    const closeAlert = (id: number) => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
    };

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}

            {/* Overlay si hay confirmación activa */}
            {alerts.some((a) => a.type === "confirm" || a.options.duration === 0) && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.3)",
                        zIndex: 9998,
                    }}
                />
            )}

            {/* Contenedor */}
            <div
                style={{
                    position: "fixed",
                    zIndex: 9999,
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    top: alerts.some((a) => a.type === "confirm") ? "40%" : "20px",
                    right: alerts.some((a) => a.type === "confirm") ? "50%" : "20px",
                    transform: alerts.some((a) => a.type === "confirm")
                        ? "translateX(50%)"
                        : "none",
                }}
            >
                {alerts.map((alert) => (
                    <AlertItem
                        key={alert.id}
                        alert={alert}
                        close={() => closeAlert(alert.id)}
                    />
                ))}
            </div>
        </AlertContext.Provider>
    );
};

// =============================
// COMPONENTE DE ALERTA
// =============================
const AlertItem = ({
                       alert,
                       close,
                   }: {
    alert: AlertData;
    close: () => void;
}) => {
    const { type, message, options, onConfirm } = alert;

    const bgColor = AlertColors[type];

    return (
        <div
            style={{
                padding: "15px 20px",
                borderRadius: "8px",
                color: "white",
                minWidth: "250px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: bgColor,
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                animation: "fadeIn 0.3s",
            }}
        >
            <span>{message}</span>

            {/* Confirmación (Sí / No) */}
            {type === "confirm" && (
                <div style={{ display: "flex", gap: "8px" }}>
                    <button
                        style={btnStyle(AlertColors.btn.confirm)}
                        onClick={() => {
                            onConfirm?.(true);
                            close();
                        }}
                    >
                        {options.yesText ?? "Sí"}
                    </button>

                    <button
                        style={btnStyle(AlertColors.btn.cancel)}
                        onClick={() => {
                            onConfirm?.(false);
                            close();
                        }}
                    >
                        {options.noText ?? "No"}
                    </button>
                </div>
            )}

            {/* Modal con OK */}
            {options.duration === 0 && type !== "confirm" && (
                <button
                    style={btnStyle(AlertColors.btn[type])}
                    onClick={() => {
                        onConfirm?.();
                        close();
                    }}
                >
                    {options.okText ?? "Aceptar"}
                </button>
            )}
        </div>
    );
};

// =============================
// Estilo para botones
// =============================
const btnStyle = (background: string): React.CSSProperties => ({
    background,
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    color: "white",
    fontWeight: "bold",
});
