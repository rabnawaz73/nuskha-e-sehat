'use server';

import { z } from 'zod';
import {
  identifyMedicineFromImage,
} from '@/ai/flows/identify-medicine-from-image';
import {
  detectFakeOrExpiredMedicine,
} from '@/ai/flows/detect-fake-or-expired-medicine';
import {
  getPersonalizedHealthGuidance,
} from '@/ai/flows/personalized-health-guidance';
import { translateMedicalJargon, TranslateMedicalJargonInput } from '@/ai/flows/translate-medical-jargon';
import { voiceBasedAssistantForSymptoms } from '@/ai/flows/voice-based-assistant-for-symptoms';
import type { VoiceBasedAssistantForSymptomsInput } from '@/ai/flows/voice-based-assistant-for-symptoms';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import { generalHealthQuery } from '@/ai/flows/general-health-query';
import { getMedicineFoodInteraction } from '@/ai/flows/get-medicine-food-interaction';
import type { MedicineFoodInteractionInput } from '@/ai/types/medicine-food-interaction';
import { coughAnalysisFlow } from '@/ai/flows/cough-analysis-flow';
import { debateFlow, type DebateInput } from '@/ai/flows/debate-flow';
import { detectEmotion } from '@/ai/flows/detect-emotion-flow';
import { getMoodAdviceFlow } from '@/ai/flows/get-mood-advice-flow';
import type { DetectEmotionInput, GetMoodAdviceInput } from '@/ai/types/emotion';


const guideSchema = z.object({
  age: z.coerce.number().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  symptoms: z.string().optional(),
  media: z.any().optional(),
});

const HealthAdvisorInputSchema = z.object({
  audioDataUri: z.string().optional().describe(
    "The user's voice query as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  textQuery: z.string().optional().describe("The user's text query."),
  photoDataUri: z.string().optional().describe(
    "A photo of a medicine, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  userDetails: z.object({
    age: z.coerce.number().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
  }).optional(),
});
export type HealthAdvisorInput = z.infer<typeof HealthAdvisorInputSchema>;


