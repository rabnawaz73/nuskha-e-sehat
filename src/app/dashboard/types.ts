import { z } from 'zod';

/**
 * Central API response shape used across server actions.
 */
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };


export const HealthAdvisorInputSchema = z.object({
  audioDataUri: z.string().optional().describe("Base64 data URI for audio."),
  textQuery: z.string().trim().optional(),
  photoDataUri: z.string().optional().describe("Base64 data URI for an image."),
  userDetails: z
    .object({
      age: z.coerce.number().optional(),
      gender: z.enum(['male', 'female', 'other']).optional(),
    })
    .optional(),
  userLang: z.string().optional(),
});
export type HealthAdvisorInput = z.infer<typeof HealthAdvisorInputSchema>;

