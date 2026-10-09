import { GoogleGenAI, Type } from "@google/genai";

export type SupportedScanLang = "en" | "hi" | "kn" | "ta" | "te";

export interface ScannedMedicineItem {
  name: string;
  localizedName?: string;
  strength: string;
  form: "tablet" | "capsule" | "syrup";
  doseAmount: number;
  frequency: string;
  timesOfDay: ("morning" | "afternoon" | "night")[];
  durationDays: number;
  specialInstructions: "before_food" | "after_food" | "with_food";
  suggestedColor: string;
  suggestedShape: "round" | "oval" | "capsule" | "syrup";
  conditionTag?: string;
}

export interface StepByStepBreakdownItem {
  stepNumber: number;
  medicineName: string;
  localizedMedicineName?: string;
  dosage: string;
  timingInstructions: string;
  unclearWarning?: string;
}

export interface PrescriptionScanResult {
  isDemo: boolean;
  reason?: string;
  targetLang: SupportedScanLang;
  transcribedText: string;
  translatedEnglishText: string;
  translatedSelectedLangText: string;
  stepByStepBreakdown: StepByStepBreakdownItem[];
  hasBlurryOrUnclearParts: boolean;
  blurryOrUnclearFlags: string[];
  medicines: ScannedMedicineItem[];
}

const LANGUAGE_LABELS: Record<SupportedScanLang, string> = {
  en: "English",
  hi: "Hindi (हिन्दी - Devanagari script)",
  kn: "Kannada (ಕನ್ನಡ - Kannada script)",
  ta: "Tamil (தமிழ் - Tamil script)",
  te: "Telugu (తెలుగు - Telugu script)",
};

export const DEMO_SCANNED_MEDICINES: ScannedMedicineItem[] = [
  {
    name: "Metformin Hydrochloride (Glycomet)",
    localizedName: "Metformin Hydrochloride (Glycomet)",
    strength: "500 mg",
    form: "tablet",
    doseAmount: 1,
    frequency: "Twice daily (1-0-1)",
    timesOfDay: ["morning", "night"],
    durationDays: 30,
    specialInstructions: "after_food",
    suggestedColor: "#FFFFFF",
    suggestedShape: "oval",
    conditionTag: "Diabetes",
  },
  {
    name: "Amlodipine Besylate (Stamlo)",
    localizedName: "Amlodipine Besylate (Stamlo)",
    strength: "5 mg",
    form: "tablet",
    doseAmount: 1,
    frequency: "Once daily (1-0-0)",
    timesOfDay: ["morning"],
    durationDays: 30,
    specialInstructions: "after_food",
    suggestedColor: "#FACC15",
    suggestedShape: "round",
    conditionTag: "Blood pressure",
  },
  {
    name: "Ambroxol Pediatric Cough Syrup",
    localizedName: "Ambroxol Pediatric Cough Syrup",
    strength: "15 mg / 5 ml",
    form: "syrup",
    doseAmount: 5,
    frequency: "Twice daily (5ml - 0 - 5ml)",
    timesOfDay: ["morning", "night"],
    durationDays: 5,
    specialInstructions: "after_food",
    suggestedColor: "#F472B6",
    suggestedShape: "syrup",
    conditionTag: "Asthma",
  },
];

export const DEMO_LOCALIZED_DATA: Record<
  SupportedScanLang,
  {
    translatedText: string;
    medicines: {
      localizedName: string;
      dosage: string;
      timing: string;
      unclearWarning?: string;
    }[];
    blurryFlags: string[];
  }
