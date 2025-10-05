'use client';

import { useState } from 'react';
import { mockVoices, type Voice, type Language } from '@/lib/voice-data';
import { VoiceCard } from '@/components/dashboard/voice-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

const allLanguages = Array.from(new Set(mockVoices.map(v => v.language)));

export default function VoiceLibraryPage() {
    const [selectedLanguage, setSelectedLanguage] = useState<Language>('Urdu');
    const [selectedVoice, setSelectedVoice] = useState<string | null>('v_ur_aisha');

    const filteredVoices = mockVoices.filter(voice => voice.language === selectedLanguage);

    return (
        <div className="container mx-auto py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                    <Sparkles className="text-primary" /> AI Voice Library
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                    Choose the voice for your AI health assistant. Find the one that sounds most natural and clear to you.
                </p>
            </header>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="font-body">Select a Language</CardTitle>
                </CardHeader>
                 <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {allLanguages.map(lang => (
                            <Button
                                key={lang}
                                variant={selectedLanguage === lang ? 'default' : 'outline'}
                                onClick={() => setSelectedLanguage(lang)}
                            >
                                {lang}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVoices.map(voice => (
                    <VoiceCard 
                        key={voice.id}
                        voice={voice}
                        isSelected={selectedVoice === voice.id}
                        onSelect={() => setSelectedVoice(voice.id)}
                    />
                ))}
            </div>
             {filteredVoices.length === 0 && (
                <div className="text-center py-10 col-span-full">
                    <p className="text-muted-foreground">No voices available for {selectedLanguage} yet. Check back later!</p>
                </div>
            )}
        </div>
    );
}
