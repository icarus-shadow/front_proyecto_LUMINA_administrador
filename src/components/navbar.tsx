
import {Home} from '@mui/icons-material';

import './styles/navbar.css'



const navItems = [
    {
        name: 'Home',
        icon: <Home/>,
        path: '/'
    },
]



const Navbar = () => {
    return (
        <div className="navbar">
            <div className="contMain">
                <div className="contBanner"></div>
                <div className="contItems"></div>
            </div>
            <div className="contProfile"></div>
        </div>
    )
}


export default Navbar;