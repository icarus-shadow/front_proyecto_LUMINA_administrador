import {BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
import Login from './pages/auth/Login';

import Usuarios from './pages/usuarios.tsx';
import Elementos from './pages/elementos.tsx';
import Historial from './pages/historial.tsx';
import Entradas from './pages/entradas.tsx';
import Salidas from './pages/salidas.tsx';
import ContNav from "./components/ContNav.tsx";
import Banner from "./components/Banner.tsx";
import {useAppSelector} from "./services/redux/hooks";

function App() {
    const { user, token } = useAppSelector((state) => state.authReducer);
    const isAuthenticated = !!token && !!user;
    

    return (
        <Router>
            <Banner/>
            {isAuthenticated ? (
                <>
                    <ContNav/>
                    <Routes>
                        <Route path="/" element={<Navigate to="/usuarios" replace/>}/>
                        <Route path="/usuarios" element={<Usuarios/>}/>
                        <Route path="/elementos" element={<Elementos/>}/>
                        <Route path="/historial" element={<Historial/>}/>
                        <Route path="/entradas" element={<Entradas/>}/>
                        <Route path="/salidas" element={<Salidas/>}/>
                        <Route path="/login" element={<Navigate to="/usuarios" replace/>}/>
                        <Route path="*" element={<Navigate to="/usuarios" replace/>}/>
                    </Routes>
                </>
            ) : (
                <Routes>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="*" element={<Navigate to="/login" replace/>}/>
                </Routes>
            )}
        </Router>)
}

export default App
