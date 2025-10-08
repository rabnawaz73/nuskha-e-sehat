// VoiceVisualizer.tsx
import React from "react";

/**
 * Simple visualizer: receives level 0..1 and renders bars
 */
export function VoiceVisualizer({ level = 0 }: { level?: number }) {
  const bars = 20;
  const active = Math.round(level * bars);
  return (
    <div className="flex gap-0.5 items-end h-8">
      {Array.from({ length: bars }).map((_, i) => {
        const isActive = i < active;
        const h = 4 + Math.round((i / bars) * 22);
        return (
          <div
            key={i}
            className={`w-[3px] rounded-sm ${isActive ? "bg-primary" : "bg-slate-200"}`}
            style={{ height: `${h}px` }}
          />
        );
      })}
    </div>
  );
}
