import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Card = ({ children, className, ...props }) => (
  <div className={cn("glass rounded-xl p-6", className)} {...props}>
    {children}
  </div>
);

export const Badge = ({ children, variant = 'cyan', className }) => {
  const variants = {
    cyan: "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30",
    purple: "bg-neon-purple/10 text-neon-purple border border-neon-purple/30",
    red: "bg-red-500/10 text-red-400 border border-red-500/30",
    green: "bg-green-500/10 text-green-400 border border-green-500/30",
  };
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider", variants[variant], className)}>
      {children}
    </span>
  );
};

export const ProgressBar = ({ progress, color = 'bg-neon-cyan', label, valueText, className }) => (
  <div className={cn("w-full", className)}>
    {(label || valueText) && (
      <div className="flex justify-between items-center mb-1 text-sm font-medium">
        {label && <span className="text-gray-400">{label}</span>}
        {valueText && <span className="text-gray-200">{valueText}</span>}
      </div>
    )}
    <div className="w-full bg-slate-800 rounded-full h-2.5 border border-white/5 overflow-hidden">
      <div 
        className={cn("h-2.5 rounded-full transition-all duration-1000 ease-out", color)} 
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
    if (start === end) return;
    let totalMilSecDur = parseInt(duration);
    let incrementTime = (totalMilSecDur / end) * 1000;
    
    // Quick heuristic to avoid too many renders for large numbers
    if(incrementTime < 10) {
      incrementTime = 30;
    }
    
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
  
  // Format based on integer or float
  const formattedCount = Number.isInteger(parseFloat(value)) ? Math.floor(count) : count.toFixed(1);
  
  return <span>{prefix}{formattedCount}{suffix}</span>;
};
