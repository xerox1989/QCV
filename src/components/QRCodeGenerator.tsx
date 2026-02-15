import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Timer } from 'lucide-react';

interface Props {
  data: string;
  label?: string;
  expiresIn?: number; // in seconds
  onExpire?: () => void;
}

export const QRCodeDisplay: React.FC<Props> = ({ data, label, expiresIn, onExpire }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(expiresIn || null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || isExpired) return;

    // Add ephemeral ID and expiry to data if not already present
    const payload = JSON.parse(data);
    if (!payload.ephemeralId) {
      payload.ephemeralId = crypto.randomUUID();
    }
    if (expiresIn && !payload.expiresAt) {
      payload.expiresAt = Date.now() + expiresIn * 1000;
    }
    
    const finalData = JSON.stringify(payload);

    QRCode.toCanvas(canvasRef.current, finalData, {
      width: 220,
      margin: 2,
      color: {
        dark: '#020617', // Deep bg
        light: '#d946ef' // Purple 450
      }
    }, (error) => {
      if (error) console.error(error);
    });
  }, [data, isExpired, expiresIn]);

  useEffect(() => {
    if (expiresIn === undefined) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresIn, onExpire]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/60 rounded-3xl border border-purple-500/20 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
      <div className={`transition-all duration-500 ${isExpired ? 'grayscale blur-sm opacity-30 scale-95' : 'scale-100'}`}>
        <canvas ref={canvasRef} className="rounded-2xl shadow-[0_0_25px_rgba(217,70,239,0.3)]" />
      </div>

      {isExpired && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 animate-in-fade">
          <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-2xl backdrop-blur-md">
            <span className="text-red-400 font-orbitron text-xs tracking-[0.2em] uppercase font-bold">Signal Expired</span>
          </div>
        </div>
      )}

      <div className="mt-5 w-full">
        {label && <p className="text-slate-400 font-orbitron text-[10px] tracking-[0.2em] uppercase text-center mb-3">{label}</p>}
        
        {timeLeft !== null && !isExpired && (
          <div className="flex items-center justify-center gap-3 py-2 px-4 bg-purple-950/30 rounded-full border border-purple-500/20 animate-pulse">
            <Timer className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 font-mono font-bold text-sm tracking-widest">{timeLeft}s REMAINING</span>
          </div>
        )}
      </div>
      
      {/* Decorative corners */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-purple-500/40 rounded-tl-lg"></div>
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-purple-500/40 rounded-tr-lg"></div>
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-purple-500/40 rounded-bl-lg"></div>
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-purple-500/40 rounded-br-lg"></div>
    </div>
  );
};
