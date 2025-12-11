import React, { useEffect, useRef } from 'react';
import './styles/CustomAlert.css';

interface CustomAlertProps {
    visible: boolean;
    severity: 'error' | 'success' | 'warning' | 'info';
    message: string;
    onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ visible, severity, message, onClose }) => {
    const alertRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (visible) {
            // Limpiar timeout anterior si existe
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Cargar anime.js y animar entrada
            import('animejs').then((animeModule) => {
                const anime = (animeModule as any).default || animeModule;
                if (anime && typeof anime === 'function' && alertRef.current) {
                    anime({
                        targets: alertRef.current,
                        translateY: [-100, 0],
                        opacity: [0, 1],
                        scale: [0.8, 1],
                        duration: 600,
                        easing: 'easeOutElastic(1, .8)'
                    });
                }
            }).catch(() => {
                // Si no carga anime, solo mostrar el alerta sin animación
                if (alertRef.current) {
                    alertRef.current.style.opacity = '1';
                }
            });

            // Auto-cerrar después de 4 segundos
            timeoutRef.current = window.setTimeout(() => {
                handleClose();
            }, 4000);
        }

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [visible]);

    const handleClose = () => {
        import('animejs').then((module) => {
            const anime = (module as any).default || module;
            if (alertRef.current) {
                anime({
                    targets: alertRef.current,
                    translateX: [0, 100],
                    opacity: [1, 0],
                    scale: [1, 0.8],
                    duration: 400,
                    easing: 'easeInQuad',
                    complete: () => {
                        onClose();
                    }
                });
            } else {
                onClose();
            }
        }).catch(() => {
            // Si falla la carga de anime, cerrar directamente
            onClose();
        });
    };

    if (!visible) return null;

    const icons = {
        error: '✕',
        success: '✓',
        warning: '⚠',
        info: 'ℹ'
    };

    return (
        <div ref={alertRef} className={`custom-alert custom-alert-${severity}`}>
            <div className="custom-alert-icon">
                {icons[severity]}
            </div>
            <div className="custom-alert-content">
                <div className="custom-alert-message">{message}</div>
            </div>
            <button
                className="custom-alert-close"
                onClick={handleClose}
                type="button"
                aria-label="Cerrar alerta"
            >
                ✕
            </button>
        </div>
    );
};

export default CustomAlert;
