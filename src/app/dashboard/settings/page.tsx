'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/firebase'
import { useToast } from '@/hooks/use-toast'
import { VoiceCard } from '@/components/dashboard/voice-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  User,
  Languages,
  BrainCircuit,
  Bell,
  Shield,
  Database,
  Info,
  Palette,
  Mic,
  LogOut,
  Save,
  UserPlus,
} from 'lucide-react'
import { mockVoices, type Language } from '@/lib/voice-data'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { toast } = useToast()
  const auth = useAuth()

  const [user, setUser] = useState<any>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [language, setLanguage] = useState<Language>('Urdu')
  const [voiceId, setVoiceId] = useState<string>('v_ur_aisha')
  const [aiLearning, setAiLearning] = useState<boolean>(true)
  const [notifications, setNotifications] = useState<boolean>(true)

  // Load from localStorage
  useEffect(() => {
    const savedPrefs = localStorage.getItem('nuskha_prefs')
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs)
      setTheme(prefs.theme || 'light')
      setLanguage(prefs.language || 'Urdu')
      setVoiceId(prefs.voiceId || 'v_ur_aisha')
      setAiLearning(prefs.aiLearning ?? true)
      setNotifications(prefs.notifications ?? true)
    }

    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [auth])

  const handleSave = () => {
    const prefs = { theme, language, voiceId, aiLearning, notifications }
    localStorage.setItem('nuskha_prefs', JSON.stringify(prefs))
    toast({
      title: '✅ Preferences Saved',
      description: 'Your settings were saved successfully.',
    })
  }

  const handleLogout = async () => {
    await auth.signOut()
    toast({
      title: 'Signed out',
      description: 'You have been logged out of Nuskha-e-Sehat.',
    })
  }

  const filteredVoices = mockVoices.filter(v => v.language === language)

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-lg">
          Manage your preferences, profile, and personalization.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT: Profile + AI + Language */}
        <div className="lg:col-span-2 space-y-8">

          {/* User Profile */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-body flex items-center gap-2">
                  <User /> Profile Information
                </CardTitle>
                <CardDescription>Manage your profile connected via Firebase Auth.</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <UserPlus className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.photoURL || 'https://picsum.photos/100'} />
                <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">{user?.displayName || 'Anonymous User'}</p>
                <p className="text-muted-foreground text-sm">{user?.email || 'Not logged in'}</p>
              </div>
              <Button variant="ghost" onClick={handleLogout} className="ml-auto text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </CardContent>
          </Card>

          {/* Language & Voice */}
          <Card>
            <CardHeader>
              <CardTitle className="font-body flex items-center gap-2">
                <Languages /> Language & Voice
              </CardTitle>
              <CardDescription>
                Choose your assistant’s speaking language and voice.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Language</Label>
                <Select value={language} onValueChange={(v: Language) => setLanguage(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...new Set(mockVoices.map(v => v.language))].map(lang => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredVoices.map(voice => (
                  <VoiceCard
                    key={voice.id}
                    voice={voice}
                    isSelected={voiceId === voice.id}
                    onSelect={() => setVoiceId(voice.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Personalization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit /> AI Personalization
              </CardTitle>
              <CardDescription>
                Control how your AI assistant learns and adapts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center border p-4 rounded-lg">
                <Label>
                  Allow AI to learn my habits
                  <p className="text-sm text-muted-foreground">
                    AI tailors advice based on your health history.
                  </p>
                </Label>
                <Switch checked={aiLearning} onCheckedChange={setAiLearning} />
              </div>
              <Button variant="outline">Reset Learning Data</Button>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Preferences + Data + Info */}
        <div className="lg:col-span-1 space-y-8 sticky top-8">

          {/* Theme & Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette /> Preferences
              </CardTitle>
              <CardDescription>Choose theme and notification settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Dark Mode</Label>
                <Switch checked={theme === 'dark'} onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
              </div>
              <div className="flex justify-between items-center">
                <Label>Enable Notifications</Label>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </CardContent>
          </Card>

          {/* Data & Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database /> Data & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full">
                Export Health Report
              </Button>
              <Button variant="destructive" className="w-full">
                Clear All My Data
              </Button>
            </CardContent>
          </Card>

          {/* App Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info /> App Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span>Version</span> <span>v1.2.0</span>
              </p>
              <Separator />
              <p className="italic text-muted-foreground">
                “Empowering every Pakistani with AI-powered healthcare knowledge.”
              </p>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" className="w-full">Rate App</Button>
                <Button variant="outline" className="w-full">Share</Button>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} className="w-full shadow-md">
            <Save className="mr-2 h-4 w-4" /> Save All Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
