import React, { useState } from "react";
import {
  Volume2,
  Mic,
  Check,
  User,
  Users,
  HeartPulse,
  Sun,
  ShieldCheck,
  Edit3,
  Plus,
  X,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import {
  LanguageCode,
  LANGUAGE_LIST,
  TranslationDictionary,
} from "../i18n";
import { FamilyMemberProfile } from "../types/maatra";
import { speakText, startVoiceDictation } from "../utils/speech";

interface OnboardingWizardProps {
  currentLang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
  t: TranslationDictionary;
  initialProfile: FamilyMemberProfile;
  onComplete: (profile: FamilyMemberProfile) => void;
  onClose: () => void;
  onToast: (msg: string) => void;
}

const CONDITION_OPTIONS = [
  "Diabetes",
  "Blood pressure",
  "Thyroid",
  "Asthma",
  "Heart disease",
  "Cholesterol",
  "Arthritis",
  "Kidney disease",
  "Epilepsy",
  "TB",
  "Anaemia",
  "Pregnancy",
  "Eye problems",
  "Depression/anxiety",
  "None",
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  currentLang,
  onSelectLang,
  t,
  initialProfile,
  onComplete,
  onClose,
  onToast,
}) => {
  const [step, setStep] = useState<number>(1);
  const [profile, setProfile] = useState<FamilyMemberProfile>({
    ...initialProfile,
  });
  const [otherConditionInput, setOtherConditionInput] = useState("");
  const [allergyInput, setAllergyInput] = useState("");
  const [dobInput, setDobInput] = useState("");

  const speakCurrentStep = () => {
    const stepPrompts: Record<number, string> = {
      1: t.chooseLanguagePrompt,
      2: `${t.onboarding.step2Title}. ${t.onboarding.step2Sub}`,
      3: `${t.onboarding.step3Title}. ${t.onboarding.roleSelf}, ${t.onboarding.roleFamily}`,
      4: `${t.onboarding.step4Title}. ${t.onboarding.step4Sub}`,
      5: `${t.onboarding.step5Title}. ${t.onboarding.step5Sub}`,
      6: `${t.onboarding.step6Title}. ${t.onboarding.step6Sub}`,
      7: `${t.onboarding.step7Title}. ${t.onboarding.startWithMaatra}`,
    };
    speakText(stepPrompts[step] || t.appTitle, currentLang, profile.needs.slowVoice, onToast);
  };

  const toggleCondition = (cond: string) => {
    if (cond === "None") {
      setProfile((p) => ({ ...p, conditions: ["None"] }));
      return;
    }
    setProfile((p) => {
      const filtered = p.conditions.filter((c) => c !== "None");
      const exists = filtered.includes(cond);
      return {
        ...p,
        conditions: exists
          ? filtered.filter((c) => c !== cond)
          : [...filtered, cond],
      };
    });
  };

  const handleAddOtherCondition = () => {
    const trimmed = otherConditionInput.trim();
    if (!trimmed) return;
    setProfile((p) => ({
      ...p,
      conditions: [...p.conditions.filter((c) => c !== "None"), trimmed],
    }));
    setOtherConditionInput("");
  };

  const handleAddAllergy = () => {
    const trimmed = allergyInput.trim();
    if (!trimmed) return;
    if (!profile.allergies.includes(trimmed)) {
      setProfile((p) => ({ ...p, allergies: [...p.allergies, trimmed] }));
    }
    setAllergyInput("");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-[#E2EEFF] via-[#EFEAFF] to-[#F8FAFF] dark:from-[#0B1324] dark:via-[#111C33] dark:to-[#18243E] p-3 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-3xl rounded-[28px] bg-white/85 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/80 dark:border-slate-700/80 shadow-[0_24px_60px_-15px_rgba(37,99,235,0.2)] p-5 sm:p-8">
        {/* Top Progress Header */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white font-bold flex items-center justify-center shadow-md">
              {step}/7
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {t.appTitle} · Voice-Assisted Setup
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStep(s)}
                    className={`h-2 rounded-full transition-all ${
                      s === step
                        ? "w-7 bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]"
                        : s < step
                        ? "w-3 bg-blue-400"
                        : "w-3 bg-slate-200 dark:bg-slate-700"
                    }`}
                    aria-label={`Step ${s}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={speakCurrentStep}
              className="min-h-[48px] px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold text-sm flex items-center gap-2 hover:bg-blue-100 transition"
            >
              <Volume2 className="w-5 h-5 shrink-0" />
              <span>{t.common.listen}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-3 py-2 rounded-2xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium"
            >
              {t.common.skip}
            </button>
          </div>
        </div>

        {/* STEP 1: LANGUAGE */}
        {step === 1 && (
          <div className="py-6 space-y-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {t.onboarding.step1Title}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1">
                {t.onboarding.step1Sub}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {LANGUAGE_LIST.map((item) => {
                const isSelected = currentLang === item.code;
                return (
                  <div
                    key={item.code}
                    onClick={() => onSelectLang(item.code)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") onSelectLang(item.code);
                    }}
                    className={`min-h-[82px] p-4 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 shadow-md"
                        : "border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-800/70 hover:border-blue-300"
                    }`}
                  >
                    <div>
                      <div className="text-xl font-bold text-slate-900 dark:text-white">
                        {item.nativeName}
                      </div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {item.englishName}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLang(item.code);
                          speakText(item.sampleGreeting, item.code, true, onToast);
                        }}
                        className="min-h-[48px] px-3.5 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-blue-600 dark:text-blue-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:bg-blue-50"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>{t.common.listen}</span>
                      </button>
                      {isSelected && (
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: ABOUT YOU */}
        {step === 2 && (
          <div className="py-6 space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t.onboarding.step2Title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                {t.onboarding.step2Sub}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  {t.onboarding.nameLabel}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, name: e.target.value }))
                    }
                    className="flex-1 min-h-[52px] px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-base font-medium text-slate-900 dark:text-white"
                    placeholder="e.g. Ramesh Sharma"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      startVoiceDictation(
                        currentLang,
                        (text) => setProfile((p) => ({ ...p, name: text })),
                        onToast
                      )
                    }
                    className="min-h-[52px] min-w-[52px] rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-600 border border-blue-200 dark:border-slate-700 flex items-center justify-center"
                    title="Voice input"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  {t.onboarding.genderLabel}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(
                    [
                      { id: "male", label: t.onboarding.male, icon: "👨🏽" },
                      { id: "female", label: t.onboarding.female, icon: "👩🏽" },
                      { id: "other", label: t.onboarding.other, icon: "🧑🏽" },
                      {
                        id: "preferNotToSay",
                        label: t.onboarding.preferNotToSay,
                        icon: "🛡️",
                      },
                    ] as const
                  ).map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() =>
                        setProfile((p) => ({ ...p, gender: g.id }))
                      }
                      className={`min-h-[68px] p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition ${
                        profile.gender === g.id
                          ? "border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-200 font-bold"
                          : "border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="text-xl">{g.icon}</span>
                      <span className="text-xs">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                    {t.onboarding.ageLabel}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={profile.age}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        age: Number(e.target.value) || 60,
                      }))
                    }
                    className="w-full min-h-[52px] px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-base font-semibold tabular-nums text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                    Date of Birth (Optional)
                  </label>
                  <input
                    type="date"
                    value={dobInput}
                    onChange={(e) => {
                      setDobInput(e.target.value);
                      const yr = new Date(e.target.value).getFullYear();
                      if (yr > 1900) {
                        const calcAge = Math.max(1, new Date().getFullYear() - yr);
                        setProfile((p) => ({ ...p, age: calcAge }));
                      }
                    }}
                    className="w-full min-h-[52px] px-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                    {t.onboarding.phoneLabel}
                  </label>
                  <input
                    type="tel"
                    value={profile.phone || ""}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="+91 98201..."
                    className="w-full min-h-[52px] px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onComplete(profile);
                  }}
                  className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-sm font-semibold"
                >
                  {t.onboarding.continueGuest} →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ROLE */}
        {step === 3 && (
          <div className="py-6 space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t.onboarding.step3Title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                {t.onboarding.step3Sub}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setProfile((p) => ({ ...p, role: "self" }))}
                className={`min-h-[150px] p-6 rounded-3xl border-2 text-left transition flex flex-col justify-between ${
                  profile.role === "self"
                    ? "border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 shadow-lg"
                    : "border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div className="mt-4">
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {t.onboarding.roleSelf}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {t.onboarding.roleSelfDesc}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setProfile((p) => ({ ...p, role: "family" }))}
                className={`min-h-[150px] p-6 rounded-3xl border-2 text-left transition flex flex-col justify-between ${
                  profile.role === "family"
                    ? "border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 shadow-lg"
                    : "border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div className="mt-4">
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {t.onboarding.roleFamily}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {t.onboarding.roleFamilyDesc}
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: HEALTH CONDITIONS & ALLERGIES */}
        {step === 4 && (
          <div className="py-6 space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t.onboarding.step4Title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                {t.onboarding.step4Sub}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CONDITION_OPTIONS.map((cond) => {
                const selected = profile.conditions.includes(cond);
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => toggleCondition(cond)}
                    className={`min-h-[52px] px-3.5 py-2.5 rounded-2xl border-2 text-left text-xs sm:text-sm font-semibold flex items-center justify-between gap-2 transition ${
                      selected
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-blue-200"
                        : "border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <span className="truncate">{t.conditions[cond] || cond}</span>
                    {selected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* + Add other condition with mic dictation */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.onboarding.addOtherCondition}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={otherConditionInput}
                  onChange={(e) => setOtherConditionInput(e.target.value)}
                  placeholder="Type condition or tap mic..."
                  className="flex-1 min-h-[48px] px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() =>
                    startVoiceDictation(
                      currentLang,
                      (txt) => setOtherConditionInput(txt),
                      onToast
                    )
                  }
                  className="min-h-[48px] min-w-[48px] rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-600 border border-blue-200 dark:border-slate-700 flex items-center justify-center"
                  title="Dictate condition"
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleAddOtherCondition}
                  className="min-h-[48px] px-4 rounded-2xl bg-blue-600 text-white text-sm font-semibold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>

            {/* Allergies input + chips */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.onboarding.allergiesLabel}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  placeholder={t.onboarding.allergiesPlaceholder}
                  className="flex-1 min-h-[48px] px-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddAllergy}
                  className="min-h-[48px] px-4 rounded-2xl bg-amber-500 text-white text-sm font-semibold"
                >
                  + Allergy
                </button>
              </div>
              {profile.allergies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {profile.allergies.map((alg) => (
                    <span
                      key={alg}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300"
                    >
                      ⚠️ {alg}
                      <button
                        type="button"
                        onClick={() =>
                          setProfile((p) => ({
                            ...p,
                            allergies: p.allergies.filter((a) => a !== alg),
                          }))
                        }
                        className="hover:text-rose-900"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: LIFESTYLE & MEAL TIMES */}
        {step === 5 && (
          <div className="py-6 space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t.onboarding.step5Title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                {t.onboarding.step5Sub}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(
                [
                  { id: "veg", label: t.onboarding.veg },
                  { id: "nonVeg", label: t.onboarding.nonVeg },
                  { id: "vegan", label: t.onboarding.vegan },
                  { id: "jain", label: t.onboarding.jain },
                ] as const
              ).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() =>
                    setProfile((p) => ({
                      ...p,
                      lifestyle: { ...p.lifestyle, diet: d.id },
                    }))
                  }
                  className={`min-h-[48px] px-3 py-2 rounded-2xl border-2 text-xs font-semibold transition ${
                    profile.lifestyle.diet === d.id
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-200"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Activity, Smoking, Alcohol */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {t.onboarding.activityLevel}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["low", "medium", "high"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() =>
                        setProfile((p) => ({
                          ...p,
                          lifestyle: { ...p.lifestyle, activityLevel: lvl },
                        }))
                      }
                      className={`min-h-[44px] rounded-xl text-xs font-semibold border ${
                        profile.lifestyle.activityLevel === lvl
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {t.onboarding[lvl]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setProfile((p) => ({
                    ...p,
                    lifestyle: { ...p.lifestyle, smoking: !p.lifestyle.smoking },
                  }))
                }
                className={`min-h-[48px] px-4 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
                  profile.lifestyle.smoking
                    ? "border-amber-500 bg-amber-50 text-amber-800"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span>{t.onboarding.smoking}</span>
                <span>{profile.lifestyle.smoking ? "Yes" : "No"}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setProfile((p) => ({
                    ...p,
                    lifestyle: { ...p.lifestyle, alcohol: !p.lifestyle.alcohol },
                  }))
                }
                className={`min-h-[48px] px-4 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
                  profile.lifestyle.alcohol
                    ? "border-amber-500 bg-amber-50 text-amber-800"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span>{t.onboarding.alcohol}</span>
                <span>{profile.lifestyle.alcohol ? "Yes" : "No"}</span>
              </button>
            </div>

            {/* Wake & Meal Times */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {(
                [
                  { key: "wakeTime", label: t.onboarding.wakeTime },
                  { key: "breakfastTime", label: t.onboarding.breakfastTime },
                  { key: "lunchTime", label: t.onboarding.lunchTime },
                  { key: "dinnerTime", label: t.onboarding.dinnerTime },
                  { key: "sleepTime", label: t.onboarding.sleepTime },
                ] as const
              ).map((tm) => (
                <div key={tm.key}>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 truncate">
                    {tm.label}
                  </label>
                  <input
                    type="time"
                    value={profile.lifestyle[tm.key]}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        lifestyle: { ...p.lifestyle, [tm.key]: e.target.value },
                      }))
                    }
                    className="w-full min-h-[46px] px-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold tabular-nums text-slate-900 dark:text-white"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {t.onboarding.fastingDays}
                </label>
                <input
                  type="text"
                  value={profile.lifestyle.fastingDays}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      lifestyle: { ...p.lifestyle, fastingDays: e.target.value },
                    }))
                  }
                  placeholder="e.g. Ekadashi, Mondays, Ramadan..."
                  className="w-full min-h-[48px] px-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {t.onboarding.anythingElse}
                </label>
                <input
                  type="text"
                  value={profile.lifestyle.notes}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      lifestyle: { ...p.lifestyle, notes: e.target.value },
                    }))
                  }
                  placeholder="Warm water, swallowing difficulty, etc."
                  className="w-full min-h-[48px] px-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: NEEDS & CAREGIVER */}
        {step === 6 && (
          <div className="py-6 space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t.onboarding.step6Title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                {t.onboarding.step6Sub}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  { key: "largeText", label: t.onboarding.largeText },
                  { key: "slowVoice", label: t.onboarding.slowVoice },
                  { key: "poorEyesight", label: t.onboarding.poorEyesight },
                  {
                    key: "hearingDifficulty",
                    label: t.onboarding.hearingDifficulty,
                  },
                ] as const
              ).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    setProfile((p) => ({
                      ...p,
                      needs: { ...p.needs, [item.key]: !p.needs[item.key] },
                    }))
                  }
                  className={`min-h-[54px] px-4 py-3 rounded-2xl border-2 flex items-center justify-between text-sm font-semibold transition ${
                    profile.needs[item.key]
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      profile.needs[item.key]
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  >
                    {profile.needs[item.key] && <Check className="w-4 h-4" />}
                  </span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {t.onboarding.caregiverName}
                </label>
                <input
                  type="text"
                  value={profile.contacts.caregiverName}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      contacts: { ...p.contacts, caregiverName: e.target.value },
                    }))
                  }
                  className="w-full min-h-[48px] px-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {t.onboarding.caregiverPhone}
                </label>
                <input
                  type="tel"
                  value={profile.contacts.caregiverPhone}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      contacts: {
                        ...p.contacts,
                        caregiverPhone: e.target.value,
                      },
                    }))
                  }
                  className="w-full min-h-[48px] px-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {t.onboarding.doctorName}
                </label>
                <input
                  type="text"
                  value={profile.contacts.doctorName}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      contacts: { ...p.contacts, doctorName: e.target.value },
                    }))
                  }
                  className="w-full min-h-[48px] px-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {t.onboarding.emergencyContact}
                </label>
                <input
                  type="tel"
                  value={profile.contacts.emergencyContact}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      contacts: {
                        ...p.contacts,
                        emergencyContact: e.target.value,
                      },
                    }))
                  }
                  className="w-full min-h-[48px] px-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: SUMMARY */}
        {step === 7 && (
          <div className="py-6 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t.onboarding.step7Title}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                {t.onboarding.step7Sub}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Section 1 & 2 */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-blue-600">
                    Language & Profile
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {profile.name} ({profile.age} yrs)
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {t.nativeName} · Role:{" "}
                    {profile.role === "self"
                      ? t.onboarding.roleSelf
                      : t.onboarding.roleFamily}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-xs font-semibold text-blue-600 flex items-center gap-1 shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" /> {t.common.edit}
                </button>
              </div>

              {/* Section 4: Conditions */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                    <HeartPulse className="w-3.5 h-3.5" /> Conditions & Allergies
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {profile.conditions
                      .map((c) => t.conditions[c] || c)
                      .join(", ") || "None"}
                  </div>
                  <div className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                    Allergies: {profile.allergies.join(", ") || "None"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-xs font-semibold text-blue-600 flex items-center gap-1 shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" /> {t.common.edit}
                </button>
              </div>

              {/* Section 5: Meal Schedule */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5" /> Meal & Dose Schedule
                  </div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 tabular-nums">
                    🌅 {profile.lifestyle.breakfastTime} · ☀️{" "}
                    {profile.lifestyle.lunchTime} · 🌙{" "}
                    {profile.lifestyle.dinnerTime}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Diet: {profile.lifestyle.diet.toUpperCase()} · Fasting:{" "}
                    {profile.lifestyle.fastingDays || "None"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-xs font-semibold text-blue-600 flex items-center gap-1 shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" /> {t.common.edit}
                </button>
              </div>

              {/* Section 6: Caregiver */}
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Caregiver & Accessibility
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {profile.contacts.caregiverName}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {profile.contacts.caregiverPhone} ·{" "}
                    {profile.needs.largeText ? "Large Text" : "Standard Text"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-xs font-semibold text-blue-600 flex items-center gap-1 shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" /> {t.common.edit}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation Bar */}
        <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="min-h-[52px] px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm flex items-center gap-2 hover:bg-slate-200 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.common.back}</span>
            </button>
          ) : (
            <div />
          )}

          {step < 7 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="min-h-[52px] px-7 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-bold text-base shadow-lg shadow-blue-500/25 flex items-center gap-2 hover:opacity-95 transition"
            >
              <span>{t.common.continue}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onComplete(profile)}
              className="min-h-[54px] px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-bold text-base shadow-lg shadow-blue-500/30 flex items-center gap-2 hover:opacity-95 transition"
            >
              <Check className="w-5 h-5" />
              <span>{t.onboarding.startWithMaatra}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