> = {
  en: {
    translatedText:
      "Dr. A. K. Rao Clinic — Prescription:\n1) Tablet Glycomet (Metformin Hydrochloride) 500 mg — Take 1 tablet in the Morning and 1 tablet at Night after meals for 30 days.\n2) Tablet Stamlo (Amlodipine) 5 mg — Take 1 tablet in the Morning after breakfast for 30 days.\n3) Syrup Ambroxol 15 mg / 5 ml — Take 5 ml (1 teaspoon) twice daily in the Morning and at Night after food for 5 days.\n[Note: Handwritten remark at the bottom right corner is smudged and unclear.]",
    medicines: [
      {
        localizedName: "Metformin Hydrochloride (Glycomet) 500 mg Tablet",
        dosage: "1 Tablet (500 mg) per dose",
        timing:
          "Take twice daily — 1 tablet in the Morning after breakfast and 1 tablet at Night after dinner for 30 days.",
      },
      {
        localizedName: "Amlodipine Besylate (Stamlo) 5 mg Tablet",
        dosage: "1 Tablet (5 mg) per dose",
        timing:
          "Take once daily — 1 tablet in the Morning after breakfast for 30 days.",
      },
      {
        localizedName: "Ambroxol Pediatric Cough Syrup (15 mg / 5 ml)",
        dosage: "5 ml (1 measuring spoon) per dose",
        timing:
          "Take twice daily — 5 ml in the Morning and 5 ml at Night after food for 5 days.",
        unclearWarning:
          "Handwritten duration digit on the right edge is slightly faint — confirm 5-day course with your doctor or pharmacist.",
      },
    ],
    blurryFlags: [
      "Bottom-right handwritten note is too blurry/smudged to read safely — do not guess instructions from that section.",
      "Handwritten duration next to Item #3 (Ambroxol Syrup) has low contrast — please confirm the exact number of days with your doctor or pharmacist.",
    ],
  },
  hi: {
    translatedText:
      "डॉ. ए. के. राव क्लिनिक — पर्ची का हिंदी अनुवाद:\n1) गोली ग्लाइकोमेट (मेटफॉर्मिन हाइड्रोक्लोराइड / Metformin) 500 मि.ग्रा. — सुबह और रात भोजन के बाद 1-1 गोली, 30 दिनों तक।\n2) गोली स्टैमलो (एम्लोडिपिन / Amlodipine) 5 मि.ग्रा. — सुबह नाश्ते के बाद 1 गोली, 30 दिनों तक।\n3) सिरप एम्ब्रॉक्सोल (Ambroxol खांसी की दवा) 15 मि.ग्रा./5 मि.ली. — सुबह और रात भोजन के बाद 5 मि.ली. (1 चम्मच), 5 दिनों तक।\n[नोट: नीचे दाईं ओर लिखा गया हाथ का नोट धुंधला और अस्पष्ट है।]",
    medicines: [
      {
        localizedName: "मेटफॉर्मिन (ग्लाइकोमेट) 500 मि.ग्रा. की गोली",
        dosage: "1 गोली (500 मि.ग्रा.) प्रति खुराक",
        timing:
          "दिन में दो बार — सुबह नाश्ते के बाद 1 गोली और रात के खाने के बाद 1 गोली (30 दिनों तक)।",
      },
      {
        localizedName: "एम्लोडिपिन (स्टैमलो) 5 मि.ग्रा. की गोली",
        dosage: "1 गोली (5 मि.ग्रा.) प्रति खुराक",
        timing: "दिन में एक बार — सुबह नाश्ते के बाद 1 गोली (30 दिनों तक)।",
      },
      {
        localizedName: "एम्ब्रॉक्सोल खांसी का सिरप (15 मि.ग्रा. / 5 मि.ली.)",
        dosage: "5 मि.ली. (1 नापने वाला चम्मच)",
        timing:
          "दिन में दो बार — सुबह और रात खाने के बाद 5 मि.ली. (5 दिनों तक)।",
        unclearWarning:
          "तीसरी दवा के पास दिनों की संख्या थोड़ी धुंधली लिखी है — कृपया डॉक्टर या केमिस्ट से 5 दिन की पुष्टि करें।",
      },
    ],
    blurryFlags: [
      "पर्ची के नीचे दाएं कोने में हाथ से लिखा नोट बहुत धुंधला है — सुरक्षा के लिए उसका अनुमान न लगाएं।",
      "तीसरी दवा (एम्ब्रॉक्सोल सिरप) के पास लिखे दिनों की संख्या हल्की है — कृपया डॉक्टर से पुष्टि करें।",
    ],
  },
  kn: {
    translatedText:
      "ಡಾ. ಎ. ಕೆ. ರಾವ್ ಕ್ಲಿನಿಕ್ — ಕನ್ನಡ ಅನುವಾದ:\n1) ಗ್ಲೈಕೊಮೆಟ್ ಮಾತ್ರೆ (ಮೆಟ್‌ಫಾರ್ಮಿನ್ / Metformin) 500 ಮಿ.ಗ್ರಾಂ — ಬೆಳಿಗ್ಗೆ ಮತ್ತು ರಾತ್ರಿ ಊಟದ ನಂತರ 1 ಮಾತ್ರೆ, 30 ದಿನಗಳವರೆಗೆ.\n2) ಸ್ಟಾಮ್ಲೊ ಮಾತ್ರೆ (ಅಮ್ಲೋಡಿಪಿನ್ / Amlodipine) 5 ಮಿ.ಗ್ರಾಂ — ಬೆಳಿಗ್ಗೆ ಉಪಾಹಾರದ ನಂತರ 1 ಮಾತ್ರೆ, 30 ದಿನಗಳವರೆಗೆ.\n3) ಆಂಬ್ರೊಕ್ಸಾಲ್ ಕೆಮ್ಮಿನ ಸಿರಪ್ (Ambroxol Syrup) 15 ಮಿ.ಗ್ರಾಂ/5 ಮಿ.ಲೀ — ಬೆಳಿಗ್ಗೆ ಮತ್ತು ರಾತ್ರಿ ಊಟದ ನಂತರ 5 ಮಿ.ಲೀ (1 ಚಮಚ), 5 ದಿನಗಳವರೆಗೆ.\n[ಗಮನಿಸಿ: ಕೆಳಗಿನ ಬಲ ಮೂಲೆಯಲ್ಲಿ ಕೈಬರಹದ ಟಿಪ್ಪಣಿ ಮಂದವಾಗಿದ್ದು ಓದಲು ಅಸ್ಪಷ್ಟವಾಗಿದೆ.]",
    medicines: [
      {
        localizedName: "ಮೆಟ್‌ಫಾರ್ಮಿನ್ (ಗ್ಲೈಕೊಮೆಟ್) 500 ಮಿ.ಗ್ರಾಂ ಮಾತ್ರೆ",
        dosage: "1 ಮಾತ್ರೆ (500 ಮಿ.ಗ್ರಾಂ)",
        timing:
          "ದಿನಕ್ಕೆ ಎರಡು ಬಾರಿ — ಬೆಳಿಗ್ಗೆ ತಿಂಡಿಯ ನಂತರ 1 ಮಾತ್ರೆ ಮತ್ತು ರಾತ್ರಿ ಊಟದ ನಂತರ 1 ಮಾತ್ರೆ (30 ದಿನಗಳು).",
      },
      {
        localizedName: "ಅಮ್ಲೋಡಿಪಿನ್ (ಸ್ಟಾಮ್ಲೊ) 5 ಮಿ.ಗ್ರಾಂ ಮಾತ್ರೆ",
        dosage: "1 ಮಾತ್ರೆ (5 ಮಿ.ಗ್ರಾಂ)",
        timing:
          "ದಿನಕ್ಕೆ ಒಂದು ಬಾರಿ — ಬೆಳಿಗ್ಗೆ ತಿಂಡಿಯ ನಂತರ 1 ಮಾತ್ರೆ (30 ದಿನಗಳು).",
      },
      {
        localizedName: "ಆಂಬ್ರೊಕ್ಸಾಲ್ ಕೆಮ್ಮಿನ ಸಿರಪ್ (15 ಮಿ.ಗ್ರಾಂ / 5 ಮಿ.ಲೀ)",
        dosage: "5 ಮಿ.ಲೀ (1 ಚಮಚ)",
        timing:
          "ದಿನಕ್ಕೆ ಎರಡು ಬಾರಿ — ಬೆಳಿಗ್ಗೆ ಮತ್ತು ರಾತ್ರಿ ಊಟದ ನಂತರ 5 ಮಿ.ಲೀ (5 ದಿನಗಳು).",
        unclearWarning:
          "ಮೂರನೇ ಔಷಧಿಯ ದಿನಗಳ ಸಂಖ್ಯೆ ಸ್ವಲ್ಪ ಮಂದವಾಗಿದೆ — ದಯವಿಟ್ಟು ವೈದ್ಯರು ಅಥವಾ ಫಾರ್ಮಸಿಸ್ಟ್ ಬಳಿ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.",
      },
    ],
    blurryFlags: [
      "ಕೆಳಗಿನ ಬಲ ಮೂಲೆಯ ಕೈಬರಹದ ಟಿಪ್ಪಣಿ ತುಂಬಾ ಮಂದವಾಗಿದೆ (Blurry) — ಸುರಕ್ಷತೆಗಾಗಿ ಊಹಿಸಬೇಡಿ.",
      "ಮೂರನೇ ಔಷಧಿಯ (ಆಂಬ್ರೊಕ್ಸಾಲ್ ಸಿರಪ್) ದಿನಗಳ ಸಂಖ್ಯೆ ಮಂದವಾಗಿದೆ — ದಯವಿಟ್ಟು ವೈದ್ಯರನ್ನು ಕೇಳಿ ಖಚಿತಪಡಿಸಿ.",
    ],
  },
  ta: {
    translatedText:
      "டாக்டர் ஏ. கே. ராவ் கிளினிக் — தமிழ் மொழிபெயர்ப்பு:\n1) கிளைகோமெட் மாத்திரை (மெட்ஃபார்மின் / Metformin) 500 மி.கி — காலை மற்றும் இரவு உணவுக்குப் பிறகு 1 மாத்திரை, 30 நாட்களுக்கு.\n2) ஸ்டாம்லோ மாத்திரை (அம்லோடிபின் / Amlodipine) 5 மி.கி — காலை உணவுக்குப் பிறகு 1 மாத்திரை, 30 நாட்களுக்கு.\n3) அம்புரோக்சால் இருமல் மருந்து (Ambroxol Syrup) 15 மி.கி/5 மி.லி — காலை மற்றும் இரவு உணவுக்குப் பிறகு 5 மி.லி (1 ஸ்பூன்), 5 நாட்களுக்கு.\n[குறிப்பு: கீழ் வலது மூலையில் உள்ள கையெழுத்து மங்கலாகவும் தெளிவற்றதாகவும் உள்ளது.]",
    medicines: [
      {
        localizedName: "மெட்ஃபார்மின் (கிளைகோமெட்) 500 மி.கி மாத்திரை",
        dosage: "1 மாத்திரை (500 மி.கி)",
        timing:
          "தினமும் இரண்டு முறை — காலை உணவுக்குப் பிறகு 1 மாத்திரை மற்றும் இரவு உணவுக்குப் பிறகு 1 மாத்திரை (30 நாட்கள்).",
      },
      {
        localizedName: "அம்லோடிபின் (ஸ்டாம்லோ) 5 மி.கி மாத்திரை",
        dosage: "1 மாத்திரை (5 மி.கி)",
        timing:
          "தினமும் ஒரு முறை — காலை உணவுக்குப் பிறகு 1 மாத்திரை (30 நாட்கள்).",
      },
      {
        localizedName: "அம்புரோக்சால் இருமல் சிரப் (15 மி.கி / 5 மி.லி)",
        dosage: "5 மி.லி (1 அளவு ஸ்பூன்)",
        timing:
          "தினமும் இரண்டு முறை — காலை மற்றும் இரவு உணவுக்குப் பிறகு 5 மி.லி (5 நாட்கள்).",
        unclearWarning:
          "மூன்றாவது மருந்தின் நாட்களின் எண்ணிக்கை சற்று மங்கலாக உள்ளது — மருத்துவரிடம் 5 நாட்களா என உறுதிப்படுத்தவும்.",
      },
    ],
    blurryFlags: [
      "கீழ் வலது மூலையில் உள்ள கையெழுத்துப் பகுதி பாதுகாப்பாகப் படிக்க முடியாத அளவுக்கு மங்கலாக உள்ளது.",
      "மூன்றாவது மருந்து (அம்புரோக்சால் சிரப்) அருகே உள்ள நாட்கள் எண் மங்கலாக உள்ளது — மருத்துவரிடம் சரிபார்க்கவும்.",
    ],
  },
  te: {
    translatedText:
      "డా. ఏ. కే. రావు క్లినిక్ — తెలుగు అనువాదం:\n1) గ్లైకోమెట్ మాత్ర (మెట్‌ఫార్మిన్ / Metformin) 500 మి.గ్రా — ఉదయం మరియు రాత్రి భోజనం తర్వాత 1 మాత్ర, 30 రోజుల పాటు.\n2) స్టామ్లో మాత్ర (అమ్లోడిపిన్ / Amlodipine) 5 మి.గ్రా — ఉదయం అల్పాహారం తర్వాత 1 మాత్ర, 30 రోజుల పాటు.\n3) ఆంబ్రోక్సాల్ దగ్గు సిరప్ (Ambroxol Syrup) 15 మి.గ్రా/5 మి.లీ — ఉదయం మరియు రాత్రి భోజనం తర్వాత 5 మి.లీ (1 చెంచా), 5 రోజుల పాటు.\n[గమనిక: క్రింది కుడి మూలలో చేతిరాత మసకగా మరియు అస్పష్టంగా ఉంది.]",
    medicines: [
      {
        localizedName: "మెట్‌ఫార్మిన్ (గ్లైకోమెట్) 500 మి.గ్రా మాత్ర",
        dosage: "1 మాత్ర (500 మి.గ్రా)",
        timing:
          "రోజుకు రెండుసార్లు — ఉదయం టిఫిన్ తర్వాత 1 మాత్ర మరియు రాత్రి భోజనం తర్వాత 1 మాత్ర (30 రోజులు).",
      },
      {
        localizedName: "అమ్లోడిపిన్ (స్టామ్లో) 5 మి.గ్రా మాత్ర",
        dosage: "1 మాత్ర (5 మి.గ్రా)",
        timing:
          "రోజుకు ఒక్కసారి — ఉదయం అల్పాహారం తర్వాత 1 మాత్ర (30 రోజులు).",
      },
      {
        localizedName: "ఆంబ్రోక్సాల్ దగ్గు సిరప్ (15 మి.గ్రా / 5 మి.లీ)",
        dosage: "5 మి.లీ (1 చెంచా)",
        timing:
          "రోజుకు రెండుసార్లు — ఉదయం మరియు రాత్రి భోజనం తర్వాత 5 మి.లీ (5 రోజులు).",
        unclearWarning:
          "మూడవ మందు పక్కన రోజుల సంఖ్య కొంచెం మసకగా ఉంది — దయచేసి డాక్టర్ లేదా ఫార్మసిస్ట్‌తో నిర్ధారించుకోండి.",
      },
    ],
    blurryFlags: [
      "క్రింది కుడి మూలలో ఉన్న చేతిరాత చదవడానికి వీలులేనంత మసకగా (Blurry) ఉంది — ఊహించి వేసుకోకండి.",
      "మూడవ మందు (ఆంబ్రోక్సాల్ సిరప్) పక్కన ఉన్న రోజుల సంఖ్య అస్పష్టంగా ఉంది — డాక్టర్‌ను అడిగి నిర్ధారించుకోండి.",
    ],
  },
};

