'use client';

import { useState } from 'react';
import { mockVoices, type Voice, type Language } from '@/lib/voice-data';
import { VoiceCard } from '@/components/dashboard/voice-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Bell, Database, HelpCircle, UserPlus, Sparkles, Languages, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const allLanguages = Array.from(new Set(mockVoices.map(v => v.language)));

const contacts = [
    { name: "Ahmad (Son)", number: "0300-1234567" },
    { name: "Dr. Fatima", number: "0333-9876543" },
];

export default function SettingsPage() {
    const [selectedLanguage, setSelectedLanguage] = useState<Language>('Urdu');
    const [selectedVoice, setSelectedVoice] = useState<string | null>('v_ur_aisha');

    const filteredVoices = mockVoices.filter(voice => voice.language === selectedLanguage);

    return (
        <div className="container mx-auto py-8">
            <header className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight font-headline">Settings</h1>
                <p className="text-muted-foreground">Manage your profile, preferences, and app settings.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side: Settings Categories */}
                <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-body flex items-center gap-2"><User /> Your Profile</CardTitle>
                        </CardHeader>
                         <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" defaultValue="Amina Ahmed" />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="age">Age</Label>
                                    <Input id="age" type="number" defaultValue="45" />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="gender">Gender</Label>
                                    <Select defaultValue="female">
                                        <SelectTrigger id="gender">
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                             <Button className="w-full">Save Changes</Button>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-body flex items-center gap-2"><UserPlus /> Emergency Contacts</CardTitle>
                             <CardDescription>These contacts will be alerted in an emergency.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                             {contacts.map(contact => (
                                <div key={contact.name} className="flex items-center justify-between p-2 bg-secondary rounded-md text-sm">
                                    <span>{contact.name}</span>
                                    <span className="text-muted-foreground">{contact.number}</span>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full">Manage Contacts</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-body flex items-center gap-2"><Database /> Data Management</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                             <Button variant="outline" className="w-full justify-between">Export Health Report <ChevronRight /></Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full justify-between">Clear All Data <ChevronRight /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your entire health timeline, saved preferences, and other data.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction>Yes, delete my data</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </div>

                {/* Right side: Voice Library and other settings */}
                <div className="lg:col-span-2 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-3xl flex items-center gap-2">
                                <Sparkles className="text-primary" /> AI Voice Library
                            </CardTitle>
                            <CardDescription>
                                Choose the voice for your AI health assistant that sounds most natural and clear to you.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label className="font-bold font-body text-base flex items-center gap-2 mb-2"><Languages /> Select Language</Label>
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
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredVoices.map(voice => (
                                    <VoiceCard 
                                        key={voice.id}
                                        voice={voice}
                                        isSelected={selectedVoice === voice.id}
                                        onSelect={() => setSelectedVoice(voice.id)}
                                    />
                                ))}
                                {filteredVoices.length === 0 && (
                                    <div className="text-center py-10 col-span-full">
                                        <p className="text-muted-foreground">No voices available for {selectedLanguage} yet. Check back later!</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}