import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  Eye,
  EyeOff,
  Lock,
  User,
  Volume2,
  Mic,
  Globe,
  Pill,
  ArrowRight,
  Sparkles,
  Check,
  X,
  Plus,
  Trash2,
  HeartPulse,
  Droplets,
  UserPlus,
  LogIn,
} from "lucide-react";
import {
  LanguageCode,
  LANGUAGE_LIST,
  TranslationDictionary,
} from "../i18n";
import { PillShape, TimeOfDaySlot } from "../types/maatra";
import { speakText, startVoiceDictation } from "../utils/speech";
import { VisualPillSVG } from "./VisualPillSVG";

export interface LoginMedicineEntry {
  id: string;
  name: string;
  strength: string;
  shape: PillShape;
  color: string;
  doseAmount: number;
  timesOfDay: TimeOfDaySlot[];
}

export interface LoginCredentials {
  authMode: "login" | "register";
  name: string;
  gender: "male" | "female" | "other" | "preferNotToSay";
  password: string;
  avatarPhoto: string;
  bloodGroup: string;
  conditions: string[];
  medicines: LoginMedicineEntry[];
}

interface LoginPageProps {
  lang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
  t: TranslationDictionary;
  darkMode: boolean;
  onToggleDark: () => void;
  initialName?: string;
  initialGender?: "male" | "female" | "other" | "preferNotToSay";
  initialPhoto?: string;
  initialBloodGroup?: string;
  initialConditions?: string[];
  onLoginSuccess: (creds: LoginCredentials) => void;
  onToast: (msg: string) => void;
}

