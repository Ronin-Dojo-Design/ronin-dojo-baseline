"use client";

import { useEffect, useState } from "react";

/**
 * Hero visual: a steel building rendered as inline SVG (no binary asset needed
 * for the MVP) with a faded floor-reflection "mirror" beneath it (Desi §6).
 * The reflection is decorative and aria-hidden. Real photography drops in later.
 */
function BuildingMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 180"
      className={className}
      role="img"
      aria-label="Pre-engineered metal building"
    >
      <defs>
        <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a4048" />
          <stop offset="1" stopColor="#23272d" />
        </linearGradient>
      </defs>
      {/* gable roof */}
      <polygon points="40,70 160,28 280,70 280,80 160,40 40,80" fill="var(--primary)" />
      {/* body */}
      <rect x="40" y="78" width="240" height="86" fill="url(#steel)" />
      {/* ribbing */}
      {Array.from({ length: 11 }).map((_, i) => (
        <line
          key={i}
          x1={52 + i * 22}
          y1="80"
          x2={52 + i * 22}
          y2="164"
          stroke="#171a1e"
          strokeWidth="1.5"
        />
      ))}
      {/* roll-up door */}
      <rect x="120" y="112" width="52" height="52" fill="#15171a" stroke="var(--primary)" strokeWidth="2" />
      {/* entry */}
      <rect x="196" y="124" width="26" height="40" fill="#15171a" stroke="#3a4048" strokeWidth="1.5" />
      {/* eave trim */}
      <rect x="40" y="76" width="240" height="4" fill="var(--primary-deep)" />
    </svg>
  );
}

export function MirrorVisual() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="select-none">
      <BuildingMark className="w-full" />
      <div className="-mt-1 overflow-hidden" aria-hidden="true">
        <BuildingMark className={`mirror-reflect w-full ${loaded ? "is-visible" : ""}`} />
      </div>
    </div>
  );
}
