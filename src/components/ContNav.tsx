import './styles/ContNav.css'
import CountCard from "./CounterCard.tsx";
import { useAppSelector } from '../services/redux/hooks';

const ContNav = () => {
    const usersCount = useAppSelector(state => state.usersReducer.count);
    const elementsCount = useAppSelector(state => state.elementsReducer.count);
    const historyCount = useAppSelector(state => state.historyReduce.count);
    const historyData = useAppSelector(state => state.historyReduce.data);

    const activeElements = historyData ? new Set(historyData.filter(item => !item.salida || item.salida === '').map(item => item.equipos_o_elementos_id)).size : 0;

    const today = new Date().toISOString().split('T')[0];
    const exitedToday = historyData ? new Set(historyData.filter(item => item.salida && item.salida.startsWith(today)).map(item => item.equipos_o_elementos_id)).size : 0;

    return (
        <div className="contMain">
            <CountCard path={'/usuarios'} tittle={'Usuarios'} number={usersCount} />
            <CountCard path={'/elementos'} tittle={'Elementos'} number={elementsCount} />
            <CountCard path={'/historial'} tittle={'Historial'} number={historyCount} />
            <CountCard path={'/entradas'} tittle={'Entradas'} number={activeElements} />
            <CountCard path={'/salidas'} tittle={'Salidas'} number={exitedToday} />
        </div>
    )
}


export default ContNav;