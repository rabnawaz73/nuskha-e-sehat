import { config } from 'dotenv';
config();

// Keep these imports here for Genkit to discover the flows
import '@/ai/flows/translate-medical-jargon.ts';
import '@/ai:flows/identify-medicine-from-image.ts';
import '@/ai/flows/voice-based-assistant-for-symptoms.ts';
import '@/ai/flows/detect-fake-or-expired-medicine.ts';
import '@/ai/flows/personalized-health-guidance.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/transcribe-audio.ts';
import '@/ai/flows/general-health-query.ts';
import '@/ai/flows/get-medicine-food-interaction.ts';
import '@/ai/types/medicine-food-interaction.ts';
import '@/ai/flows/cough-analysis-flow.ts';
import '@/ai/flows/debate-flow.ts';
import '@/ai/types/debate.ts';
import '@/ai/flows/detect-emotion-flow.ts';
import '@/ai/flows/get-mood-advice-flow.ts';
import '@/ai/types/emotion.ts';
