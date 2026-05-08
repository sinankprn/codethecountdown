import { motion } from "motion/react";
import "./StartGate.css";

type Props = { onStart: () => void };

export function StartGate({ onStart }: Props) {
  return (
    <motion.button
      className="gate"
      onClick={onStart}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.4, filter: "blur(20px)" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Begin countdown"
    >
      <div className="gate__inner">
        <div className="gate__eyebrow">
          <span className="gate__pulse" />
          <span>GOOGLE / IO · CELLULAR COUNTDOWN</span>
        </div>
        <div className="gate__title">
          <span>EVOLVE</span>
          <span className="gate__title-accent">THE</span>
          <span>COUNTDOWN</span>
        </div>
        <div className="gate__sub">
          A generative score, written by 21,600 cells.
          <br />
          Headphones recommended. Press anywhere to begin.
        </div>
        <div className="gate__cta">
          <span className="gate__cta-arrow">▶</span>
          <span className="gate__cta-text">PRESS TO BEGIN</span>
          <span className="gate__cta-key">[ ENTER ]</span>
        </div>
      </div>
    </motion.button>
  );
}
