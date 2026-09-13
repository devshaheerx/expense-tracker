// hooks/useCountUp.js
import { useEffect, useState, useRef } from 'react';

// Animates from 0 (or the previous value) up to `target` over `duration` ms,
// using requestAnimationFrame for a smooth ramp rather than jumping straight
// to the final number. Re-triggers automatically whenever `target` changes.
export const useCountUp = (target, duration = 800) => {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const startValue = 0;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic — starts fast, settles gently rather than a linear count
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(startValue + (target - startValue) * eased);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return value;
};