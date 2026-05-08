import { useEffect, useRef } from "react";

export function useAnimationFrame(cb: (dtMs: number, tMs: number) => void, active = true) {
  const cbRef = useRef(cb);
  cbRef.current = cb;

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let prev = performance.now();
    const start = prev;
    const loop = (now: number) => {
      const dt = now - prev;
      prev = now;
      cbRef.current(dt, now - start);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}
