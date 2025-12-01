import Pusher from "pusher-js";
import { useEffect } from "react";
import { useAppDispatch } from "../redux/hooks";
import { reloadHistory } from "../redux/slices/data/historySlice";

export const HistoryEffects = () => {
    const dispatch = useAppDispatch();
    useEffect(() => {
        var pusher = new Pusher('3961091702fc34d8a2d3', {
            cluster: 'us2'
        });
        var channel = pusher.subscribe('historial-updates');
        channel.bind('historial.updated', function (data: []) {
            console.log(data);
            dispatch(reloadHistory(data));
        });
    }, []);

    return (
        <></>
    )
}
