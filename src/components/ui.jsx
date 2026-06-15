import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Card: add quantum-card class by default, hover lift effect
export const Card = ({ children, className, ...props }) => (
  <div className={cn("quantum-card hover:-translate-y-1 transition-transform duration-300", className)} {...props}>
    {children}
  </div>
);

// Badge: add glow shadow matching variant color
export const Badge = ({ children, variant = 'cyan', className }) => {
  const variants = {
    cyan: "bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30 shadow-[0_0_8px_var(--neon-cyan)]",
    purple: "bg-[var(--neon-purple)]/10 text-[var(--neon-purple)] border border-[var(--neon-purple)]/30 shadow-[0_0_8px_var(--neon-purple)]",
    red: "bg-red-500/10 text-red-400 border border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.5)]",
    green: "bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30 shadow-[0_0_8px_rgba(0,255,136,0.5)]",
    amber: "bg-[#ffb800]/10 text-[#ffb800] border border-[#ffb800]/30 shadow-[0_0_8px_rgba(255,184,0,0.5)]",
  };
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider", variants[variant] || variants.cyan, className)}>
      {children}
    </span>
  );
};

// GlowButton
export const GlowButton = ({ children, variant = 'cyan', className, ...props }) => {
  const variantClass = variant === 'purple' ? 'neon-btn-purple' : 'neon-btn-cyan';
  return (
    <button className={cn(variantClass, "relative overflow-hidden group", className)} {...props}>
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 bg-white/20 opacity-0 group-active:opacity-100 transition-opacity duration-75"></span>
    </button>
  );
};

// QuantumDivider
export const QuantumDivider = ({ className }) => (
  <div className={cn("w-full h-px opacity-50", className)} style={{ backgroundImage: 'linear-gradient(to right, transparent, var(--neon-cyan), var(--neon-purple), transparent)' }} />
);

// StatusDot
export const StatusDot = ({ status = 'online', className }) => {
  const colors = {
    online: 'bg-[#00ff88]',
    warning: 'bg-[#ffb800]',
    offline: 'bg-red-500',
  };
  const colorClass = colors[status] || colors.online;
  
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div className={cn("w-2 h-2 rounded-full relative z-10", colorClass)} />
      <div className={cn("absolute w-4 h-4 rounded-full animate-ping opacity-40", colorClass)} />
    </div>
  );
};

export const ProgressBar = ({ progress, color = 'bg-[var(--neon-cyan)]', label, valueText, className }) => (
  <div className={cn("w-full", className)}>
    {(label || valueText) && (
      <div className="flex justify-between items-center mb-1 text-sm font-medium">
        {label && <span className="text-[var(--text-secondary)]">{label}</span>}
        {valueText && <span className="text-[var(--text-primary)]">{valueText}</span>}
      </div>
    )}
    <div className="w-full bg-[var(--bg-primary)] rounded-full h-2.5 border border-[var(--border-color)] overflow-hidden relative">
      <div 
        className={cn("h-2.5 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]", color)} 
        style={{ width: `${progress}%` }}
      >
        <div className="w-full h-full bg-white/20 animate-pulse"></div>
      </div>
    </div>
  </div>
);

export const AnimatedCounter = ({ value, duration = 2, prefix = "", suffix = "" }) => {
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    let start = 0;
    const end = parseFloat(value);
    if (isNaN(end)) return;
    if (start === end) {
      setCount(end);
      return;
    }
    let totalMilSecDur = parseInt(duration);
    let incrementTime = (totalMilSecDur / end) * 1000;
    
    if(incrementTime < 10) incrementTime = 30;
    
    const steps = totalMilSecDur * 1000 / incrementTime;
    const increment = end / steps;
    
    let timer = setInterval(() => {
      start += increment;
      if(start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [value, duration]);
  
  const formattedCount = Number.isInteger(parseFloat(value)) ? Math.floor(count) : count.toFixed(1);
  
  return <span>{prefix}{formattedCount}{suffix}</span>;
};
