'use server';
/**
 * @fileOverview Generates empathetic advice based on a detected emotion.
 *
 * - getMoodAdviceFlow - A function that takes an emotion and returns tailored advice.
 */

import { ai } from '@/ai/genkit';
import {
    GetMoodAdviceInputSchema,
    GetMoodAdviceOutputSchema,
    type GetMoodAdviceInput,
    type GetMoodAdviceOutput
} from '@/ai/types/emotion';


const prompt = ai.definePrompt({
    name: 'moodAdvicePrompt',
    input: { schema: GetMoodAdviceInputSchema },
    output: { schema: GetMoodAdviceOutputSchema },
    prompt: `You are an empathetic health and wellness advisor for Nuskha-e-Sehat. Your tone is warm, brief, and culturally empathetic.

    A user's emotion has been detected as "{{emotion}}". Their preferred language is {{user_lang}}.

    Follow these rules:
    1.  Create a warm greeting in the user's chosen language that kindly acknowledges the detected emotion. For example, if 'Sad', say something like "Aap kuch udaas lag rahe ho."
    2.  Provide 2-3 safe, practical, and short tips to help with that emotion. For 'Stressed', you might suggest a simple breathing exercise or a short walk. For 'Happy', you can provide positive reinforcement.
    3.  If the emotion is 'Sad' or 'Stressed' and seems persistent, gently suggest that talking to a professional or a helpline can be helpful, but keep it a soft suggestion.
    4.  Generate a short, positive daily affirmation in the user's chosen language.
    5.  Do not use complex medical jargon.
    `
});

export const getMoodAdviceFlow = ai.defineFlow(
  {
    name: 'getMoodAdviceFlow',
    inputSchema: GetMoodAdviceInputSchema,
    outputSchema: GetMoodAdviceOutputSchema,
  },
  async (input): Promise<GetMoodAdviceOutput> => {
    const { output } = await prompt(input);
    return output!;
  }
);
