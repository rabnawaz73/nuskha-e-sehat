'use server';
/**
 * @fileOverview Simulates detecting emotion from voice or image.
 *
 * - detectEmotion - A function that analyzes media and returns a detected emotion.
 */

import { ai } from '@/ai/genkit';
import { 
    DetectEmotionInputSchema,
    DetectEmotionOutputSchema,
    type DetectEmotionInput,
    type DetectEmotionOutput,
    type Emotion,
} from '@/ai/types/emotion';


const detectEmotionFlow = ai.defineFlow(
  {
    name: 'detectEmotionFlow',
    inputSchema: DetectEmotionInputSchema,
    outputSchema: DetectEmotionOutputSchema,
  },
  async (flowInput) => {
    
    // In a real application, this would call a machine learning model.
    // For this prototype, we'll simulate the analysis by returning a random emotion.
    
    const possibleEmotions: Emotion[] = ['Happy', 'Sad', 'Stressed', 'Tired', 'Calm'];
    const randomEmotion = possibleEmotions[Math.floor(Math.random() * possibleEmotions.length)];

    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time

    return {
        emotion: randomEmotion
    };
  }
);

export async function detectEmotion(input: DetectEmotionInput): Promise<DetectEmotionOutput> {
  return detectEmotionFlow(input);
}
