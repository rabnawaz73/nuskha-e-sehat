'use client';

import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Loader2, CheckCircle, Star } from "lucide-react";
import type { Voice } from '@/lib/voice-data';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Progress } from '../ui/progress';

interface VoiceCardProps {
    voice: Voice;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export function VoiceCard({ voice, isSelected, onSelect }: VoiceCardProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handlePlayPause = async () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            try {
                audio.currentTime = 0;
                await audio.play();
            } catch (error) {
                console.error("Audio playback error:", error);
                setIsPlaying(false);
            }
        }
    };

    return (
        <Card className={cn("flex flex-col", isSelected && "border-primary ring-2 ring-primary")}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-body text-xl">{voice.name}</CardTitle>
                        <CardDescription>{voice.provider}</CardDescription>
                    </div>
                    {isSelected && (
                        <Badge variant="default">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Selected
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between space-y-4">
                 <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5"><Star className="h-4 w-4 text-yellow-400 fill-current"/> Naturalness</label>
                    <div className="flex items-center gap-2">
                         <Progress value={voice.qualityScore * 10} className="w-full h-2" />
                         <span className="text-xs font-mono text-muted-foreground">{voice.qualityScore}/10</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button 
                        size="icon" 
                        variant="outline" 
                        onClick={handlePlayPause} 
                        disabled={isLoading}
                        className="flex-shrink-0"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : isPlaying ? <Pause /> : <Play />}
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        Test with: "<span className="italic">السلام علیکم، نُسخہِ صحت میں خوش آمدید</span>"
                    </div>
                </div>
                <Button onClick={() => onSelect(voice.id)} disabled={isSelected} className="w-full">
                    {isSelected ? 'Currently Selected' : 'Select this Voice'}
                </Button>
            </CardContent>
            <audio
                ref={audioRef}
                src={voice.demoUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onWaiting={() => setIsLoading(true)}
                onCanPlay={() => setIsLoading(false)}
                onError={(e) => {
                    console.error(`Error loading audio for voice: ${voice.name}`, e);
                    setIsLoading(false);
                    setIsPlaying(false);
                }}
                preload="none"
                className="hidden"
            />
        </Card>
    );
}
