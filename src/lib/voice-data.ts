export type Language = 'Urdu' | 'Punjabi' | 'Pashto' | 'Sindhi' | 'Siraiki' | 'Balochi';

export interface Voice {
    id: string;
    name: string;
    language: Language;
    provider: 'Google AI' | 'ElevenLabs' | 'Uplift AI';
    qualityScore: number;
    demoUrl: string; // URL to a short audio clip
}

// This is mock data. In a real application, this would come from a Firestore collection
// that is populated by a Cloud Function calling various TTS APIs.
export const mockVoices: Voice[] = [
    // Urdu Voices
    {
        id: 'v_ur_aisha',
        name: 'Aisha',
        language: 'Urdu',
        provider: 'Google AI',
        qualityScore: 8.5,
        demoUrl: 'https://storage.googleapis.com/studioprod-51147.appspot.com/assets/tts-samples/ur_female_01.wav',
    },
    {
        id: 'v_ur_bilal',
        name: 'Bilal',
        language: 'Urdu',
        provider: 'Uplift AI',
        qualityScore: 9.2,
        demoUrl: 'https://storage.googleapis.com/studioprod-51147.appspot.com/assets/tts-samples/ur_male_01.wav',
    },
    {
        id: 'v_ur_fatima',
        name: 'Fatima',
        language: 'Urdu',
        provider: 'ElevenLabs',
        qualityScore: 7.8,
        demoUrl: 'https://storage.googleapis.com/studioprod-51147.appspot.com/assets/tts-samples/ur_female_02.wav',
    },

    // Pashto Voices
    {
        id: 'v_ps_khushal',
        name: 'Khushal',
        language: 'Pashto',
        provider: 'Google AI',
        qualityScore: 8.1,
        demoUrl: 'https://storage.googleapis.com/studioprod-51147.appspot.com/assets/tts-samples/ps_male_01.wav',
    },
    {
        id: 'v_ps_malala',
        name: 'Malala',
        language: 'Pashto',
        provider: 'Uplift AI',
        qualityScore: 9.0,
        demoUrl: 'https://storage.googleapis.com/studioprod-51147.appspot.com/assets/tts-samples/ps_female_01.wav',
    },

     // Sindhi Voices
    {
        id: 'v_sd_sassui',
        name: 'Sassui',
        language: 'Sindhi',
        provider: 'Google AI',
        qualityScore: 8.8,
        demoUrl: 'https://storage.googleapis.com/studioprod-51147.appspot.com/assets/tts-samples/sd_female_01.wav',
    },
     {
        id: 'v_sd_hoat',
        name: 'Hoat',
        language: 'Sindhi',
        provider: 'Uplift AI',
        qualityScore: 8.2,
        demoUrl: 'https://storage.googleapis.com/studioprod-51147.appspot.com/assets/tts-samples/sd_male_01.wav',
    },

    // Punjabi Voices
    {
        id: 'v_pa_heer',
        name: 'Heer',
        language: 'Punjabi',
        provider: 'Uplift AI',
        qualityScore: 9.5,
        demoUrl: 'https://storage.googleapis.com/studioprod-51147.appspot.com/assets/tts-samples/pa_female_01.wav',
    },
     {
        id: 'v_pa_ranjha',
        name: 'Ranjha',
        language: 'Punjabi',
        provider: 'Google AI',
        qualityScore: 8.4,
        demoUrl: 'https://storage.googleapis.com/studioprod-51147.appspot.com/assets/tts-samples/pa_male_01.wav',
    },
     // Siraiki Voices (using Punjabi as a stand-in for demo audio)
    {
        id: 'v_sk_khwaja',
        name: 'Khwaja',
        language: 'Siraiki',
        provider: 'Google AI',
        qualityScore: 8.6,
        demoUrl: 'https://storage.googleapis.com/studioprod-51147.appspot.com/assets/tts-samples/pa_male_01.wav',
    },

    // Balochi Voices (using Pashto as a stand-in for demo audio)
     {
        id: 'v_ba_hambal',
        name: 'Hambal',
        language: 'Balochi',
        provider: 'Uplift AI',
        qualityScore: 8.3,
        demoUrl: 'https://storage.googleapis.com/studioprod-51147.appspot.com/assets/tts-samples/ps_male_01.wav',
    },
];
