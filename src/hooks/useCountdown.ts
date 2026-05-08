import { useEffect, useState } from "react";

export type Phase = "running" | "bigbang" | "settled";

export type CountdownState = {
  digit: number; // 10..0
  phase: Phase;
  elapsed: number;
};

const BIGBANG_MS = 2800; // duration of the explosion before the field settles

// runKey lets the parent restart the countdown by bumping the key.
export function useCountdown(running: boolean, runKey: number, startFrom = 10): CountdownState {
  const [state, setState] = useState<CountdownState>({ digit: startFrom, phase: "running", elapsed: 0 });

  useEffect(() => {
    setState({ digit: startFrom, phase: "running", elapsed: 0 });
    if (!running) return;
    const start = performance.now();
    let timer: ReturnType<typeof setTimeout> | null = null;

    const advance = () => {
      const elapsed = performance.now() - start;
      const ticksElapsed = Math.floor(elapsed / 1000);
      const digit = Math.max(0, startFrom - ticksElapsed);
      let phase: Phase = "running";
      if (digit === 0) {
        const sinceZero = elapsed - startFrom * 1000;
        phase = sinceZero > BIGBANG_MS ? "settled" : "bigbang";
      }
      setState({ digit, phase, elapsed });
      // Schedule next update at the next semantically interesting moment.
      let nextDelay: number;
      if (digit > 0) {
        nextDelay = 1000 - (elapsed % 1000);
      } else if (phase === "bigbang") {
        nextDelay = Math.max(50, BIGBANG_MS - (elapsed - startFrom * 1000));
      } else {
        return; // settled — no more updates
      }
      timer = setTimeout(advance, nextDelay);
    };

    advance();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [running, runKey, startFrom]);

  return state;
}
