import  { useEffect, useRef, useState } from "react";
import "./styles/camera.css"



const Camera = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err: any) {
                setError("No se pudo acceder a la cámara: " + err.message);
            }
        };

        startCamera();

        return () => {
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream)
                    .getTracks()
                    .forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div style={{ textAlign: "center" }}>
            {error ? (
                <p>{error}</p>
            ) : (

                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        style={{ width: "100%", maxWidth: "500px", borderRadius: "10px" }}
                    />
            )}
        </div>
    );
};

export default Camera;
