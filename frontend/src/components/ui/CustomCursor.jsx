import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);

  // Use motion values directly to avoid React state re-render lag
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  
  const ringX = useMotionValue(-100);
  const ringY = useMotionValue(-100);

  // Smooth trailing spring for the outer ring
  const springConfig = { damping: 25, stiffness: 500, mass: 0.15 };
  const cursorX = useSpring(ringX, springConfig);
  const cursorY = useSpring(ringY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Inner dot: 8x8 (w-2 h-2) -> 4px offset to center
      dotX.set(e.clientX - 4); 
      dotY.set(e.clientY - 4);
      // Outer ring: 40x40 (w-10 h-10) -> 20px offset to center
      ringX.set(e.clientX - 20); 
      ringY.set(e.clientY - 20);
    };

    const handleMouseOver = (e) => {
      // Scale cursor if hovering over clickable elements
      if (
        e.target.closest('a') ||
        e.target.closest('button') ||
        e.target.closest('.magnetic-target') ||
        e.target.closest('[role="button"]') ||
        window.getComputedStyle(e.target).cursor === 'pointer'
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [dotX, dotY, ringX, ringY]);

  // Hide cursor on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) return null;

  return (
    <>
      {/* Outer premium glass ring */}
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 rounded-full border border-brand-400/30 bg-brand-900/10 backdrop-blur-[2px] pointer-events-none z-[9998] hidden md:flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.15)]"
        style={{
          x: cursorX,
          y: cursorY,
        }}
        animate={{
          scale: isHovering ? 1.4 : 1,
          backgroundColor: isHovering ? "rgba(59, 130, 246, 0.15)" : "rgba(30, 58, 138, 0.1)",
          borderColor: isHovering ? "rgba(59, 130, 246, 0.6)" : "rgba(96, 165, 250, 0.3)",
        }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Inner precise glowing dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-brand-400 rounded-full pointer-events-none z-[9999] hidden md:block shadow-[0_0_8px_rgba(96,165,250,0.9)]"
        style={{
          x: dotX,
          y: dotY,
        }}
        animate={{
          scale: isHovering ? 0 : 1,
          opacity: isHovering ? 0 : 1,
        }}
        transition={{ type: 'spring', stiffness: 1000, damping: 28, mass: 0.1 }}
      />
    </>
  );
}
