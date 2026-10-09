import React, { useState } from "react";
import { ScanLine, Volume2, Layers, Maximize2,Minimize2, Heart, Wind, Activity, ShieldAlert, Droplets } from "lucide-react";
import { FamilyMemberProfile, MemberVitals } from "../types/maatra";
import { TranslationDictionary } from "../i18n";

interface HumanBodyHeroProps {
  member: FamilyMemberProfile;
  vitals: MemberVitals;
  t: TranslationDictionary;
  onSpeak: (text: string) => void;
  onOpenScan: () => void;
}

export const HumanBodyHero: React.FC<HumanBodyHeroProps> = ({
  member,
  vitals,
  t,
  onSpeak,
  onOpenScan,
}) => {
  const [showAllOrgans, setShowAllOrgans] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const hasBPOrHeart =
    member.conditions.includes("Blood pressure") ||
    member.conditions.includes("Heart disease") ||
    member.conditions.includes("Cholesterol");
  const hasLungs =
    member.conditions.includes("Asthma") || member.conditions.includes("TB");
  const hasDiabetes =
    member.conditions.includes("Diabetes") ||
    member.conditions.includes("Thyroid");
  const hasKidney = member.conditions.includes("Kidney disease");

  const speakHeroSummary = () => {
    const condText =
      member.conditions.length > 0
        ? member.conditions.map((c) => t.conditions[c] || c).join(", ")
        : t.common.good;
    onSpeak(
      `${member.name}. ${t.greetings.bodyHeroTitle}: ${condText}. ${t.vitals.bloodPressure} ${vitals.bpSystolic} / ${vitals.bpDiastolic}. ${t.vitals.bloodSugar} ${vitals.bloodSugar}.`
    );
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[26px] bg-gradient-to-b from-[#DCEBFE]/85 via-[#E8EDFF]/80 to-[#F5F8FF]/90 dark:from-[#132038]/90 dark:via-[#17253F]/90 dark:to-[#0F172A]/95 backdrop-blur-xl border border-white/70 dark:border-white/10 shadow-[0_16px_40px_-12px_rgba(37,99,235,0.12)] transition-all duration-300 ${
        expanded ? "min-h-[600px] p-6" : "min-h-[490px] p-4 sm:p-5"
      } flex flex-col justify-between`}
    >
      {/* Ambient Medical Blue & Lavender Glows matching Veridia */}
      <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-blue-400/25 dark:bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-purple-400/20 dark:bg-purple-500/15 blur-3xl" />

      {/* Header Row */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
            {t.greetings.bodyHeroTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {member.name} · {member.age} yrs · {member.patientId}
          </p>
        </div>
        <button
          onClick={speakHeroSummary}
          title={t.common.listenScreen}
          className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-2xl bg-white/80 dark:bg-slate-800/80 hover:bg-white text-blue-600 dark:text-blue-400 border border-white/70 dark:border-slate-700 shadow-sm flex items-center gap-1.5 text-xs font-semibold transition"
        >
          <Volume2 className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">{t.common.listen}</span>
        </button>
      </div>

      {/* Central Human Anatomy SVG + Floating Organ Callout Cards */}
      <div className="relative z-10 my-2 flex-1 flex items-center justify-center">
        {/* Central Glowing Human Body SVG */}
        <svg
          viewBox="0 0 320 440"
          className={`${
            expanded ? "h-[430px]" : "h-[360px] sm:h-[390px]"
          } w-auto select-none drop-shadow-[0_0_24px_rgba(59,130,246,0.35)]`}
          role="img"
          aria-label={t.greetings.bodyHeroTitle}
        >
          <defs>
            <linearGradient id="bodySilhouette" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.42" />
              <stop offset="45%" stopColor="#3B82F6" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.18" />
            </linearGradient>
            <linearGradient id="bodyStroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#93C5FD" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#A78BFA" />
            </linearGradient>
            <radialGradient id="heartGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F97316" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.15" />
            </radialGradient>
            <radialGradient id="lungGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0.2" />
            </radialGradient>
            <radialGradient id="liverGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.15" />
            </radialGradient>
          </defs>

          {/* Subtle Neural/Vascular Grid Lines inside silhouette */}
          <g stroke="#60A5FA" strokeOpacity="0.28" strokeWidth="1" fill="none">
            <path d="M160 35 L160 370" strokeDasharray="3 3" />
            <path d="M160 110 C130 130, 105 170, 90 250" />
            <path d="M160 110 C190 130, 215 170, 230 250" />
            <path d="M160 165 C140 200, 135 260, 135 360" />
            <path d="M160 165 C180 200, 185 260, 185 360" />
          </g>

          {/* Human Head, Neck, Shoulders, Torso Silhouette */}
          <path
            d="M160 18
               C138 18, 125 34, 126 56
               C127 72, 134 86, 144 94
               L144 108
               C116 114, 88 126, 78 152
               C68 178, 62 245, 58 295
               C56 310, 68 314, 74 300
               C82 262, 90 205, 100 176
               L104 285
               C104 335, 110 385, 114 425
               L152 425
               L156 345
               L164 345
               L168 425
               L206 425
               C210 385, 216 335, 216 285
               L220 176
               C230 205, 238 262, 246 300
               C252 314, 264 310, 262 295
               C258 245, 252 178, 242 152
               C232 126, 204 114, 176 108
               L176 94
               C186 86, 193 72, 194 56
               C195 34, 182 18, 160 18 Z"
            fill="url(#bodySilhouette)"
            stroke="url(#bodyStroke)"
            strokeWidth="2.2"
          />

          {/* Lungs (Left & Right lobes) */}
          <path
            d="M152 132 C132 132, 114 154, 112 192 C110 215, 126 224, 148 216 Z"
            fill="url(#lungGlow)"
            stroke="#38BDF8"
            strokeWidth="1.5"
          />
          <path
            d="M168 132 C188 132, 206 154, 208 192 C210 215, 194 224, 172 216 Z"
            fill="url(#lungGlow)"
            stroke="#38BDF8"
            strokeWidth="1.5"
          />

          {/* Heart (Center-left chest) */}
          <path
            d="M166 168 C158 158, 144 166, 148 182 C152 196, 168 206, 176 196 C184 186, 176 168, 166 168 Z"
            fill="url(#heartGlow)"
            stroke="#FB923C"
            strokeWidth="1.8"
          />

          {/* Liver (Right side of body = viewer's left) */}
          <path
            d="M116 232 C116 222, 145 220, 166 230 C156 248, 132 256, 116 248 Z"
            fill="url(#liverGlow)"
            stroke="#34D399"
            strokeWidth="1.5"
          />

          {/* Stomach & GI Tract */}
          <path
            d="M164 232 C182 228, 198 242, 192 262 C186 278, 162 280, 154 266 Z"
            fill="#C084FC"
            fillOpacity="0.45"
            stroke="#A855F7"
            strokeWidth="1.5"
          />
          <path
            d="M128 282 C128 270, 192 270, 192 284 C192 298, 128 298, 128 312 C128 326, 190 324, 186 336"
            fill="none"
            stroke="#C084FC"
            strokeWidth="9"
            strokeLinecap="round"
            strokeOpacity="0.45"
          />

          {/* Callout Anchor Rings on Body (Veridia style) */}
          {/* Lungs Anchor */}
          <g>
            <circle cx="132" cy="172" r="10" fill="#FFFFFF" fillOpacity="0.85" />
            <circle cx="132" cy="172" r="5.5" fill="#2563EB" />
            <line x1="122" y1="166" x2="55" y2="122" stroke="#FFFFFF" strokeWidth="1.8" />
          </g>

          {/* Heart Anchor */}
          <g>
            <circle cx="168" cy="184" r="11" fill="#FFFFFF" fillOpacity="0.9" />
            <circle cx="168" cy="184" r="6" fill="#F59E0B" />
            <line x1="178" y1="178" x2="255" y2="132" stroke="#FFFFFF" strokeWidth="1.8" />
          </g>

          {/* Liver / Diabetes Metabolic Anchor */}
          <g>
            <circle cx="138" cy="238" r="10" fill="#FFFFFF" fillOpacity="0.85" />
            <circle cx="138" cy="238" r="5.5" fill="#10B981" />
            <line x1="128" y1="242" x2="58" y2="275" stroke="#FFFFFF" strokeWidth="1.8" />
          </g>

          {/* Stomach / Kidney Anchor */}
          <g>
            <circle cx="165" cy="306" r="10" fill="#FFFFFF" fillOpacity="0.85" />
            <circle cx="165" cy="306" r="5.5" fill="#8B5CF6" />
            <line x1="175" y1="306" x2="252" y2="320" stroke="#FFFFFF" strokeWidth="1.8" />
          </g>
        </svg>

        {/* Organ Callout Card 1: Top-Left (Pulmonary / Lungs) */}
        {showAllOrgans && (
          <button
            type="button"
            onClick={() =>
              onSpeak(
                `${t.organs.lungs}: SpO2 ${vitals.spo2}%. ${
                  hasLungs ? t.common.review : t.common.good
                }`
              )
            }
            className="absolute top-4 left-1 sm:left-3 z-20 w-[138px] sm:w-[162px] text-left p-2.5 sm:p-3 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-white/80 dark:border-slate-700/80 shadow-lg hover:scale-[1.02] transition"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Wind className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {t.organs.lungs}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  SpO2: <strong className="tabular-nums">{vitals.spo2}%</strong>
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span
                className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-semibold ${
                  hasLungs
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                }`}
              >
                {hasLungs ? t.common.review : t.common.good}
              </span>
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </button>
        )}

        {/* Organ Callout Card 2: Top-Right (Cardiac & BP) */}
        {showAllOrgans && (
          <button
            type="button"
            onClick={() =>
              onSpeak(
                `${t.organs.heart}: ${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg.`
              )
            }
            className="absolute top-6 right-1 sm:right-3 z-20 w-[142px] sm:w-[168px] text-left p-2.5 sm:p-3 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-white/80 dark:border-slate-700/80 shadow-lg hover:scale-[1.02] transition"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {t.organs.heart}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  BP:{" "}
                  <strong className="tabular-nums">
                    {vitals.bpSystolic}/{vitals.bpDiastolic}
                  </strong>
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span
                className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-semibold ${
                  hasBPOrHeart || vitals.bpStatus !== "good"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                }`}
              >
                {hasBPOrHeart ? t.common.borderline : t.common.good}
              </span>
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </button>
        )}

        {/* Organ Callout Card 3: Bottom-Left (Liver / Metabolic / Sugar) */}
        {showAllOrgans && (
          <button
            type="button"
            onClick={() =>
              onSpeak(
                `${t.organs.liver}: ${t.vitals.bloodSugar} ${vitals.bloodSugar} mg/dL.`
              )
            }
            className="absolute bottom-8 left-1 sm:left-3 z-20 w-[142px] sm:w-[164px] text-left p-2.5 sm:p-3 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-white/80 dark:border-slate-700/80 shadow-lg hover:scale-[1.02] transition"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {t.organs.liver}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Sugar: <strong className="tabular-nums">{vitals.bloodSugar} mg/dL</strong>
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span
                className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-semibold ${
                  hasDiabetes
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                }`}
              >
                {hasDiabetes ? t.common.borderline : t.common.good}
              </span>
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </button>
        )}

        {/* Organ Callout Card 4: Bottom-Right (Stomach & Renal / Meal Schedule) */}
        {showAllOrgans && (
          <button
            type="button"
            onClick={() =>
              onSpeak(
                `${t.organs.stomach}: ${t.greetings.afterFood} (${member.lifestyle.breakfastTime}, ${member.lifestyle.dinnerTime}).`
              )
            }
            className="absolute bottom-6 right-1 sm:right-3 z-20 w-[142px] sm:w-[166px] text-left p-2.5 sm:p-3 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-white/80 dark:border-slate-700/80 shadow-lg hover:scale-[1.02] transition"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                {hasKidney ? <Droplets className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {hasKidney ? t.organs.kidney : t.organs.stomach}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {t.greetings.afterFood} · {member.lifestyle.breakfastTime}
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="inline-block px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {t.common.active}
              </span>
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </button>
        )}
      </div>

      {/* Bottom Floating Frosted Icon Toolbar (Veridia Exact Reference: Scan, Voice, Layers, Fullscreen) */}
      <div className="relative z-20 mx-auto mt-1 flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/80 dark:border-slate-700 shadow-md">
        <button
          type="button"
          onClick={onOpenScan}
          title={t.nav.scan}
          className="min-h-[44px] min-w-[44px] rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center hover:bg-blue-100 transition"
        >
          <ScanLine className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={speakHeroSummary}
          title={t.common.listenScreen}
          className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center transition"
        >
          <Volume2 className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => setShowAllOrgans((prev) => !prev)}
          title="Toggle Organ Callout Layers"
          className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center transition ${
            showAllOrgans
              ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100"
          }`}
        >
          <Layers className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          title="Toggle Hero Size"
          className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center transition"
        >
          {expanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};
