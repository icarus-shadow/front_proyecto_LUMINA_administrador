// =============================
//  CONFIGURACIÓN DE COLORES
// =============================
export const AlertColors = {
    success: {
        border: "#44ff44",
        background: "linear-gradient(135deg, #001a00 0%, #002d00 100%)",
        icon: "#44ff44",
        iconBg: "#44ff44",
        iconColor: "#003300",
        text: "#ccffcc",
        glow: "rgba(68, 255, 68, 0.5)"
    },
    error: {
        border: "#ff4444",
        background: "linear-gradient(135deg, #1a0000 0%, #2d0000 100%)",
        icon: "#ff4444",
        iconBg: "#ff4444",
        iconColor: "#ffffff",
        text: "#ffcccc",
        glow: "rgba(255, 68, 68, 0.5)"
    },
    confirm: {
        border: "#00ccff",
        background: "linear-gradient(135deg, #00141a 0%, #00242d 100%)",
        icon: "#00ccff",
        iconBg: "#00ccff",
        iconColor: "#001a24",
        text: "#ccf4ff",
        glow: "rgba(0, 204, 255, 0.5)"
    },
    warning: {
        border: "#ffcc00",
        background: "linear-gradient(135deg, #1a1400 0%, #2d2400 100%)",
        icon: "#ffcc00",
        iconBg: "#ffcc00",
        iconColor: "#1a1400",
        text: "#fff4cc",
        glow: "rgba(255, 204, 0, 0.5)"
    },
    info: {
        border: "#00ccff",
        background: "linear-gradient(135deg, #00141a 0%, #00242d 100%)",
        icon: "#00ccff",
        iconBg: "#00ccff",
        iconColor: "#001a24",
        text: "#ccf4ff",
        glow: "rgba(0, 204, 255, 0.5)"
    },

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

    // Mapear tipo a colores (confirm se muestra como info)
    const colorType = type === 'confirm' ? 'info' : type;
    const colorKey = colorType as 'success' | 'error' | 'info';
    const colors = AlertColors[colorKey];

    // Iconos según el tipo
    const icons = {
        error: '✕',
        success: '✓',
        warning: '⚠',
        info: 'ℹ',
        confirm: 'ℹ'
    };

    // Animación de entrada
    useEffect(() => {
        if (alertRef.current) {
            // Determinar animación según tipo
            if (type === "confirm" || options.duration === 0) {
                // Modal: Escala desde el centro con rebote
                anime(alertRef.current, {
                    scale: [0.8, 1],
                    opacity: [0, 1],
                    duration: 600,
                    easing: 'easeOutElastic(1, .8)',
                });
            } else if (type === "success") {
                // Success: Desliza desde arriba con rebote
                anime(alertRef.current, {
                    translateY: [-100, 0],
                    opacity: [0, 1],
                    scale: [0.8, 1],
                    duration: 600,
                    easing: 'easeOutElastic(1, .8)',
                });
            } else if (type === "error") {
                // Error: Entrada con escala
                anime(alertRef.current, {
                    translateY: [-100, 0],
                    opacity: [0, 1],
                    scale: [0.8, 1],
                    duration: 600,
                    easing: 'easeOutElastic(1, .8)',
                });
            }
        }
    }, [type, options.duration]);

    // Función de cierre con animación
    const handleClose = (callback?: () => void) => {
        if (alertRef.current) {
            anime(alertRef.current, {
                translateX: [0, 100],
                opacity: [1, 0],
                scale: [1, 0.8],
                duration: 400,
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
                position: 'relative',
                minWidth: '320px',
                maxWidth: '500px',
                padding: '1.25rem 1.5rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: colors.background,
                border: `2px solid ${colors.border}`,
                boxShadow: `0 10px 40px rgba(0, 0, 0, 0.6)`,
                opacity: 0,
                transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 48px rgba(0, 0, 0, 0.7)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.6)';
            }}
        >
            {/* Barra de progreso animada para alertas con duración */}
            {options.duration !== 0 && type !== "confirm" && (
                <ProgressBar duration={(options.duration ?? 3) * 1000} color={colors.border} />
            )}

            {/* Icono circular con animación de pulso */}
            <div
                style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    background: colors.iconBg,
                    color: colors.iconColor,
                    boxShadow: `0 0 20px ${colors.glow}`,
                    animation: 'pulse 2s ease-in-out infinite',
                }}
            >
                {icons[type]}
            </div>

            {/* Contenido del mensaje */}
            <div style={{ flex: 1 }}>
                <div
                    style={{
                        fontSize: '1rem',
                        lineHeight: '1.5',
                        fontWeight: '500',
                        color: colors.text,
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    {message}
                </div>
            </div>

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

            {/* Botón de cierre circular */}
            {type !== "confirm" && options.duration !== 0 && (
                <button
                    onClick={() => handleClose()}
                    style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                        e.currentTarget.style.transform = 'rotate(90deg)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                        e.currentTarget.style.transform = 'rotate(0deg)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'rotate(90deg) scale(0.9)';
                    }}
                    onMouseUp={(e) => {
                        e.currentTarget.style.transform = 'rotate(90deg)';
                    }}
                    type="button"
                    aria-label="Cerrar alerta"
                >
                    ✕
                </button>
            )}

            {/* Estilos CSS para la animación de pulso */}
            <style>{`
                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.08);
                    }
                }
                @keyframes glow {
                    0%, 100% {
                        filter: brightness(1);
                    }
                    50% {
                        filter: brightness(1.2);
                    }
                }
            `}</style>
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
