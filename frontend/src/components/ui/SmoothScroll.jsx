import React, { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1, // Increased lerp for more responsive scrolling
      wheelMultiplier: 1, // Normal wheel feel
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
