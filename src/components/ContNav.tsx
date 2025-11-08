import './styles/ContNav.css'
import CountCard from "./CounterCard.tsx";



const ContNav = () => {
    return (
        <div className="contMain">
            <CountCard path={'/'} tittle={'acd'} number={45} />
            <CountCard path={'/profile'} tittle={'acd'} number={45} />
            <CountCard path={'/'} tittle={'acds'} number={45} />
            <CountCard path={'/'} tittle={'aca'} number={45} />
        </div>
    )
}


export default ContNav;