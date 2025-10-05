'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { MedicineGuideResult } from './medicine-check';
import { CheckCircle, AlertTriangle, Pill, HeartPulse, ShieldAlert, FileText, BadgeCheck, BadgeAlert, Info } from 'lucide-react';
import { Badge } from '../ui/badge';

type MedicineGuideResultsProps = {
  results: Partial<MedicineGuideResult> | null;
  isLoading: boolean;
};

const ResultItem = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <div className="flex items-start gap-4">
        <div className="bg-primary/10 text-primary p-2 rounded-lg">
            <Icon className="h-5 w-5" />
        </div>
        <div>
            <h4 className="font-bold text-md font-body">{title}</h4>
            <div className="text-sm text-muted-foreground prose prose-sm max-w-none">
                {children}
            </div>
        </div>
    </div>
)

export default function MedicineGuideResults({ results, isLoading }: MedicineGuideResultsProps) {
    if (isLoading) {
        return (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </CardContent>
          </Card>
        );
      }
    
      if (!results) {
        return (
            <Card className="flex flex-col items-center justify-center h-full text-center bg-card/50 border-dashed border-2">
                <CardHeader>
                    <CardTitle className="font-body">Awaiting Analysis</CardTitle>
                    <CardDescription>Your medicine analysis results will appear here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FileText className="h-16 w-16 text-muted-foreground/30" />
                </CardContent>
            </Card>
        );
      }
  
    const { identification, authenticity, guidance } = results;

    if (!guidance && identification) {
        return (
             <Card className="h-full">
                <CardHeader>
                    <CardTitle className="font-body flex items-center justify-between text-2xl">
                        <span>{identification.medicineName}</span>
                    </CardTitle>
                    <CardDescription>{identification.usage}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <ResultItem icon={Info} title="Batch Number">
                        <p>{identification.batchNumber || 'Not found'}</p>
                    </ResultItem>
                    <ResultItem icon={Info} title="Expiry Date">
                        <p>{identification.expiryDate || 'Not found'}</p>
                    </ResultItem>
                    <ResultItem icon={Info} title="Manufacturer">
                        <p>{identification.manufacturer || 'Not found'}</p>
                    </ResultItem>
                    <div className="p-4 bg-accent/20 border border-accent/30 rounded-lg text-center">
                        <h4 className="font-bold font-body text-accent-foreground">Need Personalized Guidance?</h4>
                        <p className="text-accent-foreground/80 text-sm mt-1">Fill out your age, gender, and symptoms for a full health assessment.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!identification || !authenticity || !guidance) return null;


    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="font-body flex items-center justify-between text-2xl">
                    <span>{identification.medicineName}</span>
                    {authenticity.isFakeOrExpired ? (
                        <Badge variant="destructive" className="flex items-center gap-1.5 text-base">
                            <BadgeAlert className="h-4 w-4" />
                            <span>Warning</span>
                        </Badge>
                    ) : (
                        <Badge className="flex items-center gap-1.5 bg-green-100 text-green-800 border-green-200 hover:bg-green-200 text-base">
                             <BadgeCheck className="h-4 w-4" />
                            <span>Verified</span>
                        </Badge>
                    )}
                </CardTitle>
                <CardDescription>{identification.usage}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <ResultItem icon={authenticity.isFakeOrExpired ? AlertTriangle : CheckCircle} title="Authenticity Check">
                    <p>{authenticity.isFakeOrExpired ? authenticity.reason : 'Medicine appears to be authentic and not expired.'}</p>
                </ResultItem>

                <ResultItem icon={HeartPulse} title="Suitability">
                   <p>{guidance.suitability}</p>
                </ResultItem>
                
                <ResultItem icon={ShieldAlert} title="Potential Side Effects">
                    <p>{guidance.sideEffects}</p>
                </ResultItem>

                <ResultItem icon={Pill} title="Warnings & Precautions">
                    <p>{guidance.warnings}</p>
                </ResultItem>
            </CardContent>
        </Card>
    );
}
