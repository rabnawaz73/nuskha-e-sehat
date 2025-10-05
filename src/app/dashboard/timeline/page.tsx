'use client';
import { useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { mockTimelineData, mockAiInsights } from '@/lib/timeline-data';
import type { DailyLog, HealthEvent } from '@/lib/timeline-data';
import { Button } from '@/components/ui/button';
import { Bot, CalendarDays, FileDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// Sub-component for rendering calendar day markers
const DayContent = ({ date }: { date: Date }) => {
    const log = mockTimelineData.find(day => isSameDay(day.date, date));
    if (!log || log.events.length === 0) return null;
    
    // Display up to 3 unique event icons for the day
    const uniqueIcons = Array.from(new Set(log.events.map(e => e.icon))).slice(0, 3);
    
    return (
        <div className="absolute bottom-1 right-1 flex items-center justify-end gap-0.5 w-full px-1">
            {uniqueIcons.map((icon, index) => (
                <span key={index} className="text-[9px] leading-none">{icon}</span>
            ))}
        </div>
    );
};

// Sub-component for rendering a single timeline event
const TimelineEvent = ({ event }: { event: HealthEvent }) => (
    <div className="flex items-center gap-3 p-2 bg-secondary rounded-md text-sm">
        <span className="text-lg">{event.icon}</span>
        <div className="flex-1">
            <p className="font-medium text-secondary-foreground">{event.type.charAt(0).toUpperCase() + event.type.slice(1)}</p>
            <p className="text-muted-foreground">{event.name}</p>
        </div>
    </div>
);

// Sub-component for rendering an AI insight
const AiInsight = ({ insight }: { insight: { text: string; icon: string } }) => (
    <div className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
        <div className="text-lg pt-0.5">{insight.icon}</div>
        <p className="text-sm text-accent-foreground/90">{insight.text}</p>
    </div>
);


export default function TimelinePage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    // Find the log for the selected date, or default to today's log if none is selected
    const selectedLog = date ? mockTimelineData.find(log => isSameDay(log.date, date)) : mockTimelineData.find(log => isSameDay(log.date, new Date()));

    const handleDateSelect = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
    };

    return (
        <div className="relative min-h-full">
            <div className="container mx-auto py-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2"><CalendarDays /> Health Timeline</h1>
                        <p className="text-muted-foreground">Your personal health diary to track patterns and insights.</p>
                    </div>
                     <Button variant="outline">
                        <FileDown className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Calendar View */}
                    <Card className="lg:col-span-2">
                        <CardContent className="p-2 flex justify-center">
                             <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleDateSelect}
                                className="p-0"
                                components={{ DayContent }}
                                modifiersClassNames={{
                                    selected: 'bg-primary text-primary-foreground hover:bg-primary/90',
                                    today: 'bg-accent/50 text-accent-foreground'
                                }}
                            />
                        </CardContent>
                    </Card>

                    {/* Daily Log & AI Insights */}
                    <div className="space-y-8 sticky top-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-body">
                                    {date ? format(date, "MMMM do, yyyy") : "Select a date"}
                                </CardTitle>
                                <CardDescription>Daily health summary</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 max-h-[300px] overflow-y-auto">
                               {selectedLog && selectedLog.events.length > 0 ? (
                                    selectedLog.events.map((event, index) => (
                                        <TimelineEvent key={index} event={event} />
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-muted-foreground">
                                        <p>No events logged for this day.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="font-body flex items-center gap-2"><Bot /> AI Insights</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                               {mockAiInsights.map((insight, index) => (
                                   <AiInsight key={index} insight={insight} />
                               ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            
            <Button className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg z-20">
                 <Plus className="h-8 w-8" />
                 <span className="sr-only">Add new event</span>
            </Button>
        </div>
    );
}
