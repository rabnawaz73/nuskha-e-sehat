'use server';
/**
 * @fileOverview Transcribes audio to text using a Genkit flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TranscribeAudioOutputSchema = z.object({
  text: z.string().describe('The transcribed text from the audio.'),
});

export const transcribeAudio = ai.defineFlow(
    {
      name: 'transcribeAudio',
      inputSchema: z.string(),
      outputSchema: TranscribeAudioOutputSchema,
    },
    async (audioDataUri) => {
      const { text } = await ai.generate({
        prompt: [
          { text: 'Transcribe the following audio. The user might speak in English, Urdu, Pashto, Sindhi, or Punjabi.' },
          { media: { url: audioDataUri } },
        ],
      });
      return {
        text: text,
      };
    }
);
