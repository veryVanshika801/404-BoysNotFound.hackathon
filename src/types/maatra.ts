import { LanguageCode } from "../i18n";

export type PillShape = "round" | "oval" | "capsule" | "syrup";
export type TimeOfDaySlot = "morning" | "afternoon" | "night";
export type FoodTiming = "before_food" | "after_food" | "with_food";

export interface LifestyleConfig {
  diet: "veg" | "nonVeg" | "vegan" | "jain";
  smoking: boolean;
  alcohol: boolean;
  activityLevel: "low" | "medium" | "high";
  wakeTime: string;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
  sleepTime: string;
  fastingDays: string;
  notes: string;
}

export interface AccessibilityNeeds {
  largeText: boolean;
  slowVoice: boolean;
  poorEyesight: boolean;
  hearingDifficulty: boolean;
  vibration: boolean;
  notificationsEnabled: boolean;
  voiceEnabled: boolean;
}

export interface CaregiverContacts {
  caregiverName: string;
  caregiverPhone: string;
  doctorName: string;
  doctorPhone: string;
  emergencyContact: string;
}

export interface FamilyMemberProfile {
  id: string;
  name: string;
  relation: string;
  patientId: string;
  gender: "male" | "female" | "other" | "preferNotToSay";
  age: number;
  bloodGroup: string;
  phone?: string;
  password?: string;
  avatarPhoto?: string;
  role: "self" | "family";
  avatarColor: string;
  conditions: string[];
  allergies: string[];
  lifestyle: LifestyleConfig;
  needs: AccessibilityNeeds;
  contacts: CaregiverContacts;
  streakDays: number;
}

export interface MedicineItem {
  id: string;
  memberId: string;
  name: string;
  vernacularNote?: Record<LanguageCode, string>;
  strength: string;
  form: "tablet" | "capsule" | "syrup";
  color: string;
  secondaryColor?: string;
  shape: PillShape;
  doseAmount: number; // 0.5, 1, 2 for pills; 2.5, 5, 10 for syrup
  timesOfDay: TimeOfDaySlot[];
  foodTiming: FoodTiming;
  durationDays: number;
  stockCount: number;
  expiryDate: string;
  conditionTag: string;
  refillReminderSet?: boolean;
  takenToday: Record<TimeOfDaySlot, string | null>; // ISO timestamp when taken
}

export interface VitalLogEntry {
  date: string;
  value: number;
  secondaryValue?: number; // e.g. diastolic for BP
  displayValue: string;
}

export interface MemberVitals {
  bpSystolic: number;
  bpDiastolic: number;
  bpStatus: "good" | "borderline" | "high";
  bpHistory: VitalLogEntry[];
  bloodSugar: number;
  sugarStatus: "good" | "borderline" | "high";
  sugarHistory: VitalLogEntry[];
  weight: number;
  weightStatus: "good" | "borderline";
  weightHistory: VitalLogEntry[];
  temperature: number;
  tempStatus: "good" | "borderline" | "high";
  tempHistory: VitalLogEntry[];
  spo2: number;
  spo2Status: "good" | "borderline" | "high";
  spo2History: VitalLogEntry[];
}

export interface HistoryTimelineItem {
  id: string;
  memberId: string;
  medicineId: string;
  medicineName: string;
  dateLabel: string;
  timeLabel: string;
  slot: TimeOfDaySlot;
  status: "taken" | "missed" | "snoozed";
  detail: string;
}

export interface DoctorAppointment {
  id: string;
  memberId: string;
  doctorName: string;
  specialty: string;
  hospital: string;
  date: string;
  time: string;
  notes: string;
}

export interface DoctorQuestion {
  id: string;
  memberId: string;
  question: string;
  createdAt: string;
  asked: boolean;
}
