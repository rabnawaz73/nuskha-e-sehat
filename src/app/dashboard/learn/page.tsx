import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Droplets, HeartPulse, Shield, Thermometer } from "lucide-react";

const topics = [
  {
    title: "Understanding Diabetes (شوگر)",
    icon: Droplets,
    content: "Diabetes is a condition where your body has trouble managing blood sugar (glucose). This can happen if your body doesn't make enough insulin or can't use it properly. Common symptoms include frequent urination, increased thirst, and unexplained weight loss. It's managed through diet, exercise, and sometimes medication."
  },
  {
    title: "Managing Hypertension (بلڈ پریشر)",
    icon: HeartPulse,
    content: "Hypertension, or high blood pressure, means the force of blood against your artery walls is consistently too high. It often has no symptoms but can lead to serious health problems like heart disease and stroke. It's important to get it checked regularly and manage it with a healthy lifestyle and medication if needed."
  },
  {
    title: "Common Cold vs. Flu (نزلہ بمقابلہ فلو)",
    icon: Thermometer,
    content: "The flu and the common cold are both respiratory illnesses but are caused by different viruses. The flu is generally worse, with more intense symptoms like fever, body aches, and fatigue that come on suddenly. Colds are usually milder with symptoms like a runny or stuffy nose. Rest and fluids help with both."
  },
];

export default function LearnPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Learn About Health</h1>
        <p className="text-muted-foreground">Simple guides to help you stay informed.</p>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-body">
            <BookOpen />
            Common Health Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {topics.map((topic, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg">
                      <topic.icon className="h-5 w-5" />
                    </div>
                    <span className="font-bold font-body text-lg">{topic.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="prose prose-sm max-w-none text-muted-foreground pl-14">
                  {topic.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
       <p className="text-center text-sm text-muted-foreground mt-8">
        Disclaimer: This information is for educational purposes only and is not a substitute for professional medical advice.
      </p>
    </div>
  );
}
