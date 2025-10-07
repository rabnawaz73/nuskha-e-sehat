'use client';

import { useState } from 'react';
import { mockVoices, type Voice, type Language } from '@/lib/voice-data';
import { VoiceCard } from '@/components/dashboard/voice-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Bell, Database, HelpCircle, UserPlus, Sparkles, Languages, ChevronRight, Shield, Palette, BrainCircuit, Info, Edit, LogOut } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

const allLanguages = Array.from(new Set(mockVoices.map(v => v.language)));

const contacts = [
    { name: "Ahmad (Son)", number: "0300-1234567" },
    { name: "Dr. Fatima", number: "0333-9876543" },
];

// Mock user data, in a real app this would come from Firebase Auth
const mockUser = {
    displayName: "Amina Ahmed",
    email: "amina.ahmed@example.com",
    photoURL: "https://picsum.photos/seed/user/100/100",
    age: 45,
    gender: 'female',
};

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left side: Main settings */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Profile Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                           <div>
                             <CardTitle className="font-body flex items-center gap-2"><User /> Your Profile</CardTitle>
                             <CardDescription>Manage your personal information.</CardDescription>
                           </div>
                           <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4"/>Edit Profile</Button>
                        </CardHeader>
                         <CardContent className="flex items-center space-x-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={mockUser.photoURL} alt={mockUser.displayName} />
                                <AvatarFallback>{mockUser.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold text-lg">{mockUser.displayName}</p>
                                <p className="text-sm text-muted-foreground">{mockUser.email}</p>
                                <p className="text-xs text-muted-foreground mt-1">{mockUser.age} years old, {mockUser.gender}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Language & Voice Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-body flex items-center gap-2"><Languages /> Language & Voice</CardTitle>
                            <CardDescription>
                                Choose the language and voice for your AI health assistant.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div>
                                <Label className="font-bold text-base mb-2">Select Language</Label>
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
                                        <p className="text-muted-foreground">No voices available for {selectedLanguage} yet.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Personalization Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-body flex items-center gap-2"><BrainCircuit /> AI Personalization</CardTitle>
                            <CardDescription>Control how the AI learns from your interactions.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <Label htmlFor="ai-learning" className="font-medium">
                                    Allow AI to Learn My Habits
                                    <p className="text-sm text-muted-foreground">Adapts to your frequent symptoms and medicines.</p>
                                </Label>
                                <Switch id="ai-learning" defaultChecked/>
                            </div>
                             <Button variant="outline">Reset AI Learning History</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right side: Other settings */}
                <div className="lg:col-span-1 space-y-8 sticky top-8">
                    {/* Emergency Contacts Card */}
                    <Card className="border-destructive/20 bg-destructive/5">
                        <CardHeader>
                            <CardTitle className="font-body flex items-center gap-2 text-destructive"><Shield /> Emergency Settings</CardTitle>
                             <CardDescription className="text-destructive/80">Manage your SOS contacts and alerts.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             {contacts.map(contact => (
                                <div key={contact.name} className="flex items-center justify-between p-2 bg-background/50 rounded-md text-sm">
                                    <span>{contact.name}</span>
                                    <span className="text-muted-foreground">{contact.number}</span>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full">Manage Contacts</Button>
                            <div className="flex items-center justify-between rounded-lg border p-3 bg-background/50">
                                <Label htmlFor="shout-detection" className="font-medium">
                                   Enable Shout Detection
                                </Label>
                                <Switch id="shout-detection" />
                            </div>
                            <Button variant="destructive" className="w-full">Send Test Alert</Button>
                        </CardContent>
                    </Card>
                    
                    {/* Data Management Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-body flex items-center gap-2"><Database /> Data & Privacy</CardTitle>
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

                     {/* App Info Card */}
                    <Card>
                        <CardHeader>
                             <CardTitle className="font-body flex items-center gap-2"><Info /> App Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                           <div className="flex justify-between items-center">
                               <span>App Version</span>
                               <span className="text-muted-foreground">1.0.0</span>
                           </div>
                           <Separator />
                           <p className="text-muted-foreground italic">"Empowering every Pakistani with accessible, AI-powered healthcare knowledge."</p>
                           <div className="flex gap-2">
                             <Button variant="outline" className="w-full">Rate App</Button>
                             <Button variant="outline" className="w-full">Share</Button>
                           </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
