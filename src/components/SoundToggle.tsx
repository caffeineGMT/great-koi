"use client";

import { useState, useEffect, useRef } from "react";

export default function SoundToggle() {
  const [playing, setPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ gains: GainNode[]; oscillators: OscillatorNode[] }>({
    gains: [],
    oscillators: [],
  });

  useEffect(() => {
    return () => {
      nodesRef.current.oscillators.forEach((o) => {
        try { o.stop(); } catch { /* already stopped */ }
      });
      audioCtxRef.current?.close();
    };
  }, []);

  const startAmbient = () => {
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.15;
    masterGain.connect(ctx.destination);

    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    // Deep water drone
    const drone = ctx.createOscillator();
    drone.type = "sine";
    drone.frequency.value = 60;
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.3;
    drone.connect(droneGain).connect(masterGain);
    drone.start();
    oscillators.push(drone);
    gains.push(droneGain);

    // Gentle wave modulation
    const wave = ctx.createOscillator();
    wave.type = "sine";
    wave.frequency.value = 0.2;
    const waveGain = ctx.createGain();
    waveGain.gain.value = 20;
    wave.connect(waveGain).connect(drone.frequency);
    wave.start();
    oscillators.push(wave);
    gains.push(waveGain);

    // High shimmer
    const shimmer = ctx.createOscillator();
    shimmer.type = "sine";
    shimmer.frequency.value = 440;
    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0.02;
    shimmer.connect(shimmerGain).connect(masterGain);
    shimmer.start();
    oscillators.push(shimmer);
    gains.push(shimmerGain);

    // Shimmer LFO
    const shimmerLfo = ctx.createOscillator();
    shimmerLfo.type = "sine";
    shimmerLfo.frequency.value = 0.1;
    const shimmerLfoGain = ctx.createGain();
    shimmerLfoGain.gain.value = 0.02;
    shimmerLfo.connect(shimmerLfoGain).connect(shimmerGain.gain);
    shimmerLfo.start();
    oscillators.push(shimmerLfo);
    gains.push(shimmerLfoGain);

    // Gentle wind (filtered noise via oscillator)
    const wind = ctx.createOscillator();
    wind.type = "triangle";
    wind.frequency.value = 120;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.08;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = "lowpass";
    windFilter.frequency.value = 200;
    wind.connect(windFilter).connect(windGain).connect(masterGain);
    wind.start();
    oscillators.push(wind);
    gains.push(windGain);

    nodesRef.current = { gains, oscillators };
  };

  const stopAmbient = () => {
    nodesRef.current.oscillators.forEach((o) => {
      try { o.stop(); } catch { /* */ }
    });
    nodesRef.current = { gains: [], oscillators: [] };
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
  };

  const toggle = () => {
    if (playing) {
      stopAmbient();
    } else {
      startAmbient();
    }
    setPlaying(!playing);
  };

  return (
    <button
      onClick={toggle}
      className="absolute bottom-8 sm:bottom-12 right-4 sm:right-6 z-30
        w-10 h-10 sm:w-12 sm:h-12 rounded-full glass
        flex items-center justify-center
        text-[var(--gold-light)] text-lg sm:text-xl
        hover:bg-opacity-80 transition-all cursor-pointer select-none"
      title={playing ? "Mute sounds" : "Play ambient sounds"}
    >
      {playing ? "\u{1F50A}" : "\u{1F507}"}
    </button>
  );
}
