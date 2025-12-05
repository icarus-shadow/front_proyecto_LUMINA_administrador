import Pusher from "pusher-js";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../redux/hooks";
import { reloadHistory } from "../redux/slices/data/historySlice";

export const HistoryEffects = () => {
    const dispatch = useAppDispatch();
    const users = useSelector((state: any) => state.usersReducer?.data || []);
    const elements = useSelector((state: any) => state.elementsReducer?.data || []);

    // * Usar refs para mantener referencias actualizadas sin reconectar el WebSocket
    const usersRef = useRef(users);
    const elementsRef = useRef(elements);

    // * Actualizar las refs cuando cambien los datos
    useEffect(() => {
        usersRef.current = users;
        elementsRef.current = elements;
    }, [users, elements]);

    useEffect(() => {
        const pusher = new Pusher('3961091702fc34d8a2d3', {
            cluster: 'us2'
        });

        const channel = pusher.subscribe('historial-updates');

        channel.bind('historial.updated', function (data: any) {
            try {
                // Extraer el array de historiales del objeto
                let historyArray = null;

                if (Array.isArray(data)) {
                    // Si data ya es un array, usarlo directamente
                    historyArray = data;
                } else if (data && typeof data === 'object' && Array.isArray(data.historiales)) {
                    // Si data es un objeto con propiedad 'historiales' que es un array
                    historyArray = data.historiales;
                } else {
                    console.error('[HistoryEffects] Formato de datos no válido:', data);
                    return;
                }

                // * Enriquecer cada item del historial con objetos completos de usuario y equipo
                // * Usar las refs para obtener los datos más actuales
                const enrichedHistoryArray = historyArray.map((item: any) => {
                    // * Buscar el usuario correspondiente por ID
                    const usuario = usersRef.current.find((u: any) => u.id === item.usuario_id) || null;
                    // * Buscar el equipo correspondiente por ID
                    const equipo = elementsRef.current.find((e: any) => e.id === item.equipos_o_elementos_id) || null;

                    // * Retornar el item enriquecido con las propiedades adicionales
                    return {
                        ...item,
                        usuario,
                        equipo
                    };
                });

                dispatch(reloadHistory(enrichedHistoryArray));

            } catch (error) {
                console.error('[HistoryEffects] Error al procesar datos del WebSocket:', error);
            }
        });

        // Función de limpieza: desconectar cuando el componente se desmonte
        return () => {
            channel.unbind('historial.updated');
            pusher.unsubscribe('historial-updates');
            pusher.disconnect();
        };
    }, [dispatch]);

    return (
        <></>
    )
}
