import { useState } from "react";
import {useAppDispatch} from "../../services/redux/hooks.tsx";
import {login} from "../../services/redux/slices/AuthSlice.tsx";



const Login = () => {

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const dispatch = useAppDispatch();

    const ValidateInfo = (email: string, password: string) => {
        if (password.length < 6) {

        }
    }

    const handleSubmit = () => {
        dispatch(login({email, password}));
    }

    return(
        <div className="contForm">
            <div className="header"></div>
            <div className="line"></div>
            <div className="contEmail">
                <div className="emailLabel">email</div>
                <input type="email" className="emailInput" value={email} onChange={(e) => setEmail(e.target.value)}/>
            </div>
            <div className="contPassword">
                <div className="passwordLabel">contraseña</div>
                <input type="password" className="passwordInput" value={password} onChange={(e) => setPassword(e.target.value)}/>
            </div>
            <button type={"button"} className="signInButton" onClick={handleSubmit}>ingresar</button>
        </div>
    )
}

export default Login;