'use server';

/**
 * @fileOverview An AI assistant that understands voice input in local languages,
 *  identifies symptoms, and provides personalized guidance related to uploaded medicine.
 *
 * - voiceBasedAssistantForSymptoms - A function that handles the voice-based assistant process.
 * - VoiceBasedAssistantForSymptomsInput - The input type for the voiceBasedAssistantForSymptoms function.
 * - VoiceBasedAssistantForSymptomsOutput - The return type for the voiceBasedAssistantForSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoiceBasedAssistantForSymptomsInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'The audio data URI of the user\s voice input in a local language (Urdu, Balochi, Pashto, Sindhi, Siraiki), that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
  medicineDetails: z.string().describe('The extracted details of the medicine.'),
  userDetails: z.string().describe('The user details like age, gender, etc.'),
});
export type VoiceBasedAssistantForSymptomsInput = z.infer<typeof VoiceBasedAssistantForSymptomsInputSchema>;

const VoiceBasedAssistantForSymptomsOutputSchema = z.object({
  guidance: z.string().describe('The personalized health guidance and warnings.'),
});
export type VoiceBasedAssistantForSymptomsOutput = z.infer<typeof VoiceBasedAssistantForSymptomsOutputSchema>;

export async function voiceBasedAssistantForSymptoms(input: VoiceBasedAssistantForSymptomsInput): Promise<VoiceBasedAssistantForSymptomsOutput> {
  return voiceBasedAssistantForSymptomsFlow(input);
}

const symptomAssistantPrompt = ai.definePrompt({
  name: 'symptomAssistantPrompt',
  input: {schema: VoiceBasedAssistantForSymptomsInputSchema},
  output: {schema: VoiceBasedAssistantForSymptomsOutputSchema},
  prompt: `You are a helpful AI assistant that understands voice input in local languages, identifies symptoms, and provides personalized guidance related to the medicine the user uploaded.

  The user will provide their voice input as an audio data URI.  Transcribe the audio to text and extract any mentioned symptoms or conditions. 

  Based on the identified symptoms, medicine details, and user details, provide solutions, assistance, and guidance.

  Audio Transcription: {{media url=audioDataUri}}
  Medicine Details: {{{medicineDetails}}}
  User Details: {{{userDetails}}}

  Provide your response in a clear and accessible format.
`,
});

const voiceBasedAssistantForSymptomsFlow = ai.defineFlow(
  {
    name: 'voiceBasedAssistantForSymptomsFlow',
    inputSchema: VoiceBasedAssistantForSymptomsInputSchema,
    outputSchema: VoiceBasedAssistantForSymptomsOutputSchema,
  },
  async input => {
    const {output} = await symptomAssistantPrompt(input);
    return output!;
  }
);
