import React, { useRef } from 'react';
import { motion, useScroll, useVelocity, useTransform, useAnimationFrame, useMotionValue } from 'framer-motion';
import { wrap } from 'framer-motion';

export default function Marquee({ children, baseVelocity = 2 }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useTransform(scrollVelocity, [0, 1000], [0, 5], {
    clamp: false
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [1, 5], {
    clamp: false
  });

  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);
  const directionFactor = useRef(1);

  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    
    // Change direction if scrolling up
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden m-0 whitespace-nowrap flex flex-nowrap py-10 opacity-50">
      <motion.div className="flex whitespace-nowrap gap-10 items-center font-heading font-black text-6xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-brand-900 to-cyan-900 stroke-text uppercase select-none" style={{ x }}>
        <span className="block">{children} </span>
        <span className="block">{children} </span>
        <span className="block">{children} </span>
        <span className="block">{children} </span>
      </motion.div>
    </div>
  );
}
