import { LanguageCode, translations } from "../i18n";

export interface SpeechResult {
  spoken: boolean;
  message?: string;
}

export function speakText(
  text: string,
  langCode: LanguageCode,
  slowVoice: boolean = true,
  onFallbackToast?: (msg: string) => void
): SpeechResult {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onFallbackToast?.(`🔊 ${text}`);
    return { spoken: false, message: text };
  }

  try {
    window.speechSynthesis.cancel();
    const dict = translations[langCode] || translations.en;
    const targetBcp47 = dict.speechLang; // en-IN, hi-IN, kn-IN, ta-IN, te-IN
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetBcp47;
    utterance.rate = slowVoice ? 0.85 : 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const langPrefix = targetBcp47.split("-")[0].toLowerCase();

    const matchedVoice =
      voices.find((v) => v.lang.toLowerCase() === targetBcp47.toLowerCase()) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    } else if (voices.length > 0 && langCode !== "en") {
      // Friendly toast when browser lacks native Indian script TTS pack, while still attempting utterance
      onFallbackToast?.(
        `🔊 (${dict.nativeName} Voice Display): "${text}"`
      );
    }

    window.speechSynthesis.speak(utterance);
    return { spoken: true };
  } catch (err) {
    onFallbackToast?.(`🔊 ${text}`);
    return { spoken: false, message: text };
  }
}

export function startVoiceDictation(
  langCode: LanguageCode,
  onResult: (transcript: string) => void,
  onError?: (msg: string) => void
) {
  if (typeof window === "undefined") return;
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError?.("Voice dictation is not supported in this browser. Please type instead.");
    return;
  }

  try {
    const recognition = new SpeechRecognition();
    const dict = translations[langCode] || translations.en;
    recognition.lang = dict.speechLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const text = event.results?.[0]?.[0]?.transcript;
      if (text) onResult(text);
    };

    recognition.onerror = () => {
      onError?.("Could not hear clearly. Please try speaking again or type below.");
    };

    recognition.start();
  } catch {
    onError?.("Microphone permission unavailable.");
  }
}
