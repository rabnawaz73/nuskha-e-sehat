'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Sparkles, Stethoscope, Leaf, Users, AlertCircle, CalendarPlus, MessagesSquare, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { runDebate } from '@/app/dashboard/actions';
import { DebateResult } from '@/ai/types/debate';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

const formSchema = z.object({
  symptom_text: z.string().min(10, 'Please describe your symptoms in at least 10 characters.'),
});

const PersonaCard = ({ persona, summary }: { persona: 'doctor' | 'herbalist', summary: string }) => {
    const isDoctor = persona === 'doctor';
    const Icon = isDoctor ? Stethoscope : Leaf;

    return (
        <div className={cn(
            "rounded-lg p-4 animate-fade-in-up",
            isDoctor ? "bg-blue-100 dark:bg-blue-900/30" : "bg-green-100 dark:bg-green-900/30"
        )}>
            <div className="flex items-center gap-3 mb-2">
                 <div className={cn("p-2 rounded-full", isDoctor ? "bg-blue-500 text-white" : "bg-green-500 text-white")}>
                    <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold font-body">{isDoctor ? 'Modern Doctor' : 'Desi Herbalist'}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{summary}</p>
        </div>
    )
};


const ArbiterVerdict = ({ verdict }: { verdict: DebateResult['arbiterVerdict'] }) => {
    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'urgent': return 'bg-destructive text-destructive-foreground';
            case 'watch': return 'bg-yellow-400 text-yellow-900';
            default: return 'bg-secondary text-secondary-foreground';
        }
    }
    
    return (
        <Card className="bg-slate-50 dark:bg-slate-800/50 mt-6 animate-fade-in-up [animation-delay:1s]">
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center justify-between">
                    <span>The Verdict</span>
                    <Badge className={cn("capitalize", getUrgencyColor(verdict.final_urgency))}>
                        {verdict.final_urgency}
                    </Badge>
                </CardTitle>
                <CardDescription>{verdict.rationale}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-bold font-body mb-2">Final Recommendation</h4>
                    <p className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">{verdict.final_summary}</p>
                </div>
                <div className="p-3 bg-background rounded-lg border">
                    <h4 className="font-bold font-body mb-2 flex items-center gap-2"><Sparkles className="text-primary"/> Next Steps</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        {verdict.final_recommendation.map((rec, i) => <li key={i}>{rec}</li>)}
                    </ul>
                </div>
                {verdict.followup_question && (
                     <div className="text-center pt-2">
                        <p className="text-sm font-semibold text-primary">{verdict.followup_question}</p>
                        <div className="flex gap-4 justify-center mt-2">
                            <Button variant="outline" size="sm">Yes</Button>
                            <Button variant="outline" size="sm">No</Button>
                        </div>
                    </div>
                )}
                 <Separator className="my-4"/>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                    <Button variant="ghost" size="sm" className="flex-col h-auto">
                        <CalendarPlus className="h-5 w-5 mb-1"/>
                        <span>Save to Timeline</span>
                    </Button>
                     <Button variant="ghost" size="sm" className="flex-col h-auto">
                        <MessagesSquare className="h-5 w-5 mb-1"/>
                        <span>Follow-up</span>
                    </Button>
                     <Button variant="ghost" size="sm" className="flex-col h-auto">
                        <FileDown className="h-5 w-5 mb-1"/>
                        <span>Export</span>
                    </Button>
                     <Button variant="ghost" size="sm" className="flex-col h-auto text-destructive hover:text-destructive">
                        <AlertCircle className="h-5 w-5 mb-1"/>
                        <span>Emergency</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default function AiDebate() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DebateResult | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptom_text: '',
    },
  });

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setResult(null);
    const response = await runDebate(values);
    setIsLoading(false);

    if (response.success && response.data) {
      setResult(response.data as DebateResult);
    } else {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: response.error,
      });
    }
  };

  const renderDebate = () => {
    if (!result) return null;
    const { doctorTurn, herbalistTurn, arbiterVerdict } = result;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl">The Debate</CardTitle>
                <CardDescription>
                    Our AI agents discuss your symptoms to find the best path forward.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <PersonaCard persona="doctor" summary={doctorTurn.summary} />
                    <PersonaCard persona="herbalist" summary={herbalistTurn.summary} />
                </div>
                <ArbiterVerdict verdict={arbiterVerdict} />
            </CardContent>
        </Card>
    )
  }

  const renderInitialState = () => (
    <Card className="flex flex-col items-center justify-center h-96 text-center bg-card/50 border-dashed border-2">
        <CardHeader>
            <CardTitle className="font-body">Awaiting Debate</CardTitle>
            <CardDescription>Your AI agents' discussion will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
            <Users className="h-16 w-16 text-muted-foreground/30" />
        </CardContent>
    </Card>
  )

  const renderLoadingState = () => (
     <Card className="flex flex-col items-center justify-center h-96 text-center">
        <CardHeader>
            <CardTitle className="font-body">Agents are Debating...</CardTitle>
            <CardDescription>This may take a moment.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-2">
                <Stethoscope className="h-10 w-10 text-blue-500 animate-pulse" />
                <span className="text-sm font-medium">Doctor</span>
            </div>
             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <div className="flex flex-col items-center gap-2">
                <Leaf className="h-10 w-10 text-green-500 animate-pulse" />
                <span className="text-sm font-medium">Herbalist</span>
            </div>
        </CardContent>
    </Card>
  )


  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
            <Card className="h-fit sticky top-4">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Users /> AI Health Debate</CardTitle>
                    <CardDescription>
                        Get two expert opinions on your symptoms from our AI agents.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="symptom_text"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Describe Your Symptoms</FormLabel>
                                    <FormControl>
                                    <Textarea
                                        placeholder="e.g., 'Mujhe 2 din se khansi aur halki bukhar hai'"
                                        className="min-h-[100px]"
                                        {...field}
                                    />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Starting Debate...
                                </>
                                ) : (
                                'Start Debate'
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2">
            {isLoading ? renderLoadingState() : result ? renderDebate() : renderInitialState()}
        </div>
    </div>
  );
}
