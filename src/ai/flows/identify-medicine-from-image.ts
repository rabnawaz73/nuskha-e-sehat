'use server';
/**
 * @fileOverview This file defines a Genkit flow for identifying medicine from an image or video.
 *
 * - identifyMedicineFromImage - A function that takes an image/video of a medicine and returns the identified medicine details.
 * - IdentifyMedicineFromImageInput - The input type for the identifyMedicineFromImage function.
 * - IdentifyMedicineFromImageOutput - The return type for the identifyMedicineFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyMedicineFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo or a video of a medicine, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyMedicineFromImageInput = z.infer<typeof IdentifyMedicineFromImageInputSchema>;

const IdentifyMedicineFromImageOutputSchema = z.object({
  medicineName: z.string().describe('The name of the identified medicine (brand and common name).'),
  usage: z.string().describe('The purpose of the medicine in simple, non-medical terms.'),
  batchNumber: z.string().optional().describe('The batch number extracted from the packaging.'),
  expiryDate: z.string().optional().describe('The expiry date extracted from the packaging (YYYY-MM-DD).'),
  manufacturer: z.string().optional().describe('The manufacturer of the medicine.'),
});
export type IdentifyMedicineFromImageOutput = z.infer<typeof IdentifyMedicineFromImageOutputSchema>;

export async function identifyMedicineFromImage(input: IdentifyMedicineFromImageInput): Promise<IdentifyMedicineFromImageOutput> {
  return identifyMedicineFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyMedicineFromImagePrompt',
  input: {schema: IdentifyMedicineFromImageInputSchema},
  output: {schema: IdentifyMedicineFromImageOutputSchema},
  prompt: `You are an expert pharmacist. You will identify the medicine in the video or image and extract key details.

  Analyze the following media and extract:
  1. The medicine name (both brand and common name if available).
  2. The purpose of the medicine, explained in simple, non-medical terms.
  3. The batch number from the packaging.
  4. The expiry date from the packaging.
  5. The manufacturer of the medicine.

  Media: {{media url=photoDataUri}}`,
});

const identifyMedicineFromImageFlow = ai.defineFlow(
  {
    name: 'identifyMedicineFromImageFlow',
    inputSchema: IdentifyMedicineFromImageInputSchema,
    outputSchema: IdentifyMedicineFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