// Built-in SVG data-URL avatars for 1-tap selection: You, Father, Mother, Grandfather, Grandmother, Child
const PRESET_AVATARS = [
  {
    id: "self-you",
    label: "You",
    url: `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="gyou" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#DBEAFE"/><stop offset="100%" stop-color="#E0E7FF"/></linearGradient></defs><rect width="120" height="120" rx="60" fill="url(#gyou)"/><circle cx="60" cy="46" r="21" fill="#FBBF24"/><path d="M36 44 C36 20, 84 20, 84 44" fill="#1E293B"/><circle cx="52" cy="46" r="2.5" fill="#1E293B"/><circle cx="68" cy="46" r="2.5" fill="#1E293B"/><path d="M52 55 Q60 61 68 55" fill="none" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/><path d="M26 108 C26 78, 94 78, 94 108" fill="#3B82F6"/></svg>`
    )}`,
  },
  {
    id: "father",
    label: "Father",
    url: `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="gfather" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#E0F2FE"/><stop offset="100%" stop-color="#BAE6FD"/></linearGradient></defs><rect width="120" height="120" rx="60" fill="url(#gfather)"/><circle cx="60" cy="46" r="22" fill="#F59E0B"/><path d="M36 42 C36 22, 84 22, 84 42" fill="#334155"/><circle cx="52" cy="46" r="2.5" fill="#1E293B"/><circle cx="68" cy="46" r="2.5" fill="#1E293B"/><path d="M49 53 Q60 56 71 53" fill="none" stroke="#334155" stroke-width="3" stroke-linecap="round"/><path d="M53 57 Q60 62 67 57" fill="none" stroke="#1E293B" stroke-width="2" stroke-linecap="round"/><path d="M26 108 C26 78, 94 78, 94 108" fill="#0284C7"/></svg>`
    )}`,
  },
  {
    id: "parent-female",
    label: "Mother",
    url: `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="#D1FAE5"/><circle cx="60" cy="46" r="22" fill="#FBBF24"/><path d="M35 46 C35 20, 85 20, 85 46" fill="#1E293B"/><circle cx="60" cy="38" r="2" fill="#DC2626"/><circle cx="52" cy="46" r="2.5" fill="#1E293B"/><circle cx="68" cy="46" r="2.5" fill="#1E293B"/><path d="M53 55 Q60 60 67 55" fill="none" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/><path d="M26 108 C26 78, 94 78, 94 108" fill="#059669"/></svg>`
    )}`,
  },
  {
    id: "senior-male",
    label: "Grandfather",
    url: `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#DBEAFE"/><stop offset="100%" stop-color="#BFDBFE"/></linearGradient></defs><rect width="120" height="120" rx="60" fill="url(#g1)"/><circle cx="60" cy="46" r="22" fill="#FBBF24"/><path d="M36 42 C36 24, 84 24, 84 42" fill="#E2E8F0"/><circle cx="52" cy="46" r="2.5" fill="#1E293B"/><circle cx="68" cy="46" r="2.5" fill="#1E293B"/><rect x="46" y="42" width="12" height="8" rx="3" fill="none" stroke="#475569" stroke-width="2"/><rect x="62" y="42" width="12" height="8" rx="3" fill="none" stroke="#475569" stroke-width="2"/><line x1="58" y1="45" x2="62" y2="45" stroke="#475569" stroke-width="2"/><path d="M52 55 Q60 61 68 55" fill="none" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/><path d="M26 108 C26 78, 94 78, 94 108" fill="#2563EB"/></svg>`
    )}`,
  },
  {
    id: "senior-female",
    label: "Grandmother",
    url: `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FCE7F3"/><stop offset="100%" stop-color="#E0E7FF"/></linearGradient></defs><rect width="120" height="120" rx="60" fill="url(#g2)"/><circle cx="60" cy="46" r="22" fill="#F59E0B"/><path d="M35 44 C35 22, 85 22, 85 44" fill="#94A3B8"/><circle cx="60" cy="37" r="2.5" fill="#E11D48"/><circle cx="52" cy="46" r="2.5" fill="#1E293B"/><circle cx="68" cy="46" r="2.5" fill="#1E293B"/><path d="M53 55 Q60 60 67 55" fill="none" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/><path d="M26 108 C26 78, 94 78, 94 108" fill="#8B5CF6"/></svg>`
    )}`,
  },
  {
    id: "child",
    label: "Child",
    url: `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="#FEF3C7"/><circle cx="60" cy="48" r="20" fill="#FBBF24"/><path d="M38 44 C38 24, 82 24, 82 44" fill="#1E293B"/><circle cx="53" cy="48" r="2.5" fill="#1E293B"/><circle cx="67" cy="48" r="2.5" fill="#1E293B"/><path d="M53 56 Q60 62 67 56" fill="none" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/><path d="M30 108 C30 82, 90 82, 90 108" fill="#F97316"/></svg>`
    )}`,
  },
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const DISEASE_LIST = [
  "Diabetes",
  "Blood pressure",
  "Thyroid",
  "Asthma",
  "Heart disease",
  "Cholesterol",
  "Arthritis",
  "Kidney disease",
  "Anaemia",
  "None",
];

const PILL_COLORS = [
  "#FFFFFF",
  "#FACC15",
  "#3B82F6",
  "#F472B6",
  "#EF4444",
  "#10B981",
];

