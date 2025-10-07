import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Video, Mic, Store, AlertCircle, BookOpen, CookingPot, ShieldCheck, Waves, Users, BrainCircuit, Settings, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "AI Voice Assistant",
    description: "Ask questions in your own language and get voice replies.",
    href: "/dashboard/assistant",
    icon: Mic,
    cta: "Ask Assistant",
    primary: true,
  },
  {
    title: "Health Timeline",
    description: "View your health history, symptoms, and AI insights in one place.",
    href: "/dashboard/timeline",
    icon: CalendarDays,
    cta: "View Timeline",
    primary: true,
  },
   {
    title: "AI Health Debate",
    description: "Get two expert opinions from our AI Doctor and Herbalist.",
    href: "/dashboard/debate",
    icon: Users,
    cta: "Start Debate",
  },
  {
    title: "Safety Check",
    description: "Scan a medicine's package to check for authenticity and expiry.",
    href: "/dashboard/safety-check",
    icon: ShieldCheck,
    cta: "Run Safety Check",
  },
  {
    title: "Cough Analysis",
    description: "Record your cough to get informational, non-diagnostic guidance.",
    href: "/dashboard/cough-detector",
    icon: Waves,
    cta: "Analyze Cough",
  },
  {
    title: "Mood Tracker",
    description: "Get wellness tips based on your detected mood from voice or selfie.",
    href: "/dashboard/mood-tracker",
    icon: BrainCircuit,
    cta: "Check Mood",
  },
  {
    title: "Food & Medicine Guide",
    description: "Check how your food interacts with your medicine.",
    href: "/dashboard/food-guide",
    icon: CookingPot,
    cta: "Check Food Guide",
  },
   {
    title: "Scan Medicine",
    description: "Upload a video or image of your medicine to identify it.",
    href: "/dashboard/scan",
    icon: Video,
    cta: "Start Scanning",
  },
   {
    title: "Find Nearby Pharmacies",
    description: "Locate verified pharmacies and clinics near you.",
    href: "/dashboard/pharmacies",
    icon: Store,
    cta: "Find Pharmacies",
  },
  {
    title: "Learn About Health",
    description: "Read simple guides on common health conditions.",
    href: "/dashboard/learn",
    icon: BookOpen,
    cta: "Learn More",
  },
  {
    title: "Settings",
    description: "Customize your profile, voice preferences, and more.",
    href: "/dashboard/settings",
    icon: Settings,
    cta: "Go to Settings",
  },
  {
    title: "Emergency Help",
    description: "Quick access to emergency helplines and your SOS settings.",
    href: "/dashboard/emergency",
    icon: AlertCircle,
    cta: "Get Help Now",
    destructive: true
  },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-12">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Assalam-o-Alaikum!</h1>
        <p className="text-muted-foreground text-lg">How can we help you today?</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card 
            key={feature.title} 
            className={cn(
              "flex flex-col transform transition-transform hover:scale-[1.02] hover:shadow-lg",
               // Make the top 2 items span 2 columns on lg screens
              index < 2 && "lg:col-span-2",
               // Make the top item span 2 columns on xl screens
              index < 1 && "xl:col-span-2",
            )}
          >
            <CardHeader>
               <div className={cn("p-3 rounded-lg w-fit mb-4",
                  feature.destructive ? 'bg-destructive/10 text-destructive' :
                  feature.primary ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'bg-accent text-accent-foreground'
               )}>
                  <feature.icon className="h-6 w-6" />
                </div>
              <CardTitle className="font-body font-bold text-xl">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-end">
              <Link href={feature.href} className="w-full">
                <Button 
                    variant={feature.primary ? "default" : feature.destructive ? "destructive" : "outline"} 
                    className={cn("w-full group", {"shadow-lg shadow-primary/30": feature.primary})}
                >
                  {feature.cta} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
