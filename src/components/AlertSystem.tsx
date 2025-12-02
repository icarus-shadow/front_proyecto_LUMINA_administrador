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
// LIBRERÍA DE ALERTAS CON ANIME.JS
// =============================
import React, {
    createContext,
    useContext,
    useState,
    type ReactNode,
    useCallback,
    useRef,
    useEffect,
} from "react";
import { animate as anime } from 'animejs';

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
// PROVIDER CON ANIMACIONES
// =============================
export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [alerts, setAlerts] = useState<AlertData[]>([]);
    const overlayRef = useRef<HTMLDivElement>(null);

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

    // Animar overlay cuando aparece/desaparece
    useEffect(() => {
        if (overlayRef.current) {
            const hasModal = alerts.some((a) => a.type === "confirm" || a.options.duration === 0);

            if (hasModal) {
                anime(overlayRef.current, {
                    opacity: [0, 1],
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            }
        }
    }, [alerts]);

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}

            {/* Overlay con animación */}
            {alerts.some((a) => a.type === "confirm" || a.options.duration === 0) && (
                <div
                    ref={overlayRef}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.3)",
                        zIndex: 9998,
                        opacity: 0,
                    }}
                />
            )}

            {/* Contenedor de alertas */}
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
// COMPONENTE DE ALERTA CON ANIMACIONES
// =============================
const AlertItem = ({
    alert,
    close,
}: {
    alert: AlertData;
    close: () => void;
}) => {
    const { type, message, options, onConfirm } = alert;
    const alertRef = useRef<HTMLDivElement>(null);
    const bgColor = AlertColors[type];

    // Animación de entrada
    useEffect(() => {
        if (alertRef.current) {
            // Determinar animación según tipo
            if (type === "confirm" || options.duration === 0) {
                // Modal: Escala desde el centro con rebote
                anime(alertRef.current, {
                    scale: [0, 1],
                    opacity: [0, 1],
                    duration: 600,
                    easing: 'easeOutElastic(1, .6)',
                });
            } else if (type === "success") {
                // Success: Desliza desde arriba con rebote
                anime(alertRef.current, {
                    translateY: [-100, 0],
                    opacity: [0, 1],
                    duration: 800,
                    easing: 'easeOutBounce',
                });
            } else if (type === "error") {
                // Error: Shake horizontal
                anime(alertRef.current, {
                    translateX: [
                        { value: -10, duration: 100 },
                        { value: 10, duration: 100 },
                        { value: -10, duration: 100 },
                        { value: 10, duration: 100 },
                        { value: 0, duration: 100 }
                    ],
                    opacity: [0, 1],
                    duration: 500,
                    easing: 'easeInOutQuad',
                });
            }

            // Animación de pulsación continua para alertas importantes
            if (type === "error" || type === "confirm") {
                anime(alertRef.current, {
                    scale: [1, 1.02, 1],
                    duration: 2000,
                    loop: true,
                    easing: 'easeInOutQuad',
                });
            }
        }
    }, [type, options.duration]);

    // Función de cierre con animación
    const handleClose = (callback?: () => void) => {
        if (alertRef.current) {
            anime(alertRef.current, {
                opacity: [1, 0],
                translateY: type === "confirm" ? 0 : -50,
                scale: type === "confirm" ? [1, 0.8] : 1,
                duration: 300,
                easing: 'easeInQuad',
                complete: () => {
                    callback?.();
                    close();
                }
            });
        } else {
            callback?.();
            close();
        }
    };

    return (
        <div
            ref={alertRef}
            style={{
                padding: "15px 20px",
                borderRadius: "8px",
                color: "white",
                minWidth: "250px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: bgColor,
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                opacity: 0,
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Barra de progreso animada para alertas con duración */}
            {options.duration !== 0 && type !== "confirm" && (
                <ProgressBar duration={(options.duration ?? 3) * 1000} color={bgColor} />
            )}

            <span style={{ position: "relative", zIndex: 1 }}>{message}</span>

            {/* Confirmación (Sí / No) */}
            {type === "confirm" && (
                <div style={{ display: "flex", gap: "8px", position: "relative", zIndex: 1 }}>
                    <AnimatedButton
                        color={AlertColors.btn.confirm}
                        onClick={() => handleClose(() => onConfirm?.(true))}
                    >
                        {options.yesText ?? "Sí"}
                    </AnimatedButton>

                    <AnimatedButton
                        color={AlertColors.btn.cancel}
                        onClick={() => handleClose(() => onConfirm?.(false))}
                    >
                        {options.noText ?? "No"}
                    </AnimatedButton>
                </div>
            )}

            {/* Modal con OK */}
            {options.duration === 0 && type !== "confirm" && (
                <AnimatedButton
                    color={AlertColors.btn[type]}
                    onClick={() => handleClose(() => onConfirm?.())}
                >
                    {options.okText ?? "Aceptar"}
                </AnimatedButton>
            )}
        </div>
    );
};

// =============================
// BARRA DE PROGRESO ANIMADA
// =============================
const ProgressBar = ({ duration, color }: { duration: number; color: string }) => {
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (progressRef.current) {
            anime(progressRef.current, {
                width: ['100%', '0%'],
                duration: duration,
                easing: 'linear',
            });
        }
    }, [duration]);

    return (
        <div
            ref={progressRef}
            style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                height: "4px",
                backgroundColor: color,
                width: "100%",
            }}
        />
    );
};

// =============================
// BOTÓN ANIMADO
// =============================
const AnimatedButton = ({
    children,
    onClick,
    color,
}: {
    children: React.ReactNode;
    onClick: () => void;
    color: string;
}) => {
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleMouseEnter = () => {
        if (buttonRef.current) {
            anime(buttonRef.current, {
                scale: 1.1,
                duration: 200,
                easing: 'easeOutQuad',
            });
        }
    };

    const handleMouseLeave = () => {
        if (buttonRef.current) {
            anime(buttonRef.current, {
                scale: 1,
                duration: 200,
                easing: 'easeOutQuad',
            });
        }
    };

    const handleClick = () => {
        if (buttonRef.current) {
            anime(buttonRef.current, {
                scale: [1, 0.95, 1],
                duration: 300,
                easing: 'easeInOutQuad',
                complete: onClick,
            });
        } else {
            onClick();
        }
    };

    return (
        <button
            ref={buttonRef}
            style={{
                background: color,
                border: "none",
                padding: "6px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                color: "white",
                fontWeight: "bold",
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            {children}
        </button>
    );
};
