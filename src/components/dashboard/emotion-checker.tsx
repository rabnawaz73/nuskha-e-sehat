'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Mic, Loader2, VideoOff, Smile, Frown, Zap, PersonStanding, Wind, Coffee, BookOpen, Quote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { getEmotionFromMedia, getAdviceForMood } from '@/app/dashboard/actions';
import type { GetMoodAdviceOutput } from '@/ai/flows/get-mood-advice-flow';
import type { Emotion } from '@/ai/types/emotion';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const moodData = [
  { mood: "Happy", count: 4 },
  { mood: "Sad", count: 1 },
  { mood: "Stressed", count: 2 },
  { mood: "Tired", count: 3 },
  { mood: "Calm", count: 5 },
]

type Status = 'idle' | 'capturing' | 'analyzing' | 'result';

type EmotionUI = {
    icon: React.ReactNode;
    color: string;
    label: string;
};

const emotionMap: Record<Emotion, EmotionUI> = {
    Happy: { icon: <Smile className="h-12 w-12" />, color: 'text-yellow-500', label: 'Happy' },
    Sad: { icon: <Frown className="h-12 w-12" />, color: 'text-blue-500', label: 'Sad' },
    Stressed: { icon: <Zap className="h-12 w-12" />, color: 'text-red-500', label: 'Stressed' },
    Tired: { icon: <Coffee className="h-12 w-12" />, color: 'text-gray-500', label: 'Tired' },
    Calm: { icon: <Wind className="h-12 w-12" />, color: 'text-green-500', label: 'Calm' },
    Neutral: { icon: <PersonStanding className="h-12 w-12" />, color: 'text-purple-500', label: 'Neutral' },
};

const actionIcons: { [key: string]: React.ReactNode } = {
    'breathing': <Wind />,
    'walk': <PersonStanding />,
    'tea': <Coffee />,
    'grateful': <BookOpen />,
    'talk': <Mic />,
};

const getActionIcon = (tip: string) => {
    const lowerTip = tip.toLowerCase();
    if (lowerTip.includes('breathing') || lowerTip.includes('saans')) return actionIcons.breathing;
    if (lowerTip.includes('walk') || lowerTip.includes('chalein')) return actionIcons.walk;
    if (lowerTip.includes('tea') || lowerTip.includes('chai')) return actionIcons.tea;
    if (lowerTip.includes('grateful') || lowerTip.includes('shukr')) return actionIcons.grateful;
    if (lowerTip.includes('talk') || lowerTip.includes('baat')) return actionIcons.talk;
    return <Zap />;
}


