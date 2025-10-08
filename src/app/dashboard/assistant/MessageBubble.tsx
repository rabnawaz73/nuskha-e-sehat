// MessageBubble.tsx
import React from "react";
import { format } from "date-fns";
import Image from "next/image";
import { Volume2, Mic, User as UserIcon, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
  audioDataUri?: string | null;
  photoDataUri?: string | null;
  isStreaming?: boolean;
  timestamp: string | Date;
};

export function MessageBubble({
  msg,
  onPlayAudio,
  isPlaying,
}: {
  msg: Message;
  onPlayAudio?: (m: Message) => void;
  isPlaying?: boolean;
}) {
  const isAssistant = msg.role === "assistant";
  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"} gap-3`}>
      {isAssistant && (
        <div className="flex-shrink-0 p-2 bg-primary rounded-full text-white self-start">
          <Stethoscope className="h-5 w-5" />
        </div>
      )}

      <div className={`${isAssistant ? "bg-white rounded-bl-none" : "bg-green-50 rounded-br-none"} px-4 py-3 shadow-sm max-w-[80%]`}>
        <div className="space-y-2">
          {msg.text && <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-800">{msg.text}</div>}
          {msg.photoDataUri && (
            <div className="mt-2">
              <Image src={msg.photoDataUri} alt="attachment" width={240} height={160} className="rounded-md object-cover" />
            </div>
          )}
          {msg.audioDataUri && (
            <div className="flex items-center gap-2 mt-2">
              <Button variant="ghost" size="icon" onClick={() => onPlayAudio?.(msg)}>
                <Volume2 className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground">{isPlaying ? "Playing..." : "Play audio"}</span>
            </div>
          )}

          {msg.isStreaming && <div className="text-xs text-muted-foreground">Thinking…</div>}
        </div>
        <div className="mt-2 text-xs text-slate-400 flex justify-between items-center">
          <span>{format(new Date(msg.timestamp), "p")}</span>
        </div>
      </div>

      {!isAssistant && (
        <div className="flex-shrink-0 p-2 bg-slate-200 rounded-full text-slate-600 self-start">
          <UserIcon className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
