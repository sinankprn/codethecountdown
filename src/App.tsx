import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import * as Tone from "tone";
import { GradientMesh } from "./components/GradientMesh";
import { LifeCanvas } from "./components/LifeCanvas";
import { Countdown } from "./components/Countdown";
import { AudioEngine } from "./components/AudioEngine";
import { StartGate } from "./components/StartGate";
import { useCountdown } from "./hooks/useCountdown";
import "./App.css";

export function App() {
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const { digit, phase } = useCountdown(started, runKey);

  const start = async () => {
    try { await Tone.start(); } catch { /* already started */ }
    setStarted(true);
  };

  const restart = () => {
    setRunKey((k) => k + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!started) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          start();
        }
        return;
      }
      if (e.key === "m" || e.key === "M") setMuted((v) => !v);
      if (e.key === "r" || e.key === "R") restart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started]);

  const flash = phase === "bigbang" && digit === 0;

  return (
    <>
      <GradientMesh />
      <LifeCanvas digit={digit} phase={phase} running={started} runKey={runKey} />
      {started && <Countdown digit={digit} phase={phase} />}
      {started && <AudioEngine muted={muted} running={started} />}

      <AnimatePresence>{!started && <StartGate onStart={start} />}</AnimatePresence>

      {started && (
        <div className="hud">
          <button
            className="hud__btn"
            onClick={() => setMuted((v) => !v)}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? "MUTED" : "AUDIO ON"} <span className="hud__key">[M]</span>
          </button>
          <button className="hud__btn" onClick={restart} aria-label="Restart">
            RESTART <span className="hud__key">[R]</span>
          </button>
        </div>
      )}

      <div className={`flash ${flash ? "flash--on" : ""}`} aria-hidden />
    </>
  );
}
