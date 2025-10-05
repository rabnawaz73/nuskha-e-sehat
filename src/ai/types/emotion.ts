import { z } from 'genkit';

export const EmotionEnum = z.enum(['Happy', 'Sad', 'Stressed', 'Tired', 'Calm', 'Neutral']);
export type Emotion = z.infer<typeof EmotionEnum>;

export const DetectEmotionInputSchema = z.object({
  mediaUri: z
    .string()
    .describe(
      "A selfie image or voice recording, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectEmotionInput = z.infer<typeof DetectEmotionInputSchema>;

export const DetectEmotionOutputSchema = z.object({
    emotion: EmotionEnum.describe('The detected emotion.'),
});
export type DetectEmotionOutput = z.infer<typeof DetectEmotionOutputSchema>;


export const GetMoodAdviceInputSchema = z.object({
    emotion: EmotionEnum,
    user_lang: z.string().optional().default('ur').describe('Users preferred language (e.g., "ur", "en").'),
});
export type GetMoodAdviceInput = z.infer<typeof GetMoodAdviceInputSchema>;

export const GetMoodAdviceOutputSchema = z.object({
    greeting: z.string().describe("A warm greeting in the user's language acknowledging the emotion."),
    tips: z.array(z.string()).describe("A list of 2-3 safe, practical, and empathetic tips."),
    affirmation: z.string().describe("A short, positive daily affirmation in the user's language."),
});
export type GetMoodAdviceOutput = z.infer<typeof GetMoodAdviceOutputSchema>;
