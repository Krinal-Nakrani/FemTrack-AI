import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, RotateCcw, Check, AlertCircle } from 'lucide-react';

interface Props {
  onCapture: (base64: string) => void;
  captured: string | null;
}

export function StepCamera({ onCapture, captured }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
        setError('');
      }
    } catch {
      setError('Camera access denied. Please allow camera permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setStreaming(false);
    }
  }, []);

  useEffect(() => {
    if (!captured) startCamera();
    return () => stopCamera();
  }, []);

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(videoRef.current, 0, 0, 640, 480);
    const base64 = canvas.toDataURL('image/jpeg', 0.8);
    onCapture(base64);
    stopCamera();
  };

  const retake = () => {
    onCapture('');
    startCamera();
  };

  if (error) {
    return (
      <div className="glass-card p-6 text-center">
        <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
        <p className="text-red-300 font-body text-sm mb-3">{error}</p>
        <button onClick={startCamera} className="px-4 py-2 rounded-xl bg-purple-600/30 text-purple-300 font-body text-sm">
          Try Again
        </button>
      </div>
    );
  }

  if (captured) {
    return (
      <div className="text-center">
        <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-green-500/30">
          <img src={captured} alt="Face capture" className="w-full h-full object-cover" />
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <Check size={14} className="text-white" />
          </div>
        </div>
        <p className="text-green-400 font-body text-sm mt-3">✓ Face captured successfully</p>
        <button onClick={retake} className="flex items-center gap-1.5 mx-auto mt-2 text-xs text-lavender/40 font-body hover:text-lavender/70">
          <RotateCcw size={12} /> Retake
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-2 border-purple-400/30">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        {/* Oval overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 256 256">
          <defs>
            <mask id="oval-mask">
              <rect width="256" height="256" fill="white" />
              <ellipse cx="128" cy="128" rx="90" ry="115" fill="black" />
            </mask>
          </defs>
          <rect width="256" height="256" fill="rgba(0,0,0,0.5)" mask="url(#oval-mask)" />
          <ellipse cx="128" cy="128" rx="90" ry="115" fill="none" stroke="rgba(168,85,247,0.6)" strokeWidth="2" strokeDasharray="8 4" />
        </svg>
      </div>
      <p className="text-lavender/50 font-body text-xs mt-3">Position your face within the oval</p>
      {streaming && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={capture}
          className="mt-4 w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-purple-600/30"
        >
          <Camera size={24} className="text-white" />
        </motion.button>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
