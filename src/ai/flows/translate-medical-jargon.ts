'use server';
/**
 * @fileOverview Translates medical jargon into simpler terms in various local languages.
 *
 * - translateMedicalJargon - A function that translates medical jargon into simple terms.
 * - TranslateMedicalJargonInput - The input type for the translateMedicalJargon function.
 * - TranslateMedicalJargonOutput - The return type for the translateMedicalJargon function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateMedicalJargonInputSchema = z.object({
  medicalText: z
    .string()
    .describe('The medical jargon text to be translated into simpler terms.'),
  targetLanguage: z
    .enum(['Urdu', 'Punjabi', 'Sindhi', 'Pashto', 'Balochi'])
    .describe('The target local language for the translation.'),
});
export type TranslateMedicalJargonInput = z.infer<
  typeof TranslateMedicalJargonInputSchema
>;

const TranslateMedicalJargonOutputSchema = z.object({
  simpleExplanation: z
    .string()
    .describe('The simplified explanation of the medical jargon in the target language.'),
});
export type TranslateMedicalJargonOutput = z.infer<
  typeof TranslateMedicalJargonOutputSchema
>;

export async function translateMedicalJargon(
  input: TranslateMedicalJargonInput
): Promise<TranslateMedicalJargonOutput> {
  return translateMedicalJargonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateMedicalJargonPrompt',
  input: {schema: TranslateMedicalJargonInputSchema},
  output: {schema: TranslateMedicalJargonOutputSchema},
  prompt: `You are a medical expert skilled at explaining complex medical terms in simple language.

  Please translate the following medical text into a simple explanation in {{{targetLanguage}}}:
  {{{medicalText}}}
  `,
});

const translateMedicalJargonFlow = ai.defineFlow(
  {
    name: 'translateMedicalJargonFlow',
    inputSchema: TranslateMedicalJargonInputSchema,
    outputSchema: TranslateMedicalJargonOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
