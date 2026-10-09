import React, { useRef, useState, useEffect } from "react";
import {
  Camera,
  Upload,
  Sliders,
  Volume2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  ShieldAlert,
  FileText,
  Languages,
  ListChecks,
  EyeOff,
  Pill,
} from "lucide-react";
import {
  FamilyMemberProfile,
  MedicineItem,
  PillShape,
  TimeOfDaySlot,
  FoodTiming,
} from "../types/maatra";
import { LanguageCode, TranslationDictionary } from "../i18n";
import { VisualPillSVG, VisualDoseIcons } from "./VisualPillSVG";

interface ScanPrescriptionViewProps {
  member: FamilyMemberProfile;
  t: TranslationDictionary;
  onSpeak: (text: string) => void;
  onAddMedicine: (med: MedicineItem) => void;
  onToast: (msg: string) => void;
}

interface StepByStepBreakdown {
  stepNumber: number;
  medicineName: string;
  localizedMedicineName?: string;
  dosage: string;
  timingInstructions: string;
  unclearWarning?: string;
}

interface EditableDraftMed {
  id: string;
  name: string;
  localizedName: string;
  strength: string;
  form: "tablet" | "capsule" | "syrup";
  color: string;
  secondaryColor: string;
  shape: PillShape;
  doseAmount: number;
  timesOfDay: TimeOfDaySlot[];
  foodTiming: FoodTiming;
  durationDays: number;
  conditionTag: string;
  confirmed: boolean;
}

const SWATCH_COLORS = [
  { hex: "#FFFFFF", name: "White" },
  { hex: "#FACC15", name: "Yellow" },
  { hex: "#3B82F6", name: "Blue" },
  { hex: "#F472B6", name: "Pink" },
  { hex: "#EF4444", name: "Red" },
  { hex: "#10B981", name: "Green" },
  { hex: "#FB923C", name: "Orange" },
  { hex: "#A855F7", name: "Purple" },
];

// Dictionary of common Indian medicines + phonetic script helper so any tablet name is always shown in the user's selected language script
const KNOWN_TABLET_NAMES_BY_LANG: Record<
  LanguageCode,
  Record<string, string>
> = {
  en: {
    metformin: "Metformin Hydrochloride (Glycomet) Tablet",
    amlodipine: "Amlodipine Besylate (Stamlo) Tablet",
    ambroxol: "Ambroxol Pediatric Cough Syrup",
    paracetamol: "Paracetamol (Dolo / Crocin) Tablet",
    atorvastatin: "Atorvastatin (Atorva) Tablet",
    telmisartan: "Telmisartan (Telma) Tablet",
    pantoprazole: "Pantoprazole (Pan-40) Tablet",
    levothyroxine: "Levothyroxine (Thyronorm) Tablet",
    glimepiride: "Glimepiride (Amaryl) Tablet",
    cetirizine: "Cetirizine Tablet",
    azithromycin: "Azithromycin Tablet",
    amoxicillin: "Amoxicillin Capsule",
  },
  hi: {
    metformin: "मेटफॉर्मिन (ग्लाइकोमेट / Glycomet) की गोली",
    amlodipine: "एम्लोडिपिन (स्टैमलो / Stamlo) की गोली",
    ambroxol: "एम्ब्रॉक्सोल (Ambroxol) खांसी का सिरप",
    paracetamol: "पैरासिटामोल (डोलो / क्रोसिन) की गोली",
    atorvastatin: "एटोरवास्टेटिन (अटोरवा) की गोली",
    telmisartan: "टेल्मिसर्टन (टेल्मा) की गोली",
    pantoprazole: "पैंटोप्राजोल (पैन-40) की गोली",
    levothyroxine: "लेवोथायरोक्सिन (थायरोनॉर्म) की गोली",
    glimepiride: "ग्लिमेपिराइड (अमरील) की गोली",
    cetirizine: "सेटिरीज़िन की गोली",
    azithromycin: "एज़िथ्रोमाइसिन की गोली",
    amoxicillin: "एमोक्सिसिलिन कैप्सूल",
  },
  kn: {
    metformin: "ಮೆಟ್‌ಫಾರ್ಮಿನ್ (ಗ್ಲೈಕೊಮೆಟ್ / Glycomet) ಮಾತ್ರೆ",
    amlodipine: "ಅಮ್ಲೋಡಿಪಿನ್ (ಸ್ಟಾಮ್ಲೊ / Stamlo) ಮಾತ್ರೆ",
    ambroxol: "ಆಂಬ್ರೊಕ್ಸಾಲ್ (Ambroxol) ಕೆಮ್ಮಿನ ಸಿರಪ್",
    paracetamol: "ಪ್ಯಾರಾಸಿಟಮಾಲ್ (ಡೊಲೊ / ಕ್ರೋಸಿನ್) ಮಾತ್ರೆ",
    atorvastatin: "ಅಟೊರ್ವಾಸ್ಟಾಟಿನ್ (ಅಟೊರ್ವಾ) ಮಾತ್ರೆ",
    telmisartan: "ಟೆಲ್ಮಿಸಾರ್ಟನ್ (ಟೆಲ್ಮಾ) ಮಾತ್ರೆ",
    pantoprazole: "ಪ್ಯಾಂಟೊಪ್ರಜೋಲ್ (ಪ್ಯಾನ್-40) ಮಾತ್ರೆ",
    levothyroxine: "ಲೆವೊಥೈರಾಕ್ಸಿನ್ (ಥೈರೋನಾರ್ಮ್) ಮಾತ್ರೆ",
    glimepiride: "ಗ್ಲಿಮೆಪಿರೈಡ್ ಮಾತ್ರೆ",
    cetirizine: "ಸೆಟಿರಿಜಿನ್ ಮಾತ್ರೆ",
    azithromycin: "ಅಜಿಥ್ರೊಮೈಸಿನ್ ಮಾತ್ರೆ",
    amoxicillin: "ಅಮೋಕ್ಸಿಸಿಲಿನ್ ಕ್ಯಾಪ್ಸೂಲ್",
  },
  ta: {
    metformin: "மெட்ஃபார்மின் (கிளைகோமெட் / Glycomet) மாத்திரை",
    amlodipine: "அம்லோடிபின் (ஸ்டாம்லோ / Stamlo) மாத்திரை",
    ambroxol: "அம்புரோக்சால் (Ambroxol) இருமல் சிரப்",
    paracetamol: "பாராசிட்டமால் (டோலோ / குரோசின்) மாத்திரை",
    atorvastatin: "அடோர்வாஸ்டாடின் (அடோர்வா) மாத்திரை",
    telmisartan: "டெல்மிசார்டன் (டெல்மா) மாத்திரை",
    pantoprazole: "பான்டோபிரசோல் (பான்-40) மாத்திரை",
    levothyroxine: "லெவோதைராக்சின் (தைரோநார்ம்) மாத்திரை",
    glimepiride: "கிளிமெபிரைடு மாத்திரை",
    cetirizine: "செட்டிரிசின் மாத்திரை",
    azithromycin: "அசித்ரோமைசின் மாத்திரை",
    amoxicillin: "அமோக்ஸிசிலின் காப்ஸ்யூல்",
  },
  te: {
    metformin: "మెట్‌ఫార్మిన్ (గ్లైకోమెట్ / Glycomet) మాత్ర",
    amlodipine: "అమ్లోడిపిన్ (స్టామ్లో / Stamlo) మాత్ర",
    ambroxol: "ఆంబ్రోక్సాల్ (Ambroxol) దగ్గు సిరప్",
    paracetamol: "పారాసిటమాల్ (డోలో / క్రోసిన్) మాత్ర",
    atorvastatin: "అటోర్వాస్టాటిన్ (అటోర్వా) మాత్ర",
    telmisartan: "టెల్మిసార్టన్ (టెల్మా) మాత్ర",
    pantoprazole: "పాంటోప్రజోల్ (పాన్-40) మాత్ర",
    levothyroxine: "లెవోథైరాక్సిన్ (థైరోనార్మ్) మాత్ర",
    glimepiride: "గ్లిమెపిరైడ్ మాత్ర",
    cetirizine: "సెటిరిజిన్ మాత్ర",
    azithromycin: "అజిత్రోమైసిన్ మాత్ర",
    amoxicillin: "అమోక్సిసిలిన్ క్యాప్సూల్",
  },
};

