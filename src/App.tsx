import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import Home from './pages/home.tsx';
import ContNav from "./components/ContNav.tsx";
import Banner from "./components/Banner.tsx";

function App() {
    return (
        <Router>
                <Banner />
                <ContNav/>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                </Routes>
        </Router>)
}

export default App
