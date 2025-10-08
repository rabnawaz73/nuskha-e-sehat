// LanguageSelector.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LANGS = ["Urdu", "Punjabi", "Pashto", "Sindhi", "Balochi", "Siraiki"] as const;
export type Language = typeof LANGS[number];

export function LanguageSelector({ value, onChange }: { value: Language; onChange: (l: Language) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {LANGS.map((l) => (
        <Button key={l} variant={value === l ? "default" : "outline"} size="sm" onClick={() => onChange(l)}>
          {l}
        </Button>
      ))}
    </div>
  );
}
