import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-4 text-center">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] bg-repeat opacity-5"></div>
      
      <div className="relative z-10 space-y-8">
        <div className="inline-block p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
          <Logo className="text-4xl" />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-headline font-bold tracking-tight text-gray-800">
          Sehat sab ke liye,
          <br/>
          <span className="text-primary">samajhne ki zubaan mein.</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
          Your AI-powered health companion to help you understand your medicines safely and easily.
        </p>

        <Link href="/dashboard">
          <Button size="lg" className="text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105 h-14 px-10 group">
            Get Started <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>

      <div className="absolute bottom-4 text-sm text-muted-foreground">
        Built with ❤️ for a healthier Pakistan.
      </div>
    </div>
  );
}
