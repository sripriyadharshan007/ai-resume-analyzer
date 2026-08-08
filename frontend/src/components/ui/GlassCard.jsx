import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function GlassCard({ children, className, hover = true, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -5, scale: 1.01 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-3xl shadow-2xl',
        hover && 'hover:border-white/[0.12] hover:bg-white/[0.04] hover:shadow-brand-500/10',
        className
      )}
      {...props}
    >
      {/* Inner subtle glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
