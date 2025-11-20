import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

export const echo = new Echo({
    broadcaster: "pusher",
    key: '3961091702fc34d8a2d3',
    cluster: 'us2',
    forceTLS: true,
    authEndpoint: "https://lumina-testing.onrender.com/broadcasting/auth",
    auth: {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    },
});
