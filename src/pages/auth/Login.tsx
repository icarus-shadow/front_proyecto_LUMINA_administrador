import { useState } from "react";
import { useAppDispatch } from "../../services/redux/hooks.tsx";
import { login } from "../../services/redux/slices/AuthSlice.tsx";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import "./login.css";

const Login = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [emailError, setEmailError] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const dispatch = useAppDispatch();

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
                await dispatch(login({ email, password }));
            } catch {
                // Manejo de errores adicional si es necesario
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