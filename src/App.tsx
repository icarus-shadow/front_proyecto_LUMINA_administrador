import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import Home from './pages/home.tsx';
import Navbar from "./components/navbar.tsx";

function App() {
  return (
      <Router>
          <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
  )
}

export default App
