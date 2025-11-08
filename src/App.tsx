import {BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';

import Usuarios from './pages/usuarios.tsx';
import Elementos from './pages/elementos.tsx';
import Historial from './pages/historial.tsx';
import Entradas from './pages/entradas.tsx';
import Salidas from './pages/salidas.tsx';
import ContNav from "./components/ContNav.tsx";
import Banner from "./components/Banner.tsx";

function App() {
    return (
        <Router>
                <Banner />
                <ContNav/>
                <Routes>
                    <Route path="/" element={<Navigate to="/usuarios" replace />} />
                    <Route path="/usuarios" element={<Usuarios/>}/>
                    <Route path="/elementos" element={<Elementos/>}/>
                    <Route path="/historial" element={<Historial/>}/>
                    <Route path="/entradas" element={<Entradas/>}/>
                    <Route path="/salidas" element={<Salidas/>}/>
                </Routes>
        </Router>)
}

export default App
