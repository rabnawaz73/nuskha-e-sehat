import { addDays, startOfMonth, subDays } from 'date-fns';

export type HealthEvent = {
    type: 'Symptom' | 'Medicine' | 'Note' | 'Healthy' | 'Mood' | 'Cough Scan' | 'AI Debate';
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
        date: subDays(today, 5),
        events: [
            { type: 'Symptom', name: 'Fever', icon: '🤒' },
            { type: 'Symptom', name: 'Cough', icon: '🤧' },
            { type: 'Medicine', name: 'Paracetamol', icon: '💊' },
        ],
    },
    {
        date: subDays(today, 4),
        events: [
            { type: 'Cough Scan', name: 'Wet-like cough detected', icon: '💧' },
            { type: 'Note', name: 'Ate outside food for dinner', icon: '🍛' },
        ],
    },
     {
        date: subDays(today, 3),
        events: [
            { type: 'Symptom', name: 'Headache', icon: '🤕' },
            { type: 'AI Debate', name: 'Debate held for headache', icon: '🧑‍⚕️' },
            { type: 'Medicine', name: 'Aspirin', icon: '💊' },
        ],
    },
    {
        date: subDays(today, 2),
        events: [
            { type: 'Healthy', name: 'Feeling much better', icon: '✅' },
        ],
    },
     {
        date: subDays(today, 1),
        events: [
            { type: 'Mood', name: 'Detected Mood: Stressed', icon: '😟' },
            { type: 'Note', name: 'Big presentation at work', icon: '📝' },
        ],
    },
    {
        date: today,
        events: [
            { type: 'Mood', name: 'Detected Mood: Happy', icon: '😊' },
            { type: 'Healthy', name: 'No symptoms today', icon: '✅' },
        ]
    }
];

export const mockAiInsights = [
    { text: "Your mood seems to improve on days you don't log symptoms. Keep tracking to see if this pattern holds!", icon: '📈' },
    { text: "You took Paracetamol for a fever 5 days ago. Remember to consult a doctor if fever persists.", icon: '⏰' },
    { text: "You're on a 2-day healthy streak. Great job!", icon: '🏅' }
];
