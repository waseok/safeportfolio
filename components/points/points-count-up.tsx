"use client";

import { useEffect, useRef, useState } from "react";

const COIN_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2000.m4a";

type Props = {
  value: number;
  duration?: number;
  playSound?: boolean;
  className?: string;
};

export function PointsCountUp({
  value,
  duration = 800,
  playSound = false,
  className = "",
}: Props) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (value === prevValue.current) return;
    const start = prevValue.current;
    const end = value;
    prevValue.current = value;

    if (playSound && end > start) {
      try {
        const audio = new Audio(COIN_SOUND_URL);
        audio.volume = 0.3;
        audio.play().catch(() => {});
        audioRef.current = audio;
      } catch {
        // ignore
      }
    }

    const startTime = performance.now();
    function tick(now: number) {
      const t = Math.min((now - startTime) / duration, 1);
      const easeOut = 1 - (1 - t) * (1 - t);
      setDisplay(Math.round(start + (end - start) * easeOut));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value, duration, playSound]);

  return <span className={className}>{display}</span>;
}