export async function getMedicineGuide(formData: FormData) {
  try {
    const validatedData = guideSchema.parse({
      age: formData.get('age') || undefined,
      gender: formData.get('gender') || undefined,
      symptoms: formData.get('symptoms') || undefined,
      media: formData.get('media'),
    });

    const { age, gender, symptoms, media } = validatedData;
    
    if (!media && !symptoms) {
      return {
        success: false,
        error: 'Please provide either symptoms or a medicine image/video.',
      };
    }
    
    let photoDataUri: string | undefined;
    if (media && media.size > 0) {
      const buffer = await media.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      photoDataUri = `data:${media.type};base64,${base64}`;
    }

    // Case 1: Photo and symptoms provided
    if (photoDataUri && symptoms && age && gender) {
       const [identification, authenticity] = await Promise.all([
        identifyMedicineFromImage({ photoDataUri }),
        detectFakeOrExpiredMedicine({ photoDataUri }),
      ]);

      const guidance = await getPersonalizedHealthGuidance({
        age,
        gender,
        symptoms,
        medicineName: identification.medicineName,
        medicineUsage: identification.usage,
      });

       return {
        success: true,
        data: {
          identification,
          authenticity,
          guidance,
        },
      };
    }

    // Case 2: Only photo provided
    if (photoDataUri) {
      const identification = await identifyMedicineFromImage({ photoDataUri });
      return {
        success: true,
        data: {
          identification,
          guidance: null,
          authenticity: null,
        }
      }
    }

    // Case 3: Only symptoms provided
    if (symptoms) {
        try {
            return await generalHealthQuery({symptoms, age, gender});
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while getting your health recommendation.';
             return {
                success: false,
                error: errorMessage,
            };
        }
    }

    // Should not be reached due to initial check
    return {
      success: false,
      error: 'Invalid input combination.',
    }

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function translateJargon(input: TranslateMedicalJargonInput) {
    try {
        const result = await translateMedicalJargon(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return {
          success: false,
          error: errorMessage,
        };
    }
}

export async function getVoiceGuidance(input: VoiceBasedAssistantForSymptomsInput) {
    try {
        const result = await voiceBasedAssistantForSymptoms(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return {
          success: false,
          error: errorMessage,
        };
    }
}

export async function transcribeSymptoms(audioDataUri: string) {
    try {
        const result = await transcribeAudio(audioDataUri);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return {
          success: false,
          error: errorMessage,
        };
    }
}

export async function runHealthAdvisor(input: HealthAdvisorInput) {
  try {
    let userQuery = input.textQuery || '';

    // Step 1: Transcribe audio if present
    if (input.audioDataUri) {
      const transcriptionResponse = await transcribeAudio(input.audioDataUri);
      if (transcriptionResponse.text) {
        userQuery = transcriptionResponse.text;
      }
    }
    
    if (!userQuery && !input.photoDataUri) {
        const responseText = "I can help you with your health questions. Please describe your symptoms or show me a medicine.";
        return {
            success: true,
            data: { text: responseText }
        }
    }

    // Step 2: Main logic based on inputs
    if (input.photoDataUri) {
      // Case 1: Photo is provided.
      const [identification, authenticity] = await Promise.all([
        identifyMedicineFromImage({ photoDataUri: input.photoDataUri }),
        detectFakeOrExpiredMedicine({ photoDataUri: input.photoDataUri }),
      ]);

      if (userQuery) {
        // Subcase 1.1: Photo AND symptoms provided. Give full guidance.
         const guidance = await getPersonalizedHealthGuidance({
          age: input.userDetails?.age || 30, // Default age
          gender: input.userDetails?.gender || 'other', // Default gender
          symptoms: userQuery,
          medicineName: identification.medicineName,
          medicineUsage: identification.usage,
        });

        const responseText = `⚠️ I am not a real doctor. This is for advice only. \n\nBased on my analysis of ${"identification.medicineName"} and your symptoms, here is my guidance. Authenticity: ${"authenticity.isFakeOrExpired" ? authenticity.reason : 'This medicine appears to be authentic and not expired.'}. Suitability: ${"guidance.suitability"}. Potential Side Effects: ${"guidance.sideEffects"}. Warnings: ${"guidance.warnings"}. ${"guidance.alternatives" ? `\nAlternatives: ${guidance.alternatives}`: ''}`;
        return {
            success: true,
            data: { text: responseText }
        }
      } else {
        // Subcase 1.2: Only photo provided. Identify and ask for more info.
        const responseText = `I've identified the medicine as ${"identification.medicineName"}. Its purpose is ${"identification.usage"}. For personalized guidance, please tell me your symptoms.`;
        return {
            success: true,
            data: { text: responseText }
        }
      }
    } else if (userQuery) {
      // Case 2: No photo, but symptoms are provided.
      try {
        return await generalHealthQuery({
            symptoms: userQuery,
            age: input.userDetails?.age,
            gender: input.userDetails?.gender,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while getting your health recommendation.';
         return {
            success: false,
            error: errorMessage,
        };
      }

    } else {
      // Case 3: No photo and no symptoms. (Should be handled by the check at the top)
      const responseText = "I can help you with your health questions. Please describe your symptoms or show me a medicine.";
       return {
            success: true,
            data: { text: responseText }
        }
    }
  } catch (error) {
    console.error("Error in runHealthAdvisor:", error);
    let userFriendlyError = "I'm sorry, I encountered an error and couldn't process your request. Please try again.";

    if (error instanceof Error) {
        if (error.message.includes('503') || error.message.includes('overloaded')) {
            userFriendlyError = "The AI model is currently overloaded. Please wait a moment and try your request again.";
        } else if (error.message) {
            userFriendlyError = error.message;
        }
    }
    
    return {
      success: false,
      error: userFriendlyError,
    };
  }
}

export async function getAudioForText(text: string) {
    if (!text) {
        return { success: false, error: 'No text provided for speech synthesis.' };
    }
    try {
        const ttsResponse = await textToSpeech(text);
        return { 
          success: true, 
          data: {
            audioDataUri: ttsResponse.media
          }
        };
    } catch (error) {
        console.error("Error in textToSpeech:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: errorMessage };
    }
}

export async function getFoodInteractionGuide(input: MedicineFoodInteractionInput) {
    try {
        const result = await getMedicineFoodInteraction(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error in getFoodInteractionGuide:", error);
        let userFriendlyError = "I'm sorry, I couldn't process your request for food interactions. Please try again.";

        if (error instanceof Error) {
            if (error.message.includes('503') || error.message.includes('overloaded')) {
                userFriendlyError = "The AI model is currently overloaded. Please wait a moment and try your request again.";
            } else if (error.message) {
                userFriendlyError = error.message;
            }
        }
        return { success: false, error: userFriendlyError };
    }
}

export async function analyzeCough(audioDataUri: string) {
    try {
        const result = await coughAnalysisFlow({ coughAudio: audioDataUri });
        return { success: true, data: result };
    } catch (error) {
        console.error("Error in analyzeCough:", error);
        let userFriendlyError = "I'm sorry, I couldn't process your cough analysis request. Please try again.";

        if (error instanceof Error) {
            if (error.message.includes('503') || error.message.includes('overloaded')) {
                userFriendlyError = "The AI model is currently overloaded. Please wait a moment and try your request again.";
            } else if (error.message) {
                userFriendlyError = error.message;
            }
        }
        return { success: false, error: userFriendlyError };
    }
}

export async function runDebate(input: DebateInput) {
    try {
        const result = await debateFlow(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error in runDebate:", error);
        let userFriendlyError = "I'm sorry, I couldn't process your request for an AI debate. Please try again.";

        if (error instanceof Error) {
            if (error.message.includes('503') || error.message.includes('overloaded')) {
                userFriendlyError = "The AI model is currently overloaded. Please wait a moment and try your request again.";
            } else if (error.message) {
                userFriendlyError = error.message;
            }
        }
        return { success: false, error: userFriendlyError };
    }
}


export async function getEmotionFromMedia(input: DetectEmotionInput) {
    try {
        const result = await detectEmotion(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error in getEmotionFromMedia:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while detecting emotion.";
        return { success: false, error: errorMessage };
    }
}

export async function getAdviceForMood(input: GetMoodAdviceInput) {
    try {
        const result = await getMoodAdviceFlow(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error in getAdviceForMood:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while getting advice.";
        return { success: false, error: errorMessage };
    }
}
