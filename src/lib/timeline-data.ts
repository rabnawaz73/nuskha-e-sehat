import { addDays, startOfMonth } from 'date-fns';

export type HealthEvent = {
    type: 'symptom' | 'medicine' | 'note' | 'healthy';
    name: string;
    icon: string;
};

export type DailyLog = {
    date: Date;
    events: HealthEvent[];
};

// Mock Data
const today = new Date();
const monthStart = startOfMonth(today);

export const mockTimelineData: DailyLog[] = [
    {
        date: addDays(monthStart, 1),
        events: [
            { type: 'symptom', name: 'Fever', icon: '🤒' },
            { type: 'symptom', name: 'Cough', icon: '🤧' },
            { type: 'medicine', name: 'Paracetamol', icon: '💊' },
        ],
    },
    {
        date: addDays(monthStart, 2),
        events: [
            { type: 'symptom', name: 'Headache', icon: '🤕' },
            { type: 'note', name: 'Ate outside food', icon: '🍛' },
        ],
    },
    {
        date: addDays(monthStart, 3),
        events: [
            { type: 'healthy', name: 'Feeling good', icon: '✅' },
        ],
    },
     {
        date: addDays(monthStart, 8),
        events: [
            { type: 'symptom', name: 'Headache', icon: '🤕' },
             { type: 'medicine', name: 'Aspirin', icon: '💊' },
        ],
    },
     {
        date: addDays(monthStart, 15),
        events: [
            { type: 'symptom', name: 'Headache', icon: '🤕' },
             { type: 'medicine', name: 'Aspirin', icon: '💊' },
        ],
    },
];

export const mockAiInsights = [
    { text: "You had headaches 3 times this month.", icon: '📊' },
    { text: "Fever seems to appear after you eat outside.", icon: '⏰' },
    { text: "You're on a 5-day healthy streak. Keep it up!", icon: '🏅' }
];
