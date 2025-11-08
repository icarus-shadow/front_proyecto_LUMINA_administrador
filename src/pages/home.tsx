// @ts-ignore
import * as React from 'react';
import {Box} from "@mui/material";
import Modal from "../components/Modal";
import Camera from "../components/Camera";
import "./styles/homeStyles.css";
import QRCode from "react-qr-code";
import {DinamicTable} from "../components/DinamicTable.tsx";
import {Button} from "primereact/button";




const Home = () => {
    const [open, setOpen] = React.useState(false);
    const [valueQR, setValueQR] = React.useState("");

    const handleClose = () => {
        setOpen(false);
    }

    const handleOpen = () => {
        setOpen(true);
        setValueQR("codigo encriptado desde back");
    }


    const testRows = [
        {id: 1, name: 'John Doe', age: 30, email: 'john@example.com'},
        {id: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com'},
        {id: 3, name: 'Bob Johnson', age: 35, email: 'bob@example.com'},
    ];

    const testColumns = [
        {field: 'name', headerName: 'Name', width: 130},
        {field: 'age', headerName: 'Age', width: 90},
        {field: 'email', headerName: 'Email', width: 200},
    ];

    const handleDelete = (id: number) => {
        console.log('Delete:', id);
    };

    const handleEdit = (row: any) => {
        console.log('Edit:', row);
    };

    return (
        <Box>
            <DinamicTable
                rows={testRows}
                columns={testColumns}
                onDelete={handleDelete}
                onEdit={handleEdit}
            />

            <Button onClick={handleOpen}>prueba del modal</Button>

            <Modal isOpen={open} onClose={handleClose} >
                <div className="contModal">
                    <div className="contMain">
                        <QRCode value={valueQR} />
                    </div>
                    <div className="contCam">
                        <Camera/>
                    </div>
                </div>
            </Modal>
        </Box>
    )
}

export default Home;