import React, { useState } from "react";
import {
  Volume2,
  Plus,
  PhoneCall,
  AlertOctagon,
  Calendar,
  Mic,
  CheckCircle2,
  Package,
  Award,
  Printer,
  RotateCcw,
  Sun,
  Moon,
  Bell,
  Sparkles,
  UserPlus,
  Edit3,
  Trash2,
  Share2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  FamilyMemberProfile,
  MedicineItem,
  HistoryTimelineItem,
  DoctorAppointment,
  DoctorQuestion,
} from "../types/maatra";
import {
  LanguageCode,
  LANGUAGE_LIST,
  TranslationDictionary,
} from "../i18n";
import { VisualPillSVG, VisualDoseIcons } from "./VisualPillSVG";
import { WEEKLY_ADHERENCE_DATA } from "../data/seedData";
import { startVoiceDictation } from "../utils/speech";

/* =========================================================
   1. FAMILY VIEW (Member cards + Add/Edit/Delete + Caregiver View)
========================================================= */
export const FamilyView: React.FC<{
  members: FamilyMemberProfile[];
  activeMemberId: string;
  medicines: MedicineItem[];
  t: TranslationDictionary;
  onSelectMember: (id: string) => void;
  onSaveMember: (member: FamilyMemberProfile) => void;
  onUpdateMember: (member: FamilyMemberProfile) => void;
  onDeleteMember: (memberId: string) => void;
  onOpenOnboardingForMember: (member: FamilyMemberProfile) => void;
  onSpeak: (text: string) => void;
}> = ({
  members,
  activeMemberId,
  medicines,
  t,
  onSelectMember,
  onSaveMember,
  onUpdateMember,
  onDeleteMember,
  onOpenOnboardingForMember,
  onSpeak,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newRelation, setNewRelation] = useState("Family Member");
  const [newAge, setNewAge] = useState(45);
  const [newBloodGroup, setNewBloodGroup] = useState("B+");
  const [newConditions, setNewConditions] = useState<string[]>(["Diabetes"]);

  const getMemberAdherence = (memberId: string) => {
    const memberMeds = medicines.filter((m) => m.memberId === memberId);
    let total = 0;
    let taken = 0;
    memberMeds.forEach((m) => {
      m.timesOfDay.forEach((slot) => {
        total += 1;
        if (m.takenToday[slot]) taken += 1;
      });
    });
    if (total === 0) return 100;
    return Math.round((taken / total) * 100);
  };

  const openCreateModal = () => {
    setEditingMemberId(null);
    setNewName("");
    setNewRelation("Family Member");
    setNewAge(45);
    setNewBloodGroup("B+");
    setNewConditions(["Diabetes"]);
    setShowAddModal(true);
  };

  const openEditModal = (member: FamilyMemberProfile) => {
    setEditingMemberId(member.id);
    setNewName(member.name);
    setNewRelation(member.relation);
    setNewAge(member.age);
    setNewBloodGroup(member.bloodGroup || "B+");
    setNewConditions(member.conditions);
    setShowAddModal(true);
  };

  const handleSaveModal = () => {
    if (!newName.trim()) return;
    if (editingMemberId) {
      const existing = members.find((m) => m.id === editingMemberId);
      if (existing) {
        const updated: FamilyMemberProfile = {
          ...existing,
          name: newName.trim(),
          relation: newRelation,
          age: newAge,
          bloodGroup: newBloodGroup,
          conditions: newConditions.length > 0 ? newConditions : ["None"],
        };
        onUpdateMember(updated);
        onSpeak(`${updated.name} profile updated.`);
      }
    } else {
      const base = members[0];
      const created: FamilyMemberProfile = {
        ...base,
        id: `member-${Date.now()}`,
        name: newName.trim(),
        relation: newRelation,
        patientId: `ID ${Math.floor(100 + Math.random() * 899)}-22-9104`,
        age: newAge,
        bloodGroup: newBloodGroup,
        avatarColor: "#EC4899",
        conditions: newConditions.length > 0 ? newConditions : ["None"],
        streakDays: 1,
      };
      onSaveMember(created);
      onSpeak(`${created.name} added to family circle.`);
    }
    setNewName("");
    setEditingMemberId(null);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/70 dark:border-slate-800 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {t.sections.familyTitle}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
            {t.sections.caregiverOverview} — Tap Edit or Delete on any profile card
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              onSpeak(
                `${t.sections.familyTitle}. ${members
                  .map((m) => `${m.name}, ${m.age} years`)
                  .join(". ")}`
              )
            }
            className="min-h-[48px] px-4 py-2 rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-semibold text-sm flex items-center gap-2"
          >
            <Volume2 className="w-5 h-5" />
            <span>{t.common.listen}</span>
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-bold text-sm shadow-md flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.sections.addMember}</span>
          </button>
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {members.map((m) => {
          const adherence = getMemberAdherence(m.id);
          const isCurrent = m.id === activeMemberId;
          const memberMeds = medicines.filter((med) => med.memberId === m.id);

          return (
            <div
              key={m.id}
              onClick={() => onSelectMember(m.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelectMember(m.id);
              }}
              className={`rounded-[26px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-5 transition cursor-pointer flex flex-col justify-between gap-4 ${
                isCurrent
                  ? "border-2 border-blue-600 shadow-[0_14px_38px_-10px_rgba(37,99,235,0.22)]"
                  : "border border-white/70 dark:border-slate-800 shadow-sm hover:border-blue-300"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#8B5CF6] to-[#3B82F6] shadow-md shrink-0 overflow-hidden"
                    >
                      {m.avatarPhoto ? (
                        <img
                          src={m.avatarPhoto}
                          alt={m.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full rounded-full object-cover bg-white dark:bg-slate-900"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-lg font-bold text-blue-600">
                          {m.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {m.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {m.relation} · {m.age} yrs · {m.bloodGroup}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold tabular-nums ${
                      adherence >= 80
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {adherence}% {t.common.taken}
                  </span>
                </div>

                {/* Condition Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {m.conditions.map((c) => (
                    <span
                      key={c}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 text-xs font-semibold"
                    >
                      {t.conditions[c] || c}
                    </span>
                  ))}
                </div>

                {/* Caregiver Mini Schedule Summary */}
                <div className="p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Active Medicines ({memberMeds.length})
                  </div>
                  {memberMeds.slice(0, 3).map((med) => (
                    <div
                      key={med.id}
                      className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300"
                    >
                      <span className="truncate">{med.name}</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {med.timesOfDay.length}x / day
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(m);
                    }}
                    className="min-h-[42px] px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1 hover:bg-blue-100"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t.common.edit}</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenOnboardingForMember(m);
                    }}
                    className="min-h-[42px] px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200"
                  >
                    7-Step Setup
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${m.contacts.caregiverPhone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="min-h-[42px] px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteMember(m.id);
                      }}
                      title={t.common.delete}
                      className="min-h-[42px] px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-300 text-xs font-bold flex items-center gap-1 hover:bg-rose-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t.common.delete}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Family Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 border border-white/80 dark:border-slate-700 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingMemberId ? `${t.common.edit} Profile` : t.sections.addMember}
            </h3>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                {t.onboarding.nameLabel}
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Lakshmi Devi (Grandmother)"
                className="w-full min-h-[48px] px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Relation
                </label>
                <input
                  type="text"
                  value={newRelation}
                  onChange={(e) => setNewRelation(e.target.value)}
                  className="w-full min-h-[48px] px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {t.onboarding.ageLabel}
                </label>
                <input
                  type="number"
                  value={newAge}
                  onChange={(e) => setNewAge(Number(e.target.value) || 50)}
                  className="w-full min-h-[48px] px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {t.sections.bloodGroup}
                </label>
                <select
                  value={newBloodGroup}
                  onChange={(e) => setNewBloodGroup(e.target.value)}
                  className="w-full min-h-[48px] px-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                >
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                    (bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Conditions / Disease Info
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Diabetes",
                  "Blood pressure",
                  "Thyroid",
                  "Asthma",
                  "Arthritis",
                  "Cholesterol",
                ].map((c) => {
                  const sel = newConditions.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() =>
                        setNewConditions((prev) =>
                          sel ? prev.filter((x) => x !== c) : [...prev, c]
                        )
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                        sel
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-600"
                      }`}
                    >
                      {t.conditions[c] || c}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingMemberId(null);
                }}
                className="min-h-[46px] px-4 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="min-h-[46px] px-5 rounded-xl bg-blue-600 text-white text-sm font-bold"
              >
                {t.common.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   2. CABINET VIEW (All medicines, stock count, refill needed, expiry)
========================================================= */
export const CabinetView: React.FC<{
  medicines: MedicineItem[];
  t: TranslationDictionary;
  onSpeak: (text: string) => void;
  onToggleRefillReminder: (medId: string) => void;
  onRestockMedicine: (medId: string) => void;
}> = ({
  medicines,
  t,
  onSpeak,
  onToggleRefillReminder,
  onRestockMedicine,
}) => {
  return (
    <div className="space-y-6">
      <div className="rounded-[24px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/70 dark:border-slate-800 p-5 shadow-sm flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {t.sections.cabinetTitle}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
            Visual stock tracker with low-stock warnings at 5 doses or fewer
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            onSpeak(
              `${t.sections.cabinetTitle}. ${medicines.length} medicines in stock.`
            )
          }
          className="min-h-[48px] px-4 py-2 rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-semibold text-sm flex items-center gap-2"
        >
          <Volume2 className="w-5 h-5" />
          <span>{t.common.listen}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {medicines.map((med) => {
          const isLowStock = med.stockCount <= 5;
          return (
            <div
              key={med.id}
              className="rounded-[24px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/70 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <VisualPillSVG
                    shape={med.shape}
                    color={med.color}
                    secondaryColor={med.secondaryColor}
                    size="md"
                  />
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {med.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {med.strength} · {med.conditionTag} ·{" "}
                      {t.sections.expiryLabel}:{" "}
                      <span className="font-semibold tabular-nums">
                        {med.expiryDate}
                      </span>
                    </p>
                    <div className="mt-2">
                      <VisualDoseIcons
                        shape={med.shape}
                        doseAmount={med.doseAmount}
                        color={med.color}
                        pillLabel={t.greetings.pillUnit}
                        halfLabel={t.greetings.halfPillUnit}
                        spoonLabel={t.greetings.mlSpoonUnit}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-1.5">
                  <span
                    className={`inline-block px-3 py-1 rounded-xl text-xs font-bold tabular-nums ${
                      isLowStock
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    }`}
                  >
                    {med.stockCount} {t.greetings.dosesLeft}
                  </span>
                  {isLowStock && (
                    <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      ⚠️ {t.sections.refillNeeded}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onToggleRefillReminder(med.id)}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    med.refillReminderSet
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-amber-50 dark:bg-slate-800 text-amber-800 dark:text-amber-300 border border-amber-200"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>
                    {med.refillReminderSet
                      ? "✓ Refill Reminder Active"
                      : t.sections.orderRefill}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onRestockMedicine(med.id)}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 transition"
                >
                  + Add 30 Doses
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* =========================================================
   3. HISTORY VIEW (Veridia Findings Timeline + Weekly Bar Chart)
========================================================= */
export const HistoryView: React.FC<{
  history: HistoryTimelineItem[];
  t: TranslationDictionary;
  onSpeak: (text: string) => void;
}> = ({ history, t, onSpeak }) => {
  return (
    <div className="space-y-6">
      <div className="rounded-[24px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/70 dark:border-slate-800 p-5 shadow-sm flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {t.sections.historyTitle}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
            Veridia-style vertical timeline of taken, snoozed, and missed doses
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            onSpeak(
              `${t.sections.historyTitle}. ${history
                .slice(0, 3)
                .map((h) => `${h.medicineName} ${h.status} at ${h.timeLabel}`)
                .join(". ")}`
            )
          }
          className="min-h-[48px] px-4 py-2 rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-semibold text-sm flex items-center gap-2"
        >
          <Volume2 className="w-5 h-5" />
          <span>{t.common.listen}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Findings Timeline (7 cols) */}
        <div className="lg:col-span-7 rounded-[24px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/70 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-5">
            Findings & Dose Log Timeline
          </h2>
          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-700">
            {history.map((item) => {
              const ringColor =
                item.status === "taken"
                  ? "border-emerald-500 bg-emerald-50"
                  : item.status === "snoozed"
                  ? "border-amber-500 bg-amber-50"
                  : "border-rose-500 bg-rose-50";

              return (
                <div
                  key={item.id}
                  className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60"
                >
                  {/* Coloured Ring Dot on Timeline */}
                  <span
                    className={`absolute -left-[21px] top-5 w-4 h-4 rounded-full border-[3px] ${ringColor}`}
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      <span>{item.dateLabel}</span>
                      <span>·</span>
                      <span>{item.timeLabel}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.medicineName}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      {item.detail}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        item.status === "taken"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : item.status === "snoozed"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      }`}
                    >
                      {item.status === "taken"
                        ? t.common.taken
                        : item.status === "snoozed"
                        ? t.common.snoozed
                        : t.common.missed}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onSpeak(`${item.medicineName}. ${item.detail}`)
                      }
                      className="min-h-[40px] min-w-[40px] rounded-xl bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 flex items-center justify-center"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Adherence Bar Chart (5 cols) */}
        <div className="lg:col-span-5 rounded-[24px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/70 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t.sections.weeklyAdherence}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              7-Day Prescription Completion (%)
            </p>
          </div>
          <div className="h-64 w-full my-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_ADHERENCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar
                  dataKey="adherence"
                  fill="#3B82F6"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-slate-800 text-xs text-blue-800 dark:text-blue-200 font-medium">
            91% weekly adherence across morning, afternoon, and night routines.
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   4. HEALTH TIPS & APPOINTMENTS VIEW
========================================================= */
export const HealthTipsAndAppointmentsView: React.FC<{
  member: FamilyMemberProfile;
  appointments: DoctorAppointment[];
  questions: DoctorQuestion[];
  langCode: LanguageCode;
  t: TranslationDictionary;
  onSpeak: (text: string) => void;
  onAddQuestion: (q: string) => void;
  onToggleQuestionAsked: (id: string) => void;
  onToast: (msg: string) => void;
}> = ({
  member,
  appointments,
  questions,
  langCode,
  t,
  onSpeak,
  onAddQuestion,
  onToggleQuestionAsked,
  onToast,
}) => {
  const [questionDraft, setQuestionDraft] = useState("");

  const tips = [
    {
      id: "tip-diabetes",
      condition: "Diabetes",
      title: "Walk 15 minutes after dinner",
      body: `Since your dinner is at ${member.lifestyle.dinnerTime}, a gentle 15-minute walk helps lower post-meal blood sugar naturally.`,
      tag: t.conditions["Diabetes"] || "Diabetes",
    },
    {
      id: "tip-bp",
      condition: "Blood pressure",
      title: "Low salt & warm water in the morning",
      body: `Take your morning blood pressure tablet after breakfast (${member.lifestyle.breakfastTime}) and avoid extra table salt or papad.`,
      tag: t.conditions["Blood pressure"] || "Blood Pressure",
    },
    {
      id: "tip-fasting",
      condition: "Lifestyle",
      title: `Fasting Day Care (${member.lifestyle.fastingDays || "Regular"})`,
      body: "Never skip blood pressure tablets on religious fasting days. Ask your doctor before taking diabetes tablets on an empty stomach.",
      tag: "Fasting & Diet",
    },
    {
      id: "tip-asthma",
      condition: "Asthma",
      title: "Rinse mouth after evening syrup or inhaler",
      body: "Giving warm water after nighttime cough syrup keeps the throat clear and prevents irritation.",
      tag: t.conditions["Asthma"] || "Asthma",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Condition-Based Spoken Daily Tips */}
      <div className="rounded-[24px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/70 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>{t.sections.tipsTitle}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalized for {member.name}'s conditions & meal times
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tips.map((tip) => (
            <div
              key={tip.id}
              className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 border border-blue-200/60 dark:border-slate-700 flex flex-col justify-between gap-3"
            >
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[11px] font-bold">
                  {tip.tag}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                  {tip.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {tip.body}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSpeak(`${tip.title}. ${tip.body}`)}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 self-start shadow-sm"
              >
                <Volume2 className="w-4 h-4" />
                <span>{t.common.listen}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Appointments & Voice-Dictated Questions for the Doctor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 rounded-[24px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/70 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>{t.sections.appointmentsTitle}</span>
          </h2>
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {apt.doctorName}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold tabular-nums">
                    {apt.date} · {apt.time}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  {apt.specialty} · {apt.hospital}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {apt.notes}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    onSpeak(
                      `${apt.doctorName}, ${apt.date} at ${apt.time}. ${apt.notes}`
                    )
                  }
                  className="min-h-[40px] px-3 py-1 rounded-xl bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{t.common.listen}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Questions for the Doctor with Voice Dictation */}
        <div className="lg:col-span-6 rounded-[24px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/70 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t.sections.questionsForDoctor}
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={questionDraft}
              onChange={(e) => setQuestionDraft(e.target.value)}
              placeholder="Speak or type a question for your next visit..."
              className="flex-1 min-h-[48px] px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() =>
                startVoiceDictation(
                  langCode,
                  (txt) => setQuestionDraft(txt),
                  onToast
                )
              }
              className="min-h-[48px] min-w-[48px] rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-600 border border-blue-200 dark:border-slate-700 flex items-center justify-center"
              title="Dictate question with voice"
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (!questionDraft.trim()) return;
                onAddQuestion(questionDraft.trim());
                setQuestionDraft("");
              }}
              className="min-h-[48px] px-4 rounded-2xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>{t.sections.addQuestion}</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {questions.map((q) => (
              <div
                key={q.id}
                onClick={() => onToggleQuestionAsked(q.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onToggleQuestionAsked(q.id);
                }}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 flex items-start justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-start gap-2.5">
                  <CheckCircle2
                    className={`w-5 h-5 mt-0.5 shrink-0 ${
                      q.asked ? "text-emerald-600" : "text-slate-400"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        q.asked
                          ? "line-through text-slate-400"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {q.question}
                    </p>
                    <span className="text-[11px] text-slate-400">
                      {q.createdAt}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSpeak(q.question);
                  }}
                  className="min-h-[38px] min-w-[38px] rounded-xl bg-white dark:bg-slate-700 text-blue-600 flex items-center justify-center shrink-0"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   5. EMERGENCY SOS & HIGH-CONTRAST SHAREABLE CARD
========================================================= */
export const EmergencySOSView: React.FC<{
  member: FamilyMemberProfile;
  medicines: MedicineItem[];
  t: TranslationDictionary;
  onSpeak: (text: string) => void;
  onToast: (msg: string) => void;
}> = ({ member, medicines, t, onSpeak, onToast }) => {
  const [highContrastFull, setHighContrastFull] = useState(false);
  const memberMeds = medicines.filter((m) => m.memberId === member.id);

  const speakEmergencyCard = () => {
    onSpeak(
      `Emergency Medical Card for ${member.name}, Age ${member.age}. Blood group ${
        member.bloodGroup
      }. Conditions: ${member.conditions.join(", ")}. Allergies: ${
        member.allergies.join(", ") || "None"
      }. Emergency contact ${member.contacts.caregiverName}, ${
        member.contacts.emergencyContact
      }.`
    );
  };

  return (
    <div className="space-y-6">
      {/* One-Tap SOS Call Button */}
      <div className="rounded-[28px] bg-gradient-to-r from-rose-600 to-red-600 text-white p-6 sm:p-8 shadow-xl shadow-rose-600/25 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
            <AlertOctagon className="w-4 h-4" />
            <span>24/7 Emergency Medical ID</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            {t.sections.emergencyTitle}
          </h1>
          <p className="text-sm text-rose-100">
            Immediate one-tap call to caregiver ({member.contacts.caregiverName}) and spoken medical summary for paramedics.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <a
            href={`tel:${member.contacts.emergencyContact}`}
            onClick={() =>
              onSpeak(
                `Calling emergency contact ${member.contacts.caregiverName}`
              )
            }
            className="w-full sm:w-auto min-h-[64px] px-8 py-4 rounded-2xl bg-white text-rose-700 font-extrabold text-base sm:text-lg shadow-lg flex items-center justify-center gap-3 hover:bg-rose-50 transition"
          >
            <PhoneCall className="w-6 h-6 animate-bounce" />
            <span>{t.sections.sosButton}</span>
          </a>
        </div>
      </div>

      {/* High-Contrast Shareable Emergency Card */}
      <div
        className={`rounded-[28px] border-4 transition p-6 sm:p-8 space-y-6 ${
          highContrastFull
            ? "fixed inset-4 z-50 overflow-y-auto bg-slate-950 text-white border-yellow-400 shadow-2xl"
            : "bg-white/95 dark:bg-slate-900 border-slate-900 dark:border-yellow-400/80 text-slate-900 dark:text-white shadow-lg"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-slate-200 dark:border-slate-700">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-lg bg-rose-600 text-white">
              EMERGENCY MEDICAL ID CARD
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold mt-2">
              {member.name} ({member.age} yrs)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={speakEmergencyCard}
              className="min-h-[48px] px-4 py-2 rounded-2xl bg-blue-600 text-white font-bold text-sm flex items-center gap-2"
            >
              <Volume2 className="w-5 h-5" />
              <span>{t.common.listen}</span>
            </button>
            <button
              type="button"
              onClick={() => setHighContrastFull((p) => !p)}
              className="min-h-[48px] px-4 py-2 rounded-2xl bg-yellow-400 text-slate-950 font-extrabold text-sm flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>
                {highContrastFull ? "Exit Fullscreen" : t.sections.shareEmergencyCard}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border-2 border-rose-300 dark:border-rose-800">
            <div className="text-xs font-bold text-rose-700 dark:text-rose-300">
              {t.sections.bloodGroup} & Allergies
            </div>
            <div className="text-3xl font-extrabold text-rose-700 dark:text-rose-300 mt-1">
              {member.bloodGroup}
            </div>
            <div className="text-sm font-bold text-rose-900 dark:text-rose-200 mt-2">
              ⚠️ Allergies:{" "}
              {member.allergies.length > 0
                ? member.allergies.join(", ")
                : "None Known"}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-slate-800 border-2 border-blue-300 dark:border-slate-700">
            <div className="text-xs font-bold text-blue-700 dark:text-blue-300">
              Medical Conditions
            </div>
            <div className="text-lg font-extrabold mt-1">
              {member.conditions
                .map((c) => t.conditions[c] || c)
                .join(", ") || "None"}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-800">
            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Emergency Contacts
            </div>
            <div className="text-base font-extrabold mt-1">
              {member.contacts.caregiverName}
            </div>
            <div className="text-sm font-bold tabular-nums">
              {member.contacts.caregiverPhone}
            </div>
            <div className="text-xs mt-1 opacity-80">
              Doctor: {member.contacts.doctorName} ({member.contacts.doctorPhone})
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-extrabold mb-3">
            Current Prescription Medicines ({memberMeds.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {memberMeds.map((med) => (
              <div
                key={med.id}
                className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center gap-3"
              >
                <VisualPillSVG
                  shape={med.shape}
                  color={med.color}
                  secondaryColor={med.secondaryColor}
                  size="sm"
                  highContrast={true}
                />
                <div>
                  <div className="text-base font-extrabold">{med.name}</div>
                  <div className="text-xs font-bold opacity-80">
                    {med.strength} · {med.doseAmount}{" "}
                    {med.shape === "syrup" ? "ml" : "pill"} (
                    {med.timesOfDay.join(", ")})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   6. SETTINGS & IMPACT VIEW
========================================================= */
export const SettingsAndImpactView: React.FC<{
  mode: "settings" | "impact";
  member: FamilyMemberProfile;
  medicines: MedicineItem[];
  currentLang: LanguageCode;
  darkMode: boolean;
  t: TranslationDictionary;
  onSelectLang: (lang: LanguageCode) => void;
  onToggleDark: () => void;
  onUpdateMember: (updated: FamilyMemberProfile) => void;
  onOpenOnboarding: () => void;
  onResetDemoData: () => void;
  onSpeak: (text: string) => void;
  onToast: (msg: string) => void;
}> = ({
  mode,
  member,
  medicines,
  currentLang,
  darkMode,
  t,
  onSelectLang,
  onToggleDark,
  onUpdateMember,
  onOpenOnboarding,
  onResetDemoData,
  onSpeak,
  onToast,
}) => {
  const requestBrowserNotifications = async () => {
    if (!("Notification" in window)) {
      onToast("Browser notifications are not supported on this device.");
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      new Notification("Maatra Voice Reminders Enabled", {
        body: t.common.backgroundAlarmNote,
      });
      onToast("Notification permission granted!");
    } else {
      onToast(t.common.backgroundAlarmNote);
    }
  };

  if (mode === "impact") {
    return (
      <div className="space-y-6">
        <div className="rounded-[24px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/70 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {t.sections.impactTitle}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
              Celebrating safe, language-free prescription adherence
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              onSpeak(
                `${t.sections.impactTitle}. ${member.streakDays} ${t.sections.daysStreak}. 94% on-time adherence.`
              )
            }
            className="min-h-[48px] px-4 py-2 rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-semibold text-sm flex items-center gap-2"
          >
            <Volume2 className="w-5 h-5" />
            <span>{t.common.listen}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-[24px] bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white p-6 shadow-lg space-y-2">
            <Award className="w-8 h-8" />
            <div className="text-4xl font-extrabold tabular-nums">
              {member.streakDays} {t.sections.daysStreak}
            </div>
            <p className="text-xs text-blue-100">{t.sections.currentStreak}</p>
          </div>

          <div className="rounded-[24px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/70 dark:border-slate-800 p-6 shadow-sm space-y-2">
            <div className="text-xs font-bold text-emerald-600">
              {t.sections.dosesTakenTotal}
            </div>
            <div className="text-4xl font-extrabold tabular-nums text-slate-900 dark:text-white">
              142
            </div>
            <p className="text-xs text-slate-500">
              Zero English packaging mistakes or double-doses
            </p>
          </div>

          <div className="rounded-[24px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/70 dark:border-slate-800 p-6 shadow-sm space-y-2">
            <div className="text-xs font-bold text-blue-600">
              Doctor Summary Report
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Print or save a clean adherence & vitals report for {member.contacts.doctorName}.
            </p>
            <button
              type="button"
              onClick={() => window.print()}
              className="mt-2 min-h-[46px] px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>{t.sections.exportReport}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/70 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {t.nav.settings} & My Health Profile
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.common.backgroundAlarmNote}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenOnboarding}
              className="min-h-[48px] px-4 py-2 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Full 7-Step Health Profile</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-[48px] px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>{t.sections.exportReport}</span>
            </button>
          </div>
        </div>

        {/* Language Selection */}
        <div>
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2.5">
            Language / भाषा / ಭಾಷೆ / மொழி / భాష
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {LANGUAGE_LIST.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => onSelectLang(l.code)}
                className={`min-h-[54px] p-3 rounded-2xl border-2 text-left transition ${
                  currentLang === l.code
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-200 font-bold"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                }`}
              >
                <div className="text-base font-bold">{l.nativeName}</div>
                <div className="text-[11px] text-slate-500">{l.englishName}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Accessibility & Dark Mode Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={onToggleDark}
            className="min-h-[54px] px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-sm font-bold"
          >
            <span className="flex items-center gap-2">
              {darkMode ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span>Dark Mode (Navy Glass)</span>
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400">
              {darkMode ? "ON" : "OFF"}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              onUpdateMember({
                ...member,
                needs: { ...member.needs, largeText: !member.needs.largeText },
              })
            }
            className="min-h-[54px] px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-sm font-bold"
          >
            <span>{t.onboarding.largeText}</span>
            <span className="text-xs text-blue-600">
              {member.needs.largeText ? "ON" : "OFF"}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              onUpdateMember({
                ...member,
                needs: { ...member.needs, slowVoice: !member.needs.slowVoice },
              })
            }
            className="min-h-[54px] px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-sm font-bold"
          >
            <span>{t.onboarding.slowVoice}</span>
            <span className="text-xs text-blue-600">
              {member.needs.slowVoice ? "0.85x" : "1.0x"}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              onUpdateMember({
                ...member,
                needs: {
                  ...member.needs,
                  poorEyesight: !member.needs.poorEyesight,
                },
              })
            }
            className="min-h-[54px] px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-sm font-bold"
          >
            <span>{t.onboarding.poorEyesight}</span>
            <span className="text-xs text-blue-600">
              {member.needs.poorEyesight ? "ON" : "OFF"}
            </span>
          </button>

          <button
            type="button"
            onClick={requestBrowserNotifications}
            className="min-h-[54px] px-4 py-3 rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-950/50 flex items-center justify-between text-sm font-bold text-blue-700 dark:text-blue-300"
          >
            <span className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span>Enable Browser Dose Notifications</span>
            </span>
            <span className="text-xs underline">Allow</span>
          </button>

          <button
            type="button"
            onClick={onResetDemoData}
            className="min-h-[54px] px-4 py-3 rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/40 flex items-center justify-between text-sm font-bold text-rose-700 dark:text-rose-300"
          >
            <span className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              <span>{t.common.resetSwitchProfile}</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
