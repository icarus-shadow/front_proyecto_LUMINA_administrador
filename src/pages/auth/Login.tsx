import { useState } from "react";
import {useAppDispatch} from "../../services/redux/hooks.tsx";
import {login} from "../../services/redux/slices/AuthSlice.tsx";
import "./login.css"
import { Eye, EyeOff } from "lucide-react";


const Login = () => {

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [emailError, setEmailError] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
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
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = () => {
        if (ValidateInfo()) {
            dispatch(login({email, password}));
        }
    }

    return(
        <div className="contForm">
            <div className="header">INGRESE CREDENCIALES</div>
            <div className="line"></div>
            <div className="contEmail">
                <div className="emailLabel">Email</div>
                <input type="email" className="emailInput" value={email} onChange={(e) => setEmail(e.target.value)}/>
                <div className="error">{emailError}</div>
            </div>
            <div className="contPassword">
                <div className="passwordLabel">Contraseña</div>
                <div className="passwordInputContainer">
                    <input type={showPassword ? "text" : "password"} className="passwordInput" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    <button type="button" className="passwordToggleButton" onClick={togglePasswordVisibility}>
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                <div className="error">{passwordError}</div>
            </div>
            <button type={"button"} className="signInButton" onClick={handleSubmit}>Ingresar</button>
        </div>
    )
}

export default Login;