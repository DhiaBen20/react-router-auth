import { toCanvas } from "qrcode";
import { useEffect, useRef } from "react";

export function AuthenticatorQrCode({ otpauth }: { otpauth: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        toCanvas(canvasRef.current, otpauth, { margin: 0 });
    }, [toCanvas, otpauth]);

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="rounded-xl border p-6">
                <canvas ref={canvasRef}></canvas>
            </div>
        </div>
    );
}
