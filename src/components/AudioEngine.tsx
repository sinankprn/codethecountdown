import { useEffect, useRef } from "react";
import * as Tone from "tone";
import { bus } from "../hooks/useEventBus";

const SCALE = [
  "A2", "C3", "D3", "E3", "G3",
  "A3", "C4", "D4", "E4", "G4",
  "A4", "C5", "D5", "E5", "G5",
  "A5", "C6",
];
const BANDS = 8;
const BASS_BY_DIGIT = ["A1", "G1", "F1", "E1", "D1", "C1", "B0", "A0", "G0", "F0", "E0"];

type Props = { muted: boolean; running: boolean };

export function AudioEngine({ muted, running }: Props) {
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const bassRef = useRef<Tone.MonoSynth | null>(null);
  const tickSynthRef = useRef<Tone.MetalSynth | null>(null);
  const masterRef = useRef<Tone.Gain | null>(null);
  const lastTriggerRef = useRef<number[]>(new Array(BANDS).fill(0));

  useEffect(() => {
    const reverb = new Tone.Reverb({ decay: 9, wet: 0.55 });
    const delay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.45, wet: 0.32 });
    const filter = new Tone.Filter({ frequency: 2200, type: "lowpass", Q: 0.6 });
    const filterLfo = new Tone.LFO({ frequency: 0.07, min: 900, max: 4400 }).start();
    filterLfo.connect(filter.frequency);

    const master = new Tone.Gain(0.45);
    const masterLfo = new Tone.LFO({ frequency: 0.13, min: 0.32, max: 0.55 }).start();
    masterLfo.connect(master.gain);
    master.toDestination();

    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "fmtriangle", modulationType: "sine", modulationIndex: 4 },
      envelope: { attack: 0.02, decay: 0.6, sustain: 0.05, release: 1.8 },
    });
    synth.volume.value = -10;
    synth.chain(filter, delay, reverb, master);

    const bass = new Tone.MonoSynth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.02, decay: 0.4, sustain: 0.7, release: 2.5 },
      filterEnvelope: { attack: 0.6, decay: 0.4, sustain: 0.6, release: 1.6, baseFrequency: 80, octaves: 2.5 },
    });
    bass.volume.value = -14;
    bass.chain(reverb, master);

    // Percussive accent on each digit boundary.
    const tickSynth = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.18, release: 0.05 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.2,
    });
    tickSynth.volume.value = -28;
    tickSynth.chain(filter, reverb, master);

    synthRef.current = synth;
    bassRef.current = bass;
    tickSynthRef.current = tickSynth;
    masterRef.current = master;

    bass.triggerAttack("A1");

    const offBirths = bus.on("births", ({ indices, cols }) => {
      if (!synthRef.current) return;
      const now = performance.now();
      const counts = new Array(BANDS).fill(0);
      for (const idx of indices) {
        const x = idx % cols;
        const band = Math.min(BANDS - 1, Math.floor((x / cols) * BANDS));
        counts[band]++;
      }
      // Adaptive throttle: when births explode, slow note triggering down.
      const total = indices.length;
      const throttleMs = total > 200 ? 240 : total > 80 ? 160 : 110;
      for (let b = 0; b < BANDS; b++) {
        if (counts[b] === 0) continue;
        if (now - lastTriggerRef.current[b] < throttleMs) continue;
        lastTriggerRef.current[b] = now;
        const noteIdx = b + 2 + Math.floor(Math.random() * 3);
        const note = SCALE[Math.min(SCALE.length - 1, noteIdx)];
        const velocity = Math.min(0.7, 0.12 + counts[b] / 30);
        try {
          synthRef.current.triggerAttackRelease(note, "8n", undefined, velocity);
        } catch { /* polyphony overflow */ }
      }
    });

    const offDigit = bus.on("digit", (digit) => {
      if (!bassRef.current || !tickSynthRef.current) return;
      const note = BASS_BY_DIGIT[Math.min(BASS_BY_DIGIT.length - 1, 10 - digit)];
      // Re-trigger envelope so each digit drop is heard discretely.
      try {
        bassRef.current.triggerRelease();
        bassRef.current.triggerAttack(note, undefined, 0.85);
      } catch { /* ignore */ }
      // Percussive accent on the digit change.
      try {
        tickSynthRef.current.triggerAttackRelease("C5", "32n", undefined, 0.8);
      } catch { /* ignore */ }
    });

    const offBigBang = bus.on("bigbang", () => {
      if (!synthRef.current || !masterRef.current || !bassRef.current) return;
      try { bassRef.current.triggerRelease(); } catch { /* ignore */ }
      // Big chord swell.
      synthRef.current.triggerAttackRelease(
        ["A2", "E3", "A3", "C4", "E4", "A4", "C5", "E5", "A5"],
        "1n",
        undefined,
        0.7
      );
      const t = Tone.now();
      masterRef.current.gain.cancelScheduledValues(t);
      masterRef.current.gain.setValueAtTime(masterRef.current.gain.value, t);
      masterRef.current.gain.linearRampToValueAtTime(0.85, t + 0.15);
      masterRef.current.gain.linearRampToValueAtTime(0.32, t + 5);
    });

    return () => {
      offBirths();
      offDigit();
      offBigBang();
      try { bass.triggerRelease(); } catch { /* ignore */ }
      synth.dispose();
      bass.dispose();
      tickSynth.dispose();
      master.dispose();
      delay.dispose();
      reverb.dispose();
      filter.dispose();
      filterLfo.dispose();
      masterLfo.dispose();
    };
  }, [running]);

  useEffect(() => {
    if (masterRef.current) {
      masterRef.current.gain.rampTo(muted ? 0 : 0.45, 0.4);
    }
  }, [muted]);

  return null;
}
