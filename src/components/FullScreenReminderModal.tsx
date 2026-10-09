import React, { useEffect } from "react";
import { Volume2, Check, Clock, PhoneCall, BellRing } from "lucide-react";
import {
  FamilyMemberProfile,
  MedicineItem,
  TimeOfDaySlot,
} from "../types/maatra";
import { TranslationDictionary } from "../i18n";
import { VisualPillSVG, VisualDoseIcons, FoodTimingBadge } from "./VisualPillSVG";

interface FullScreenReminderModalProps {
  medicine: MedicineItem;
  slot: TimeOfDaySlot;
  member: FamilyMemberProfile;
  t: TranslationDictionary;
  snoozeCount: number;
  caregiverAlerted: boolean;
  onSpeak: (text: string) => void;
  onMarkTaken: () => void;
  onSnooze10Min: () => void;
  onClose: () => void;
}

export const FullScreenReminderModal: React.FC<FullScreenReminderModalProps> = ({
  medicine,
  slot,
  member,
  t,
  snoozeCount,
  caregiverAlerted,
  onSpeak,
  onMarkTaken,
  onSnooze10Min,
  onClose,
}) => {
  const foodLabel =
    medicine.foodTiming === "before_food"
      ? t.greetings.beforeFood
      : medicine.foodTiming === "with_food"
      ? t.greetings.withFood
      : t.greetings.afterFood;

  const doseUnitLabel =
    medicine.shape === "syrup"
      ? `${medicine.doseAmount} ${t.greetings.mlSpoonUnit}`
      : medicine.doseAmount === 0.5
      ? t.greetings.halfPillUnit
      : `${medicine.doseAmount} ${t.greetings.pillUnit}`;

  const fullSpokenInstruction = `${member.name}, ${t.reminderModal.timeToTake}. ${medicine.name}, ${medicine.strength}. ${doseUnitLabel}, ${foodLabel}.`;

  useEffect(() => {
    onSpeak(fullSpokenInstruction);
    if (member.needs.vibration && "vibrate" in navigator) {
      try {
        navigator.vibrate([300, 150, 300]);
      } catch {
        // ignore
      }
    }
  }, [medicine.id]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-[32px] bg-white dark:bg-slate-900 border-2 border-blue-400/80 shadow-[0_25px_70px_-15px_rgba(37,99,235,0.45)] p-6 sm:p-8 text-center space-y-6">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
          <BellRing className="w-4 h-4 animate-bounce" />
          <span>
            {t.reminderModal.timeToTake} ({slot.toUpperCase()})
          </span>
        </div>

        {/* Caregiver Alerted Simulated Banner if Missed/Repeated */}
        {caregiverAlerted && (
          <div className="p-3.5 rounded-2xl bg-amber-100 dark:bg-amber-950/90 border border-amber-400 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-bold">
            🔔 {t.reminderModal.caregiverAlerted} ({member.contacts.caregiverName})
          </div>
        )}

        {/* Huge Pulsing Pill Picture */}
        <div className="flex justify-center py-2">
          <VisualPillSVG
            shape={medicine.shape}
            color={medicine.color}
            secondaryColor={medicine.secondaryColor}
            size="xl"
            highContrast={true}
            pulse={true}
          />
        </div>

        {/* Medicine Name & Instruction */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {member.name}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {medicine.name}
          </h2>
          <p className="text-base font-semibold text-blue-600 dark:text-blue-400">
            {medicine.strength} · {medicine.conditionTag}
          </p>
        </div>

        {/* Enlarged Dose Icons & Before/After Food */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <VisualDoseIcons
            shape={medicine.shape}
            doseAmount={medicine.doseAmount}
            color={medicine.color}
            pillLabel={t.greetings.pillUnit}
            halfLabel={t.greetings.halfPillUnit}
            spoonLabel={t.greetings.mlSpoonUnit}
          />
          <FoodTimingBadge timing={medicine.foodTiming} label={foodLabel} />
        </div>

        {/* Spoken Instruction Text Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200">
          "{fullSpokenInstruction}"
        </div>

        {/* Action Buttons: I took it, Listen again, Remind in 10 min, Call family */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onMarkTaken}
            className="sm:col-span-2 min-h-[58px] rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition"
          >
            <Check className="w-6 h-6" />
            <span>{t.reminderModal.iTookIt}</span>
          </button>

          <button
            type="button"
            onClick={() => onSpeak(fullSpokenInstruction)}
            className="min-h-[52px] rounded-2xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition"
          >
            <Volume2 className="w-5 h-5" />
            <span>{t.reminderModal.listenAgain}</span>
          </button>

          <button
            type="button"
            onClick={onSnooze10Min}
            className="min-h-[52px] rounded-2xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold text-sm flex items-center justify-center gap-2 transition"
          >
            <Clock className="w-5 h-5" />
            <span>
              {t.reminderModal.remind10Min} {snoozeCount > 0 ? `(${snoozeCount})` : ""}
            </span>
          </button>

          <a
            href={`tel:${member.contacts.caregiverPhone || "+919820188920"}`}
            className="sm:col-span-2 min-h-[50px] rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition"
          >
            <PhoneCall className="w-4 h-4 text-blue-600" />
            <span>
              {t.reminderModal.callFamily}: {member.contacts.caregiverName}
            </span>
          </a>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-xs font-medium text-slate-400 hover:text-slate-600"
        >
          {t.common.cancel}
        </button>
      </div>
    </div>
  );
};
