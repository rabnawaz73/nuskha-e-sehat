import { HeartPulse } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
       <div className="p-2 bg-primary rounded-lg text-primary-foreground">
        <HeartPulse className="h-6 w-6" />
      </div>
      <h1 className="font-headline text-2xl font-bold text-foreground">
        نسخہ صحت
      </h1>
    </div>
  );
}
