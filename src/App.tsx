import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import Home from './pages/home.tsx';
import ContNav from "./components/ContNav.tsx";

function App() {
    return (
        <Router>
                <ContNav/>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                </Routes>
        </Router>)
}

export default App
