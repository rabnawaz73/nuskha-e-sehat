// AssistantHeader.tsx
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export function AssistantHeader({ name = "Dr. Sehat", onOpenSettings }: { name?: string; onOpenSettings?: () => void }) {
  return (
    <div className="flex items-center justify-between border-b py-3 px-4 bg-white">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src="/doctor-avatar.png" alt={name} />
          <AvatarFallback>{name?.[0] ?? "D"}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-xs text-muted-foreground">AI Health Assistant • Local language supported</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onOpenSettings} aria-label="Assistant settings">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
