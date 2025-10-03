// @ts-ignore
import * as React from 'react';
import {Box} from "@mui/material";
import Modal from "../components/Modal";
import Camera from "../components/Camera";
import "./styles/homeStyles.css";

const Home = () => {
    const [open, setOpen] = React.useState(false);
    const [state, setState] = React.useState(false);

    const handleClose = () => {
        setOpen(false);
        setState(false);
    }

    const handleOpen = () => {
        setOpen(true);
        setState(true);
    }

    return (
        <Box>
            <h1>Home</h1>
            <button onClick={handleOpen}>prueba del modal</button>
            <Modal isOpen={open} onClose={handleClose} >
                <div className="contModal">
                    <div className="contMain"></div>
                    <div className="contCam">
                        <Camera state={state}/>
                    </div>
                </div>
            </Modal>
        </Box>
    )
}

export default Home;