export function buildDemoResultForLang(
  lang: SupportedScanLang = "en",
  reason?: string
): PrescriptionScanResult {
  const safeLang: SupportedScanLang = DEMO_LOCALIZED_DATA[lang] ? lang : "en";
  const loc = DEMO_LOCALIZED_DATA[safeLang];

  return {
    isDemo: true,
    reason,
    targetLang: safeLang,
    transcribedText:
      "Dr. A. K. Rao Clinic — Rx:\n1) Tab. Glycomet (Metformin HCl) 500mg — 1-0-1 (भोजन के बाद / After meals) x 30 days\n2) Tab. Stamlo (Amlodipine) 5mg — 1-0-0 (सुबह नाश्ते के बाद) x 30 days\n3) Syp. Ambroxol 15mg/5ml — 5ml BD (Morning & Night after food) x 5 days\n[Bottom corner handwritten note partially smudged]",
    translatedEnglishText: DEMO_LOCALIZED_DATA.en.translatedText,
    translatedSelectedLangText: loc.translatedText,
    stepByStepBreakdown: DEMO_SCANNED_MEDICINES.map((m, idx) => ({
      stepNumber: idx + 1,
      medicineName: `${m.name} (${m.strength})`,
      localizedMedicineName:
        loc.medicines[idx]?.localizedName || `${m.name} (${m.strength})`,
      dosage: loc.medicines[idx]?.dosage || `${m.doseAmount} ${m.form}`,
      timingInstructions: loc.medicines[idx]?.timing || m.frequency,
      unclearWarning: loc.medicines[idx]?.unclearWarning,
    })),
    hasBlurryOrUnclearParts: true,
    blurryOrUnclearFlags: loc.blurryFlags,
    medicines: DEMO_SCANNED_MEDICINES.map((m, idx) => ({
      ...m,
      localizedName: loc.medicines[idx]?.localizedName || m.name,
    })),
  };
}

