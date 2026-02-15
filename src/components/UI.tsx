import React, { memo } from 'react';
import { Loader2, X } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost' | 'neon';
  loading?: boolean;
}

export const NeonButton: React.FC<ButtonProps> = ({ children, variant = 'primary', loading, className, ...props }) => {
  const baseStyle = "relative overflow-hidden font-orbitron font-bold uppercase tracking-widest transition-all duration-300 active:scale-[0.95] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 px-6 py-3 rounded-xl group gpu touch-ripple";
  
  const variants = {
    primary: "bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_35px_rgba(34,211,238,0.6)] border border-cyan-400/40",
    neon: "bg-transparent text-cyan-400 border border-cyan-500/30 hover:bg-cyan-950/40 hover:text-cyan-200 hover:border-cyan-400 hover:shadow-[0_0_20px_inset_rgba(6,182,212,0.1)] shadow-[0_0_15px_rgba(34,211,238,0.1)]",
    danger: "bg-red-950/30 text-red-400 border border-red-500/20 hover:bg-red-900/50 hover:text-red-300 hover:shadow-[0_0_25px_rgba(239,68,68,0.25)]",
    ghost: "text-slate-500 hover:text-purple-400 hover:bg-purple-950/20 border border-transparent transition-colors"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className || ''}`} {...props}>
      {loading && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      
      {/* Glint Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent z-0 pointer-events-none" />
    </button>
  );
};

export const NeonInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return (
    <div className="relative group transition-all duration-300 gpu">
      <input 
        {...props}
        className={`w-full bg-slate-900/60 border border-slate-800 text-purple-100 px-5 py-3.5 rounded-xl focus:outline-none focus:border-purple-500/50 focus:bg-slate-900/80 transition-all duration-300 placeholder-slate-600 font-rajdhani text-lg backdrop-blur-md shadow-inner ${props.className}`}
      />
      {/* Dynamic Underglow */}
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent transition-all duration-700 ease-in-out group-hover:w-full opacity-0 group-hover:opacity-100 shadow-[0_0_12px_rgba(217,70,239,0.9)]"></div>
    </div>
  );
};

interface NeonCardProps { 
    children: React.ReactNode; 
    className?: string; 
    onClick?: () => void;
    variant?: 'cyan' | 'purple' | 'glass'; 
    // Fix: Added style property to allow inline CSS (e.g. animationDelay)
    style?: React.CSSProperties;
}

// Optimized for smoothness and spark consistency
export const NeonCard: React.FC<NeonCardProps> = memo(({ children, className, onClick, variant = 'cyan', style }) => {
  const variantClass = `variant-${variant}`;
  const gridColor = variant === 'purple' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(6, 182, 212, 0.2)';

  return (
    <div 
      onClick={onClick}
      style={style}
      className={`neon-card-wrapper ${variantClass} ${className || ''} ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''} gpu`}
    >
      <div className="neon-card-inner">
        {/* Interactive Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.08] pointer-events-none group-hover:opacity-20 transition-opacity duration-500" 
          style={{ 
            backgroundImage: `radial-gradient(${gridColor} 1.2px, transparent 1.2px)`, 
            backgroundSize: '20px 20px' 
          }} 
        />
        
        {/* Content Enclave */}
        <div className="relative z-10 h-full flex flex-col p-6">
            {children}
        </div>
      </div>
    </div>
  );
});

export const PageTransition: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`animate-in-zoom gpu ${className || ''}`} style={{ willChange: 'transform, opacity' }}>
    {children}
  </div>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; variant?: 'cyan' | 'purple' }> = ({ isOpen, onClose, title, children, variant = 'cyan' }) => {
  if (!isOpen) return null;
  
  const headerColor = variant === 'purple' ? 'text-purple-400 glow-text' : 'text-cyan-400 glow-text';
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in-fade gpu">
      <div 
        className="max-w-xl w-full animate-in-zoom gpu origin-center" 
        style={{ animationDuration: '0.4s' }}
      >
        <NeonCard variant={variant} className="shadow-2xl ring-1 ring-white/10 overflow-visible">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <h3 className={`text-2xl font-orbitron tracking-widest ${headerColor}`}>{title}</h3>
                <button 
                  onClick={onClose} 
                  className="text-slate-500 hover:text-red-400 transition-all p-2.5 hover:bg-red-500/10 rounded-full active:scale-90"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto custom-scrollbar pr-4 -mr-4">
              {children}
            </div>
        </NeonCard>
      </div>
    </div>
  );
};