'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getMedicineGuide } from '@/app/dashboard/actions';
import MedicineGuideForm from './medicine-guide-form';
import MedicineGuideResults from './medicine-guide-results';
import type { IdentifyMedicineFromImageOutput } from '@/ai/flows/identify-medicine-from-image';
import type { DetectFakeOrExpiredMedicineOutput } from '@/ai/flows/detect-fake-or-expired-medicine';
import type { PersonalizedHealthGuidanceOutput } from '@/ai/flows/personalized-health-guidance';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ArrowRight, Mic } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';


export type MedicineGuideResult = {
  identification: IdentifyMedicineFromImageOutput;
  authenticity: DetectFakeOrExpiredMedicineOutput;
  guidance: PersonalizedHealthGuidanceOutput;
};

export default function MedicineCheck() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Partial<MedicineGuideResult> | null>(null);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setResults(null);
    setStreamingText(null);
    const response = await getMedicineGuide(formData);
    
    if (response instanceof ReadableStream) {
      const reader = response.getReader();
      const decoder = new TextDecoder();
      let text = '';
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          setStreamingText(text);
        }
      } catch (error) {
        console.error('Streaming error:', error);
        let errorMessage = 'Could not stream the AI response.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        toast({
            variant: 'destructive',
            title: 'An error occurred',
            description: errorMessage,
        });
        setStreamingText(null); // Clear partial text on error
      } finally {
        setIsLoading(false);
      }
    } else if (response.success) {
      setResults(response.data);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: response.error,
      });
    }
  };

  const renderStreamingResults = () => (
     <Card>
      <CardHeader>
        <CardTitle className="font-body">AI Recommendation</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && !streamingText ? (
           <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <p className="prose prose-sm max-w-none text-foreground">{streamingText}</p>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="space-y-6">
            <header className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight font-headline">
                    AI Medicine Guide
                </h2>
                <p className="text-muted-foreground text-lg max-w-prose">
                    Get instant, personalized health guidance. Upload a short video or image of a medicine, tell us your symptoms, and our AI will do the rest.
                </p>
                 <div className="p-4 bg-accent/20 border border-accent/30 rounded-lg">
                    <h3 className="font-bold font-body flex items-center gap-2 text-accent-foreground"><Mic /> Prefer to talk?</h3>
                    <p className="text-accent-foreground/80 text-sm mt-1">Jump straight to our AI Voice Assistant for a conversation-based check-up.</p>
                     <Link href="/dashboard/assistant">
                        <Button variant="link" className="px-0 group">
                            Talk to My AI Health Assistant <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>
            </header>
            <MedicineGuideForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
        <div>
            {streamingText !== null ? renderStreamingResults() : <MedicineGuideResults results={results} isLoading={isLoading} />}
        </div>
      </div>
    </div>
  );
}
