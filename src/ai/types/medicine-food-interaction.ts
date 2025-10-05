import { z } from 'zod';

export const MedicineFoodInteractionInputSchema = z.object({
  medicineName: z
    .string()
    .describe('The name of the medicine to check for food interactions (e.g., Panadol, Amoxicillin).'),
});
export type MedicineFoodInteractionInput = z.infer<typeof MedicineFoodInteractionInputSchema>;


const FoodItemSchema = z.object({
    name: z.string().describe('The name of the food item in English (e.g., "Milk", "Tea", "Paratha").'),
    nameUrdu: z.string().describe('The name of the food item in Urdu (e.g., "دودھ", "چائے", "پراٹھا").'),
    reason: z.string().describe('A simple, one-sentence explanation for the interaction in simple Urdu.'),
});

export const MedicineFoodInteractionOutputSchema = z.object({
  medicineName: z.string().describe('The recognized name of the medicine.'),
  purpose: z.string().describe('The primary purpose of the medicine in simple Urdu (e.g., "Bukhaar kam karna").'),
  interactions: z.object({
      avoid: z.array(FoodItemSchema).describe('A list of foods to strictly avoid with this medicine.'),
      warning: z.array(FoodItemSchema).describe('A list of foods to be cautious with or consume at a different time.'),
      safe: z.array(FoodItemSchema).describe('A list of foods that are safe to consume with the medicine.'),
  }),
  timingSuggestion: z.string().describe('A general suggestion on when to take the medicine in simple Urdu (e.g., "Khana khane ke 1 ghantay baad pani ke sath lein").'),
});
export type MedicineFoodInteractionOutput = z.infer<typeof MedicineFoodInteractionOutputSchema>;
