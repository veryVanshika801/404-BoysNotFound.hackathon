/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, Suspense, lazy } from "react";
import {
  Search,
  Bell,
  Menu,
  Volume2,
  CalendarCheck,
  ScanLine,
  Users,
  Pill,
  Activity,
  History,
  Sparkles,
  Calendar,
  AlertOctagon,
  Settings,
  Award,
  Sun,
  Moon,
  Check,
  RotateCcw,
  AlertTriangle,
  BellRing,
  Globe,
  ChevronRight,
  UserCheck,
  LogOut,
  X,
} from "lucide-react";
import {
  LanguageCode,
  LANGUAGE_LIST,
  translations,
} from "./i18n";
import {
  FamilyMemberProfile,
  MedicineItem,
  MemberVitals,
  VitalLogEntry,
  HistoryTimelineItem,
  DoctorAppointment,
  DoctorQuestion,
  TimeOfDaySlot,
} from "./types/maatra";
import {
  SEED_MEMBERS,
  SEED_MEDICINES,
  SEED_VITALS,
  SEED_HISTORY,
  SEED_APPOINTMENTS,
  SEED_QUESTIONS,
} from "./data/seedData";
import { speakText } from "./utils/speech";
import {
  VisualPillSVG,
  VisualDoseIcons,
  FoodTimingBadge,
} from "./components/VisualPillSVG";
import { HumanBodyHero } from "./components/HumanBodyHero";
import {
  PWAInstallButton,
  OfflineIndicator,
} from "./components/PWAInstallBanner";
import { LoginPage, LoginCredentials } from "./components/LoginPage";

// Lazy-load secondary views and heavy modals so initial load is ultra-fast
const OnboardingWizard = lazy(() =>
  import("./components/OnboardingWizard").then((m) => ({
    default: m.OnboardingWizard,
  }))
);
const ScanPrescriptionView = lazy(() =>
  import("./components/ScanPrescriptionView").then((m) => ({
    default: m.ScanPrescriptionView,
  }))
);
const FullScreenReminderModal = lazy(() =>
  import("./components/FullScreenReminderModal").then((m) => ({
    default: m.FullScreenReminderModal,
  }))
);
const VitalsView = lazy(() =>
  import("./components/VitalsView").then((m) => ({ default: m.VitalsView }))
);
const FamilyView = lazy(() =>
  import("./components/SecondaryScreens").then((m) => ({
    default: m.FamilyView,
  }))
);
const CabinetView = lazy(() =>
  import("./components/SecondaryScreens").then((m) => ({
    default: m.CabinetView,
  }))
);
const HistoryView = lazy(() =>
  import("./components/SecondaryScreens").then((m) => ({
    default: m.HistoryView,
  }))
);
const HealthTipsAndAppointmentsView = lazy(() =>
  import("./components/SecondaryScreens").then((m) => ({
    default: m.HealthTipsAndAppointmentsView,
  }))
);
const EmergencySOSView = lazy(() =>
  import("./components/SecondaryScreens").then((m) => ({
    default: m.EmergencySOSView,
  }))
);
const SettingsAndImpactView = lazy(() =>
  import("./components/SecondaryScreens").then((m) => ({
    default: m.SettingsAndImpactView,
  }))
);

