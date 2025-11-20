import { useEffect } from "react";
import { echo } from "./src/echo";

export default function HistoryChannel() {
    useEffect(() => {
        const channel = echo.private("wss://ws-us2.pusher.com/app/3961091702fc34d8a2d3");

        channel.listen("NewHistory", (data: any) => {
            console.log("history:", data);
        });

        return () => {
            echo.leave(`wss://ws-us2.pusher.com/app/3961091702fc34d8a2d3`);
        };
    }, []);

    return (
        <div>Conectado al canal privado</div>
    );
}
