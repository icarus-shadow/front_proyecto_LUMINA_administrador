import Pusher from "pusher-js";
import {useEffect} from "react";

export const HistoryEffects = () => {
    useEffect(() => {
        var pusher = new Pusher('3961091702fc34d8a2d3', {
            cluster: 'us2'
        });
        var channel = pusher.subscribe('historial-updates');
        channel.bind('historial.updated', function(data: []) {
            alert(data);
        });
    }, []);

    return (
        <></>
    )
}