const FORM_WORD_BY_LANG: Record<
  LanguageCode,
  { tablet: string; capsule: string; syrup: string }
> = {
  en: { tablet: "Tablet", capsule: "Capsule", syrup: "Syrup" },
  hi: { tablet: "गोली (Tablet)", capsule: "कैप्सूल (Capsule)", syrup: "सिरप (Syrup)" },
  kn: { tablet: "ಮಾತ್ರೆ (Tablet)", capsule: "ಕ್ಯಾಪ್ಸೂಲ್ (Capsule)", syrup: "ಸಿರಪ್ (Syrup)" },
  ta: { tablet: "மாத்திரை (Tablet)", capsule: "காப்ஸ்யூல் (Capsule)", syrup: "சிரப் (Syrup)" },
  te: { tablet: "మాత్ర (Tablet)", capsule: "క్యాప్సూల్ (Capsule)", syrup: "సిరప్ (Syrup)" },
};

function getLocalizedTabletName(
  rawName: string,
  providedLocalizedName: string | undefined,
  form: "tablet" | "capsule" | "syrup",
  langCode: LanguageCode
): string {
  const lower = rawName.toLowerCase();
  const dict = KNOWN_TABLET_NAMES_BY_LANG[langCode] || KNOWN_TABLET_NAMES_BY_LANG.en;
  for (const [key, translated] of Object.entries(dict)) {
    if (lower.includes(key)) {
      return translated;
    }
  }
  if (
    providedLocalizedName &&
    providedLocalizedName.trim() &&
    (langCode === "en" || providedLocalizedName !== rawName)
  ) {
    return providedLocalizedName;
  }
  if (langCode === "en") return rawName;
  const formLabel = FORM_WORD_BY_LANG[langCode]?.[form] || FORM_WORD_BY_LANG.en[form];
  return `${rawName} — ${formLabel}`;
}

