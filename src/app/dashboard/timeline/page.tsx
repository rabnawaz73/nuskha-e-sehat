
'use client';
import { useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { mockTimelineData, mockAiInsights } from '@/lib/timeline-data';
import type { DailyLog } from '@/lib/timeline-data';
import { Button } from '@/components/ui/button';
import { Bot, CalendarDays, FileDown, StickyNote, Pill } from 'lucide-react';

const DayContent = ({ date }: { date: Date }) => {
    const log = mockTimelineData.find(day => isSameDay(day.date, date));
    if (!log) return null;
    
    return (
        <div className="absolute bottom-1 right-1 flex gap-0.5">
            {log.events.slice(0, 2).map((event, index) => (
                <span key={index} className="text-[9px]">{event.icon}</span>
            ))}
        </div>
    );
};

export default function TimelinePage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedLog, setSelectedLog] = useState<DailyLog | null>(() => {
        const todayLog = mockTimelineData.find(log => isSameDay(log.date, new Date()));
        return todayLog || null;
    });

    const handleDateSelect = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        if (selectedDate) {
            const log = mockTimelineData.find(day => isSameDay(day.date, selectedDate));
            setSelectedLog(log || null);
        } else {
            setSelectedLog(null);
        }
    };
    

    return (
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar View */}
                <Card className="lg:col-span-2">
                    <CardContent className="p-2 flex justify-center">
                         <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleDateSelect}
                            className="p-0"
                            components={{
                                DayContent: DayContent
                            }}
                        />
                    </CardContent>
                </Card>

                {/* Daily Log & AI Insights */}
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-body">
                                {date ? format(date, "MMMM do, yyyy") : "Select a date"}
                            </CardTitle>
                            <CardDescription>Daily health summary</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {selectedLog ? (
                                <>
                                    {selectedLog.events.filter(e => e.type === 'symptom').length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-sm flex items-center gap-2"><Pill /> Symptoms</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedLog.events.filter(e => e.type === 'symptom').map((event, i) => (
                                                    <div key={i} className="flex items-center gap-2 p-2 bg-secondary rounded-md text-sm">
                                                        <span>{event.icon}</span>
                                                        <span>{event.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                     {selectedLog.events.filter(e => e.type === 'medicine').length > 0 && (
                                         <div className="space-y-2">
                                            <h4 className="font-bold text-sm flex items-center gap-2"><Pill /> Medicines</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedLog.events.filter(e => e.type === 'medicine').map((event, i) => (
                                                    <div key={i} className="flex items-center gap-2 p-2 bg-secondary rounded-md text-sm">
                                                        <span>{event.icon}</span>
                                                        <span>{event.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {selectedLog.events.filter(e => e.type === 'note').length > 0 && (
                                         <div className="space-y-2">
                                            <h4 className="font-bold text-sm flex items-center gap-2"><StickyNote /> Notes</h4>
                                            {selectedLog.events.filter(e => e.type === 'note').map((event, i) => (
                                                <p key={i} className="text-sm text-muted-foreground p-2 bg-secondary rounded-md">{event.icon} {event.name}</p>
                                            ))}
                                        </div>
                                    )}
                                    {selectedLog.events.length === 1 && selectedLog.events[0].type === 'healthy' && (
                                        <div className="text-center py-4">
                                            <span className="text-4xl">✅</span>
                                            <p className="font-bold text-primary mt-2">Healthy Day!</p>
                                            <p className="text-sm text-muted-foreground">No symptoms or medicines logged.</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-10 text-muted-foreground">
                                    <p>No data for this day.</p>
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
                               <div key={index} className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
                                   <div className="text-lg">{insight.icon}</div>
                                   <p className="text-sm text-accent-foreground/80">{insight.text}</p>
                               </div>
                           ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
