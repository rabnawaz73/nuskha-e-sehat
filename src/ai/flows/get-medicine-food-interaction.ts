'use server';
/**
 * @fileOverview Checks for food interactions with a given medicine, with a focus on a "desi" diet.
 *
 * - getMedicineFoodInteraction - A function that handles the interaction check.
 */

import { ai } from '@/ai/genkit';
import { 
    MedicineFoodInteractionInputSchema, 
    MedicineFoodInteractionOutputSchema,
    type MedicineFoodInteractionInput,
    type MedicineFoodInteractionOutput
} from '@/ai/types/medicine-food-interaction';


const prompt = ai.definePrompt({
  name: 'medicineFoodInteractionPrompt',
  input: { schema: MedicineFoodInteractionInputSchema },
  output: { schema: MedicineFoodInteractionOutputSchema },
  prompt: `You are an expert AI pharmacist specializing in medicine-food interactions, with deep knowledge of common Pakistani (desi) dietary habits.

  For the given medicine, "{{medicineName}}", provide a clear and simple guide for a user in Pakistan.

  Your instructions are:
  1.  **Identify the Medicine**: Confirm the medicine name.
  2.  **State the Purpose**: In simple Urdu, explain what the medicine is for.
  3.  **Check Food Interactions**: Analyze interactions with common desi foods. Your analysis must include, but is not limited to:
      - Chai (Tea)
      - Doodh (Milk) and other dairy products
      - Lassi
      - Paratha / Roti (Oily/Starchy foods)
      - Citrus Fruits (e.g., Orange, Lemon)
      - Oily / Fried food
      - Water
  4.  **Categorize Foods**:
      -   **Avoid (❌)**: Foods that must NOT be taken with the medicine.
      -   **Warning (⚠️)**: Foods that should be consumed with caution or at a different time (e.g., 2 hours apart).
      -   **Safe (✅)**: Foods that are perfectly fine to have with the medicine.
  5.  **Provide Simple Explanations**: For each interaction, give a very short reason in simple Urdu.
  6.  **Give Timing Suggestion**: Provide a clear recommendation on when to take the medicine relative to meals.
  7.  **Language**: All output text must be in simple, easy-to-understand Urdu. Avoid complex medical terms.

  Example for an antibiotic:
  - Medicine: Amoxicillin
  - Purpose: "Jism mein infection khatam karne ke liye."
  - Avoid: "Doodh", "Lassi". Reason: "Doodh is dawa ka asar kam kar deta hai."
  - Warning: "Chai". Reason: "Chai ke sath lene se kamzor ho sakti hai."
  - Safe: "Pani", "Sada Roti". Reason: "Pani ke sath lena sab se behtar hai."
  - Timing: "Khana khane ke 1 ghantay baad pani ke sath lein."

  Now, analyze "{{medicineName}}".
  `,
});


export async function getMedicineFoodInteraction(
  input: MedicineFoodInteractionInput
): Promise<MedicineFoodInteractionOutput> {
   const getMedicineFoodInteractionFlow = ai.defineFlow(
    {
      name: 'getMedicineFoodInteractionFlow',
      inputSchema: MedicineFoodInteractionInputSchema,
      outputSchema: MedicineFoodInteractionOutputSchema,
    },
    async (flowInput) => {
      const { output } = await prompt(flowInput);
      return output!;
    }
  );
  return getMedicineFoodInteractionFlow(input);
}
