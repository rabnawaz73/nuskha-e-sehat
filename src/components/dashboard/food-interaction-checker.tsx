'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, CookingPot, AlertCircle, CheckCircle, Clock, Utensils, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getFoodInteractionGuide } from '@/app/dashboard/actions';
import type { MedicineFoodInteractionOutput } from '@/ai/flows/get-medicine-food-interaction';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const formSchema = z.object({
  medicineName: z.string().min(3, 'Please enter a medicine name.'),
});

const foodIcons: { [key: string]: string } = {
    'Tea': '☕',
    'Milk': '🥛',
    'Yogurt': '🥣',
    'Lassi': '🥤',
    'Paratha': '🫓',
    'Roti': '🫓',
    'Citrus Fruits': '🍊',
    'Oily Food': ' 油',
    'Fried Food': '🍟',
    'Water': '💧',
    'Juice': '🧃'
};

const getFoodIcon = (foodName: string) => {
    for (const key in foodIcons) {
        if (foodName.toLowerCase().includes(key.toLowerCase())) {
            return foodIcons[key];
        }
    }
    return '🍴';
};

export default function FoodInteractionChecker() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MedicineFoodInteractionOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medicineName: '',
    },
  });

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setResult(null);
    const response = await getFoodInteractionGuide(values);
    setIsLoading(false);

    if (response.success) {
      setResult(response.data as MedicineFoodInteractionOutput);
    } else {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: response.error,
      });
    }
  };
  
  const InteractionList = ({ title, items, variant }: { title: string, items: MedicineFoodInteractionOutput['interactions']['avoid'], variant: 'destructive' | 'warning' | 'default' }) => {
      if (!items || items.length === 0) return null;
      
      const Icon = variant === 'destructive' ? '❌' : variant === 'warning' ? '⚠️' : '✅';

      return (
          <div className="space-y-2">
            <h4 className="font-bold font-body">{title}</h4>
             <TooltipProvider>
                <div className="flex flex-wrap gap-2">
                {items.map((item, index) => (
                     <Tooltip key={index}>
                        <TooltipTrigger asChild>
                            <Badge variant={variant} className="text-lg cursor-pointer flex gap-2">
                               <span>{Icon} {getFoodIcon(item.name)}</span>
                               <span>{item.nameUrdu}</span>
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{item.reason}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
                </div>
            </TooltipProvider>
          </div>
      )
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
            <Card className="h-fit sticky top-4">
                <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><CookingPot /> Medicine & Food Guide</CardTitle>
                <CardDescription>
                    Enter a medicine name to check for interactions with common desi foods.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="medicineName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Medicine Name</FormLabel>
                            <FormControl>
                            <Input
                                placeholder="e.g., Panadol, Brufen, Amoxil"
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
                            Checking...
                        </>
                        ) : (
                        'Check Interactions'
                        )}
                    </Button>
                    </form>
                </Form>
                </CardContent>
            </Card>
        </div>

        <div>
            {isLoading ? (
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-3/4 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-10 w-1/3" />
                        <div className="flex gap-2">
                            <Skeleton className="h-8 w-20 rounded-full" />
                            <Skeleton className="h-8 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-10 w-1/3" />
                        <div className="flex gap-2">
                            <Skeleton className="h-8 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-6 w-full" />
                    </CardContent>
                </Card>
            ) : result ? (
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">{result.medicineName}</CardTitle>
                        <CardDescription className="flex items-center gap-2 pt-1"><Info className="h-4 w-4"/> {result.purpose}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <InteractionList title="Bilkul Parhez Karein (Avoid)" items={result.interactions.avoid} variant="destructive" />
                        <InteractionList title="Ehtiyat Karein (Be Cautious)" items={result.interactions.warning} variant="warning" />
                        <InteractionList title="Le Sakte Hain (Safe to Take)" items={result.interactions.safe} variant="default" />
                        
                        <div className="p-4 bg-accent/10 border-l-4 border-accent rounded-r-lg">
                           <h4 className="font-bold font-body flex items-center gap-2"><Clock className="h-5 w-5"/> Waqt ka Khayal</h4>
                           <p className="text-muted-foreground mt-1">{result.timingSuggestion}</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="flex flex-col items-center justify-center h-96 text-center bg-card/50 border-dashed border-2">
                    <CardHeader>
                        <CardTitle className="font-body">Awaiting Check</CardTitle>
                        <CardDescription>Your food interaction results will appear here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Utensils className="h-16 w-16 text-muted-foreground/30" />
                    </CardContent>
                </Card>
            )}
        </div>
    </div>
  );
}

// Add a warning variant to the badge component
declare module "@/components/ui/badge" {
    interface BadgeProps {
      variant?: "default" | "secondary" | "destructive" | "outline" | "warning";
    }
}

import { badgeVariants } from '@/components/ui/badge';
badgeVariants.getVariants = () => ({
    ...badgeVariants.getVariants(),
    warning: "border-transparent bg-yellow-400 text-yellow-900 hover:bg-yellow-400/80",
});
