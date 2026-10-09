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
} from "lucide-react";
import {
  FamilyMemberProfile,
  MedicineItem,
  PillShape,
  TimeOfDaySlot,
  FoodTiming,
} from "../types/maatra";
import { TranslationDictionary } from "../i18n";
import { VisualPillSVG, VisualDoseIcons } from "./VisualPillSVG";

interface ScanPrescriptionViewProps {
  member: FamilyMemberProfile;
  t: TranslationDictionary;
  onSpeak: (text: string) => void;
  onAddMedicine: (med: MedicineItem) => void;
  onToast: (msg: string) => void;
}

interface EditableDraftMed {
  id: string;
  name: string;
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

export const ScanPrescriptionView: React.FC<ScanPrescriptionViewProps> = ({
  member,
  t,
  onSpeak,
  onAddMedicine,
  onToast,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isDemoResult, setIsDemoResult] = useState(false);
  const [demoReason, setDemoReason] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<EditableDraftMed[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

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
        "Camera unavailable in this preview window — opening prescription scanner demo."
      );
      runScanRequest("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
    }
  };

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
      stopCameraStream();
      runScanRequest(dataUrl, "image/jpeg");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setPreviewDataUrl(dataUrl);
      runScanRequest(dataUrl, file.type || "image/jpeg");
    };
    reader.readAsDataURL(file);
  };

  const runScanRequest = async (base64Image: string, mimeType = "image/jpeg") => {
    setIsScanning(true);
    onSpeak(t.scan.readingPrescription);
    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image, mimeType }),
      });
      const data = await response.json();
      setIsDemoResult(Boolean(data.isDemo));
      setDemoReason(data.reason || null);

      const mapped: EditableDraftMed[] = (data.medicines || []).map(
        (m: any, idx: number) => ({
          id: `draft-${Date.now()}-${idx}`,
          name: m.name || "Medicine",
          strength: m.strength || "500 mg",
          form: m.form || "tablet",
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
        })
      );
      setDrafts(mapped);
      onSpeak(t.scan.verifyDoctorWarning);
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
    setDrafts([
      {
        id: `manual-${Date.now()}`,
        name: "New Visual Medicine",
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
    const newMed: MedicineItem = {
      id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      memberId: member.id,
      name: draft.name,
      strength: draft.strength,
      form: draft.shape === "syrup" ? "syrup" : draft.shape === "capsule" ? "capsule" : "tablet",
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
    onSpeak(`${draft.name} — ${t.scan.confirmAddRoutine}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-[24px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/70 dark:border-slate-800 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {t.scan.title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            {t.scan.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSpeak(`${t.scan.title}. ${t.scan.subtitle}`)}
          className="min-h-[48px] px-4 py-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold text-sm flex items-center gap-2 self-start"
        >
          <Volume2 className="w-5 h-5" />
          <span>{t.common.listenScreen}</span>
        </button>
      </div>

      {/* Three Big Action Buttons: a) Take Photo, b) Upload from Gallery, c) Add by Hand */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={startCamera}
          className="min-h-[120px] p-5 rounded-[24px] bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white shadow-lg shadow-blue-500/20 flex flex-col items-start justify-between text-left hover:opacity-95 transition"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Camera className="w-6 h-6" />
          </div>
          <div className="mt-3">
            <div className="text-base sm:text-lg font-bold">
              {t.scan.takePhoto}
            </div>
            <div className="text-xs text-blue-100 mt-0.5">
              Live Rear Camera Viewfinder
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="min-h-[120px] p-5 rounded-[24px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-2 border-blue-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-sm flex flex-col items-start justify-between text-left hover:border-blue-500 transition"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>
          <div className="mt-3">
            <div className="text-base sm:text-lg font-bold">
              {t.scan.uploadGallery}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Choose photo of doctor's slip or strip
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
          className="min-h-[120px] p-5 rounded-[24px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-2 border-purple-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-sm flex flex-col items-start justify-between text-left hover:border-purple-500 transition"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Sliders className="w-6 h-6" />
          </div>
          <div className="mt-3">
            <div className="text-base sm:text-lg font-bold">
              {t.scan.addByHand}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pick pill colour, shape & meal icon
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
              Don't have a paper prescription handy? Test the AI Visual Routine Builder with a sample Indian prescription.
            </span>
          </div>
          <button
            type="button"
            onClick={() => runScanRequest("")}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shrink-0 hover:bg-blue-700 transition"
          >
            Load Sample Prescription Scan
          </button>
        </div>
      )}

      {/* Live Camera Viewfinder */}
      {cameraActive && (
        <div className="rounded-[24px] bg-slate-900 p-4 text-white space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-[360px] mx-auto flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="pointer-events-none absolute inset-6 border-2 border-dashed border-blue-400/80 rounded-2xl" />
          </div>
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={captureFromCamera}
              className="min-h-[52px] px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base flex items-center gap-2 shadow-lg"
            >
              <Camera className="w-5 h-5" />
              <span>{t.scan.captureBtn}</span>
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

      {/* Reading Prescription Loading Skeleton */}
      {isScanning && (
        <div className="rounded-[24px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/70 dark:border-slate-800 p-8 text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {t.scan.readingPrescription}
          </p>
          <div className="max-w-md mx-auto space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-4/5 mx-auto animate-pulse" />
          </div>
        </div>
      )}

      {/* Image Preview + Results + Mandatory Doctor Verification Warning */}
      {drafts.length > 0 && !isScanning && (
        <div className="space-y-5">
          {/* Mandatory Doctor Check Warning Banner */}
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/70 border-2 border-amber-300 dark:border-amber-800 p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <p className="text-sm sm:text-base font-bold text-amber-900 dark:text-amber-200">
                  {t.scan.verifyDoctorWarning}
                </p>
                {isDemoResult && (
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                    {demoReason || t.scan.demoFallbackBanner}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSpeak(t.scan.verifyDoctorWarning)}
              className="min-h-[44px] min-w-[44px] rounded-xl bg-white/80 dark:bg-slate-800 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {previewDataUrl && (
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-white/60 dark:border-slate-800">
              <img
                src={previewDataUrl}
                alt="Captured prescription preview"
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-xl object-cover border border-slate-200"
              />
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500">
                  Captured Prescription Image
                </p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="mt-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold"
                >
                  {t.scan.retakeBtn}
                </button>
              </div>
            </div>
          )}

          {/* Editable Visual Routine Builder Cards */}
          <div className="space-y-5">
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

                  {/* Top Preview Row */}
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
                        <input
                          type="text"
                          value={draft.name}
                          onChange={(e) =>
                            updateDraft(draft.id, { name: e.target.value })
                          }
                          className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white bg-slate-100/80 dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-300 dark:border-slate-700"
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            value={draft.strength}
                            onChange={(e) =>
                              updateDraft(draft.id, { strength: e.target.value })
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
                          `${draft.name}, ${draft.strength}. ${draft.doseAmount} ${
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
                            {draft.shape === "syrup" ? "ml" : t.greetings.pillUnit}
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
