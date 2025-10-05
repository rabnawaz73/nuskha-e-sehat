'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, AlertTriangle, Shield, UserPlus, MessageSquare, Annoyed, X, Siren } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";

const helplines = [
  { name: "Rescue 1122", number: "1122" },
  { name: "Edhi Ambulance", number: "115" },
  { name: "Sehat Sahulat Program", number: "0800-09009" },
];

const contacts = [
    { name: "Ahmad (Son)", number: "0300-1234567" },
    { name: "Dr. Fatima", number: "0333-9876543" },
];

export default function EmergencyPage() {
    const [listeningMode, setListeningMode] = useState(false);
    const [isTriggered, setIsTriggered] = useState(false);
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isTriggered && countdown > 0) {
            timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
        } else if (isTriggered && countdown === 0) {
            // Here you would trigger the actual SOS message sending
            console.log("SOS Sent!");
        }
        return () => clearTimeout(timer);
    }, [isTriggered, countdown]);

    const handleManualTrigger = () => {
        setIsTriggered(true);
        setCountdown(10);
    }
    
    const cancelSos = () => {
        setIsTriggered(false);
    }

  return (
    <div className="container mx-auto py-8">
       <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight font-headline text-destructive flex items-center justify-center gap-2">
            <Siren /> Emergency Mode
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
            Manually trigger an SOS or enable automatic shout detection for your safety.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Main Actions */}
        <div className="space-y-8">
             <Card className="border-destructive/50 bg-destructive/5 text-center">
                <CardHeader>
                    <CardTitle>Manual SOS Trigger</CardTitle>
                    <CardDescription>If you are in danger, press this button.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button 
                        variant="destructive" 
                        size="lg" 
                        className="h-24 w-full text-2xl rounded-2xl shadow-lg shadow-destructive/20 animate-pulse"
                        onClick={handleManualTrigger}
                    >
                       <Siren className="h-8 w-8 mr-4" /> SOS
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><AlertTriangle /> Important Helplines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                {helplines.map((helpline) => (
                    <div key={helpline.name} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                    <div>
                        <p className="font-bold">{helpline.name}</p>
                        <p className="text-muted-foreground text-lg font-mono">{helpline.number}</p>
                    </div>
                    <a href={`tel:${helpline.number}`}>
                        <Button>
                        <Phone className="mr-2 h-4 w-4" />
                        Call Now
                        </Button>
                    </a>
                    </div>
                ))}
                </CardContent>
            </Card>
        </div>

        {/* Right Side: Settings */}
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Shield /> Shout Detection Settings</CardTitle>
                <CardDescription>
                    Automatically detect emergency sounds like shouts when enabled. This feature requires microphone access.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label htmlFor="listening-mode" className="font-bold text-lg">
                        Enable Emergency Listening
                    </Label>
                    <Switch 
                        id="listening-mode" 
                        checked={listeningMode} 
                        onCheckedChange={setListeningMode} 
                        aria-label="Toggle emergency listening mode"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2"><UserPlus /> Trusted Contacts</Label>
                    <div className="space-y-2">
                        {contacts.map(contact => (
                             <div key={contact.name} className="flex items-center justify-between p-2 bg-secondary rounded-md text-sm">
                                <span>{contact.name}</span>
                                <span className="text-muted-foreground">{contact.number}</span>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="w-full">Add New Contact</Button>
                </div>

                <div className="space-y-2">
                     <Label htmlFor="sos-message" className="font-bold flex items-center gap-2"><MessageSquare /> Custom SOS Message</Label>
                     <Textarea id="sos-message" defaultValue="I need help! Please call me or send help to my location immediately." />
                </div>

                 <div className="space-y-2">
                     <Label htmlFor="sensitivity" className="font-bold flex items-center gap-2"><Annoyed /> Detection Sensitivity</Label>
                     <Slider id="sensitivity" defaultValue={[50]} max={100} step={10} />
                     <div className="flex justify-between text-xs text-muted-foreground">
                         <span>Shouts Only</span>
                         <span>Loud Noises</span>
                     </div>
                </div>
            </CardContent>
        </Card>
      </div>

       <AlertDialog open={isTriggered}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive text-2xl flex items-center gap-2"><Siren className="animate-ping"/> Emergency Detected!</AlertDialogTitle>
            <AlertDialogDescription>
                An SOS alert will be sent to your trusted contacts in {countdown} seconds with your live location.
            </AlertDialogDescription>
          </AlertDialogHeader>
            <Progress value={countdown * 10} className="w-full h-2 [&>div]:bg-destructive" />
            {countdown > 0 ? (
                 <AlertDialogFooter>
                    <Button variant="secondary" size="lg" className="w-full" onClick={cancelSos}>
                        <X className="mr-2" /> I am Safe (Cancel Alert)
                    </Button>
                </AlertDialogFooter>
            ) : (
                <div className="text-center p-4 rounded-lg bg-green-100 text-green-800">
                    <h3 className="font-bold">SOS Message Sent</h3>
                    <p>Your trusted contacts have been notified.</p>
                     <AlertDialogAction className="mt-4" onClick={() => setIsTriggered(false)}>Close</AlertDialogAction>
                </div>
            )}
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
