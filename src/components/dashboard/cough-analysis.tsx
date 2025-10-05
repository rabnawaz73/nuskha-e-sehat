'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Waves, Loader2, AlertTriangle, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';
import { Progress } from '../ui/progress';
import { analyzeCough } from '@/app/dashboard/actions';
import type { CoughAnalysisOutput } from '@/ai/flows/cough-analysis-flow';
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

type Status = 'idle' | 'recording' | 'analyzing' | 'result';

const soundTypeIcons: Record<string, string> = {
    'Dry-like cough': '🌬️',
    'Wet-like cough': '💧',
    'Prolonged cough with breathing difficulty': '🫁',
}

export default function CoughAnalysis() {
    const [status, setStatus] = useState<Status>('idle');
    const [result, setResult] = useState<CoughAnalysisOutput | null>(null);
    const [isConsentOpen, setIsConsentOpen] = useState(false);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const { toast } = useToast();

    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
             if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                mediaRecorderRef.current.stop();
            }
            if(audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, []);

    const drawWaveform = () => {
        if (!analyserRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext('2d');
        const analyser = analyserRef.current;

        if (!canvasCtx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);
            analyser.getByteTimeDomainData(dataArray);

            canvasCtx.fillStyle = 'hsl(var(--background))';
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
            canvasCtx.lineWidth = 3;
            canvasCtx.strokeStyle = 'hsl(var(--primary))';
            canvasCtx.beginPath();

            const sliceWidth = canvas.width * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * canvas.height / 2;

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }
                x += sliceWidth;
            }

            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();
        };
        draw();
    };

    const startRecording = async () => {
        setIsConsentOpen(false); // Close dialog on proceed
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setStatus('recording');

            if (!audioContextRef.current) {
                 audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
           
            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            drawWaveform();

            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = handleStopRecording;
            mediaRecorderRef.current.start();

            setTimeout(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                    mediaRecorderRef.current.stop();
                }
            }, 5000);

        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Microphone Error',
                description: 'Could not access the microphone. Please check permissions.',
            });
            setStatus('idle');
        }
    };

    const handleStopRecording = async () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
       
        setStatus('analyzing');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const audioDataUri = reader.result as string;
            const response = await analyzeCough(audioDataUri);

            if(response.success && response.data) {
                setResult(response.data);
                setStatus('result');
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Analysis Failed',
                    description: response.error || 'Could not analyze the audio.'
                });
                setStatus('idle');
            }
        };
    };

    const reset = () => {
        setStatus('idle');
        setResult(null);
    }

    const renderIdle = () => (
         <Card className="w-full max-w-lg mx-auto text-center">
            <CardHeader>
                <CardTitle className="font-headline text-3xl">🎤 Record Your Cough</CardTitle>
                <CardDescription>Get informational guidance by recording your cough for 5 seconds.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                 <AlertDialog open={isConsentOpen} onOpenChange={setIsConsentOpen}>
                    <AlertDialogTrigger asChild>
                         <Button 
                            size="lg" 
                            className="w-32 h-32 rounded-full shadow-lg"
                        >
                            <Mic className="h-16 w-16" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Quick Check (Demo Mode)</AlertDialogTitle>
                        <AlertDialogDescription>
                           This tool is not a medical diagnosis. It analyzes audio and offers informational guidance. If you are having severe symptoms (chest pain, trouble breathing, persistent fever), call emergency services immediately. By continuing you consent to upload a short audio clip for analysis. We will not share audio outside this app.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={startRecording}>Proceed</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <p className="text-sm text-muted-foreground font-semibold">This feature is for informational purposes only and is not a medical diagnosis.</p>
            </CardContent>
        </Card>
    );

    const renderRecording = () => (
         <Card className="w-full max-w-lg mx-auto text-center">
            <CardHeader>
                <CardTitle className="font-body text-2xl">Recording...</CardTitle>
                <CardDescription>Take 1-2 deep breaths, then cough twice into your microphone.</CardDescription>
            </CardHeader>
            <CardContent>
                <canvas ref={canvasRef} width="400" height="150" className="w-full h-auto rounded-lg bg-background" />
                <div className="relative mt-4 h-12 w-12 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
                    <div className="relative flex items-center justify-center w-full h-full bg-primary rounded-full text-primary-foreground">
                        <Waves className="h-6 w-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderAnalyzing = () => (
        <Card className="w-full max-w-lg mx-auto text-center">
            <CardHeader>
                <CardTitle className="font-body text-2xl">Analyzing Your Cough</CardTitle>
                <CardDescription>Our AI is analyzing the audio biomarker...</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 py-12">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p>This may take a moment.</p>
            </CardContent>
        </Card>
    );

    const renderResult = () => {
        if (!result) return renderIdle();
        const isUrgent = result.recommendationLevel === 'Seek immediate care';
        const icon = soundTypeIcons[result.soundType] || '🤔';

        return (
            <div className="w-full max-w-2xl mx-auto space-y-6">
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive font-body">Informational Result — Not a medical diagnosis.</CardTitle>
                        <CardDescription>For emergencies call 1122 or your local helpline.</CardDescription>
                    </CardHeader>
                </Card>

                <Card className="text-center">
                    <CardHeader>
                        <div className="text-7xl mx-auto mb-4">{icon}</div>
                        <CardTitle className="font-headline text-4xl">{result.soundType}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">{result.explanation}</p>
                        <div>
                            <p className="text-sm font-bold">Confidence: {Math.round(result.confidence * 100)}%</p>
                            <Progress value={result.confidence * 100} className="w-full mt-1" />
                        </div>
                    </CardContent>
                </Card>

                {isUrgent && (
                     <Card className="bg-destructive/10 border-destructive/50">
                        <CardHeader>
                            <CardTitle className="font-body text-destructive flex items-center gap-2">
                                <AlertTriangle /> URGENT Recommendation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-destructive/90 font-bold">{result.recommendation}</p>
                            <a href="https://www.google.com/maps/search/nearest+clinic" target="_blank" rel="noopener noreferrer">
                                <Button variant="destructive" className="w-full animate-pulse">
                                    Find Nearest Clinic
                                </Button>
                            </a>
                        </CardContent>
                    </Card>
                )}

                {!isUrgent && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-body">Recommended Next Step</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center gap-4">
                             <Button size="icon" variant="outline"><Play /></Button>
                             <p>{result.recommendation}</p>
                        </CardContent>
                    </Card>
                )}

                <Button onClick={reset} variant="outline" className="w-full">Analyze Another Cough</Button>
            </div>
        )
    };

    switch (status) {
        case 'recording': return renderRecording();
        case 'analyzing': return renderAnalyzing();
        case 'result': return renderResult();
        default: return renderIdle();
    }
}
