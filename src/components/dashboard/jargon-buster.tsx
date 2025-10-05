'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { translateJargon } from '@/app/dashboard/actions';
import type { TranslateMedicalJargonOutput } from '@/ai/flows/translate-medical-jargon';
import { Skeleton } from '../ui/skeleton';

const formSchema = z.object({
  medicalText: z.string().min(10, 'Please enter at least 10 characters of medical text.'),
  targetLanguage: z.enum(['Urdu', 'Punjabi', 'Sindhi', 'Pashto', 'Balochi']),
});

export default function JargonBuster() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TranslateMedicalJargonOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medicalText: '',
      targetLanguage: 'Urdu',
    },
  });

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setResult(null);
    const response = await translateJargon(values);
    setIsLoading(false);

    if (response.success) {
      setResult(response.data as TranslateMedicalJargonOutput);
    } else {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: response.error,
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="font-headline">Jargon Buster</CardTitle>
          <CardDescription>
            Translate complex medical terms into simple explanations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="medicalText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'Patient presents with acute myocardial infarction...'"
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Urdu">Urdu</SelectItem>
                        <SelectItem value="Punjabi">Punjabi</SelectItem>
                        <SelectItem value="Sindhi">Sindhi</SelectItem>
                        <SelectItem value="Pashto">Pashto</SelectItem>
                        <SelectItem value="Balochi">Balochi</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Translating...
                  </>
                ) : (
                   <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Translate
                   </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Simplified Explanation</CardTitle>
            <CardDescription>
                The easy-to-understand version will appear here.
            </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-foreground">
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            ) : result ? (
                <p>{result.simpleExplanation}</p>
            ) : (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground pt-10">
                    <Sparkles className="h-12 w-12 opacity-30"/>
                    <p className="mt-4">Translation results will be shown here.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
