import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";
import { RULES } from "../ca/rules";
import "./Countdown.css";

type Props = {
  digit: number;
  phase: "running" | "bigbang" | "settled";
};

export function Countdown({ digit, phase }: Props) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const rotateY = useTransform(sx, [-1, 1], [-10, 10]);
  const rotateX = useTransform(sy, [-1, 1], [8, -8]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  const ruleName =
    phase === "settled" ? "ARRIVED" :
    phase === "bigbang" ? "BIG BANG" :
    RULES[digit]?.name ?? "I/O";

  // The center stage: digit during running, hidden during bigbang, "I/O" during settled.
  let centerKey: string;
  let centerLabel: string;
  let centerClass = "cd__digit";
  if (phase === "running") {
    centerKey = `d-${digit}`;
    centerLabel = digit === 10 ? "10" : `0${digit}`;
  } else if (phase === "bigbang") {
    centerKey = "bigbang";
    centerLabel = "";
  } else {
    centerKey = "io";
    centerLabel = "I/O";
    centerClass = "cd__digit cd__digit--io";
  }

  const showRule = phase !== "settled";

  return (
    <div className="cd" data-phase={phase}>
      <AnimatePresence>
        {showRule && (
          <motion.div
            className="cd__rule"
            aria-hidden
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="cd__rule-tag">RULE</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={ruleName}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="cd__rule-name"
              >
                {ruleName}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="cd__stage"
        style={{ rotateX, rotateY, transformPerspective: 1400 }}
      >
        <AnimatePresence mode="popLayout">
          {centerLabel && (
            <motion.div
              key={centerKey}
              className={centerClass}
              initial={{ opacity: 0, scale: 0.7, letterSpacing: "0.4em", filter: "blur(20px)" }}
              animate={{ opacity: 1, scale: 1, letterSpacing: "0", filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.15, filter: "blur(24px)" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              {centerLabel}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="cd__brand" aria-hidden>
        <span className="cd__brand-mark">[ I / O ]</span>
        <span className="cd__brand-year">MMXXVI</span>
      </div>
    </div>
  );
}
