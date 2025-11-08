import './styles/ContNav.css'
import CountCard from "./CounterCard.tsx";
import { contadores } from '../mockData.ts';

const ContNav = () => {
    return (
        <div className="contMain">
            <CountCard path={'/usuarios'} tittle={'Usuarios'} number={contadores.usuarios} />
            <CountCard path={'/elementos'} tittle={'Elementos'} number={contadores.elementos} />
            <CountCard path={'/historial'} tittle={'Historial'} number={contadores.historial} />
            <CountCard path={'/entradas'} tittle={'Entradas'} number={contadores.entradas} />
            <CountCard path={'/salidas'} tittle={'Salidas'} number={contadores.salidas} />
        </div>
    )
}


export default ContNav;