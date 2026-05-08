import { useEffect, useState } from "react";

export type Phase = "running" | "bigbang";

export type CountdownState = {
  digit: number; // 10..0
  phase: Phase;
  elapsed: number;
};

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
      const phase: Phase = digit === 0 ? "bigbang" : "running";
      setState({ digit, phase, elapsed });
      if (digit > 0) {
        timer = setTimeout(advance, 1000 - (elapsed % 1000));
      }
      // digit === 0: stay in bigbang forever; no further phase updates needed.
    };

    advance();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [running, runKey, startFrom]);

  return state;
}
