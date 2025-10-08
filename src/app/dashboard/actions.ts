'use server';

import { z } from 'zod';
import type { Readable } from 'stream';
import { identifyMedicineFromImage } from '@/ai/flows/identify-medicine-from-image';
import { detectFakeOrExpiredMedicine } from '@/ai/flows/detect-fake-or-expired-medicine';
import { getPersonalizedHealthGuidance } from '@/ai/flows/personalized-health-guidance';
import { translateMedicalJargon, TranslateMedicalJargonInput } from '@/ai/flows/translate-medical-jargon';
import { voiceBasedAssistantForSymptoms } from '@/ai/flows/voice-based-assistant-for-symptoms';
import type { VoiceBasedAssistantForSymptomsInput } from '@/ai/flows/voice-based-assistant-for-symptoms';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import { generalHealthQuery } from '@/ai/flows/general-health-query';
import { getMedicineFoodInteraction } from '@/ai/flows/get-medicine-food-interaction';
import type { MedicineFoodInteractionInput } from '@/ai/types/medicine-food-interaction';
import { coughAnalysisFlow } from '@/ai/flows/cough-analysis-flow';
import { debateFlow } from '@/ai/flows/debate-flow';
import type { DebateInput } from '@/ai/types/debate';
import { detectEmotion } from '@/ai/flows/detect-emotion-flow';
import { getMoodAdviceFlow } from '@/ai/flows/get-mood-advice-flow';
import type { DetectEmotionInput, GetMoodAdviceInput } from '@/ai/types/emotion';

/**
 * Central API response shape used across server actions.
 */
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Timeout helper for long-running AI calls.
 * Wraps a promise and rejects if not settled in `ms`.
 */
async function withTimeout<T>(promise: Promise<T>, ms = 20_000): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
    ),
  ]);
}

/**
 * Small centralized error formatter for consistent user-facing messages.
 */
function formatError(e: unknown): string {
  if (e instanceof Error) {
    // map common transient errors to friendly messages
    if (e.message.includes('ECONNRESET') || e.message.includes('timed out')) {
      return 'The AI service is temporarily unavailable. Please try again in a moment.';
    }
    return e.message || 'An unexpected error occurred.';
  }
  return 'An unexpected error occurred.';
}

/**
 * Basic validation helpers for data URIs
 */
function isValidDataUri(value?: unknown) {
  if (!value || typeof value !== 'string') return false;
  // Very small validation (do not use for security decisions)
  return /^data:[\w/+.-]+;base64,[A-Za-z0-9+/=]+$/.test(value);
}

/**
 * Limit for uploaded media (in bytes). 6 MB default here - adjust as needed.
 */
const MAX_MEDIA_BYTES = 6 * 1024 * 1024;
const AI_TIMEOUT_MS = 25_000;

/* ----------------------------
   Input schemas (zod)
   ---------------------------- */

const GuideSchema = z.object({
  age: z.coerce.number().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  symptoms: z.string().trim().optional(),
  media: z.any().optional(),
});

