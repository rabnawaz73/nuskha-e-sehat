'use server';
/**
 * @fileOverview Detects fake or expired medicine from an image.
 *
 * - detectFakeOrExpiredMedicine - A function that handles the detection process.
 * - DetectFakeOrExpiredMedicineInput - The input type for the detectFakeOrExpiredMedicine function.
 * - DetectFakeOrExpiredMedicineOutput - The return type for the detectFakeOrExpiredMedicine function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectFakeOrExpiredMedicineInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the medicine, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectFakeOrExpiredMedicineInput = z.infer<typeof DetectFakeOrExpiredMedicineInputSchema>;

const DetectFakeOrExpiredMedicineOutputSchema = z.object({
  isFakeOrExpired: z.boolean().describe('Whether the medicine is fake or expired.'),
  reason: z.string().describe('The reason why the medicine is flagged as fake or expired.'),
});
export type DetectFakeOrExpiredMedicineOutput = z.infer<typeof DetectFakeOrExpiredMedicineOutputSchema>;

export async function detectFakeOrExpiredMedicine(
  input: DetectFakeOrExpiredMedicineInput
): Promise<DetectFakeOrExpiredMedicineOutput> {
  return detectFakeOrExpiredMedicineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectFakeOrExpiredMedicinePrompt',
  input: {schema: DetectFakeOrExpiredMedicineInputSchema},
  output: {schema: DetectFakeOrExpiredMedicineOutputSchema},
  prompt: `You are an expert in identifying fake and expired medicine.

You will analyze the provided image of the medicine and determine if it is potentially fake or expired based on visual cues, labeling, and any available information.

Analyze the following image:
{{media url=photoDataUri}}

Based on your analysis, determine if the medicine is fake or expired. If it is, provide a reason for your determination.
`,
});

const detectFakeOrExpiredMedicineFlow = ai.defineFlow(
  {
    name: 'detectFakeOrExpiredMedicineFlow',
    inputSchema: DetectFakeOrExpiredMedicineInputSchema,
    outputSchema: DetectFakeOrExpiredMedicineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
