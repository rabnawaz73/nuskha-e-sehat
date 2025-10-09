'use server';
/**
 * @fileOverview Handles general health queries when no medicine is provided.
 *
 * - generalHealthQuery - A function that provides recommendations based on symptoms.
 * - GeneralHealthQueryInput - The input type for the generalHealthQuery function.
 * - GeneralHealthQueryOutput - The return type for the generalHealthQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneralHealthQueryInputSchema = z.object({
  symptoms: z.string().describe("A description of the user's symptoms."),
  age: z.number().optional().nullable().describe('The age of the user in years.'),
  gender: z.enum(['male', 'female', 'other']).optional().nullable().describe('The gender of the user.'),
  userLang: z.string().optional().describe('The language the user is speaking in (e.g. Urdu, Punjabi, Pashto, Sindhi, Balochi, Siraiki).'),
});
export type GeneralHealthQueryInput = z.infer<typeof GeneralHealthQueryInputSchema>;

const GeneralHealthQueryOutputSchema = z.string().describe('General health recommendation, including possible over-the-counter medicines, lifestyle advice, or a strong suggestion to see a doctor. This should be in a conversational, helpful, and empathetic tone. If the symptoms are serious, you must strongly advise consulting a healthcare professional.');
export type GeneralHealthQueryOutput = z.infer<typeof GeneralHealthQueryOutputSchema>;


export const generalHealthQuery = ai.defineFlow(
  {
    name: 'generalHealthQuery',
    inputSchema: GeneralHealthQueryInputSchema,
    outputSchema: GeneralHealthQueryOutputSchema,
  },
  async (input) => {
    
    const language = input.userLang || 'Urdu';
    
    const prompt = `You are a caring and empathetic AI Doctor inside the app Nuskha-e-Sehat. You speak in simple, everyday language and can use cultural proverbs and metaphors to connect with users from Pakistan.

      Your response MUST be entirely in the ${language} language.

      IMPORTANT SAFETY RULE: You MUST start every single response with the disclaimer in ${language}: "⚠️ I am not a real doctor. This is for advice only."

      A user is asking for health advice. Their details are:
      - Symptoms: "${input.symptoms}"
      - Age: ${input.age || 'Not provided'}
      - Gender: ${input.gender || 'Not provided'}
      
      Your tasks:
      1.  Start with the mandatory disclaimer in ${language}.
      2.  Acknowledge the user's symptoms in a caring tone, in ${language}.
      3.  Provide simple advice (e.g., rest, hydration, common home remedies) in ${language}. Use simple, culturally relevant metaphors if it feels natural.
      4.  Suggest safe, common over-the-counter medicines if appropriate for the symptoms, using their common brand names in Pakistan.
      5.  If the symptoms sound serious (e.g., chest pain, high fever for multiple days, difficulty breathing), you MUST strongly advise them to see a real doctor immediately or go to a hospital, in ${language}.
      6.  Keep your response concise (4-6 lines).
    `;

    try {
        const response = await ai.generate({
            prompt: prompt,
        });
        
        return response.text;
    } catch (error) {
        console.error("Error in generalHealthQuery:", error);
        if (error instanceof Error && (error.message.includes('503') || error.message.includes('overloaded'))) {
            throw new Error("The AI assistant is currently unavailable. Please try again in a few moments.");
        }
        throw new Error("An unexpected error occurred while getting your health recommendation.");
    }
  }
);