const HealthAdvisorInputSchema = z.object({
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

/* ----------------------------
   Public server action functions
   ---------------------------- */

/**
 * getMedicineGuide
 * Accepts form-data containing age, gender, symptoms and/or media (image/video).
 * Returns either identification + guidance or friendly error messages.
 */
export async function getMedicineGuide(formData: FormData): Promise<ApiResponse<any>> {
  try {
    const parsed = GuideSchema.parse({
      age: formData.get('age') || undefined,
      gender: formData.get('gender') || undefined,
      symptoms: formData.get('symptoms') || undefined,
      media: formData.get('media') || undefined,
    });

    const { age, gender, symptoms, media } = parsed;

    if (!media && !symptoms) {
      return { success: false, error: 'Provide symptoms text or upload a medicine image/video.' };
    }

    let photoDataUri: string | undefined;
    if (media) {
      // Media might be a File or a string data URL already on server
      // If it's a File (Web API), convert to data URI
      if (typeof (media as any).arrayBuffer === 'function') {
        const file = media as File;
        if (file.size > MAX_MEDIA_BYTES) {
          return { success: false, error: `Uploaded file exceeds ${MAX_MEDIA_BYTES / 1_048_576} MB limit.` };
        }
        const buffer = await file.arrayBuffer();
        photoDataUri = `data:${file.type};base64,${Buffer.from(buffer).toString('base64')}`;
      } else if (typeof media === 'string' && isValidDataUri(media)) {
        photoDataUri = media;
      } else {
        return { success: false, error: 'Unsupported media format. Please upload an image or short video.' };
      }
    }

    // If photo + symptoms + demographic available => full personalized flow
    if (photoDataUri && symptoms) {
      // Run identification + authenticity in parallel (fast)
      const [identification, authenticity] = await Promise.all([
        withTimeout(identifyMedicineFromImage({ photoDataUri }), AI_TIMEOUT_MS),
        withTimeout(detectFakeOrExpiredMedicine({ photoDataUri }), AI_TIMEOUT_MS),
      ]);

      // Personalized guidance (may be slower)
      const guidance = await withTimeout(
        getPersonalizedHealthGuidance({
          age: age ?? 0, // or prompt user for age
          gender: gender ?? 'other',
          symptoms: symptoms ?? '',
          medicineName: identification?.medicineName ?? '',
          medicineUsage: identification?.usage ?? '',
        }),
        
        AI_TIMEOUT_MS
      );

      return {
        success: true,
        data: { identification, authenticity, guidance },
      };
    }

    // If only photo given -> identify + return
    if (photoDataUri) {
      const identification = await withTimeout(identifyMedicineFromImage({ photoDataUri }), AI_TIMEOUT_MS);
      return { success: true, data: { identification, authenticity: null, guidance: null } };
    }

    // Only symptoms provided -> general health query
    if (symptoms) {
      const responseText = await withTimeout(
        generalHealthQuery({ symptoms, age, gender }),
        AI_TIMEOUT_MS
      );
      return { success: true, data: { text: responseText } };
    }

    // fallback guard (shouldn't be reached)
    return { success: false, error: 'Invalid input combination.' };
  } catch (err) {
    console.error('getMedicineGuide error:', err);
    return { success: false, error: formatError(err) };
  }
}

/**
 * translateJargon
 */
export async function translateJargon(input: TranslateMedicalJargonInput): Promise<ApiResponse<any>> {
  try {
    const result = await withTimeout(translateMedicalJargon(input), AI_TIMEOUT_MS);
    return { success: true, data: result };
  } catch (err) {
    console.error('translateJargon error:', err);
    return { success: false, error: formatError(err) };
  }
}

/**
 * getVoiceGuidance - voice assistant wrapper
 */
export async function getVoiceGuidance(input: VoiceBasedAssistantForSymptomsInput): Promise<ApiResponse<any>> {
  try {
    const result = await withTimeout(voiceBasedAssistantForSymptoms(input), AI_TIMEOUT_MS);
    return { success: true, data: result };
  } catch (err) {
    console.error('getVoiceGuidance error:', err);
    return { success: false, error: formatError(err) };
  }
}

/**
 * transcribeSymptoms - wrapper to transcribe audio data URI -> text
 */
export async function transcribeSymptoms(audioDataUri: string): Promise<ApiResponse<any>> {
  try {
    if (!isValidDataUri(audioDataUri)) {
      return { success: false, error: 'Invalid audio data. Provide a base64 data URI.' };
    }
    const result = await withTimeout(transcribeAudio(audioDataUri), AI_TIMEOUT_MS);
    return { success: true, data: result };
  } catch (err) {
    console.error('transcribeSymptoms error:', err);
    return { success: false, error: formatError(err) };
  }
}

/**
 * runHealthAdvisor - the main orchestrator used by the front-end voice assistant
 * Accepts HealthAdvisorInput and returns a human-friendly assistant message (text).
 */
export async function runHealthAdvisor(inputRaw: unknown): Promise<ApiResponse<{ text: string }>> {
  try {
    // parse & validate input (throws if invalid)
    const input = HealthAdvisorInputSchema.parse(inputRaw);

    // 1) Transcribe audio if provided
    let userQuery = input.textQuery?.trim() ?? '';

    if (input.audioDataUri) {
      if (!isValidDataUri(input.audioDataUri)) {
        return { success: false, error: 'Invalid audio data format.' };
      }
      const transcribe = await withTimeout(transcribeAudio(input.audioDataUri), AI_TIMEOUT_MS).catch((e) => {
        console.error('Transcription error:', e);
        return null;
      });
      if (transcribe && typeof transcribe.text === 'string' && transcribe.text.trim()) {
        userQuery = transcribe.text.trim();
      }
    }

    // 2) If nothing given, prompt user
    if (!userQuery && !input.photoDataUri) {
      return {
        success: true,
        data: { text: "Hi — I can help. Describe your symptoms or upload a medicine image to get started." },
      };
    }

    // 3) If photo provided -> identify medicine + authenticity
    if (input.photoDataUri) {
      if (!isValidDataUri(input.photoDataUri)) {
        return { success: false, error: 'Invalid photo data.' };
      }

      const [identification, authenticity] = await Promise.all([
        withTimeout(identifyMedicineFromImage({ photoDataUri: input.photoDataUri }), AI_TIMEOUT_MS),
        withTimeout(detectFakeOrExpiredMedicine({ photoDataUri: input.photoDataUri }), AI_TIMEOUT_MS),
      ]);

      // If user also provided symptoms (either via text or transcribed audio)
      if (userQuery) {
        // Ensure age/gender are non-undefined and valid for the personalized flow:
        const ageForGuidance = input.userDetails?.age ?? 30; // sensible default if missing
        const genderForGuidance = input.userDetails?.gender ?? 'other';

        const guidance = await withTimeout(
          getPersonalizedHealthGuidance({
            age: ageForGuidance,
            gender: genderForGuidance,
            symptoms: userQuery,
            medicineName: identification?.medicineName ?? '',
            medicineUsage: identification?.usage ?? '',
          }),
          AI_TIMEOUT_MS
        );

        const text = [
          '⚠️ Disclaimer: I am not a doctor. This is informational only.',
          `Identified medicine: ${identification?.medicineName ?? 'Unknown'}.`,
          `Purpose: ${identification?.usage ?? 'Unknown'}.`,
          authenticity ? (authenticity.isFakeOrExpired ? `Authenticity check: ${authenticity.reason}` : 'Authenticity: Appears authentic/not expired.') : '',
          guidance ? `Guidance: ${guidance.suitability ?? 'N/A'}` : '',
          guidance?.alternatives ? `Alternatives: ${guidance.alternatives}` : '',
        ]
          .filter(Boolean)
          .join('\n\n');

        return { success: true, data: { text } };
      }

      // only photo provided — ask for more details
      return {
        success: true,
        data: { text: `I found ${identification?.medicineName ?? 'a medicine'}. Tell me your age, gender, and symptoms for personalized advice.` },
      };
    }

    // 4) No photo, but userQuery exists -> general health response
    if (userQuery) {
      const responseText = await withTimeout(
        generalHealthQuery({
          symptoms: userQuery,
          age: input.userDetails?.age,
          gender: input.userDetails?.gender,
          userLang: input.userLang,
        }),
        AI_TIMEOUT_MS
      );
      return { success: true, data: { text: responseText } };
    }

    // fallback
    return { success: false, error: 'Could not process request: missing inputs.' };
  } catch (err) {
    console.error('runHealthAdvisor error:', err);
    return { success: false, error: formatError(err) };
  }
}

/**
 * getAudioForText - wrapper to produce TTS audio data
 * Signature: getAudioForText({ text, lang })
 */
export async function getAudioForText({
  text,
  lang,
}: {
  text: string;
  lang: string;
}): Promise<{
  success: boolean;
  data?: { audioDataUri: string };
  error?: string;
}> {
  try {
    // This is a placeholder. In a real app, you might have a Next.js API route
    // that calls your TTS flow. For simplicity here, we call the flow directly,
    // but this breaks the client/server boundary if not structured carefully.
    // The preferred way is an API route (`/api/tts`).
    const result = await textToSpeech(text);
    return { success: true, data: { audioDataUri: result.media } };
  } catch (err) {
    console.error('getAudioForText error', err);
    return { success: false, error: formatError(err) };
  }
}


/**
 * getFoodInteractionGuide
 */
export async function getFoodInteractionGuide(input: MedicineFoodInteractionInput): Promise<ApiResponse<any>> {
  try {
    const result = await withTimeout(getMedicineFoodInteraction(input), AI_TIMEOUT_MS);
    return { success: true, data: result };
  } catch (err) {
    console.error('getFoodInteractionGuide error:', err);
    return { success: false, error: formatError(err) };
  }
}

/**
 * analyzeCough
 */
export async function analyzeCough(audioDataUri: string): Promise<ApiResponse<any>> {
  try {
    if (!isValidDataUri(audioDataUri)) return { success: false, error: 'Invalid audio data for cough analysis.' };
    const result = await withTimeout(coughAnalysisFlow({ coughAudio: audioDataUri }), AI_TIMEOUT_MS);
    return { success: true, data: result };
  } catch (err) {
    console.error('analyzeCough error:', err);
    return { success: false, error: formatError(err) };
  }
}

/**
 * runDebate
 */
export async function runDebate(input: DebateInput): Promise<ApiResponse<any>> {
  try {
    const res = await withTimeout(debateFlow(input), AI_TIMEOUT_MS);
    return { success: true, data: res };
  } catch (err) {
    console.error('runDebate error:', err);
    return { success: false, error: formatError(err) };
  }
}

/**
 * getEmotionFromMedia
 */
export async function getEmotionFromMedia(input: DetectEmotionInput): Promise<ApiResponse<any>> {
  try {
    const res = await withTimeout(detectEmotion(input), AI_TIMEOUT_MS);
    return { success: true, data: res };
  } catch (err) {
    console.error('getEmotionFromMedia error:', err);
    return { success: false, error: formatError(err) };
  }
}

/**
 * getAdviceForMood
 */
export async function getAdviceForMood(input: GetMoodAdviceInput): Promise<ApiResponse<any>> {
  try {
    const res = await withTimeout(getMoodAdviceFlow(input), AI_TIMEOUT_MS);
    return { success: true, data: res };
  } catch (err) {
    console.error('getAdviceForMood error:', err);
    return { success: false, error: formatError(err) };
  }
}
