
import {Home} from '@mui/icons-material';

import './styles/navbar.css'
import icon from '../assets/icon.svg';
import {List, ListItem, ListItemText, Typography} from "@mui/material";
import {Link} from "react-router-dom"
import AccountIcon from '@mui/icons-material/AccountCircle';


const navItems = [
    {
        name: 'Inicio',
        icon: <Home/>,
        path: '/'
    },
]



const Navbar = () => {
    return (
        <div className="navbar">
            <div className="contMain">
                <div className="contBanner">
                    <img className='logo' src={icon} alt="logo"/>
                    <Typography variant='h3' className='textBanner'>LUMINA</Typography>
                </div>
                <div className="contItems">
                    <List>
                        {
                            navItems.map((item) => (
                                <ListItem key={item.name} disablePadding>
                                    <Link
                                        to={item.path}
                                        className='link'
                                    >
                                        {item.icon}
                                        <ListItemText primary={item.name}/>
                                    </Link>
                                </ListItem>
                            ))
                        }
                    </List>
                </div>
            </div>
            <div className="contProfile">
                <Link to='/profile' className='linkProfile'>
                    <AccountIcon style={{fontSize: 60}}/>
                    <Typography variant='h5' className='textProfile'>Usuario</Typography>
                </Link>
            </div>
        </div>
    )
}


export default Navbar;