export const ScanPrescriptionView: React.FC<ScanPrescriptionViewProps> = ({
  member,
  t,
  onSpeak,
  onAddMedicine,
  onToast,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [lastScannedMime, setLastScannedMime] = useState<string>("image/jpeg");
  const [isScanning, setIsScanning] = useState(false);
  const [isDemoResult, setIsDemoResult] = useState(false);
  const [demoReason, setDemoReason] = useState<string | null>(null);
  const [showEnglishComparison, setShowEnglishComparison] = useState(false);

  // Structured Scan Output States
  const [transcribedText, setTranscribedText] = useState<string>("");
  const [translatedSelectedLangText, setTranslatedSelectedLangText] =
    useState<string>("");
  const [translatedEnglishText, setTranslatedEnglishText] = useState<string>("");
  const [stepByStepBreakdown, setStepByStepBreakdown] = useState<
    StepByStepBreakdown[]
  >([]);
  const [hasBlurryOrUnclearParts, setHasBlurryOrUnclearParts] =
    useState<boolean>(false);
  const [blurryOrUnclearFlags, setBlurryOrUnclearFlags] = useState<string[]>(
    []
  );

  const [drafts, setDrafts] = useState<EditableDraftMed[]>([]);
  const [lastScannedLang, setLastScannedLang] = useState<LanguageCode>(
    t.langCode
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Automatically re-translate when the user changes their selected language while viewing a scan
  useEffect(() => {
    if (
      drafts.length > 0 &&
      !isScanning &&
      t.langCode !== lastScannedLang &&
      (transcribedText || isDemoResult)
    ) {
      setLastScannedLang(t.langCode);
      runScanRequest(previewDataUrl || "", lastScannedMime, t.langCode, true);
    }
  }, [t.langCode]);

  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setCameraActive(false);
      onToast(
        `Camera unavailable in this preview window — running instant prescription scan in ${t.nativeName}.`
      );
      runScanRequest(
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "image/png",
        t.langCode
      );
    }
  };

  // Immediately after taking this photo, scan the image to transcribe, translate into selected language, and break down steps
  const captureFromCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setPreviewDataUrl(dataUrl);
      setLastScannedMime("image/jpeg");
      stopCameraStream();
      onToast(
        `Photo captured — immediately transcribing text and translating tablet names into ${t.nativeName}…`
      );
      runScanRequest(dataUrl, "image/jpeg", t.langCode);
    }
  };

  // Immediately after selecting/taking a photo from input, scan the image automatically
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const mime = file.type || "image/jpeg";
      setPreviewDataUrl(dataUrl);
      setLastScannedMime(mime);
      onToast(
        `Photo loaded — immediately transcribing text and translating tablet names into ${t.nativeName}…`
      );
      runScanRequest(dataUrl, mime, t.langCode);
    };
    reader.readAsDataURL(file);
  };

  const runScanRequest = async (
    base64Image: string,
    mimeType = "image/jpeg",
    targetLang: LanguageCode = t.langCode,
    silent = false
  ) => {
    setIsScanning(true);
    setLastScannedLang(targetLang);
    if (!silent) {
      onSpeak(t.scan.readingPrescription);
    }
    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Image,
          mimeType,
          targetLang,
        }),
      });
      const data = await response.json();
      setIsDemoResult(Boolean(data.isDemo));
      setDemoReason(data.reason || null);

      setTranscribedText(
        data.transcribedText ||
          "No visible text could be transcribed from the image."
      );
      setTranslatedEnglishText(
        data.translatedEnglishText ||
          "No English translation available for this scan."
      );
      setTranslatedSelectedLangText(
        data.translatedSelectedLangText ||
          data.translatedEnglishText ||
          "No translation available for this scan."
      );

      const rawBreakdown: StepByStepBreakdown[] = Array.isArray(
        data.stepByStepBreakdown
      )
        ? data.stepByStepBreakdown.map((item: any, idx: number) => {
            const medForm =
              data.medicines?.[idx]?.form ||
              (String(item.medicineName).toLowerCase().includes("syrup")
                ? "syrup"
                : "tablet");
            return {
              stepNumber: Number(item.stepNumber) || idx + 1,
              medicineName: String(item.medicineName || `Medicine #${idx + 1}`),
              localizedMedicineName: getLocalizedTabletName(
                String(item.medicineName || ""),
                item.localizedMedicineName,
                medForm,
                targetLang
              ),
              dosage: String(item.dosage || ""),
              timingInstructions: String(item.timingInstructions || ""),
              unclearWarning: item.unclearWarning
                ? String(item.unclearWarning)
                : undefined,
            };
          })
        : [];
      setStepByStepBreakdown(rawBreakdown);

      const flags = Array.isArray(data.blurryOrUnclearFlags)
        ? data.blurryOrUnclearFlags
        : [];
      setBlurryOrUnclearFlags(flags);
      setHasBlurryOrUnclearParts(
        Boolean(data.hasBlurryOrUnclearParts) || flags.length > 0
      );

      const mapped: EditableDraftMed[] = (data.medicines || []).map(
        (m: any, idx: number) => {
          const formVal: "tablet" | "capsule" | "syrup" = [
            "tablet",
            "capsule",
            "syrup",
          ].includes(m.form)
            ? m.form
            : "tablet";
          const engName = m.name || "Medicine";
          const locName = getLocalizedTabletName(
            engName,
            m.localizedName,
            formVal,
            targetLang
          );
          return {
            id: `draft-${Date.now()}-${idx}`,
            name: engName,
            localizedName: locName,
            strength: m.strength || "500 mg",
            form: formVal,
            color: m.suggestedColor || "#3B82F6",
            secondaryColor: "#FACC15",
            shape: m.suggestedShape || "oval",
            doseAmount: Number(m.doseAmount) || 1,
            timesOfDay:
              Array.isArray(m.timesOfDay) && m.timesOfDay.length > 0
                ? m.timesOfDay
                : ["morning", "night"],
            foodTiming: m.specialInstructions || "after_food",
            durationDays: Number(m.durationDays) || 15,
            conditionTag: m.conditionTag || "General",
            confirmed: false,
          };
        }
      );
      setDrafts(mapped);

      if (!silent) {
        const firstMedSpoken =
          mapped[0]?.localizedName || mapped[0]?.name || "";
        if (flags.length > 0) {
          onSpeak(`${firstMedSpoken}. ${flags[0]}`);
        } else {
          onSpeak(`${firstMedSpoken}. ${t.scan.verifyDoctorWarning}`);
        }
      }
    } catch {
      setIsDemoResult(true);
      setDemoReason("Offline demo prescription loaded");
    } finally {
      setIsScanning(false);
    }
  };

  const handleStartManualBuilder = () => {
    setPreviewDataUrl(null);
    setIsDemoResult(false);
    setTranscribedText("");
    setTranslatedSelectedLangText("");
    setTranslatedEnglishText("");
    setStepByStepBreakdown([]);
    setHasBlurryOrUnclearParts(false);
    setBlurryOrUnclearFlags([]);
    const defaultLocName = getLocalizedTabletName(
      "Paracetamol",
      undefined,
      "tablet",
      t.langCode
    );
    setDrafts([
      {
        id: `manual-${Date.now()}`,
        name: "Paracetamol",
        localizedName: defaultLocName,
        strength: "500 mg",
        form: "tablet",
        color: "#3B82F6",
        secondaryColor: "#FACC15",
        shape: "round",
        doseAmount: 1,
        timesOfDay: ["morning", "night"],
        foodTiming: "after_food",
        durationDays: 30,
        conditionTag: member.conditions[0] || "General",
        confirmed: false,
      },
    ]);
    onSpeak(t.scan.visualBuilderTitle);
  };

  const updateDraft = (id: string, patch: Partial<EditableDraftMed>) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...patch } : d))
    );
  };

  const toggleTimeSlot = (id: string, slot: TimeOfDaySlot) => {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const exists = d.timesOfDay.includes(slot);
        const nextTimes = exists
          ? d.timesOfDay.filter((s) => s !== slot)
          : [...d.timesOfDay, slot];
        return {
          ...d,
          timesOfDay: nextTimes.length > 0 ? nextTimes : ["morning"],
        };
      })
    );
  };

  const checkAllergyMatch = (medName: string): string | null => {
    for (const alg of member.allergies) {
      if (
        alg.trim() &&
        medName.toLowerCase().includes(alg.trim().toLowerCase())
      ) {
        return alg;
      }
    }
    return null;
  };

  const handleConfirmSingle = (draft: EditableDraftMed) => {
    const displayMedName =
      t.langCode !== "en" &&
      draft.localizedName &&
      draft.localizedName !== draft.name
        ? `${draft.localizedName} (${draft.name})`
        : draft.name;

    const newMed: MedicineItem = {
      id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      memberId: member.id,
      name: displayMedName,
      strength: draft.strength,
      form:
        draft.shape === "syrup"
          ? "syrup"
          : draft.shape === "capsule"
          ? "capsule"
          : "tablet",
      color: draft.color,
      secondaryColor: draft.secondaryColor,
      shape: draft.shape,
      doseAmount: draft.doseAmount,
      timesOfDay: draft.timesOfDay,
      foodTiming: draft.foodTiming,
      durationDays: draft.durationDays,
      stockCount: draft.durationDays * draft.timesOfDay.length,
      expiryDate: "2027-09",
      conditionTag: draft.conditionTag,
      takenToday: {
        morning: null,
        afternoon: null,
        night: null,
      },
    };
    onAddMedicine(newMed);
    updateDraft(draft.id, { confirmed: true });
    onSpeak(
      `${draft.localizedName || draft.name} — ${t.scan.confirmAddRoutine}`
    );
  };

  const speakAllSteps = () => {
    if (stepByStepBreakdown.length === 0) return;
    const summary = stepByStepBreakdown
      .map(
        (s) =>
          `${s.localizedMedicineName || s.medicineName}. ${s.dosage}. ${
            s.timingInstructions
          }. ${s.unclearWarning ? s.unclearWarning : ""}`
      )
      .join(" ");
    onSpeak(summary);
  };

  return (
    <div className="space-y-6">
      {/* Header Card with Automatic Scan Pipeline Description */}
      <div className="rounded-[24px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/70 dark:border-slate-800 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-extrabold border border-blue-200 dark:border-blue-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              Auto-Scan Pipeline: Transcribe → Translate to {t.nativeName} (
              {t.englishName}) → Step-by-Step Breakdown → Blur Safety Check
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white pt-1">
            {t.scan.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Immediately after taking a photo, Maatra transcribes all visible
            text, translates tablet names & instructions into{" "}
            <strong>
              {t.nativeName} ({t.englishName})
            </strong>
            , provides a step-by-step breakdown, and explicitly flags any blurry
            or unclear parts.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            onSpeak(`${t.scan.title}. ${t.scan.subtitle}`)
          }
          className="min-h-[48px] px-4 py-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold text-sm flex items-center gap-2 self-start shrink-0"
        >
          <Volume2 className="w-5 h-5" />
          <span>{t.common.listenScreen}</span>
        </button>
      </div>

      {/* Three Big Action Buttons: a) Take Photo (Auto-Scans Immediately), b) Upload from Gallery (Auto-Scans Immediately), c) Add by Hand */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={startCamera}
          className="min-h-[124px] p-5 rounded-[24px] bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white shadow-lg shadow-blue-500/20 flex flex-col items-start justify-between text-left hover:opacity-95 transition"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Camera className="w-6 h-6" />
          </div>
          <div className="mt-3">
            <div className="text-base sm:text-lg font-bold">
              {t.scan.takePhoto}
            </div>
            <div className="text-xs text-blue-100 mt-0.5">
              Immediately scans & translates into {t.nativeName}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="min-h-[124px] p-5 rounded-[24px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-2 border-blue-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-sm flex flex-col items-start justify-between text-left hover:border-blue-500 transition"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>
          <div className="mt-3">
            <div className="text-base sm:text-lg font-bold">
              {t.scan.uploadGallery}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Auto-translates tablet names into {t.nativeName}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />
        </button>

        <button
          type="button"
          onClick={handleStartManualBuilder}
          className="min-h-[124px] p-5 rounded-[24px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-2 border-purple-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-sm flex flex-col items-start justify-between text-left hover:border-purple-500 transition"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Sliders className="w-6 h-6" />
          </div>
          <div className="mt-3">
            <div className="text-base sm:text-lg font-bold">
              {t.scan.addByHand}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pick pill colour, shape & meal icon manually
            </div>
          </div>
        </button>
      </div>

      {/* Quick Demo Prescription Trigger for instant testing */}
      {drafts.length === 0 && !cameraActive && !isScanning && (
        <div className="rounded-[24px] bg-blue-50/70 dark:bg-slate-800/60 border border-blue-200/70 dark:border-slate-700 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
              Don't have a paper prescription handy? Test the Transcription +{" "}
              <strong>{t.nativeName}</strong> Tablet Name Translation +
              Step-by-Step Breakdown + Blur Safety Flagging on a sample
              prescription.
            </span>
          </div>
          <button
            type="button"
            onClick={() => runScanRequest("", "image/jpeg", t.langCode)}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shrink-0 hover:bg-blue-700 transition"
          >
            Run Sample Scan in {t.nativeName}
          </button>
        </div>
      )}

      {/* Live Camera Viewfinder */}
      {cameraActive && (
        <div className="rounded-[24px] bg-slate-900 p-4 text-white space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-[380px] mx-auto flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="pointer-events-none absolute inset-6 border-2 border-dashed border-blue-400/80 rounded-2xl flex items-end justify-center p-3">
              <span className="px-3 py-1 rounded-full bg-slate-950/80 text-[11px] font-semibold text-blue-200">
                Hold steady — Scan & {t.nativeName} translation start immediately
                after taking photo
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={captureFromCamera}
              className="min-h-[52px] px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base flex items-center gap-2 shadow-lg"
            >
              <Camera className="w-5 h-5" />
              <span>{t.scan.captureBtn} & Auto-Scan</span>
            </button>
            <button
              type="button"
              onClick={stopCameraStream}
              className="min-h-[52px] px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm"
            >
              {t.common.cancel}
            </button>
          </div>
        </div>
      )}

      {/* Immediate Post-Capture Scanning State */}
      {isScanning && (
        <div className="rounded-[24px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/70 dark:border-slate-800 p-6 sm:p-8 text-center space-y-4">
          {previewDataUrl && (
            <div className="relative w-28 h-28 mx-auto rounded-2xl overflow-hidden border-2 border-blue-500 shadow-md">
              <img
                src={previewDataUrl}
                alt="Scanning captured prescription"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-blue-600/20 animate-pulse" />
            </div>
          )}
          <RefreshCw className="w-9 h-9 text-blue-600 animate-spin mx-auto" />
          <div className="space-y-1">
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">
              {t.scan.readingPrescription}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              1. Transcribing visible text → 2. Translating tablet names &
              instructions into {t.nativeName} ({t.englishName}) → 3. Breaking
              down dosages & timing → 4. Checking for blurry text…
            </p>
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
            <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full w-4/5 mx-auto animate-pulse" />
          </div>
        </div>
      )}

      {/* =========================================================
          SCAN RESULTS:
          1) Explicit Blurry / Unclear Safety Flag Banner
          2) Step 1 (Verbatim Transcription) & Step 2 (Selected Language Translation + Tablet Names in Selected Language)
          3) Step 3 (Step-by-Step Breakdown with Tablet Names in Selected Language)
          4) Step 4 (Editable Visual Routine Builder Cards)
      ========================================================= */}
      {drafts.length > 0 && !isScanning && (
        <div className="space-y-6">
          {/* Captured Photo Header Bar */}
          {previewDataUrl && (
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-white/70 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-4">
                <img
                  src={previewDataUrl}
                  alt="Captured prescription preview"
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-xl object-cover border border-slate-300 dark:border-slate-700"
                />
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                    ✓ Auto-Scanned & Translated into {t.nativeName}
                  </span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    Captured Prescription / Packaging Image
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Transcribed, translated into {t.nativeName} ({t.englishName}
                    ), and analyzed for clarity
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Camera className="w-4 h-4" />
                  <span>{t.scan.retakeBtn}</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold"
                >
                  Upload Another
                </button>
              </div>
            </div>
          )}

          {/* 1. EXPLICIT BLURRY OR UNCLEAR PARTS SAFETY FLAG BANNER */}
          {hasBlurryOrUnclearParts || blurryOrUnclearFlags.length > 0 ? (
            <div className="rounded-[24px] bg-rose-50/95 dark:bg-rose-950/80 border-2 border-rose-500 p-5 shadow-md space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <EyeOff className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 text-[11px] font-extrabold uppercase tracking-wide">
                      Explicit Safety Flag — Blurry or Unclear Text Detected
                    </span>
                    <h2 className="text-base sm:text-lg font-extrabold text-rose-950 dark:text-rose-100 mt-1">
                      Some parts of this image are too blurry or unclear to read
                      safely
                    </h2>
                    <p className="text-xs sm:text-sm text-rose-800 dark:text-rose-200 mt-0.5">
                      Never guess a medicine name or dosage from blurry text.
                      Review the flagged items below or retake a clearer photo:
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onSpeak(blurryOrUnclearFlags.join(". "))
                  }
                  className="min-h-[44px] min-w-[44px] rounded-xl bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 flex items-center justify-center shrink-0"
                  title="Listen to blurry/unclear flags"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              <ul className="space-y-2 pl-1">
                {blurryOrUnclearFlags.map((flag, i) => (
                  <li
                    key={i}
                    className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-rose-300 dark:border-rose-800 text-xs sm:text-sm font-bold text-rose-950 dark:text-rose-100 flex items-start gap-2.5"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <span className="text-xs font-semibold text-rose-800 dark:text-rose-200">
                  ⚠️ {t.scan.verifyDoctorWarning}
                </span>
                <button
                  type="button"
                  onClick={startCamera}
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm"
                >
                  <Camera className="w-4 h-4" />
                  <span>Retake Clearer Photo</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border-2 border-emerald-400 dark:border-emerald-800 p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm sm:text-base font-bold text-emerald-950 dark:text-emerald-100">
                    Clarity Check Passed — All visible text was legible
                  </p>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    {t.scan.verifyDoctorWarning}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSpeak(t.scan.verifyDoctorWarning)}
                className="min-h-[44px] min-w-[44px] rounded-xl bg-white/80 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Demo Fallback Notice if applicable */}
          {isDemoResult && demoReason && (
            <div className="rounded-2xl bg-amber-50/90 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 px-4 py-2.5 text-xs font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{demoReason}</span>
            </div>
          )}

          {/* 2. STEP 1 (VERBATIM TRANSCRIBED TEXT) & STEP 2 (SELECTED LANGUAGE TRANSLATION + TABLET NAMES IN SELECTED LANGUAGE) */}
          {(transcribedText || translatedSelectedLangText) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Step 1: Verbatim Transcription Card */}
              <div className="rounded-[24px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/80 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                          Step 1 · Raw OCR Transcription
                        </span>
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                          All Visible Text Transcribed
                        </h3>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSpeak(transcribedText)}
                      className="min-h-[42px] px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-slate-800 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{t.common.listen}</span>
                    </button>
                  </div>

                  <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-200 bg-slate-50/90 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                    {transcribedText}
                  </pre>
                </div>
              </div>

              {/* Step 2: Translated into User's Selected Language (with Tablet Names in Selected Language) */}
              <div className="rounded-[24px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-2 border-blue-300/80 dark:border-blue-800 p-5 shadow-sm flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                        <Languages className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          Step 2 · {t.nativeName} ({t.englishName}) Translation
                        </span>
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                          Translated into {t.nativeName}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {t.langCode !== "en" && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowEnglishComparison((prev) => !prev)
                          }
                          className="min-h-[38px] px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold"
                        >
                          {showEnglishComparison
                            ? `Show ${t.nativeName}`
                            : "Also Show English"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          onSpeak(
                            `${drafts
                              .map((d) => d.localizedName)
                              .join(", ")}. ${translatedSelectedLangText}`
                          )
                        }
                        className="min-h-[42px] px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>{t.common.listen}</span>
                      </button>
                    </div>
                  </div>

                  {/* Highlighted Tablet / Medicine Names in Selected Language */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/95 to-purple-50/90 dark:from-blue-950/60 dark:to-purple-950/50 border border-blue-200 dark:border-blue-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5" />
                        <span>
                          Tablet / Medicine Names in {t.nativeName} (
                          {t.englishName})
                        </span>
                      </span>
                    </div>
                    <div className="space-y-2">
                      {drafts.map((d, idx) => (
                        <div
                          key={d.id}
                          className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/95 dark:bg-slate-900/90 border border-blue-200/70 dark:border-slate-700"
                        >
                          <div className="min-w-0">
                            <div className="text-sm sm:text-base font-extrabold text-blue-950 dark:text-blue-100">
                              {idx + 1}. {d.localizedName}{" "}
                              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                ({d.strength})
                              </span>
                            </div>
                            {d.localizedName !== d.name && (
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                English Packaging: {d.name} ({d.strength})
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              onSpeak(`${d.localizedName}, ${d.strength}`)
                            }
                            className="min-h-[38px] min-w-[38px] rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0"
                            title={`Listen to tablet name in ${t.nativeName}`}
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Full Prescription Text Translated into User's Selected Language */}
                  <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-100 bg-blue-50/50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-blue-200/60 dark:border-slate-700">
                    {translatedSelectedLangText}
                  </pre>

                  {showEnglishComparison && t.langCode !== "en" && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Plain English Reference:
                      </span>
                      <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl">
                        {translatedEnglishText}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. STEP-BY-STEP BREAKDOWN OF MEDICINE NAMES (IN SELECTED LANGUAGE), DOSAGES & TIMING INSTRUCTIONS */}
          {stepByStepBreakdown.length > 0 && (
            <div className="rounded-[26px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/80 dark:border-slate-800 shadow-[0_12px_36px_-8px_rgba(37,99,235,0.08)] p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white flex items-center justify-center shadow-sm">
                    <ListChecks className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Step 3 · Structured Breakdown in {t.nativeName}
                    </span>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                      Step-by-Step Breakdown: Tablet Names ({t.nativeName}),
                      Dosages & Timing
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={speakAllSteps}
                  className="min-h-[44px] px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Listen to Full Breakdown ({t.nativeName})</span>
                </button>
              </div>

              <div className="space-y-3">
                {stepByStepBreakdown.map((item) => (
                  <div
                    key={item.stepNumber}
                    className="rounded-2xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                          #{item.stepNumber}
                        </span>
                        <div>
                          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            Tablet / Medicine Name ({t.nativeName})
                          </div>
                          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                            {item.localizedMedicineName || item.medicineName}
                          </h3>
                          {item.localizedMedicineName &&
                            item.localizedMedicineName !==
                              item.medicineName && (
                              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                English Label: {item.medicineName}
                              </div>
                            )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onSpeak(
                            `${
                              item.localizedMedicineName || item.medicineName
                            }. ${item.dosage}. ${item.timingInstructions}. ${
                              item.unclearWarning ? item.unclearWarning : ""
                            }`
                          )
                        }
                        className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 border border-slate-200 dark:border-slate-600 text-xs font-bold flex items-center gap-1.5 shrink-0"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>{t.common.listen}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          Dosage ({t.nativeName})
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                          {item.dosage}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                          Timing Instructions ({t.nativeName})
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                          {item.timingInstructions}
                        </div>
                      </div>
                    </div>

                    {item.unclearWarning && (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-400 dark:border-amber-700 text-xs font-bold text-amber-950 dark:text-amber-200 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Unclear / Blurry Flag:</strong>{" "}
                          {item.unclearWarning}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. EDITABLE VISUAL ROUTINE BUILDER CARDS */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Step 4 · Customize Visual Pill Appearance & Add to Routine
              </h2>
            </div>

            {drafts.map((draft) => {
              const matchedAllergy = checkAllergyMatch(draft.name);
              const pillAmounts =
                draft.shape === "syrup" ? [2.5, 5, 10] : [0.5, 1, 2];

              return (
                <div
                  key={draft.id}
                  className="rounded-[26px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/80 dark:border-slate-800 shadow-[0_12px_36px_-8px_rgba(37,99,235,0.1)] p-5 sm:p-6 space-y-5"
                >
                  {/* Allergy Conflict Warning if medicine matches user's allergy list */}
                  {matchedAllergy && (
                    <div className="p-3.5 rounded-2xl bg-rose-100 dark:bg-rose-950/90 border-2 border-rose-500 text-rose-900 dark:text-rose-200 flex items-center gap-3">
                      <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
                      <div className="text-sm font-bold">
                        {t.greetings.allergyConflictWarning}: "{matchedAllergy}"
                      </div>
                    </div>
                  )}

                  {/* Top Preview Row showing Tablet Name in Selected Language + English */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <VisualPillSVG
                        shape={draft.shape}
                        color={draft.color}
                        secondaryColor={draft.secondaryColor}
                        size="lg"
                        highContrast={member.needs.poorEyesight}
                      />
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400">
                          Tablet Name in {t.nativeName}:
                        </div>
                        <input
                          type="text"
                          value={draft.localizedName}
                          onChange={(e) =>
                            updateDraft(draft.id, {
                              localizedName: e.target.value,
                            })
                          }
                          className="w-full sm:w-80 text-base sm:text-lg font-extrabold text-slate-900 dark:text-white bg-blue-50/80 dark:bg-slate-800 px-3 py-1 rounded-xl border border-blue-300 dark:border-slate-700"
                        />
                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          <input
                            type="text"
                            value={draft.name}
                            onChange={(e) => {
                              const nextEng = e.target.value;
                              updateDraft(draft.id, {
                                name: nextEng,
                                localizedName: getLocalizedTabletName(
                                  nextEng,
                                  undefined,
                                  draft.form,
                                  t.langCode
                                ),
                              });
                            }}
                            placeholder="English name"
                            className="w-44 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700"
                          />
                          <input
                            type="text"
                            value={draft.strength}
                            onChange={(e) =>
                              updateDraft(draft.id, {
                                strength: e.target.value,
                              })
                            }
                            className="w-28 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700"
                          />
                          <VisualDoseIcons
                            shape={draft.shape}
                            doseAmount={draft.doseAmount}
                            color={draft.color}
                            pillLabel={t.greetings.pillUnit}
                            halfLabel={t.greetings.halfPillUnit}
                            spoonLabel={t.greetings.mlSpoonUnit}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onSpeak(
                          `${draft.localizedName || draft.name}, ${
                            draft.strength
                          }. ${draft.doseAmount} ${
                            draft.shape === "syrup"
                              ? t.greetings.mlSpoonUnit
                              : t.greetings.pillUnit
                          }.`
                        )
                      }
                      className="min-h-[48px] px-4 py-2 rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-300 text-xs font-bold flex items-center gap-2 self-start"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{t.common.listen}</span>
                    </button>
                  </div>

                  {/* VISUAL ROUTINE BUILDER CONTROLS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* 1. Pill Color Swatches */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {t.scan.pillColor}
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        {SWATCH_COLORS.map((sw) => (
                          <button
                            key={sw.hex}
                            type="button"
                            onClick={() =>
                              updateDraft(draft.id, { color: sw.hex })
                            }
                            className={`w-11 h-11 rounded-2xl border-2 transition flex items-center justify-center ${
                              draft.color === sw.hex
                                ? "border-blue-600 scale-110 ring-2 ring-blue-400/50"
                                : "border-slate-300 dark:border-slate-600"
                            }`}
                            style={{ backgroundColor: sw.hex }}
                            title={sw.name}
                          >
                            {draft.color === sw.hex && (
                              <span className="w-3 h-3 rounded-full bg-blue-600 border border-white" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Shape Buttons with SVG Previews */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {t.scan.pillShape}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(
                          [
                            { id: "round", label: t.scan.shapeRound },
                            { id: "oval", label: t.scan.shapeOval },
                            { id: "capsule", label: t.scan.shapeCapsule },
                            { id: "syrup", label: t.scan.shapeSyrup },
                          ] as const
                        ).map((sh) => (
                          <button
                            key={sh.id}
                            type="button"
                            onClick={() =>
                              updateDraft(draft.id, {
                                shape: sh.id,
                                doseAmount: sh.id === "syrup" ? 5 : 1,
                              })
                            }
                            className={`p-2 rounded-2xl border-2 flex flex-col items-center gap-1 transition ${
                              draft.shape === sh.id
                                ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/60"
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            }`}
                          >
                            <VisualPillSVG
                              shape={sh.id}
                              color={draft.color}
                              size="sm"
                            />
                            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                              {sh.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Dose Amount Selector (1/2, 1, 2 tablets; 2.5, 5, 10 ml for syrup) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {t.scan.doseAmount}
                      </label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {pillAmounts.map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() =>
                              updateDraft(draft.id, { doseAmount: amt })
                            }
                            className={`min-h-[48px] px-3 py-2 rounded-2xl border-2 text-sm font-bold tabular-nums transition ${
                              draft.doseAmount === amt
                                ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                            }`}
                          >
                            {amt === 0.5 ? "½" : amt}{" "}
                            {draft.shape === "syrup"
                              ? "ml"
                              : t.greetings.pillUnit}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 4. Time of Day Toggles + Food Timing */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {t.scan.timesOfDay}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(
                          [
                            {
                              id: "morning",
                              label: t.greetings.morningDose,
                              time: member.lifestyle.breakfastTime,
                            },
                            {
                              id: "afternoon",
                              label: t.greetings.afternoonDose,
                              time: member.lifestyle.lunchTime,
                            },
                            {
                              id: "night",
                              label: t.greetings.nightDose,
                              time: member.lifestyle.dinnerTime,
                            },
                          ] as const
                        ).map((slot) => {
                          const active = draft.timesOfDay.includes(slot.id);
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => toggleTimeSlot(draft.id, slot.id)}
                              className={`min-h-[48px] p-2 rounded-2xl border-2 text-xs font-bold transition ${
                                active
                                  ? "border-blue-600 bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-200"
                                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500"
                              }`}
                            >
                              <div className="truncate">{slot.label}</div>
                              <div className="text-[10px] tabular-nums opacity-75">
                                {slot.time}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Food Timing & Duration Days + Confirm CTA */}
                  <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {(
                        [
                          { id: "before_food", label: t.greetings.beforeFood },
                          { id: "after_food", label: t.greetings.afterFood },
                        ] as const
                      ).map((ft) => (
                        <button
                          key={ft.id}
                          type="button"
                          onClick={() =>
                            updateDraft(draft.id, { foodTiming: ft.id })
                          }
                          className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                            draft.foodTiming === ft.id
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {ft.label}
                        </button>
                      ))}

                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {t.scan.durationDays}:
                        </span>
                        {[5, 15, 30].map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() =>
                              updateDraft(draft.id, { durationDays: d })
                            }
                            className={`min-h-[40px] px-3 rounded-xl text-xs font-bold tabular-nums border ${
                              draft.durationDays === d
                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                : "border-slate-200 dark:border-slate-700 text-slate-600"
                            }`}
                          >
                            {d}d
                          </button>
                        ))}
                      </div>
                    </div>

                    {draft.confirmed ? (
                      <div className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-bold text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Added to {member.name}'s Routine</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConfirmSingle(draft)}
                        className="min-h-[50px] px-6 py-3 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:opacity-95 transition flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>{t.scan.confirmAddRoutine}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
