import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export default function Logo({ className, textClassName, hideText = false, size = 'md' }) {
  // Size classes for the container
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-14 h-14 rounded-2xl'
  };

  return (
    <Link to="/" className={cn("flex items-center gap-3 group", className)}>
      <div 
        className={cn(
          "overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.3)] shrink-0 flex items-center justify-center bg-brand-900/50",
          sizeClasses[size]
        )}
      >
        <img 
          src="/logo.png" 
          alt="ResumeAI Logo" 
          className="w-full h-full object-cover scale-[1.55] group-hover:scale-[1.65] transition-transform duration-500" 
        />
      </div>
      {!hideText && (
        <span className={cn("font-heading font-black text-xl text-white tracking-tight", textClassName)}>
          ResumeAI
        </span>
      )}
    </Link>
  );
}