export default function EmotionChecker() {
    const [status, setStatus] = useState<Status>('idle');
    const [advice, setAdvice] = useState<GetMoodAdviceOutput | null>(null);
    const [detectedEmotion, setDetectedEmotion] = useState<Emotion | null>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (status !== 'capturing') {
             if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            }
        }
    }, [status]);

    const handleStartCapture = async () => {
        setStatus('capturing');
        setAdvice(null);
        setDetectedEmotion(null);
        if (typeof window !== 'undefined' && navigator.mediaDevices) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                setHasCameraPermission(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Camera Access Denied',
                    description: 'Please enable camera permissions in your browser settings to use this feature.',
                });
                setStatus('idle');
            }
        } else {
            setHasCameraPermission(false);
            setStatus('idle');
        }
    };
    
    const handleAnalyze = async (type: 'image' | 'audio') => {
        let mediaUri: string | undefined;

        if (type === 'image') {
            if (!videoRef.current || !videoRef.current.srcObject) {
                toast({ variant: 'destructive', title: 'Camera not ready' });
                return;
            }
            setStatus('analyzing');

            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                mediaUri = canvas.toDataURL('image/jpeg');
            }
        } else {
            // Placeholder for voice recording logic
            toast({ title: "Voice check coming soon!", description: "For now, we'll analyze a sample audio." });
            mediaUri = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"; // dummy audio
            setStatus('analyzing');
        }


        if (!mediaUri) {
            setStatus('idle');
            return;
        }

        const emotionResponse = await getEmotionFromMedia({ selfieDataUri: mediaUri, userLang: 'ur' });
        if (emotionResponse.success && emotionResponse.data) {
            setDetectedEmotion(emotionResponse.data.emotion as Emotion);
            const adviceResponse = await getAdviceForMood({ emotion: emotionResponse.data.emotion as Emotion, user_lang: 'ur' });
            if (adviceResponse.success && adviceResponse.data) {
                setAdvice(adviceResponse.data);
                setStatus('result');
            } else {
                 toast({ variant: 'destructive', title: 'Could not get advice', description: "The advice could not be retrieved." });
                 setStatus('idle');
            }
        } else {
             toast({ variant: 'destructive', title: 'Analysis Failed', description: "The analysis failed to complete." });
             setStatus('idle');
        }
    };

    const renderIdle = () => (
         <Card className="w-full max-w-lg mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-3xl">How are you feeling today?</CardTitle>
                <CardDescription>Get instant wellness tips based on your current mood.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Button onClick={() => handleAnalyze('audio')} variant="outline" className="h-24 flex-col gap-2 text-lg">
                    <Mic className="h-8 w-8" />
                    Voice Check
                </Button>
                <Button onClick={handleStartCapture} className="h-24 flex-col gap-2 text-lg">
                    <Camera className="h-8 w-8" />
                    Selfie Check
                </Button>
            </CardContent>
        </Card>
    );

     const renderCapturing = () => (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="font-headline">Center Your Face</CardTitle>
                <CardDescription>Look at the camera with a natural expression.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="w-full aspect-[4/3] rounded-lg bg-black overflow-hidden relative flex items-center justify-center">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                    {hasCameraPermission === null && <Loader2 className="h-12 w-12 text-white animate-spin absolute" />}
                    {hasCameraPermission === false && (
                        <div className="absolute inset-0 p-4">
                            <Alert variant="destructive">
                                <VideoOff className="h-4 w-4" />
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>Please allow camera access to use this feature.</AlertDescription>
                            </Alert>
                        </div>
                    )}
                </div>
                <div className="flex gap-4">
                    <Button onClick={() => setStatus('idle')} variant="outline" className="w-full">Cancel</Button>
                    <Button onClick={() => handleAnalyze('image')} className="w-full" disabled={!hasCameraPermission}>Analyze Selfie</Button>
                </div>
            </CardContent>
        </Card>
    );
    
    const renderAnalyzing = () => (
        <Card className="w-full max-w-lg mx-auto text-center">
            <CardHeader>
                <CardTitle className="font-body">Analyzing...</CardTitle>
                <CardDescription>Our AI is checking your submission.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 py-12">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p>This may take a moment.</p>
            </CardContent>
        </Card>
    );

    const renderResult = () => {
        if (!advice || !detectedEmotion) return null;
        const emotionInfo = emotionMap[detectedEmotion];

        return (
            <div className="w-full max-w-2xl mx-auto space-y-6">
                <Card className={cn("text-center transition-all duration-500", `bg-${emotionInfo.color.split('-')[1]}-50 dark:bg-${emotionInfo.color.split('-')[1]}-900/20`)}>
                     <CardHeader>
                        <div className={cn("text-7xl mx-auto mb-4", emotionInfo.color)}>
                            {emotionInfo.icon}
                        </div>
                        <CardTitle className="font-headline text-4xl">{advice.greeting}</CardTitle>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="p-4 bg-background/50 rounded-lg border">
                           <h4 className="font-bold font-body mb-2 text-primary">Here are a few tips:</h4>
                           <ul className="space-y-2 text-left">
                            {advice.tips.map((tip, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="p-1 bg-primary/10 text-primary rounded-full mt-1">
                                        {getActionIcon(tip)}
                                    </div>
                                    <span className="text-muted-foreground">{tip}</span>
                                </li>
                            ))}
                           </ul>
                        </div>
                         <div className="p-4 bg-accent/20 rounded-lg border-l-4 border-accent">
                           <h4 className="font-bold font-body flex items-center gap-2"><Quote className="h-5 w-5"/> Daily Affirmation</h4>
                           <p className="text-muted-foreground mt-1 text-lg italic">"{advice.affirmation}"</p>
                        </div>
                    </CardContent>
                </Card>
                 <Button onClick={() => setStatus('idle')} variant="outline" className="w-full">Check Again</Button>
            </div>
        )
    };


    return (
        <div className="container mx-auto py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {status === 'idle' && renderIdle()}
                    {status === 'capturing' && renderCapturing()}
                    {status === 'analyzing' && renderAnalyzing()}
                    {status === 'result' && renderResult()}
                </div>
                 <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-body">Your Mood This Week</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={moodData} layout="vertical" margin={{ left: -10 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="mood" type="category" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 14 }} />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="hsl(var(--primary))" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