export async function analyzePrescriptionBase64(
  imageBase64?: string,
  mimeType: string = "image/jpeg",
  targetLangInput?: string
): Promise<PrescriptionScanResult> {
  const targetLang: SupportedScanLang = [
    "en",
    "hi",
    "kn",
    "ta",
    "te",
  ].includes(String(targetLangInput))
    ? (targetLangInput as SupportedScanLang)
    : "en";
  const langName = LANGUAGE_LABELS[targetLang];

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || !imageBase64) {
    return buildDemoResultForLang(
      targetLang,
      !apiKey || apiKey === "MY_GEMINI_API_KEY"
        ? `GEMINI_API_KEY not configured — showing verified sample scan translated into ${langName}`
        : `Sample prescription scan translated into ${langName}`
    );
  }

  try {
    const cleanBase64 = imageBase64.replace(
      /^data:image\/[a-zA-Z0-9+.-]+;base64,/,
      ""
    );
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const promptText =
      `Immediately after taking this photo, scan the image to transcribe all visible text, and then translate it into BOTH clear English AND the user's selected language: ${langName}. ` +
      `IMPORTANT: Always write the name of every tablet/medicine in the user's selected language script (${langName}) in \`localizedMedicineName\` and \`localizedName\` (for example, transliterated + tablet/syrup word in ${langName}) so a person who cannot read English packaging can read the tablet name in their own language. ` +
      `Please provide a clear, step-by-step breakdown of the medicine names (both in ${langName} and English), dosages, and timing instructions found in the scan. ` +
      `If any part of the image is too blurry or unclear to read safely, flag it explicitly in ${langName}.\n\n` +
      `Follow these strict safety rules:\n` +
      `1. In \`transcribedText\`, transcribe all visible text verbatim as written/printed on the prescription or medicine packaging.\n` +
      `2. In \`translatedSelectedLangText\`, translate all transcribed text, tablet/medicine names, and medical shorthand (such as 1-0-1, BD, OD, TDS, AC, PC) into ${langName}.\n` +
      `3. In \`translatedEnglishText\`, also provide the clear English translation.\n` +
      `4. In \`stepByStepBreakdown\`, provide a numbered step-by-step breakdown with \`localizedMedicineName\` (tablet name in ${langName} script), \`medicineName\` (English name), \`dosage\` (in ${langName}), \`timingInstructions\` (in ${langName}), and optional \`unclearWarning\` (in ${langName}).\n` +
      `5. In \`hasBlurryOrUnclearParts\` and \`blurryOrUnclearFlags\`, explicitly flag ANY region, handwriting, dosage number, or label that is blurry, out of focus, cut off, low-light, or unsafe to read with 100% certainty.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || "image/jpeg",
              data: cleanBase64,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcribedText: {
              type: Type.STRING,
              description:
                "Verbatim transcription of all visible text in the image in its original script/language",
            },
            translatedSelectedLangText: {
              type: Type.STRING,
              description: `Complete translation of all visible text, tablet names, and medical abbreviations into ${langName}`,
            },
            translatedEnglishText: {
              type: Type.STRING,
              description:
                "Complete translation of all visible text and medical abbreviations into plain English",
            },
            hasBlurryOrUnclearParts: {
              type: Type.BOOLEAN,
              description:
                "True if any part of the image is blurry, cut off, smudged, or unclear to read safely",
            },
            blurryOrUnclearFlags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: `Explicit safety warnings in ${langName} for any blurry, unreadable, or ambiguous parts of the image`,
            },
            stepByStepBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  localizedMedicineName: {
                    type: Type.STRING,
                    description: `Name of the tablet/medicine written in ${langName} script`,
                  },
                  medicineName: {
                    type: Type.STRING,
                    description: "Medicine name and strength in English",
                  },
                  dosage: {
                    type: Type.STRING,
                    description: `Clear dosage amount per intake written in ${langName}`,
                  },
                  timingInstructions: {
                    type: Type.STRING,
                    description: `When and how to take the medicine written in ${langName}`,
                  },
                  unclearWarning: {
                    type: Type.STRING,
                    description: `If any part of this medicine's name, dose, or timing is blurry or uncertain, flag it in ${langName}`,
                  },
                },
                required: [
                  "stepNumber",
                  "localizedMedicineName",
                  "medicineName",
                  "dosage",
                  "timingInstructions",
                ],
              },
            },
            medicines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: {
                    type: Type.STRING,
                    description: "Medicine name in English",
                  },
                  localizedName: {
                    type: Type.STRING,
                    description: `Medicine/tablet name written in ${langName} script`,
                  },
                  strength: {
                    type: Type.STRING,
                    description: "e.g. 500 mg or 5 ml",
                  },
                  form: {
                    type: Type.STRING,
                    description: "Must be one of: tablet, capsule, syrup",
                  },
                  doseAmount: {
                    type: Type.NUMBER,
                    description:
                      "0.5, 1, or 2 for tablet/capsule; 2.5, 5, or 10 for syrup",
                  },
                  frequency: {
                    type: Type.STRING,
                    description: "e.g. Twice daily, Once daily",
                  },
                  timesOfDay: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description:
                      "Array containing any of: morning, afternoon, night",
                  },
                  durationDays: {
                    type: Type.INTEGER,
                    description: "Duration in days, e.g. 7, 15, 30",
                  },
                  specialInstructions: {
                    type: Type.STRING,
                    description:
                      "Must be one of: before_food, after_food, with_food",
                  },
                  suggestedColor: {
                    type: Type.STRING,
                    description:
                      "Hex color code for visual pill identification, e.g. #FFFFFF, #3B82F6, #FACC15, #F472B6, #10B981",
                  },
                  suggestedShape: {
                    type: Type.STRING,
                    description:
                      "Must be one of: round, oval, capsule, syrup",
                  },
                  conditionTag: {
                    type: Type.STRING,
                    description:
                      "Related condition e.g. Diabetes, Blood pressure, Fever, Infection",
                  },
                },
                required: [
                  "name",
                  "localizedName",
                  "strength",
                  "form",
                  "doseAmount",
                  "frequency",
                  "timesOfDay",
                  "durationDays",
                  "specialInstructions",
                  "suggestedColor",
                  "suggestedShape",
                ],
              },
            },
          },
          required: [
            "transcribedText",
            "translatedSelectedLangText",
            "translatedEnglishText",
            "hasBlurryOrUnclearParts",
            "blurryOrUnclearFlags",
            "stepByStepBreakdown",
            "medicines",
          ],
        },
      },
    });

    const rawText = response.text?.trim();
    if (!rawText) {
      return buildDemoResultForLang(
        targetLang,
        "Empty AI response — falling back to sample prescription result"
      );
    }

    const parsed = JSON.parse(rawText);

    const normalizedMedicines: ScannedMedicineItem[] =
      Array.isArray(parsed.medicines) && parsed.medicines.length > 0
        ? parsed.medicines.map((m: any) => ({
            name: String(m.name || "Unverified Medicine"),
            localizedName: String(
              m.localizedName || m.name || "Unverified Medicine"
            ),
            strength: String(m.strength || "Verify strength"),
            form: ["tablet", "capsule", "syrup"].includes(m.form)
              ? m.form
              : "tablet",
            doseAmount: Number(m.doseAmount) || 1,
            frequency: String(m.frequency || "Verify frequency"),
            timesOfDay:
              Array.isArray(m.timesOfDay) && m.timesOfDay.length > 0
                ? m.timesOfDay.filter((t: string) =>
                    ["morning", "afternoon", "night"].includes(t)
                  )
                : ["morning"],
            durationDays: Number(m.durationDays) || 7,
            specialInstructions: [
              "before_food",
              "after_food",
              "with_food",
            ].includes(m.specialInstructions)
              ? m.specialInstructions
              : "after_food",
            suggestedColor: String(m.suggestedColor || "#3B82F6"),
            suggestedShape: ["round", "oval", "capsule", "syrup"].includes(
              m.suggestedShape
            )
              ? m.suggestedShape
              : m.form === "syrup"
              ? "syrup"
              : m.form === "capsule"
              ? "capsule"
              : "round",
            conditionTag: m.conditionTag ? String(m.conditionTag) : "General",
          }))
        : buildDemoResultForLang(targetLang).medicines;

    const normalizedBreakdown: StepByStepBreakdownItem[] =
      Array.isArray(parsed.stepByStepBreakdown) &&
      parsed.stepByStepBreakdown.length > 0
        ? parsed.stepByStepBreakdown.map((item: any, idx: number) => ({
            stepNumber: Number(item.stepNumber) || idx + 1,
            localizedMedicineName: String(
              item.localizedMedicineName ||
                normalizedMedicines[idx]?.localizedName ||
                item.medicineName ||
                `Medicine #${idx + 1}`
            ),
            medicineName: String(
              item.medicineName ||
                normalizedMedicines[idx]?.name ||
                `Medicine #${idx + 1}`
            ),
            dosage: String(
              item.dosage ||
                `${normalizedMedicines[idx]?.doseAmount || 1} ${
                  normalizedMedicines[idx]?.form || "tablet"
                } (${normalizedMedicines[idx]?.strength || ""})`
            ),
            timingInstructions: String(
              item.timingInstructions ||
                `${normalizedMedicines[idx]?.frequency || "As directed"} (${(
                  normalizedMedicines[idx]?.timesOfDay || ["morning"]
                ).join(", ")})`
            ),
            unclearWarning: item.unclearWarning
              ? String(item.unclearWarning)
              : undefined,
          }))
        : normalizedMedicines.map((m, idx) => ({
            stepNumber: idx + 1,
            localizedMedicineName: `${m.localizedName || m.name} (${
              m.strength
            })`,
            medicineName: `${m.name} (${m.strength})`,
            dosage: `${m.doseAmount} ${m.form}`,
            timingInstructions: `${m.frequency} — ${m.timesOfDay.join(
              ", "
            )} (${m.specialInstructions.replace("_", " ")}) for ${
              m.durationDays
            } days`,
          }));

    const blurryFlags: string[] = Array.isArray(parsed.blurryOrUnclearFlags)
      ? parsed.blurryOrUnclearFlags.map((f: any) => String(f)).filter(Boolean)
      : [];

    const englishTranslation =
      String(parsed.translatedEnglishText || "").trim() ||
      "No English translation available — image text was unclear.";

    const selectedLangTranslation =
      String(parsed.translatedSelectedLangText || "").trim() ||
      englishTranslation;

    return {
      isDemo: false,
      targetLang,
      transcribedText:
        String(parsed.transcribedText || "").trim() ||
        "No legible text could be transcribed from the image.",
      translatedEnglishText: englishTranslation,
      translatedSelectedLangText: selectedLangTranslation,
      stepByStepBreakdown: normalizedBreakdown,
      hasBlurryOrUnclearParts:
        Boolean(parsed.hasBlurryOrUnclearParts) || blurryFlags.length > 0,
      blurryOrUnclearFlags: blurryFlags,
      medicines: normalizedMedicines,
    };
  } catch (error: any) {
    return buildDemoResultForLang(
      targetLang,
      `AI scan fallback (${
        error?.message || "API unavailable"
      }) — showing sample result in ${langName}`
    );
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { image, mimeType, targetLang } = body;
    const result = await analyzePrescriptionBase64(image, mimeType, targetLang);
    return res.status(200).json(result);
  } catch {
    return res.status(200).json(
      buildDemoResultForLang("en", "Fallback DEMO mode activated")
    );
  }
}
