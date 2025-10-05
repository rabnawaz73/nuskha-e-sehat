'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, VideoOff, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { identifyMedicineFromImage } from '@/ai/flows/identify-medicine-from-image';
import { detectFakeOrExpiredMedicine } from '@/ai/flows/detect-fake-or-expired-medicine';
import type { IdentifyMedicineFromImageOutput } from '@/ai/flows/identify-medicine-from-image';
import type { DetectFakeOrExpiredMedicineOutput } from '@/ai/flows/detect-fake-or-expired-medicine';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';

type ScanResult = {
  identification: IdentifyMedicineFromImageOutput;
  authenticity: DetectFakeOrExpiredMedicineOutput;
};

type Status = 'idle' | 'scanning' | 'result' | 'error';

export default function SafetyChecker() {
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (typeof window !== 'undefined' && navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
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
        }
      } else {
        setHasCameraPermission(false);
      }
    };

    if (status === 'idle') {
      getCameraPermission();
    }
  }, [status, toast]);

  const handleScan = async () => {
    if (!videoRef.current || !videoRef.current.srcObject) {
      toast({
        variant: 'destructive',
        title: 'Camera not ready',
        description: 'Please grant camera access and try again.',
      });
      return;
    }

    setStatus('scanning');
    setResult(null);

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const photoDataUri = canvas.toDataURL('image/jpeg');

      try {
        const [identification, authenticity] = await Promise.all([
          identifyMedicineFromImage({ photoDataUri }),
          detectFakeOrExpiredMedicine({ photoDataUri }),
        ]);
        setResult({ identification, authenticity });
        setStatus('result');
      } catch (error) {
        console.error('Scan failed:', error);
        setStatus('error');
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: 'Could not analyze the image. Please try again with a clear picture.',
        });
      }
    }
  };
  
  const resetScanner = () => {
      setStatus('idle');
      setResult(null);
  }

  const renderCameraView = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <ShieldCheck /> Medicine Safety Check
        </CardTitle>
        <CardDescription>
            Point your camera at a medicine package to check its expiry date and authenticity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full aspect-[4/3] rounded-lg bg-black overflow-hidden relative flex items-center justify-center">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            
            {hasCameraPermission === null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-12 w-12 text-white animate-spin" />
                    <p className="text-white ml-4">Starting camera...</p>
                </div>
            )}

            {hasCameraPermission === false && (
                <div className="absolute inset-0 p-4">
                    <Alert variant="destructive">
                        <VideoOff className="h-4 w-4" />
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                        Please allow camera access in your browser settings to use this feature.
                        </AlertDescription>
                    </Alert>
                </div>
            )}
            
            <div className="absolute top-2 left-2 right-2 h-2/3 border-4 border-white/50 border-dashed rounded-lg opacity-50" />
        </div>

        <Button onClick={handleScan} size="lg" className="w-full mt-4 h-14 text-lg" disabled={!hasCameraPermission}>
          <Camera className="mr-2 h-6 w-6" />
          Scan Medicine
        </Button>
      </CardContent>
    </Card>
  );

  const renderScanning = () => (
    <Card className="w-full max-w-2xl mx-auto text-center">
        <CardHeader>
            <CardTitle className="font-body text-2xl">Analyzing Image</CardTitle>
            <CardDescription>Our AI is checking the medicine details...</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p>This may take a moment.</p>
        </CardContent>
    </Card>
  )

  const renderResult = () => {
    if (!result) return null;
    const { identification, authenticity } = result;
    const isWarning = authenticity.isFakeOrExpired;

    return (
        <div className="w-full max-w-2xl mx-auto space-y-4">
            <Card className={isWarning ? 'border-destructive' : 'border-green-500'}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                             <CardTitle className="font-body text-2xl">{identification.medicineName}</CardTitle>
                             <CardDescription>{identification.manufacturer || 'Manufacturer not found'}</CardDescription>
                        </div>
                        {isWarning ? (
                            <Badge variant="destructive" className="text-base flex items-center gap-2"><AlertTriangle /> Warning</Badge>
                        ) : (
                            <Badge className="bg-green-600 text-base flex items-center gap-2"><ShieldCheck /> Verified</Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-secondary rounded-lg">
                        <h4 className="font-bold text-lg">{isWarning ? 'Reason:' : 'Result:'}</h4>
                        <p className="text-secondary-foreground">{authenticity.reason}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-background rounded-md border">
                            <p className="font-bold text-muted-foreground">Batch Number</p>
                            <p className="font-mono">{identification.batchNumber || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-background rounded-md border">
                            <p className="font-bold text-muted-foreground">Expiry Date</p>
                            <p className="font-mono">{identification.expiryDate || 'N/A'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Button onClick={resetScanner} variant="outline" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4"/>
                Scan Another Medicine
            </Button>
        </div>
    )
  }
  
  const renderError = () => (
     <Card className="w-full max-w-2xl mx-auto text-center">
        <CardHeader>
            <CardTitle className="font-body text-destructive">Scan Failed</CardTitle>
            <CardDescription>We couldn't read the details from the image.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-8">
            <AlertTriangle className="h-16 w-16 text-destructive" />
            <p className="text-muted-foreground">Please try again with a clear, well-lit photo of the medicine package.</p>
            <Button onClick={resetScanner} variant="destructive" className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4"/>
                Try Again
            </Button>
        </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto py-8">
      {status === 'idle' && renderCameraView()}
      {status === 'scanning' && renderScanning()}
      {status === 'result' && renderResult()}
      {status === 'error' && renderError()}
    </div>
  );
}
