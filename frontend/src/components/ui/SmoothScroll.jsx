import React, { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.07, // Uses linear interpolation instead of fixed duration for much more responsive scrolling
      wheelMultiplier: 0.9, // Slightly softer wheel feel
      smoothWheel: true,
      smoothTouch: false, // Explicitly disable on mobile to use native zero-lag scrolling
    });



    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