// Fast native SVG sparkline for initial Today dashboard (avoids loading Recharts on boot)
const MiniSparkline: React.FC<{ data: VitalLogEntry[]; color: string }> = ({
  data,
  color,
}) => {
  if (!data || data.length === 0) return <div className="w-24 h-8" />;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 96;
  const height = 32;
  const points = values
    .map((val, idx) => {
      const x =
        values.length === 1 ? width / 2 : (idx / (values.length - 1)) * width;
      const y = height - 4 - ((val - min) / range) * (height - 8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="w-24 h-8 overflow-visible"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

type NavSection =
  | "today"
  | "scan"
  | "family"
  | "cabinet"
  | "vitals"
  | "history"
  | "tips"
  | "appointments"
  | "emergency"
  | "settings"
  | "impact";

const STORAGE_KEYS = {
  LANG: "maatra_lang_v1",
  DARK: "maatra_dark_v1",
  MEMBERS: "maatra_members_v2",
  ACTIVE_MEMBER: "maatra_active_member_v2",
  MEDICINES: "maatra_medicines_v1",
   VITALS: "maatra_vitals_v1",
  HISTORY: "maatra_history_v1",
  QUESTIONS: "maatra_questions_v1",
  AUTH: "maatra_logged_in_v1",
};

export default function App() {
  // Language & Theme
  const [lang, setLang] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANG) as LanguageCode;
    return saved && translations[saved] ? saved : "en";
  });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.DARK) === "true";
  });

  // Core Profiles & Health State (Pre-seeded with Grandfather & Child so every screen is full on first run)
  const [members, setMembers] = useState<FamilyMemberProfile[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      return raw ? JSON.parse(raw) : SEED_MEMBERS;
    } catch {
      return SEED_MEMBERS;
    }
  });
  const [activeMemberId, setActiveMemberId] = useState<string>(() => {
    return (
      localStorage.getItem(STORAGE_KEYS.ACTIVE_MEMBER) || SEED_MEMBERS[0].id
    );
  });
  const [medicines, setMedicines] = useState<MedicineItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.MEDICINES);
      return raw ? JSON.parse(raw) : SEED_MEDICINES;
    } catch {
      return SEED_MEDICINES;
    }
  });
  const [vitalsMap, setVitalsMap] = useState<Record<string, MemberVitals>>(
    () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.VITALS);
        return raw ? JSON.parse(raw) : SEED_VITALS;
      } catch {
        return SEED_VITALS;
      }
    }
  );
  const [historyList, setHistoryList] = useState<HistoryTimelineItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return raw ? JSON.parse(raw) : SEED_HISTORY;
    } catch {
      return SEED_HISTORY;
    }
  });
  const [appointments] = useState<DoctorAppointment[]>(SEED_APPOINTMENTS);
  const [questions, setQuestions] = useState<DoctorQuestion[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      return raw ? JSON.parse(raw) : SEED_QUESTIONS;
    } catch {
      return SEED_QUESTIONS;
    }
  });

  // Navigation & Modals
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === "true";
  });
  const [activeNav, setActiveNav] = useState<NavSection>("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Full-Screen Reminder & Double-Dose Guard State
  const [activeReminder, setActiveReminder] = useState<{
    medicine: MedicineItem;
    slot: TimeOfDaySlot;
    snoozeCount: number;
    caregiverAlerted: boolean;
  } | null>(null);

  const [doubleDosePrompt, setDoubleDosePrompt] = useState<{
    medicine: MedicineItem;
    slot: TimeOfDaySlot;
  } | null>(null);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DARK, String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_MEMBER, activeMemberId);
  }, [activeMemberId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VITALS, JSON.stringify(vitalsMap));
  }, [vitalsMap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(historyList));
  }, [historyList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  }, [questions]);

  const t = translations[lang] || translations.en;

  const activeMember = useMemo(
    () => members.find((m) => m.id === activeMemberId) || members[0],
    [members, activeMemberId]
  );

  const activeVitals = useMemo(
    () => vitalsMap[activeMember.id] || SEED_VITALS["member-grandfather"],
    [vitalsMap, activeMember.id]
  );

  const memberMedicines = useMemo(() => {
    return medicines.filter((m) => {
      if (m.memberId !== activeMember.id) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.conditionTag.toLowerCase().includes(q) ||
        m.strength.toLowerCase().includes(q)
      );
    });
  }, [medicines, activeMember.id, searchQuery]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const handleSpeak = (text: string) => {
    if (!activeMember.needs.voiceEnabled) {
      showToast(`🔇 Voice muted: "${text}"`);
      return;
    }
    speakText(text, lang, activeMember.needs.slowVoice, showToast);
  };

  // Detect look-alike pills in the active member's routine (same shape & colour)
  const hasLookAlikeInRoutine = (med: MedicineItem): MedicineItem | undefined => {
    return memberMedicines.find(
      (other) =>
        other.id !== med.id &&
        other.shape === med.shape &&
        other.color.toLowerCase() === med.color.toLowerCase()
    );
  };

  // Today's Adherence Calculation for Donut Chart
  const adherenceStats = useMemo(() => {
    let totalSlots = 0;
    let takenSlots = 0;
    memberMedicines.forEach((m) => {
      m.timesOfDay.forEach((slot) => {
        totalSlots += 1;
        if (m.takenToday[slot]) takenSlots += 1;
      });
    });
    const pct =
      totalSlots === 0 ? 100 : Math.round((takenSlots / totalSlots) * 100);
    return {
      pct,
      takenSlots,
      totalSlots,
      remaining: Math.max(0, totalSlots - takenSlots),
    };
  }, [memberMedicines]);

  // Double-Dose Guard + Mark Taken / Undo Handler
  const handleToggleDose = (
    med: MedicineItem,
    slot: TimeOfDaySlot,
    forceConfirm = false
  ) => {
    const alreadyTakenIso = med.takenToday[slot];

    // If already taken in this slot, clicking "Undo" reverts it
    if (alreadyTakenIso && !forceConfirm) {
      setMedicines((prev) =>
        prev.map((m) =>
          m.id === med.id
            ? {
                ...m,
                stockCount: m.stockCount + 1,
                takenToday: { ...m.takenToday, [slot]: null },
              }
            : m
        )
      );
      showToast(`${t.common.undo}: ${med.name}`);
      return;
    }

    // Double-Dose Guard: check if ANY slot of this medicine was taken within the last 2 hours
    if (!forceConfirm) {
      const timestamps = Object.values(med.takenToday).filter(
        Boolean
      ) as string[];
      const twoHoursMs = 2 * 60 * 60 * 1000;
      const recentTaken = timestamps.some(
        (iso) => Date.now() - new Date(iso).getTime() < twoHoursMs
      );
      if (recentTaken) {
        setDoubleDosePrompt({ medicine: med, slot });
        handleSpeak(t.greetings.doubleDoseGuardMsg);
        return;
      }
    }

    const nowIso = new Date().toISOString();
    setMedicines((prev) =>
      prev.map((m) =>
        m.id === med.id
          ? {
              ...m,
              stockCount: Math.max(0, m.stockCount - 1),
              takenToday: { ...m.takenToday, [slot]: nowIso },
            }
          : m
      )
    );

    const newHist: HistoryTimelineItem = {
      id: `hist-${Date.now()}`,
      memberId: activeMember.id,
      medicineId: med.id,
      medicineName: `${med.name} ${med.strength}`,
      dateLabel: "Today",
      timeLabel: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      slot,
      status: "taken",
      detail: `${med.doseAmount} ${
        med.shape === "syrup" ? "ml" : "pill"
      } — Marked taken (${slot})`,
    };
    setHistoryList((prev) => [newHist, ...prev]);
    handleSpeak(`${med.name} — ${t.common.taken}`);
    setDoubleDosePrompt(null);
  };

  // Trigger Instant Demo Reminder
  const triggerTestReminder = (customMed?: MedicineItem, slot: TimeOfDaySlot = "morning") => {
    const targetMed = customMed || memberMedicines[0] || medicines[0];
    if (!targetMed) return;
    setActiveReminder({
      medicine: targetMed,
      slot,
      snoozeCount: 0,
      caregiverAlerted: false,
    });
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`${t.reminderModal.timeToTake}: ${targetMed.name}`, {
        body: `${activeMember.name} — ${targetMed.doseAmount} ${targetMed.strength}`,
      });
    }
  };

  const handleSnoozeReminder = () => {
    if (!activeReminder) return;
    const nextSnoozeCount = activeReminder.snoozeCount + 1;
    const caregiverAlerted = nextSnoozeCount >= 1;
    setActiveReminder({
      ...activeReminder,
      snoozeCount: nextSnoozeCount,
      caregiverAlerted,
    });

    const snoozeHist: HistoryTimelineItem = {
      id: `hist-snooze-${Date.now()}`,
      memberId: activeMember.id,
      medicineId: activeReminder.medicine.id,
      medicineName: `${activeReminder.medicine.name} ${activeReminder.medicine.strength}`,
      dateLabel: "Today",
      timeLabel: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      slot: activeReminder.slot,
      status: "snoozed",
      detail: caregiverAlerted
        ? `Snoozed 10m — Caregiver (${activeMember.contacts.caregiverName}) alerted`
        : "Snoozed for 10 minutes",
    };
    setHistoryList((prev) => [snoozeHist, ...prev]);
    handleSpeak(
      `${t.reminderModal.remind10Min}. ${t.reminderModal.caregiverAlerted}`
    );
  };

  const handleSaveOnboardingProfile = (updatedProfile: FamilyMemberProfile) => {
    setMembers((prev) => {
      const exists = prev.some((m) => m.id === updatedProfile.id);
      if (exists) {
        return prev.map((m) =>
          m.id === updatedProfile.id ? updatedProfile : m
        );
      }
      return [updatedProfile, ...prev];
    });
    setActiveMemberId(updatedProfile.id);
    setShowOnboarding(false);
    showToast(`✓ Profile saved for ${updatedProfile.name}`);
  };

  const handleResetDemoData = () => {
    localStorage.clear();
    setMembers(SEED_MEMBERS);
    setActiveMemberId(SEED_MEMBERS[0].id);
    setMedicines(SEED_MEDICINES);
    setVitalsMap(SEED_VITALS);
    setHistoryList(SEED_HISTORY);
    setQuestions(SEED_QUESTIONS);
    setIsLoggedIn(false);
  };

  const handleLoginSuccess = (creds: LoginCredentials) => {
    const targetMemberId = activeMemberId || SEED_MEMBERS[0].id;

    setMembers((prev) =>
      prev.map((m, idx) =>
        m.id === targetMemberId || idx === 0
          ? {
              ...m,
              name: creds.name,
              gender: creds.gender,
              password: creds.password,
              avatarPhoto: creds.avatarPhoto,
              bloodGroup: creds.bloodGroup,
              conditions: creds.conditions,
            }
          : m
      )
    );

    if (creds.medicines && creds.medicines.length > 0) {
      const addedMeds: MedicineItem[] = creds.medicines.map((entry, idx) => ({
        id: `login-med-${Date.now()}-${idx}`,
        memberId: targetMemberId,
        name: entry.name,
        strength: entry.strength || "500 mg",
        form:
          entry.shape === "syrup"
            ? "syrup"
            : entry.shape === "capsule"
            ? "capsule"
            : "tablet",
        color: entry.color || "#3B82F6",
        secondaryColor: "#FACC15",
        shape: entry.shape,
        doseAmount: entry.doseAmount || 1,
        timesOfDay: entry.timesOfDay,
        foodTiming: "after_food",
        durationDays: 30,
        stockCount: 30,
        expiryDate: "2027-08",
        conditionTag: creds.conditions[0] || "General",
        takenToday: {
          morning: null,
          afternoon: null,
          night: null,
        },
      }));

      setMedicines((prev) => {
        const existingNames = new Set(
          prev
            .filter((p) => p.memberId === targetMemberId)
            .map((p) => p.name.toLowerCase())
        );
        const uniqueNew = addedMeds.filter(
          (nm) => !existingNames.has(nm.name.toLowerCase())
        );
        return [...uniqueNew, ...prev];
      });
    }

    localStorage.setItem(STORAGE_KEYS.AUTH, "true");
    setIsLoggedIn(true);
    showToast(
      `${
        creds.authMode === "register" ? "Registered" : "Welcome"
      }, ${creds.name} (${creds.bloodGroup})!`
    );
    handleSpeak(`${t.greetings.morning}, ${creds.name}`);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    setIsLoggedIn(false);
  };

  // Left Sidebar Menu Items (Veridia style)
  const sidebarItems: {
    id: NavSection;
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: "today", label: t.nav.today, icon: CalendarCheck },
    { id: "scan", label: t.nav.scan, icon: ScanLine },
    { id: "family", label: t.nav.family, icon: Users },
    { id: "cabinet", label: t.nav.cabinet, icon: Pill },
    { id: "vitals", label: t.nav.vitals, icon: Activity },
    { id: "history", label: t.nav.history, icon: History },
    { id: "tips", label: t.nav.tips, icon: Sparkles },
    { id: "appointments", label: t.nav.appointments, icon: Calendar },
    { id: "emergency", label: t.nav.emergency, icon: AlertOctagon },
    { id: "impact", label: t.nav.impact, icon: Award },
    { id: "settings", label: t.nav.settings, icon: Settings },
  ];

  // Top Pill Tab Navigation Items (Desktop Veridia Top Bar)
  const topPillTabs: { id: NavSection; label: string }[] = [
    { id: "today", label: t.nav.today },
    { id: "scan", label: t.nav.scan },
    { id: "vitals", label: t.nav.vitals },
    { id: "family", label: t.nav.family },
    { id: "cabinet", label: t.nav.cabinet },
    { id: "emergency", label: t.nav.emergency },
  ];

  const donutData = [
    { name: "Taken", value: adherenceStats.takenSlots || 1 },
    { name: "Remaining", value: adherenceStats.remaining },
  ];

  if (!isLoggedIn) {
    return (
      <>
        {toastMessage && (
          <div className="fixed top-6 right-4 z-50 max-w-md rounded-2xl bg-slate-900/95 text-white px-4 py-3 shadow-xl border border-white/20 flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold">
            <span>{toastMessage}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <LoginPage
          lang={lang}
          onSelectLang={setLang}
          t={t}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode((d) => !d)}
          initialName={activeMember.name}
          initialGender={activeMember.gender}
          initialPhoto={activeMember.avatarPhoto}
          initialBloodGroup={activeMember.bloodGroup}
          initialConditions={activeMember.conditions}
          onLoginSuccess={handleLoginSuccess}
          onToast={showToast}
        />
      </>
    );
  }

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 ${
        activeMember.needs.largeText ? "maatra-large-text" : ""
      } bg-gradient-to-br from-[#DCEAFE] via-[#EAE8FF] to-[#F5F8FF] dark:from-[#0F172A] dark:via-[#142038] dark:to-[#1B2635] text-slate-800 dark:text-slate-100 pb-24 lg:pb-10`}
    >
      {/* Ambient Background Blurred Glows matching Veridia */}
      <div className="pointer-events-none fixed top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-300/25 dark:bg-blue-600/10 blur-[130px]" />
      <div className="pointer-events-none fixed bottom-0 right-1/4 w-[480px] h-[480px] rounded-full bg-purple-300/25 dark:bg-purple-600/10 blur-[130px]" />

      {/* Offline Banner */}
      <OfflineIndicator message={t.common.offlineBanner} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-md rounded-2xl bg-slate-900/95 dark:bg-blue-950/95 text-white px-4 py-3 shadow-xl border border-white/20 flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold">
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Outer Glass Frame matching Veridia Health Suite */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-3 sm:px-6 pt-3 sm:pt-5">
        <div className="rounded-[28px] sm:rounded-[34px] bg-white/45 dark:bg-slate-900/50 backdrop-blur-2xl border border-white/75 dark:border-white/10 shadow-[0_24px_70px_-15px_rgba(37,99,235,0.14)] p-3 sm:p-6">
          {/* =========================================================
              VERIDIA TOP NAVIGATION BAR
          ========================================================= */}
          <header className="flex flex-wrap items-center justify-between gap-3 pb-4 sm:pb-6">
            {/* Brand Logo (Veridia style medical emblem + title + subtitle) */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveNav("today")}
                className="flex items-center gap-2.5 text-left group"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#8B5CF6] text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                  <Pill className="w-5 h-5 -rotate-45" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] dark:from-blue-300 dark:to-indigo-300 bg-clip-text text-transparent leading-none">
                    {t.appTitle}
                  </div>
                  <div className="text-[10px] font-bold tracking-[0.2em] text-slate-400 dark:text-slate-400 mt-0.5">
                    {t.appSubtitle}
                  </div>
                </div>
              </button>
            </div>

            {/* Center: Raised White Pill Tab Navigation with Blue Underline (Desktop) */}
            <nav
              aria-label="Primary Navigation"
              className="hidden xl:flex items-center gap-1.5 p-1.5 rounded-full bg-white/50 dark:bg-slate-800/60 backdrop-blur-md border border-white/70 dark:border-slate-700/70"
            >
              {topPillTabs.map((tab) => {
                const isActive = activeNav === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveNav(tab.id)}
                    className={`relative min-h-[42px] px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0.5 left-4 right-4 h-[3px] rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: Search Pill, Language Switcher, Test Reminder, Notification Bell, Dark Mode, Hamburger */}
            <div className="flex items-center gap-2">
              {/* Search Pill with Magnifier */}
              <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 border border-white/80 dark:border-slate-700 shadow-sm w-48 lg:w-56">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.common.searchPlaceholder}
                  className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Instant Language Switcher Pill */}
              <div className="relative flex items-center bg-white/85 dark:bg-slate-800/85 border border-white/80 dark:border-slate-700 rounded-full px-2.5 py-1.5 shadow-sm">
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-1 shrink-0" />
                <select
                  aria-label="Select Language"
                  value={lang}
                  onChange={(e) => {
                    const nextLang = e.target.value as LanguageCode;
                    setLang(nextLang);
                    const found = LANGUAGE_LIST.find((l) => l.code === nextLang);
                    if (found) {
                      speakText(
                        found.sampleGreeting,
                        nextLang,
                        activeMember.needs.slowVoice,
                        showToast
                      );
                    }
                  }}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer pr-1"
                >
                  {LANGUAGE_LIST.map((l) => (
                    <option
                      key={l.code}
                      value={l.code}
                      className="text-slate-900 bg-white"
                    >
                      {l.nativeName}
                    </option>
                  ))}
                </select>
              </div>

              {/* PWA Install Button */}
              <div className="hidden sm:block">
                <PWAInstallButton label={t.common.installApp} />
              </div>

              {/* Notification Bell with Red Count Badge (Triggers Test Voice Reminder) */}
              <button
                type="button"
                onClick={() => triggerTestReminder()}
                title={t.common.testReminder}
                className="relative min-h-[44px] min-w-[44px] rounded-full bg-white/85 dark:bg-slate-800/85 border border-white/80 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-105 transition"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
                  {adherenceStats.remaining || 2}
                </span>
              </button>

              {/* Dark Mode Toggle */}
              <button
                type="button"
                onClick={() => setDarkMode((d) => !d)}
                aria-label="Toggle Dark Mode"
                className="min-h-[44px] min-w-[44px] rounded-full bg-white/85 dark:bg-slate-800/85 border border-white/80 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-105 transition"
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>

              {/* Hamburger Menu Icon */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label="Open All Sections Menu"
                className="min-h-[44px] min-w-[44px] rounded-full bg-white/85 dark:bg-slate-800/85 border border-white/80 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-200"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Hamburger Drawer / Quick Section Switcher for Mobile & Tablet */}
          {mobileMenuOpen && (
            <div className="mb-4 p-4 rounded-[24px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/80 dark:border-slate-700 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  All Maatra Health Suite Modules
                </span>
                <button
                  type="button"
                  onClick={() => setShowOnboarding(true)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                >
                  {t.common.onboardingBtn}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveNav(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`min-h-[48px] px-3 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
                        activeNav === item.id
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* =========================================================
              VERIDIA 12-COLUMN GLASS WORKSPACE
              Left Frosted Profile & Menu (3 cols) + Main Content Area (9 cols)
          ========================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* LEFT FROSTED SIDEBAR (Light frosted panel in light mode, navy glass in dark mode) */}
            <aside className="lg:col-span-3 space-y-5">
              {/* Left Top Card: Profile Card (Round Avatar with Glowing Blue Ring, ID, Gender/Age Chips, Green Active Pill + Menu List) */}
              <div className="rounded-[26px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_12px_36px_-8px_rgba(37,99,235,0.08)] p-5 space-y-5">
                {/* Profile Header */}
                <div className="flex items-center gap-3.5">
                  <div className="relative w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-[#8B5CF6] to-[#3B82F6] shadow-[0_0_20px_rgba(59,130,246,0.45)] shrink-0 overflow-hidden">
                    {activeMember.avatarPhoto ? (
                      <img
                        src={activeMember.avatarPhoto}
                        alt={activeMember.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full rounded-full object-cover bg-white dark:bg-slate-900"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-xl font-extrabold text-blue-600 dark:text-blue-400">
                        {activeMember.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate">
                      {activeMember.name}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      {activeMember.patientId}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      <span>
                        {activeMember.gender === "female" ? t.onboarding.female : t.onboarding.male}
                      </span>
                      <span>·</span>
                      <span className="tabular-nums">{activeMember.age} yrs</span>
                      <span>·</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                        {activeMember.bloodGroup}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                        <Check className="w-3 h-3" /> {t.common.active}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vertical Menu List with Selected Item Outlined in Blue */}
                <div className="space-y-1.5 pt-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const selected = activeNav === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveNav(item.id)}
                        className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-2xl text-left text-xs sm:text-sm font-bold flex items-center justify-between transition ${
                          selected
                            ? "border-2 border-blue-500/80 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                            : "border border-transparent text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              selected
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-slate-400"
                            }`}
                          />
                          <span>{item.label}</span>
                        </span>
                        {selected && (
                          <ChevronRight className="w-4 h-4 text-blue-500" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Onboarding & Switch Profile Action */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowOnboarding(true)}
                    className="w-full min-h-[46px] px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 hover:opacity-95 transition"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{t.common.onboardingBtn} (Voice)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-200/70 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Switch Account / Login Page</span>
                  </button>
                </div>
              </div>

              {/* Left Bottom Card (Veridia "AI Diagnostic Summary" style): Today's Adherence Donut & Summary */}
              <div className="rounded-[26px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_12px_36px_-8px_rgba(37,99,235,0.08)] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {t.greetings.adherenceToday}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[11px] font-bold">
                    {t.common.new}
                  </span>
                </div>

                {/* Adherence Donut Chart (Fast Native SVG) */}
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 shrink-0">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                      <circle
                        cx="48"
                        cy="48"
                        r="36"
                        fill="none"
                        stroke="#E2E8F0"
                        strokeWidth="11"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="36"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="11"
                        strokeLinecap="round"
                        strokeDasharray={`${
                          (adherenceStats.pct / 100) * 226.2
                        } 226.2`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-base font-extrabold tabular-nums text-blue-600 dark:text-blue-400">
                        {adherenceStats.pct}%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activeMember.name} has completed{" "}
                    <strong className="tabular-nums">
                      {adherenceStats.takenSlots}/{adherenceStats.totalSlots}
                    </strong>{" "}
                    scheduled doses today.
                  </p>
                </div>

                {/* Veridia-style Condition Status Rows */}
                <div className="space-y-2">
                  {activeMember.conditions.slice(0, 3).map((cond, idx) => (
                    <div
                      key={cond}
                      className="px-3 py-2 rounded-xl bg-slate-50/90 dark:bg-slate-800/80 flex items-center justify-between text-xs font-semibold"
                    >
                      <span className="text-slate-700 dark:text-slate-200 truncate">
                        {t.conditions[cond] || cond}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          idx === 0
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {idx === 0 ? t.common.good : t.common.borderline}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Play Test Reminder Instant Demo Button */}
                <button
                  type="button"
                  onClick={() => triggerTestReminder()}
                  className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition"
                >
                  <BellRing className="w-4 h-4" />
                  <span>{t.common.testReminder}</span>
                </button>
              </div>
            </aside>

            {/* MAIN CONTENT AREA (9 cols) */}
            <main className="lg:col-span-9 space-y-5">
              {/* =========================================================
                  TODAY DASHBOARD (Veridia Center Body Hero + Right Column + Visual Dose Cards)
              ========================================================= */}
              {activeNav === "today" && (
                <div className="space-y-5">
                  {/* Top Row: Center HumanBodyHero (6 cols) + Right Veridia Stack (6 cols) */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
                    {/* Center Hero: Glowing Human Body Illustration with Organ Callouts */}
                    <div className="xl:col-span-6">
                      <HumanBodyHero
                        member={activeMember}
                        vitals={activeVitals}
                        t={t}
                        onSpeak={handleSpeak}
                        onOpenScan={() => setActiveNav("scan")}
                      />
                    </div>

                    {/* Right Column matching Veridia:
                        1) Family Avatars "Stories" Thumbnail Row (selected outlined in blue)
                        2) Key Vitals & Lab Markers with Sparklines
                        3) Findings / History Timeline with coloured ring dots */}
                    <div className="xl:col-span-6 flex flex-col justify-between gap-5">
                      {/* Card 1: Family Profiles "Stories" Thumbnail Row */}
                      <div className="rounded-[24px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_12px_36px_-8px_rgba(37,99,235,0.08)] p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                            {t.greetings.familyStories}
                          </h3>
                          <button
                            type="button"
                            onClick={() => setActiveNav("family")}
                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            View all ›
                          </button>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                          {members.map((m) => {
                            const selected = m.id === activeMember.id;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  setActiveMemberId(m.id);
                                  handleSpeak(
                                    `${t.greetings.morning}, ${m.name}`
                                  );
                                }}
                                className={`p-2.5 rounded-2xl text-left transition flex flex-col items-center text-center ${
                                  selected
                                    ? "border-2 border-blue-600 bg-blue-50/70 dark:bg-blue-950/60 shadow-sm"
                                    : "border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-800/60 hover:border-blue-300"
                                }`}
                              >
                                <div
                                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-sm mb-1.5 overflow-hidden"
                                  style={{ backgroundColor: m.avatarColor }}
                                >
                                  {m.avatarPhoto ? (
                                    <img
                                      src={m.avatarPhoto}
                                      alt={m.name}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    m.name
                                      .split(" ")
                                      .map((p) => p[0])
                                      .join("")
                                      .slice(0, 2)
                                  )}
                                </div>
                                <div className="text-xs font-bold text-slate-900 dark:text-white truncate w-full">
                                  {m.name.split(" ")[0]}
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full">
                                  {m.age} yrs
                                </div>
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => setActiveNav("family")}
                            className="p-2.5 rounded-2xl border border-dashed border-blue-300 dark:border-slate-700 bg-blue-50/30 dark:bg-slate-800/40 flex flex-col items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold"
                          >
                            <span className="text-lg">+</span>
                            <span className="text-[10px]">Add</span>
                          </button>
                        </div>
                      </div>

                      {/* Card 2: Key Vitals & Lab Markers (Label + Big Value + Status Pill + Mini Sparkline) */}
                      <div className="rounded-[24px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_12px_36px_-8px_rgba(37,99,235,0.08)] p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                            {t.vitals.title}
                          </h3>
                          <button
                            type="button"
                            onClick={() => setActiveNav("vitals")}
                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Log reading ›
                          </button>
                        </div>

                        <div className="divide-y divide-slate-200/60 dark:divide-slate-800">
                          <div className="py-2.5 flex items-center justify-between gap-2">
                            <div className="min-w-[105px]">
                              <div className="text-xs font-bold text-slate-900 dark:text-white">
                                {t.vitals.bloodSugar}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Fasting Glucose
                              </div>
                            </div>
                            <div className="text-base font-extrabold tabular-nums text-slate-900 dark:text-white">
                              {activeVitals.bloodSugar}{" "}
                              <span className="text-[10px] font-normal text-slate-500">
                                mg/dL
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                              {t.common.borderline}
                            </span>
                            <div className="hidden sm:block">
                              <MiniSparkline
                                data={activeVitals.sugarHistory}
                                color="#F59E0B"
                              />
                            </div>
                          </div>

                          <div className="py-2.5 flex items-center justify-between gap-2">
                            <div className="min-w-[105px]">
                              <div className="text-xs font-bold text-slate-900 dark:text-white">
                                {t.vitals.bloodPressure}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Arterial Pressure
                              </div>
                            </div>
                            <div className="text-base font-extrabold tabular-nums text-slate-900 dark:text-white">
                              {activeVitals.bpSystolic}/{activeVitals.bpDiastolic}{" "}
                              <span className="text-[10px] font-normal text-slate-500">
                                mmHg
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                              {t.common.borderline}
                            </span>
                            <div className="hidden sm:block">
                              <MiniSparkline
                                data={activeVitals.bpHistory}
                                color="#3B82F6"
                              />
                            </div>
                          </div>

                          <div className="py-2.5 flex items-center justify-between gap-2">
                            <div className="min-w-[105px]">
                              <div className="text-xs font-bold text-slate-900 dark:text-white">
                                {t.vitals.spo2}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Oxygen Saturation
                              </div>
                            </div>
                            <div className="text-base font-extrabold tabular-nums text-slate-900 dark:text-white">
                              {activeVitals.spo2}%
                            </div>
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                              {t.common.good}
                            </span>
                            <div className="hidden sm:block">
                              <MiniSparkline
                                data={activeVitals.spo2History}
                                color="#10B981"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card 3: Findings / History Timeline (Vertical timeline with coloured ring dots) */}
                      <div className="rounded-[24px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_12px_36px_-8px_rgba(37,99,235,0.08)] p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                            {t.sections.historyTitle}
                          </h3>
                          <button
                            type="button"
                            onClick={() => setActiveNav("history")}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300"
                          >
                            Today ▾
                          </button>
                        </div>

                        <div className="relative pl-5 space-y-3 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-700">
                          {historyList.slice(0, 3).map((h, i) => {
                            const dotColors = [
                              "border-blue-600 bg-white",
                              "border-amber-500 bg-white",
                              "border-emerald-500 bg-white",
                            ];
                            return (
                              <div
                                key={h.id}
                                className="relative flex items-start gap-3 text-xs"
                              >
                                <span
                                  className={`absolute -left-[19px] top-1 w-3.5 h-3.5 rounded-full border-[3px] ${
                                    dotColors[i % dotColors.length]
                                  }`}
                                />
                                <div className="min-w-[88px] text-[11px] text-slate-400 tabular-nums pt-0.5">
                                  {h.dateLabel} · {h.timeLabel}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-slate-900 dark:text-white truncate">
                                    {h.medicineName}
                                  </div>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                    {h.detail}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* =========================================================
                      VISUAL DOSE ROUTINE CARDS GROUPED BY MORNING, AFTERNOON, NIGHT
                      Using the user's own meal times (Breakfast 08:00, Lunch 13:30, Dinner 20:30)
                  ========================================================= */}
                  <div className="rounded-[26px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_12px_36px_-8px_rgba(37,99,235,0.08)] p-5 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                          {t.greetings.morning}, {activeMember.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                          Visual Prescription Schedule — Tap speaker to hear in{" "}
                          <strong>{t.nativeName}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleSpeak(
                              `${t.greetings.morning} ${activeMember.name}. You have ${memberMedicines.length} medicines in your routine today.`
                            )
                          }
                          className="min-h-[48px] px-4 py-2 rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>{t.common.listenScreen}</span>
                        </button>
                      </div>
                    </div>

                    {(
                      [
                        {
                          slot: "morning" as TimeOfDaySlot,
                          title: t.greetings.morningDose,
                          mealTime: activeMember.lifestyle.breakfastTime || "08:00",
                          badge: "🌅 Morning / Breakfast",
                        },
                        {
                          slot: "afternoon" as TimeOfDaySlot,
                          title: t.greetings.afternoonDose,
                          mealTime: activeMember.lifestyle.lunchTime || "14:00",
                          badge: "☀️ Afternoon / Lunch",
                        },
                        {
                          slot: "night" as TimeOfDaySlot,
                          title: t.greetings.nightDose,
                          mealTime: activeMember.lifestyle.dinnerTime || "21:00",
                          badge: "🌙 Night / Dinner",
                        },
                      ] as const
                    ).map((group) => {
                      const groupMeds = memberMedicines.filter((m) =>
                        m.timesOfDay.includes(group.slot)
                      );
                      if (groupMeds.length === 0) return null;

                      return (
                        <div key={group.slot} className="space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                                {group.title}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 text-xs font-bold tabular-nums">
                                {group.mealTime}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400">
                              {group.badge}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {groupMeds.map((med) => {
                              const isTaken = Boolean(
                                med.takenToday[group.slot]
                              );
                              const lookAlikePartner =
                                hasLookAlikeInRoutine(med);
                              const isLowStock = med.stockCount <= 5;
                              const foodLabel =
                                med.foodTiming === "before_food"
                                  ? t.greetings.beforeFood
                                  : med.foodTiming === "with_food"
                                  ? t.greetings.withFood
                                  : t.greetings.afterFood;

                              const spokenInstruction = `${med.name}, ${
                                med.strength
                              }. ${
                                med.shape === "syrup"
                                  ? `${med.doseAmount} ${t.greetings.mlSpoonUnit}`
                                  : med.doseAmount === 0.5
                                  ? t.greetings.halfPillUnit
                                  : `${med.doseAmount} ${t.greetings.pillUnit}`
                              }, ${foodLabel} (${group.mealTime}).`;

                              return (
                                <div
                                  key={`${med.id}-${group.slot}`}
                                  className={`rounded-[24px] p-4 sm:p-5 border transition flex flex-col justify-between gap-4 ${
                                    isTaken
                                      ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/60"
                                      : "bg-white/95 dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700 shadow-sm"
                                  }`}
                                >
                                  <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex items-center gap-3.5">
                                        {/* Large SVG Pill (Colour + Shape) */}
                                        <VisualPillSVG
                                          shape={med.shape}
                                          color={med.color}
                                          secondaryColor={med.secondaryColor}
                                          size="lg"
                                          highContrast={
                                            activeMember.needs.poorEyesight
                                          }
                                        />
                                        <div>
                                          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                                            {med.name}
                                          </h3>
                                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                            {med.strength} ·{" "}
                                            {t.conditions[med.conditionTag] ||
                                              med.conditionTag}
                                          </p>
                                          {/* Dose Icons + Before/After Food Icon */}
                                          <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <VisualDoseIcons
                                              shape={med.shape}
                                              doseAmount={med.doseAmount}
                                              color={med.color}
                                              pillLabel={t.greetings.pillUnit}
                                              halfLabel={
                                                t.greetings.halfPillUnit
                                              }
                                              spoonLabel={
                                                t.greetings.mlSpoonUnit
                                              }
                                            />
                                            <FoodTimingBadge
                                              timing={med.foodTiming}
                                              label={foodLabel}
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      {/* Speaker Button that speaks instruction in chosen language */}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleSpeak(spokenInstruction)
                                        }
                                        title={t.common.listen}
                                        className="min-h-[48px] min-w-[48px] rounded-2xl bg-blue-50 dark:bg-slate-700 hover:bg-blue-100 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-slate-600 flex items-center justify-center shrink-0 transition"
                                      >
                                        <Volume2 className="w-5 h-5" />
                                      </button>
                                    </div>

                                    {/* Orange Look-Alike Warning & Low-Stock Warning (<= 5 doses) */}
                                    {(lookAlikePartner || isLowStock) && (
                                      <div className="flex flex-wrap gap-2">
                                        {lookAlikePartner && (
                                          <div className="w-full px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-[11px] font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                            <span>
                                              {t.common.lookAlike}: Same colour &
                                              shape as {lookAlikePartner.name}
                                            </span>
                                          </div>
                                        )}
                                        {isLowStock && (
                                          <div className="px-3 py-1.5 rounded-xl bg-orange-100 dark:bg-orange-950/80 border border-orange-300 text-[11px] font-bold text-orange-900 dark:text-orange-200">
                                            ⚠️ {t.common.lowStock}:{" "}
                                            <span className="tabular-nums">
                                              {med.stockCount}
                                            </span>{" "}
                                            {t.greetings.dosesLeft}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* Big Green Taken Button (can be undone) + Alert Test */}
                                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
                                    {isTaken ? (
                                      <div className="flex items-center justify-between w-full gap-2">
                                        <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold">
                                          <Check className="w-4 h-4" />
                                          <span>{t.common.taken}</span>
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleToggleDose(med, group.slot)
                                          }
                                          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100"
                                        >
                                          {t.common.undo}
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 w-full">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleToggleDose(med, group.slot)
                                          }
                                          className="flex-1 min-h-[50px] px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
                                        >
                                          <Check className="w-5 h-5" />
                                          <span>{t.common.taken}</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            triggerTestReminder(med, group.slot)
                                          }
                                          title="Full-Screen Voice Alert"
                                          className="min-h-[50px] px-3.5 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center"
                                        >
                                          <BellRing className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <Suspense
                fallback={
                  <div className="rounded-[26px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/80 dark:border-white/10 p-10 text-center text-sm font-bold text-slate-500">
                    Loading screen…
                  </div>
                }
              >
                {/* SCAN PRESCRIPTION & VISUAL ROUTINE BUILDER */}
                {activeNav === "scan" && (
                  <ScanPrescriptionView
                    member={activeMember}
                    t={t}
                    onSpeak={handleSpeak}
                    onAddMedicine={(newMed) => {
                      setMedicines((prev) => [newMed, ...prev]);
                      showToast(`✓ Added ${newMed.name} to routine`);
                    }}
                    onToast={showToast}
                  />
                )}

                {/* FAMILY VIEW */}
                {activeNav === "family" && (
                  <FamilyView
                    members={members}
                    activeMemberId={activeMember.id}
                    medicines={medicines}
                    t={t}
                    onSelectMember={(id) => {
                      setActiveMemberId(id);
                      setActiveNav("today");
                    }}
                    onSaveMember={(newMember) => {
                      setMembers((prev) => [...prev, newMember]);
                      setActiveMemberId(newMember.id);
                    }}
                    onUpdateMember={(updated) => {
                      setMembers((prev) =>
                        prev.map((m) => (m.id === updated.id ? updated : m))
                      );
                      showToast(`✓ Updated ${updated.name}`);
                    }}
                    onDeleteMember={(memberId) => {
                      if (members.length <= 1) {
                        showToast("At least one family profile must remain");
                        return;
                      }
                      const next = members.filter((m) => m.id !== memberId);
                      setMembers(next);
                      if (activeMember.id === memberId && next[0]) {
                        setActiveMemberId(next[0].id);
                      }
                      showToast("Profile deleted");
                    }}
                    onOpenOnboardingForMember={(m) => {
                      setActiveMemberId(m.id);
                      setShowOnboarding(true);
                    }}
                    onSpeak={handleSpeak}
                  />
                )}

                {/* CABINET VIEW */}
                {activeNav === "cabinet" && (
                  <CabinetView
                    medicines={memberMedicines}
                    t={t}
                    onSpeak={handleSpeak}
                    onToggleRefillReminder={(medId) => {
                      setMedicines((prev) =>
                        prev.map((m) =>
                          m.id === medId
                            ? { ...m, refillReminderSet: !m.refillReminderSet }
                            : m
                        )
                      );
                      showToast("Refill reminder updated");
                    }}
                    onRestockMedicine={(medId) => {
                      setMedicines((prev) =>
                        prev.map((m) =>
                          m.id === medId
                            ? { ...m, stockCount: m.stockCount + 30 }
                            : m
                        )
                      );
                      showToast("+30 doses added to cabinet");
                    }}
                  />
                )}

                {/* VITALS VIEW */}
                {activeNav === "vitals" && (
                  <VitalsView
                    member={activeMember}
                    vitals={activeVitals}
                    t={t}
                    onSpeak={handleSpeak}
                    onUpdateVitals={(nextVitals) => {
                      setVitalsMap((prev) => ({
                        ...prev,
                        [activeMember.id]: nextVitals,
                      }));
                      showToast("✓ Vital reading logged");
                    }}
                  />
                )}

                {/* HISTORY VIEW */}
                {activeNav === "history" && (
                  <HistoryView
                    history={historyList}
                    t={t}
                    onSpeak={handleSpeak}
                  />
                )}

                {/* HEALTH TIPS & APPOINTMENTS VIEW */}
                {(activeNav === "tips" || activeNav === "appointments") && (
                  <HealthTipsAndAppointmentsView
                    member={activeMember}
                    appointments={appointments}
                    questions={questions}
                    langCode={lang}
                    t={t}
                    onSpeak={handleSpeak}
                    onAddQuestion={(qText) => {
                      setQuestions((prev) => [
                        {
                          id: `q-${Date.now()}`,
                          memberId: activeMember.id,
                          question: qText,
                          createdAt: "Just now",
                          asked: false,
                        },
                        ...prev,
                      ]);
                      showToast("Question added for doctor visit");
                    }}
                    onToggleQuestionAsked={(qId) => {
                      setQuestions((prev) =>
                        prev.map((q) =>
                          q.id === qId ? { ...q, asked: !q.asked } : q
                        )
                      );
                    }}
                    onToast={showToast}
                  />
                )}

                {/* EMERGENCY SOS VIEW */}
                {activeNav === "emergency" && (
                  <EmergencySOSView
                    member={activeMember}
                    medicines={medicines}
                    t={t}
                    onSpeak={handleSpeak}
                    onToast={showToast}
                  />
                )}

                {/* SETTINGS & IMPACT VIEW */}
                {(activeNav === "settings" || activeNav === "impact") && (
                  <SettingsAndImpactView
                    mode={activeNav}
                    member={activeMember}
                    medicines={memberMedicines}
                    currentLang={lang}
                    darkMode={darkMode}
                    t={t}
                    onSelectLang={setLang}
                    onToggleDark={() => setDarkMode((d) => !d)}
                    onUpdateMember={(updated) => {
                      setMembers((prev) =>
                        prev.map((m) => (m.id === updated.id ? updated : m))
                      );
                    }}
                    onOpenOnboarding={() => setShowOnboarding(true)}
                    onResetDemoData={handleResetDemoData}
                    onSpeak={handleSpeak}
                    onToast={showToast}
                  />
                )}
              </Suspense>
            </main>
          </div>

          {/* Footer Disclaimer */}
          <footer className="mt-6 pt-4 border-t border-white/60 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>🛡️ {t.disclaimer}</span>
            <span>{t.common.backgroundAlarmNote}</span>
          </footer>
        </div>
      </div>

      {/* =========================================================
          MOBILE FLOATING FROSTED BOTTOM BAR (Today, Scan, Family, Health, More)
      ========================================================= */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-2 left-3 right-3 z-40 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/80 dark:border-slate-700 shadow-[0_12px_32px_rgba(15,23,42,0.18)] px-2 py-1.5 grid grid-cols-5 gap-1"
      >
        {(
          [
            { id: "today" as NavSection, label: t.nav.today, icon: CalendarCheck },
            { id: "scan" as NavSection, label: t.nav.scan, icon: ScanLine },
            { id: "family" as NavSection, label: t.nav.family, icon: Users },
            { id: "vitals" as NavSection, label: t.nav.health, icon: Activity },
            { id: "settings" as NavSection, label: t.nav.more, icon: Menu },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeNav === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.id === "settings" && activeNav === "settings") {
                  setMobileMenuOpen((p) => !p);
                } else {
                  setActiveNav(tab.id);
                }
              }}
              className={`min-h-[50px] rounded-2xl flex flex-col items-center justify-center transition ${
                isActive
                  ? "bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-bold shadow-sm"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 truncate max-w-[64px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* 7-STEP VOICE-ASSISTED ONBOARDING WIZARD MODAL */}
      {showOnboarding && (
        <Suspense fallback={null}>
          <OnboardingWizard
            currentLang={lang}
            onSelectLang={setLang}
            t={t}
            initialProfile={activeMember}
            onComplete={handleSaveOnboardingProfile}
            onClose={() => setShowOnboarding(false)}
            onToast={showToast}
          />
        </Suspense>
      )}

      {/* FULL-SCREEN SPOKEN REMINDER ALERT MODAL */}
      {activeReminder && (
        <Suspense fallback={null}>
          <FullScreenReminderModal
            medicine={activeReminder.medicine}
            slot={activeReminder.slot}
            member={activeMember}
            t={t}
            snoozeCount={activeReminder.snoozeCount}
            caregiverAlerted={activeReminder.caregiverAlerted}
            onSpeak={handleSpeak}
            onMarkTaken={() => {
              handleToggleDose(
                activeReminder.medicine,
                activeReminder.slot,
                true
              );
              setActiveReminder(null);
            }}
            onSnooze10Min={handleSnoozeReminder}
            onClose={() => setActiveReminder(null)}
          />
        </Suspense>
      )}

      {/* DOUBLE-DOSE GUARD CONFIRMATION MODAL */}
      {doubleDosePrompt && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {t.greetings.doubleDoseGuardTitle}
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.greetings.doubleDoseGuardMsg}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDoubleDosePrompt(null)}
                className="min-h-[48px] px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={() =>
                  handleToggleDose(
                    doubleDosePrompt.medicine,
                    doubleDosePrompt.slot,
                    true
                  )
                }
                className="min-h-[48px] px-5 rounded-2xl bg-amber-500 text-slate-950 font-extrabold text-sm"
              >
                {t.greetings.confirmDoubleDose}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
