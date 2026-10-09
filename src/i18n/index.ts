import { LanguageCode, TranslationDictionary } from "./types";
import { en } from "./en";
import { hi } from "./hi";
import { kn } from "./kn";
import { ta } from "./ta";
import { te } from "./te";

export const translations: Record<LanguageCode, TranslationDictionary> = {
  en,
  hi,
  kn,
  ta,
  te,
};

export const LANGUAGE_LIST: {
  code: LanguageCode;
  nativeName: string;
  englishName: string;
  speechLang: string;
  sampleGreeting: string;
}[] = [
  {
    code: "en",
    nativeName: "English",
    englishName: "English",
    speechLang: "en-IN",
    sampleGreeting: "Choose your language. Welcome to Maatra.",
  },
  {
    code: "hi",
    nativeName: "हिन्दी",
    englishName: "Hindi",
    speechLang: "hi-IN",
    sampleGreeting: "अपनी भाषा चुनें। मात्रा में आपका स्वागत है।",
  },
  {
    code: "kn",
    nativeName: "ಕನ್ನಡ",
    englishName: "Kannada",
    speechLang: "kn-IN",
    sampleGreeting: "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಮಾತ್ರಾಗೆ ಸ್ವಾಗತ.",
  },
  {
    code: "ta",
    nativeName: "தமிழ்",
    englishName: "Tamil",
    speechLang: "ta-IN",
    sampleGreeting: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும். மாத்ராவிற்கு வரவேற்கிறோம்.",
  },
  {
    code: "te",
    nativeName: "తెలుగు",
    englishName: "Telugu",
    speechLang: "te-IN",
    sampleGreeting: "మీ భాషను ఎంచుకోండి. మాత్రాకు స్వాగతం.",
  },
];

export * from "./types";
