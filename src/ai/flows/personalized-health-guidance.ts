'use server';

/**
 * @fileOverview Provides personalized health guidance based on user details and identified medicine.
 *
 * - getPersonalizedHealthGuidance - A function that takes user details, symptoms, and medicine details to provide health guidance.
 * - PersonalizedHealthGuidanceInput - The input type for the getPersonalizedHealthGuidance function.
 * - PersonalizedHealthGuidanceOutput - The return type for the getPersonalizedHealthGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedHealthGuidanceInputSchema = z.object({
  age: z.number().describe('The age of the user in years.'),
  gender: z.enum(['male', 'female', 'other']).describe('The gender of the user.'),
  symptoms: z.string().describe('A description of the user\'s symptoms.'),
  medicineName: z.string().describe('The name of the identified medicine.'),
  medicineUsage: z.string().describe('The intended usage of the medicine.'),
});
export type PersonalizedHealthGuidanceInput = z.infer<typeof PersonalizedHealthGuidanceInputSchema>;

const PersonalizedHealthGuidanceOutputSchema = z.object({
  suitability: z.string().describe('An assessment of the medicine\'s suitability for the user based on their age, gender, and symptoms. State if it is risky.'),
  sideEffects: z.string().describe('Potential side effects of the medicine.'),
  warnings: z.string().describe('Any warnings or precautions associated with the medicine for the user.'),
  alternatives: z.string().optional().describe('If the medicine is unsuitable, suggest safer common alternatives or advise to see a doctor.'),
});
export type PersonalizedHealthGuidanceOutput = z.infer<typeof PersonalizedHealthGuidanceOutputSchema>;

export async function getPersonalizedHealthGuidance(
  input: PersonalizedHealthGuidanceInput
): Promise<PersonalizedHealthGuidanceOutput> {
  return personalizedHealthGuidanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedHealthGuidancePrompt',
  input: {schema: PersonalizedHealthGuidanceInputSchema},
  output: {schema: PersonalizedHealthGuidanceOutputSchema},
  prompt: `You are a helpful AI assistant specialized in providing personalized health guidance.

  Based on the user's age, gender, symptoms, and the identified medicine details, provide health guidance, check the medicine's suitability, and warn of potential side effects.

  User Details:
  - Age: {{{age}}}
  - Gender: {{{gender}}}
  - Symptoms: {{{symptoms}}}

  Medicine Details:
  - Name: {{{medicineName}}}
  - Usage: {{{medicineUsage}}}

  Instructions:
  1. Assess the suitability of the medicine for the user. Clearly state if it is risky or not recommended.
  2. List potential side effects of the medicine.
  3. Provide any relevant warnings or precautions for the user.
  4. If the medicine is unsuitable or risky, suggest safer, commonly available alternatives or strongly advise consulting a doctor.

  Provide the output in JSON format.
`,
});

const personalizedHealthGuidanceFlow = ai.defineFlow(
  {
    name: 'personalizedHealthGuidanceFlow',
    inputSchema: PersonalizedHealthGuidanceInputSchema,
    outputSchema: PersonalizedHealthGuidanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
