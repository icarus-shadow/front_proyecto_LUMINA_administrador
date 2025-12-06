import { useState } from "react";
import { useAppDispatch } from "../../services/redux/hooks.tsx";
import { login, logoutAsync } from "../../services/redux/slices/AuthSlice.tsx";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { useAlert } from "../../components/AlertSystem.tsx";
import "./login.css";

const Login = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [emailError, setEmailError] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const { showAlert } = useAlert();

    const ValidateInfo = () => {
        let isValid = true;
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError('Por favor, ingresa un email válido.');
            isValid = false;
        } else {
            setEmailError('');
        }
        if (!password.trim()) {
            setPasswordError('La contraseña no puede estar vacía.');
            isValid = false;
        } else {
            setPasswordError('');
        }
        return isValid;
    };

    const handleSubmit = async () => {
        if (ValidateInfo()) {
            setLoading(true);
            try {
                const result = await dispatch(login({ email, password }));

                // Si el login fue exitoso
                if (login.fulfilled.match(result)) {
                    const user = result.payload.data.user;

                    // Validar si el usuario es administrador (role_id = 2)
                    if (user.role_id !== 2) {
                        // No es administrador, cerrar sesión automáticamente
                        // Limpiar localStorage inmediatamente para evitar que quede logueado
                        localStorage.removeItem('user');
                        localStorage.removeItem('token');

                        await dispatch(logoutAsync());

                        showAlert(
                            'error',
                            'Acceso denegado. Solo los administradores pueden acceder a esta aplicación.',
                            { duration: 5 }
                        );
                    } else {
                        // Es administrador, login exitoso
                        showAlert(
                            'success',
                            'Inicio de sesión exitoso',
                            { duration: 3 }
                        );
                    }
                }
                // Si el login falló
                else if (login.rejected.match(result)) {
                    const errorMessage = result.payload as string;

                    // Mostrar error específico
                    if (errorMessage === 'CREDENCIALES_INCORRECTAS') {
                        showAlert(
                            'error',
                            'Credenciales incorrectas. Verifica tu email y contraseña.',
                            { duration: 4 }
                        );
                    } else {
                        showAlert(
                            'error',
                            errorMessage || 'Error en el inicio de sesión',
                            { duration: 4 }
                        );
                    }
                }
            } catch (error) {
                showAlert(
                    'error',
                    'Error inesperado. Por favor, intenta nuevamente.',
                    { duration: 4 }
                );
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="login-container">
            <Card className="login-card">
                <h2 className="login-header">INGRESE CREDENCIALES</h2>
                <div className="login-line"></div>
                <div className="field">
                    <label htmlFor="email" className="field-label">Email</label>
                    <InputText
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`field-input ${emailError ? 'p-invalid' : ''}`}
                        placeholder="Ingresa tu email"
                        autoComplete="off"
                    />
                    {emailError && <Message severity="error" text={emailError} className="field-error" />}
                </div>
                <div className="field">
                    <label htmlFor="password" className="field-label">Contraseña</label>
                    <Password
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`field-input ${passwordError ? 'p-invalid' : ''}`}
                        placeholder="Ingresa tu contraseña"
                        toggleMask
                        feedback={false}
                        autoComplete="off"
                    />
                    {passwordError && <Message severity="error" text={passwordError} className="field-error" />}
                </div>
                <Button
                    label="Ingresar"
                    onClick={handleSubmit}
                    loading={loading}
                    className="login-button"
                />
            </Card>
        </div>
    );
};

export default Login;