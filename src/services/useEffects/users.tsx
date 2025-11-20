import * as React from "react";
import {useAppSelector} from "../redux/hooks.tsx";
import { useAlert } from "../../components/AlertSystem.tsx";

const UsersEffects = () => {
    const { showAlert } = useAlert()

    const fetchSuccess = useAppSelector((state) => state.usersReducer.fetchSuccess);
    const deleteSuccess = useAppSelector((state) => state.usersReducer.deleteSuccess);


    React.useEffect (()=> {
        if (fetchSuccess == true){
            showAlert("success", "usuarios actualizados");
        } else if (fetchSuccess == false) {
            showAlert("error", "error al actualizar la información")
        }
    }, [fetchSuccess]);

    React.useEffect(() => {
        if (deleteSuccess == true) {
            showAlert("success", "usuario eliminado correctamente")
        } else if (deleteSuccess == false) {
            showAlert("error", "error al eliminar el usuario")
        }
    }, [deleteSuccess])

    return (
        <></>
    )
}

export default UsersEffects;