'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { VoiceCard } from '@/components/dashboard/voice-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  User,
  Languages,
  BrainCircuit,
  Bell,
  Palette,
  Mic,
  LogOut,
  Save,
  UserPlus,
  Database,
  Info,
} from 'lucide-react';
import { mockVoices, type Language } from '@/lib/voice-data';
import { motion } from 'framer-motion';

type Prefs = {
  theme: 'light' | 'dark';
  language: Language;
  voiceId: string;
  aiLearning: boolean;
  notifications: boolean;
  saveHistory: boolean;
};

const DEFAULT_PREFS: Prefs = {
  theme: 'light',
  language: 'Urdu',
  voiceId: 'v_ur_aisha',
  aiLearning: true,
  notifications: true,
  saveHistory: true,
};

export default function SettingsPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();

  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const allLanguages = Array.from(new Set(mockVoices.map(v => v.language)));

  // Effect to handle loading and syncing preferences from Firestore or localStorage
  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (user) {
      // User is authenticated, sync with Firestore
      const settingsRef = doc(db, 'userPreferences', user.uid);
      const unsubscribe = onSnapshot(settingsRef, snapshot => {
        if (snapshot.exists()) {
          setPrefs({ ...DEFAULT_PREFS, ...snapshot.data() });
        } else {
          // No settings found, create default document
          setDoc(settingsRef, { ...DEFAULT_PREFS, lastUpdated: serverTimestamp() }).catch(err => {
            console.error('Failed to create default prefs:', err);
          });
          setPrefs(DEFAULT_PREFS);
        }
        setLoading(false);
      }, err => {
        console.error('Firestore onSnapshot error:', err);
        toast({ title: 'Error', description: 'Failed to load settings from cloud.' });
        setLoading(false);
      });
      return () => unsubscribe(); // Cleanup listener on unmount
    } else {
      // User not authenticated, use localStorage
      const localPrefs = localStorage.getItem('nuskha_prefs');
      if (localPrefs) {
        try {
          setPrefs(JSON.parse(localPrefs));
        } catch {
          setPrefs(DEFAULT_PREFS);
        }
      } else {
        setPrefs(DEFAULT_PREFS);
      }
      setLoading(false);
    }
  }, [user, authLoading, db, toast]);

  // Apply theme to the document body
  useEffect(() => {
    document.documentElement.classList.toggle('dark', prefs.theme === 'dark');
  }, [prefs.theme]);

  // Generic handler to update a preference and persist it
  const updatePref = useCallback(async (key: keyof Prefs, value: any) => {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs); // Optimistic UI update
    
    setSaving(true);
    try {
      if (user) {
        const settingsRef = doc(db, 'userPreferences', user.uid);
        await setDoc(settingsRef, { [key]: value, lastUpdated: serverTimestamp() }, { merge: true });
      } else {
        localStorage.setItem('nuskha_prefs', JSON.stringify(newPrefs));
      }
      toast({ title: 'Setting Saved', description: `Your ${key} preference has been updated.` });
    } catch (err) {
      console.error(`Failed to save pref ${key}:`, err);
      toast({ title: 'Save Failed', description: 'Could not save your setting.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }, [prefs, user, db, toast]);

  const handleLanguageChange = (language: Language) => {
    const firstVoice = mockVoices.find(v => v.language === language) || mockVoices[0];
    const newPrefs = { ...prefs, language, voiceId: firstVoice.id };
    setPrefs(newPrefs); // Optimistic update

    // Persist multiple changes
    setSaving(true);
    if (user) {
      const settingsRef = doc(db, 'userPreferences', user.uid);
      setDoc(settingsRef, { language, voiceId: firstVoice.id, lastUpdated: serverTimestamp() }, { merge: true })
        .catch(err => console.error('Failed to save language and voice:', err));
    } else {
      localStorage.setItem('nuskha_prefs', JSON.stringify(newPrefs));
    }
    setSaving(false);
  }

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast({ title: 'Signed out', description: 'You have been logged out.' });
    } catch (err: any) {
      toast({ title: 'Sign out failed', description: err?.message ?? 'An error occurred', variant: 'destructive' });
    }
  };

  const filteredVoices = mockVoices.filter(v => v.language === prefs.language);

  if (loading) {
      return <div>Loading settings...</div>; // Or a skeleton loader
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Fine-tune your Nuskha-e-Sehat experience.</p>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div layout className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><User /> Profile</CardTitle>
                <CardDescription>Manage your account details.</CardDescription>
              </div>
               <Button variant="ghost" onClick={handleLogout} className="text-destructive hover:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </Button>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.photoURL || `https://i.pravatar.cc/150?u=${user?.uid || 'guest'}`} />
                <AvatarFallback>{user?.displayName?.[0] ?? 'G'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">{user?.displayName || 'Guest User'}</p>
                <p className="text-muted-foreground text-sm">{user?.email ?? 'Not signed in. Settings are saved locally.'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Languages /> Language & Voice</CardTitle>
              <CardDescription>Pick the language and voice for your AI assistant.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-bold">Primary Language</Label>
                  <Select value={prefs.language} onValueChange={(v: Language) => handleLanguageChange(v)}>
                    <SelectTrigger className="w-full mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {allLanguages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-bold">Voice</Label>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredVoices.map(v => (
                      <VoiceCard
                        key={v.id}
                        voice={v}
                        isSelected={prefs.voiceId === v.id}
                        onSelect={() => updatePref('voiceId', v.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BrainCircuit /> AI & Data</CardTitle>
              <CardDescription>Control what the AI learns and stores.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="aiLearning" className="font-medium">Allow AI to learn from my usage</Label>
                  <p className="text-sm text-muted-foreground">Improves suggestions over time.</p>
                </div>
                <Switch id="aiLearning" checked={prefs.aiLearning} onCheckedChange={(v) => updatePref('aiLearning', v)} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="saveHistory" className="font-medium">Save conversation history</Label>
                  <p className="text-sm text-muted-foreground">Stores transcripts in your account.</p>
                </div>
                <Switch id="saveHistory" checked={prefs.saveHistory} onCheckedChange={(v) => updatePref('saveHistory', v)} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div layout className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Palette /> Appearance & Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Dark mode</Label>
                <Switch checked={prefs.theme === 'dark'} onCheckedChange={(v) => updatePref('theme', v ? 'dark' : 'light')} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label>Push Notifications</Label>
                <Switch checked={prefs.notifications} onCheckedChange={(v) => updatePref('notifications', v)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserPlus /> Emergency Contacts</CardTitle>
                <CardDescription>Add contacts for SOS alerts.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="outline" className="w-full" onClick={() => toast({title: 'Coming Soon!'})}>Manage Contacts</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Info /> About</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between"><span>Version</span><span className="text-muted-foreground">1.2.0</span></div>
              <div className="flex justify-between"><span>Build</span><span className="text-muted-foreground">20240523</span></div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
