import React, { useState } from "react";
import {
  Volume2,
  Delete,
  Check,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  FamilyMemberProfile,
  MemberVitals,
  VitalLogEntry,
} from "../types/maatra";
import { TranslationDictionary } from "../i18n";

interface VitalsViewProps {
  member: FamilyMemberProfile;
  vitals: MemberVitals;
  t: TranslationDictionary;
  onSpeak: (text: string) => void;
  onUpdateVitals: (next: MemberVitals) => void;
}

type VitalKey = "bp" | "sugar" | "weight" | "temp" | "spo2";

export const MiniSparkline: React.FC<{
  data: VitalLogEntry[];
  color: string;
}> = ({ data, color }) => {
  return (
    <div className="w-24 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const VitalsView: React.FC<VitalsViewProps> = ({
  member,
  vitals,
  t,
  onSpeak,
  onUpdateVitals,
}) => {
  // Condition-specific vitals shown first: diabetes shows sugar first, BP shows pressure first
  const prefersSugarFirst =
    member.conditions.includes("Diabetes") &&
    !member.conditions.includes("Blood pressure");

  const [selectedMetric, setSelectedMetric] = useState<VitalKey>(
    prefersSugarFirst ? "sugar" : "bp"
  );
  const [padValue, setPadValue] = useState<string>("");

  const handlePadPress = (char: string) => {
    if (padValue.length >= 7) return;
    setPadValue((prev) => prev + char);
  };

  const handleBackspace = () => {
    setPadValue((prev) => prev.slice(0, -1));
  };

  const handleSaveVital = () => {
    if (!padValue.trim()) return;
    const updated = { ...vitals };

    if (selectedMetric === "bp") {
      const parts = padValue.split("/");
      const sys = Number(parts[0]) || 125;
      const dia = Number(parts[1]) || 82;
      const status: "good" | "borderline" | "high" =
        sys >= 140 || dia >= 90
          ? "high"
          : sys >= 130 || dia >= 85
          ? "borderline"
          : "good";
      updated.bpSystolic = sys;
      updated.bpDiastolic = dia;
      updated.bpStatus = status;
      updated.bpHistory = [
        ...updated.bpHistory.slice(-6),
        {
          date: "Now",
          value: sys,
          secondaryValue: dia,
          displayValue: `${sys}/${dia}`,
        },
      ];
      onSpeak(`${t.vitals.bloodPressure} ${sys}/${dia} saved.`);
    } else if (selectedMetric === "sugar") {
      const val = Number(padValue) || 110;
      const status: "good" | "borderline" | "high" =
        val >= 140 || val < 70
          ? "high"
          : val >= 115
          ? "borderline"
          : "good";
      updated.bloodSugar = val;
      updated.sugarStatus = status;
      updated.sugarHistory = [
        ...updated.sugarHistory.slice(-6),
        { date: "Now", value: val, displayValue: `${val} mg/dL` },
      ];
      onSpeak(`${t.vitals.bloodSugar} ${val} saved.`);
    } else if (selectedMetric === "weight") {
      const val = Number(padValue) || 65;
      updated.weight = val;
      updated.weightHistory = [
        ...updated.weightHistory.slice(-6),
        { date: "Now", value: val, displayValue: `${val} kg` },
      ];
      onSpeak(`${t.vitals.weight} ${val} kg saved.`);
    } else if (selectedMetric === "temp") {
      const val = Number(padValue) || 98.6;
      const status: "good" | "borderline" | "high" =
        val >= 100.4 ? "high" : val >= 99.2 ? "borderline" : "good";
      updated.temperature = val;
      updated.tempStatus = status;
      updated.tempHistory = [
        ...updated.tempHistory.slice(-6),
        { date: "Now", value: val, displayValue: `${val} °F` },
      ];
      onSpeak(`${t.vitals.temperature} ${val} saved.`);
    } else if (selectedMetric === "spo2") {
      const val = Math.min(100, Math.max(70, Number(padValue) || 98));
      const status: "good" | "borderline" | "high" =
        val < 92 ? "high" : val < 95 ? "borderline" : "good";
      updated.spo2 = val;
      updated.spo2Status = status;
      updated.spo2History = [
        ...updated.spo2History.slice(-6),
        { date: "Now", value: val, displayValue: `${val}%` },
      ];
      onSpeak(`${t.vitals.spo2} ${val}% saved.`);
    }

    onUpdateVitals(updated);
    setPadValue("");
  };

  const rowsBase = [
    {
      key: "sugar" as VitalKey,
      label: t.vitals.bloodSugar,
      sub: "Glycated / Fasting Glucose",
      value: `${vitals.bloodSugar}`,
      unit: "mg/dL",
      status: vitals.sugarStatus,
      history: vitals.sugarHistory,
      color:
        vitals.sugarStatus === "high"
          ? "#EF4444"
          : vitals.sugarStatus === "borderline"
          ? "#F59E0B"
          : "#10B981",
    },
    {
      key: "bp" as VitalKey,
      label: t.vitals.bloodPressure,
      sub: "Systolic / Diastolic",
      value: `${vitals.bpSystolic}/${vitals.bpDiastolic}`,
      unit: "mmHg",
      status: vitals.bpStatus,
      history: vitals.bpHistory,
      color:
        vitals.bpStatus === "high"
          ? "#EF4444"
          : vitals.bpStatus === "borderline"
          ? "#F59E0B"
          : "#3B82F6",
    },
    {
      key: "spo2" as VitalKey,
      label: t.vitals.spo2,
      sub: "Pulse Oximetry",
      value: `${vitals.spo2}`,
      unit: "%",
      status: vitals.spo2Status,
      history: vitals.spo2History,
      color: "#3B82F6",
    },
    {
      key: "temp" as VitalKey,
      label: t.vitals.temperature,
      sub: "Body Thermometer",
      value: `${vitals.temperature}`,
      unit: "°F",
      status: vitals.tempStatus,
      history: vitals.tempHistory,
      color: "#8B5CF6",
    },
    {
      key: "weight" as VitalKey,
      label: t.vitals.weight,
      sub: "Body Mass",
      value: `${vitals.weight}`,
      unit: "kg",
      status: vitals.weightStatus,
      history: vitals.weightHistory,
      color: "#10B981",
    },
  ];

  // Order rows based on member's conditions
  const orderedRows = prefersSugarFirst
    ? rowsBase
    : [rowsBase[1], rowsBase[0], rowsBase[2], rowsBase[3], rowsBase[4]];

  const activeRow =
    orderedRows.find((r) => r.key === selectedMetric) || orderedRows[0];

  const getStatusPill = (status: "good" | "borderline" | "high") => {
    if (status === "high") {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-xs font-bold">
          {t.common.high}
        </span>
      );
    }
    if (status === "borderline") {
      return (
        <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-bold">
          {t.common.borderline}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
        {t.common.good}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[24px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/70 dark:border-slate-800 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {t.vitals.title} — {member.name}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
            {t.vitals.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            onSpeak(
              `${member.name}. ${t.vitals.bloodPressure}: ${vitals.bpSystolic}/${vitals.bpDiastolic}. ${t.vitals.bloodSugar}: ${vitals.bloodSugar} mg/dL.`
            )
          }
          className="min-h-[48px] px-4 py-2 rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-slate-700 font-semibold text-sm flex items-center gap-2 self-start"
        >
          <Volume2 className="w-5 h-5" />
          <span>{t.common.listenScreen}</span>
        </button>
      </div>

      {/* Main Split: Left Veridia Key Lab Marker Rows + Chart, Right Big Number Pad */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Veridia-style Vital Rows + Area Chart */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-[24px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/70 dark:border-slate-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Key Vitals & Lab Markers
              </h2>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                Condition-Prioritized
              </span>
            </div>

            <div className="divide-y divide-slate-200/60 dark:divide-slate-800">
              {orderedRows.map((row) => {
                const isSelected = row.key === selectedMetric;
                return (
                  <div
                    key={row.key}
                    onClick={() => {
                      setSelectedMetric(row.key);
                      onSpeak(`${row.label}: ${row.value} ${row.unit}`);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedMetric(row.key);
                      }
                    }}
                    className={`py-3.5 px-3 -mx-3 rounded-2xl cursor-pointer transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-blue-50/80 dark:bg-blue-950/40 ring-2 ring-blue-500/60"
                        : "hover:bg-slate-50/70 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="min-w-[125px]">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {row.label}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {row.sub}
                      </div>
                    </div>

                    <div className="text-right sm:text-left">
                      <span className="text-lg sm:text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                        {row.value}
                      </span>{" "}
                      <span className="text-xs text-slate-500">{row.unit}</span>
                    </div>

                    <div>{getStatusPill(row.status)}</div>

                    <div className="hidden sm:block">
                      <MiniSparkline data={row.history} color={row.color} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Smooth Recharts Area & Line Chart */}
          <div className="rounded-[24px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/70 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>{activeRow.label} Trend</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Last 7 readings ({activeRow.unit})
                </p>
              </div>
              {getStatusPill(activeRow.status)}
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeRow.history}>
                  <defs>
                    <linearGradient id="vitalArea" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={activeRow.color}
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="95%"
                        stopColor={activeRow.color}
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={activeRow.color}
                    strokeWidth={3}
                    fill="url(#vitalArea)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Accessible Big Number Pad */}
        <div className="lg:col-span-5">
          <div className="rounded-[24px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/80 dark:border-slate-800 p-5 sm:p-6 shadow-md space-y-4">
            <div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {t.vitals.logVital}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {activeRow.label} ({activeRow.unit})
              </h3>
            </div>

            {/* Metric Selector Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {orderedRows.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => {
                    setSelectedMetric(r.key);
                    setPadValue("");
                  }}
                  className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedMetric === r.key
                      ? "bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Big Display Screen */}
            <div className="min-h-[68px] px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-blue-300 dark:border-slate-700 flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
                {padValue ||
                  (selectedMetric === "bp" ? "130/80" : activeRow.value)}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {activeRow.unit}
              </span>
            </div>

            {/* Big Touch Number Pad (Minimum 56px buttons) */}
            <div className="grid grid-cols-3 gap-2.5">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handlePadPress(digit)}
                  className="min-h-[58px] rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xl font-bold tabular-nums text-slate-900 dark:text-white active:scale-95 transition"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() =>
                  handlePadPress(selectedMetric === "bp" ? "/" : ".")
                }
                className="min-h-[58px] rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xl font-bold text-blue-600"
              >
                {selectedMetric === "bp" ? "/" : "."}
              </button>
              <button
                type="button"
                onClick={() => handlePadPress("0")}
                className="min-h-[58px] rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xl font-bold tabular-nums text-slate-900 dark:text-white"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                aria-label="Backspace"
                className="min-h-[58px] rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 flex items-center justify-center"
              >
                <Delete className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setPadValue("")}
                className="min-h-[50px] rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm"
              >
                {t.vitals.clear}
              </button>
              <button
                type="button"
                onClick={handleSaveVital}
                className="min-h-[50px] rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-1.5"
              >
                <Check className="w-5 h-5" />
                <span>{t.vitals.submitReading}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