export const LoginPage: React.FC<LoginPageProps> = ({
  lang,
  onSelectLang,
  t,
  initialName = "",
  initialGender = "male",
  initialPhoto = PRESET_AVATARS[0].url,
  initialBloodGroup = "B+",
  initialConditions = ["Diabetes", "Blood pressure"],
  onLoginSuccess,
  onToast,
}) => {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [name, setName] = useState(initialName);
  const [gender, setGender] = useState<
    "male" | "female" | "other" | "preferNotToSay"
  >(initialGender);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPhoto, setAvatarPhoto] = useState<string>(
    initialPhoto || PRESET_AVATARS[0].url
  );
  const [bloodGroup, setBloodGroup] = useState<string>(initialBloodGroup);
  const [conditions, setConditions] = useState<string[]>(initialConditions);
  const [customDisease, setCustomDisease] = useState("");

  // Medicine info state during Login / Sign Up
  const [medList, setMedList] = useState<LoginMedicineEntry[]>([
    {
      id: "login-med-1",
      name: "Glycomet (Metformin)",
      strength: "500 mg",
      shape: "oval",
      color: "#FFFFFF",
      doseAmount: 1,
      timesOfDay: ["morning", "night"],
    },
  ]);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      stopSelfieCamera();
    };
  }, []);

  const stopSelfieCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((tr) => tr.stop());
      videoRef.current.srcObject = null;
    }
    setCameraOpen(false);
  };

  const startSelfieCamera = async () => {
    try {
      setCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setCameraOpen(false);
      onToast("Camera unavailable — please upload a photo or pick an avatar.");
    }
  };

  const captureSelfie = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = 240;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setAvatarPhoto(dataUrl);
      stopSelfieCamera();
      onToast("Profile photo captured!");
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setAvatarPhoto(String(reader.result));
        onToast("Profile photo uploaded!");
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleCondition = (item: string) => {
    if (item === "None") {
      setConditions(["None"]);
      return;
    }
    setConditions((prev) => {
      const cleaned = prev.filter((c) => c !== "None");
      return cleaned.includes(item)
        ? cleaned.filter((c) => c !== item)
        : [...cleaned, item];
    });
  };

  const handleAddCustomDisease = () => {
    const trimmed = customDisease.trim();
    if (!trimmed) return;
    setConditions((prev) => [
      ...prev.filter((c) => c !== "None"),
      trimmed,
    ]);
    setCustomDisease("");
  };

  const handleAddMedicineRow = () => {
    setMedList((prev) => [
      ...prev,
      {
        id: `login-med-${Date.now()}`,
        name: "",
        strength: "500 mg",
        shape: "round",
        color: "#3B82F6",
        doseAmount: 1,
        timesOfDay: ["morning"],
      },
    ]);
  };

  const handleUpdateMedicine = (
    id: string,
    patch: Partial<LoginMedicineEntry>
  ) => {
    setMedList((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  };

  const handleToggleMedTime = (id: string, slot: TimeOfDaySlot) => {
    setMedList((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const exists = m.timesOfDay.includes(slot);
        const nextTimes = exists
          ? m.timesOfDay.filter((s) => s !== slot)
          : [...m.timesOfDay, slot];
        return {
          ...m,
          timesOfDay: nextTimes.length > 0 ? nextTimes : ["morning"],
        };
      })
    );
  };

  const handleRemoveMedicine = (id: string) => {
    setMedList((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter your full name.");
      speakText("Please enter your full name.", lang, true, onToast);
      return;
    }
    if (!password.trim()) {
      setErrorMsg("Please enter your password.");
      speakText("Please enter your password.", lang, true, onToast);
      return;
    }
    if (authMode === "register" && confirmPassword && password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    setErrorMsg(null);
    const validMeds = medList.filter((m) => m.name.trim().length > 0);
    onLoginSuccess({
      authMode,
      name: name.trim(),
      gender,
      password,
      avatarPhoto: avatarPhoto || PRESET_AVATARS[0].url,
      bloodGroup,
      conditions: conditions.length > 0 ? conditions : ["None"],
      medicines: validMeds,
    });
  };

  const handleQuickDemoFill = () => {
    onLoginSuccess({
      authMode: "login",
      name: "Ramesh Sharma",
      gender: "male",
      password: "maatra123",
      avatarPhoto: PRESET_AVATARS[3].url,
      bloodGroup: "B+",
      conditions: ["Diabetes", "Blood pressure"],
      medicines: [
        {
          id: `demo-med-${Date.now()}`,
          name: "Glycomet (Metformin)",
          strength: "500 mg",
          shape: "oval",
          color: "#FFFFFF",
          doseAmount: 1,
          timesOfDay: ["morning", "night"],
        },
      ],
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#DCEAFE] via-[#EAE8FF] to-[#F5F8FF] dark:from-[#0F172A] dark:via-[#142038] dark:to-[#1B2635] text-slate-800 dark:text-slate-100 flex items-center justify-center p-3 sm:p-6 relative overflow-x-hidden">
      {/* Ambient Veridia Blurred Glows */}
      <div className="pointer-events-none fixed top-0 left-1/4 w-[480px] h-[480px] rounded-full bg-blue-400/25 dark:bg-blue-600/15 blur-[130px]" />
      <div className="pointer-events-none fixed bottom-0 right-1/4 w-[460px] h-[460px] rounded-full bg-purple-400/25 dark:bg-purple-600/15 blur-[130px]" />

      {/* Main Frosted Glass Login / Register Container */}
      <div className="relative z-10 w-full max-w-3xl rounded-[32px] bg-white/85 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-[0_24px_70px_-15px_rgba(37,99,235,0.2)] p-5 sm:p-8 space-y-6 my-4">
        {/* Top Bar: Brand + Language + Voice Read Aloud */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#8B5CF6] text-white flex items-center justify-center shadow-md shadow-blue-500/25">
              <Pill className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] dark:from-blue-300 dark:to-indigo-300 bg-clip-text text-transparent leading-none">
                {t.appTitle}
              </h1>
              <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 mt-0.5">
                {t.appSubtitle} · {authMode === "login" ? "SIGN IN" : "REGISTER / SIGN UP"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher Pill */}
            <div className="flex items-center bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1.5 shadow-sm">
              <Globe className="w-4 h-4 text-blue-600 mr-1.5 shrink-0" />
              <select
                aria-label="Select Language"
                value={lang}
                onChange={(e) => onSelectLang(e.target.value as LanguageCode)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
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

            {/* Speak Screen Button */}
            <button
              type="button"
              onClick={() =>
                speakText(
                  `${t.appTitle}. ${
                    authMode === "login" ? "Login" : "Register and Sign Up"
                  }. Enter Name, Gender, Password, Profile Photo, Blood Group, Disease Info, and Medicine Info.`,
                  lang,
                  true,
                  onToast
                )
              }
              className="min-h-[44px] px-3.5 py-2 rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4" />
              <span>{t.common.listen}</span>
            </button>
          </div>
        </div>

        {/* LOGIN / REGISTER (SIGN UP) SEGMENTED SWITCHER */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setAuthMode("login")}
            className={`min-h-[48px] rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
              authMode === "login"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Login / Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("register")}
            className={`min-h-[48px] rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
              authMode === "register"
                ? "bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-md"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Register / Sign Up</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. PROFILE PHOTO SECTION (Upload, Camera Selfie, or 6 Family Avatars) */}
          <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <label className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              1. Profile Photo
            </label>

            {/* Glowing Blue Ring Avatar Preview */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#8B5CF6] to-[#3B82F6] shadow-[0_0_25px_rgba(59,130,246,0.45)]">
                <img
                  src={avatarPhoto}
                  alt="Selected profile avatar"
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-full object-cover bg-white dark:bg-slate-800"
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload profile photo"
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-500 transition border-2 border-white dark:border-slate-900"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>

            {/* Upload or Take Photo Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-sm hover:border-blue-400 transition"
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload Photo</span>
              </button>

              <button
                type="button"
                onClick={startSelfieCamera}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-sm hover:border-blue-400 transition"
              >
                <Camera className="w-3.5 h-3.5 text-purple-600" />
                <span>Take Camera Photo</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Quick Preset Avatars Row: You, Father, Mother, Grandfather, Grandmother, Child */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {PRESET_AVATARS.map((preset) => {
                const isSelected = avatarPhoto === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setAvatarPhoto(preset.url)}
                    className={`p-1 rounded-2xl border-2 transition flex items-center gap-1.5 pr-2.5 ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/80 dark:bg-blue-950/60"
                        : "border-slate-200/80 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60"
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                      {preset.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {cameraOpen && (
              <div className="w-full max-w-xs rounded-2xl bg-slate-900 p-3 text-white space-y-2.5">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-36 h-36 mx-auto rounded-full object-cover border-2 border-blue-400"
                />
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={captureSelfie}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" /> Capture
                  </button>
                  <button
                    type="button"
                    onClick={stopSelfieCamera}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-xs font-semibold flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. NAME & PASSWORD GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                2. {t.onboarding.nameLabel}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full min-h-[50px] pl-11 pr-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    startVoiceDictation(lang, (txt) => setName(txt), onToast)
                  }
                  title="Speak your name"
                  className="min-h-[50px] min-w-[50px] rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-slate-700 flex items-center justify-center"
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                3. Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    authMode === "register"
                      ? "Create a password"
                      : "Enter your password"
                  }
                  className="w-full min-h-[50px] pl-11 pr-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 min-h-[38px] min-w-[38px] rounded-xl text-slate-400 hover:text-slate-700 flex items-center justify-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {authMode === "register" && (
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password (optional)"
                  className="mt-2 w-full min-h-[44px] px-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                />
              )}
            </div>
          </div>

          {/* 4. GENDER & 5. BLOOD GROUP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gender Selection Cards */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                4. {t.onboarding.genderLabel}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: "male", label: t.onboarding.male, emoji: "👨🏽" },
                    { id: "female", label: t.onboarding.female, emoji: "👩🏽" },
                    { id: "other", label: t.onboarding.other, emoji: "🧑🏽" },
                    {
                      id: "preferNotToSay",
                      label: t.onboarding.preferNotToSay,
                      emoji: "🛡️",
                    },
                  ] as const
                ).map((g) => {
                  const selected = gender === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGender(g.id)}
                      className={`min-h-[54px] p-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-0.5 transition relative ${
                        selected
                          ? "border-blue-600 bg-blue-50/90 dark:bg-blue-950/70 text-blue-700 dark:text-blue-200 font-bold"
                          : "border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="text-base">{g.emoji}</span>
                      <span className="text-[11px] truncate max-w-full">
                        {g.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Blood Group Selector */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1.5 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5" />
                <span>5. {t.sections.bloodGroup}</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_GROUPS.map((bg) => {
                  const active = bloodGroup === bg;
                  return (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setBloodGroup(bg)}
                      className={`min-h-[46px] rounded-xl border-2 text-xs sm:text-sm font-extrabold tabular-nums transition ${
                        active
                          ? "border-rose-600 bg-rose-600 text-white shadow-sm"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-rose-300"
                      }`}
                    >
                      {bg}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 6. DISEASE / HEALTH CONDITION INFO */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 space-y-3">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4" />
              <span>6. Disease / Health Condition Info</span>
            </label>

            <div className="flex flex-wrap gap-2">
              {DISEASE_LIST.map((cond) => {
                const selected = conditions.includes(cond);
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => toggleCondition(cond)}
                    className={`min-h-[40px] px-3 py-1.5 rounded-xl border-2 text-xs font-bold flex items-center gap-1.5 transition ${
                      selected
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-200"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span>{t.conditions[cond] || cond}</span>
                    {selected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Disease Input with Voice Dictation */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={customDisease}
                onChange={(e) => setCustomDisease(e.target.value)}
                placeholder="Add another disease / health condition..."
                className="flex-1 min-h-[42px] px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() =>
                  startVoiceDictation(
                    lang,
                    (txt) => setCustomDisease(txt),
                    onToast
                  )
                }
                className="min-h-[42px] min-w-[42px] rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 border border-blue-200 dark:border-slate-700 flex items-center justify-center"
                title="Dictate condition"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleAddCustomDisease}
                className="min-h-[42px] px-3.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* 7. MEDICINE INFO SECTION */}
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-slate-800/60 border border-blue-200/70 dark:border-slate-700 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <Pill className="w-4 h-4" />
                <span>7. Medicine Info (Your Current Prescription)</span>
              </label>
              <button
                type="button"
                onClick={handleAddMedicineRow}
                className="min-h-[36px] px-3 py-1 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1 shadow-sm hover:bg-blue-500 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medicine</span>
              </button>
            </div>

            {/* Quick Medicine Preset Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 mr-1">
                Quick add:
              </span>
              {[
                { name: "Glycomet (Metformin)", strength: "500 mg", shape: "oval" as PillShape, color: "#FFFFFF" },
                { name: "Stamlo (Amlodipine)", strength: "5 mg", shape: "round" as PillShape, color: "#FACC15" },
                { name: "Thyronorm", strength: "50 mcg", shape: "round" as PillShape, color: "#F472B6" },
                { name: "Cough Syrup", strength: "5 ml", shape: "syrup" as PillShape, color: "#3B82F6" },
              ].map((quick) => (
                <button
                  key={quick.name}
                  type="button"
                  onClick={() =>
                    setMedList((prev) => [
                      ...prev,
                      {
                        id: `med-quick-${Date.now()}-${Math.random()}`,
                        name: quick.name,
                        strength: quick.strength,
                        shape: quick.shape,
                        color: quick.color,
                        doseAmount: quick.shape === "syrup" ? 5 : 1,
                        timesOfDay: ["morning", "night"],
                      },
                    ])
                  }
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 text-[11px] font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-50"
                >
                  + {quick.name}
                </button>
              ))}
            </div>

            {/* Medicine Rows */}
            <div className="space-y-3">
              {medList.map((med) => (
                <div
                  key={med.id}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col gap-3"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <VisualPillSVG
                      shape={med.shape}
                      color={med.color}
                      size="sm"
                    />
                    <div className="flex-1 min-w-[160px] flex gap-1.5">
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) =>
                          handleUpdateMedicine(med.id, { name: e.target.value })
                        }
                        placeholder="Medicine Name (e.g. Metformin)"
                        className="flex-1 min-h-[40px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          startVoiceDictation(
                            lang,
                            (txt) => handleUpdateMedicine(med.id, { name: txt }),
                            onToast
                          )
                        }
                        className="min-h-[40px] min-w-[40px] rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 flex items-center justify-center"
                        title="Speak medicine name"
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={med.strength}
                      onChange={(e) =>
                        handleUpdateMedicine(med.id, {
                          strength: e.target.value,
                        })
                      }
                      placeholder="500 mg"
                      className="w-24 min-h-[40px] px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    />
                    {medList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(med.id)}
                        className="min-h-[38px] min-w-[38px] rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center"
                        title="Remove medicine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Visual Shape, Color & Time Toggles */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {/* Shape selector */}
                    <div className="flex items-center gap-1">
                      {(["round", "oval", "capsule", "syrup"] as const).map(
                        (sh) => (
                          <button
                            key={sh}
                            type="button"
                            onClick={() =>
                              handleUpdateMedicine(med.id, {
                                shape: sh,
                                doseAmount: sh === "syrup" ? 5 : 1,
                              })
                            }
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border capitalize ${
                              med.shape === sh
                                ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200"
                                : "border-slate-200 dark:border-slate-700 text-slate-500"
                            }`}
                          >
                            {sh}
                          </button>
                        )
                      )}
                    </div>

                    {/* Color dots */}
                    <div className="flex items-center gap-1.5">
                      {PILL_COLORS.map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() =>
                            handleUpdateMedicine(med.id, { color: hex })
                          }
                          className={`w-6 h-6 rounded-full border ${
                            med.color === hex
                              ? "ring-2 ring-blue-600 scale-110"
                              : "border-slate-300"
                          }`}
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                      ))}
                    </div>

                    {/* Morning / Afternoon / Night toggles */}
                    <div className="flex items-center gap-1">
                      {(["morning", "afternoon", "night"] as const).map(
                        (slot) => {
                          const active = med.timesOfDay.includes(slot);
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => handleToggleMedTime(med.id, slot)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize border ${
                                active
                                  ? "border-emerald-600 bg-emerald-600 text-white"
                                  : "border-slate-200 dark:border-slate-700 text-slate-500"
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs font-bold text-center">
              {errorMsg}
            </div>
          )}

          {/* Submit & Quick Demo Buttons */}
          <div className="pt-1 space-y-2.5">
            <button
              type="submit"
              className="w-full min-h-[56px] rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-extrabold text-base shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 hover:opacity-95 transition"
            >
              <span>
                {authMode === "login"
                  ? `Login & Save Health Info`
                  : `Complete Registration & Start ${t.appTitle}`}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="w-full min-h-[46px] rounded-2xl bg-blue-50/90 dark:bg-slate-800/90 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Quick Demo Sign-In (Ramesh Sharma · B+ · Diabetes & BP)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
