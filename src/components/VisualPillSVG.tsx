import React from "react";
import { PillShape, FoodTiming } from "../types/maatra";

interface VisualPillSVGProps {
  shape: PillShape;
  color: string;
  secondaryColor?: string;
  size?: "sm" | "md" | "lg" | "xl";
  highContrast?: boolean;
  pulse?: boolean;
}

export const VisualPillSVG: React.FC<VisualPillSVGProps> = ({
  shape,
  color,
  secondaryColor = "#FACC15",
  size = "md",
  highContrast = false,
  pulse = false,
}) => {
  const dimensions = {
    sm: "w-11 h-11",
    md: "w-14 h-14",
    lg: "w-20 h-20",
    xl: "w-32 h-32",
  }[size];

  const strokeColor = highContrast ? "#0F172A" : "#64748B";
  const strokeWidth = highContrast ? 3.5 : 2;

  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50/90 via-white/90 to-indigo-50/80 dark:from-slate-800/90 dark:via-slate-900/90 dark:to-slate-800 border border-white/80 dark:border-slate-700 shadow-sm shrink-0 ${dimensions} ${
        pulse ? "animate-pulse ring-4 ring-blue-400/50" : ""
      }`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-4/5 h-4/5 drop-shadow-sm"
        aria-hidden="true"
      >
        {shape === "round" && (
          <g>
            <circle
              cx="50"
              cy="50"
              r="34"
              fill={color}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <line
              x1="24"
              y1="50"
              x2="76"
              y2="50"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray="3,2"
              opacity="0.55"
            />
            <ellipse
              cx="40"
              cy="34"
              rx="12"
              ry="5"
              fill="#FFFFFF"
              opacity="0.55"
            />
          </g>
        )}

        {shape === "oval" && (
          <g transform="rotate(-25 50 50)">
            <rect
              x="14"
              y="28"
              width="72"
              height="44"
              rx="22"
              fill={color}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <line
              x1="50"
              y1="30"
              x2="50"
              y2="70"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              opacity="0.45"
            />
            <rect
              x="24"
              y="34"
              width="22"
              height="6"
              rx="3"
              fill="#FFFFFF"
              opacity="0.6"
            />
          </g>
        )}

        {shape === "capsule" && (
          <g transform="rotate(-35 50 50)">
            <rect
              x="14"
              y="30"
              width="72"
              height="40"
              rx="20"
              fill={color}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <path
              d="M50 30 L66 30 A20 20 0 0 1 66 70 L50 70 Z"
              fill={secondaryColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <rect
              x="24"
              y="36"
              width="20"
              height="6"
              rx="3"
              fill="#FFFFFF"
              opacity="0.6"
            />
          </g>
        )}

        {shape === "syrup" && (
          <g>
            {/* Measuring cup cap */}
            <rect
              x="36"
              y="10"
              width="28"
              height="14"
              rx="4"
              fill="#DBEAFE"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* Neck */}
            <rect
              x="40"
              y="24"
              width="20"
              height="8"
              fill="#E2E8F0"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* Bottle body */}
            <rect
              x="24"
              y="32"
              width="52"
              height="56"
              rx="12"
              fill="#94A3B8"
              fillOpacity="0.25"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* Liquid inside */}
            <rect
              x="27"
              y="48"
              width="46"
              height="37"
              rx="9"
              fill={color}
            />
            {/* Label */}
            <rect
              x="30"
              y="42"
              width="40"
              height="20"
              rx="4"
              fill="#FFFFFF"
              stroke={strokeColor}
              strokeWidth="1.2"
            />
            <line
              x1="36"
              y1="49"
              x2="64"
              y2="49"
              stroke="#3B82F6"
              strokeWidth="2.5"
            />
            <line
              x1="36"
              y1="55"
              x2="54"
              y2="55"
              stroke="#94A3B8"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>
    </div>
  );
};

export const VisualDoseIcons: React.FC<{
  shape: PillShape;
  doseAmount: number;
  color: string;
  pillLabel: string;
  halfLabel: string;
  spoonLabel: string;
}> = ({ shape, doseAmount, color, pillLabel, halfLabel, spoonLabel }) => {
  if (shape === "syrup") {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/90 dark:bg-slate-800 border border-blue-200/70 dark:border-slate-700 text-xs font-semibold text-blue-800 dark:text-blue-200">
        <svg viewBox="0 0 36 24" className="w-6 h-5 shrink-0">
          <path
            d="M3 14 C3 19, 14 21, 20 14 L33 14 L33 11 L20 11 C15 11, 3 11, 3 14 Z"
            fill={color}
            stroke="#2563EB"
            strokeWidth="1.8"
          />
        </svg>
        <span className="tabular-nums">
          {doseAmount} {spoonLabel}
        </span>
      </div>
    );
  }

  if (doseAmount === 0.5) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50/90 dark:bg-slate-800 border border-indigo-200/70 dark:border-slate-700 text-xs font-semibold text-indigo-800 dark:text-indigo-200">
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
          <path
            d="M12 3 A9 9 0 0 0 12 21 Z"
            fill={color}
            stroke="#4F46E5"
            strokeWidth="2"
          />
          <path
            d="M12 3 A9 9 0 0 1 12 21 Z"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeDasharray="2,2"
          />
        </svg>
        <span>½ {halfLabel}</span>
      </div>
    );
  }

  const count = Math.max(1, Math.min(4, Math.round(doseAmount)));
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50/90 dark:bg-slate-800 border border-blue-200/70 dark:border-slate-700 text-xs font-semibold text-blue-800 dark:text-blue-200">
      <div className="flex items-center gap-1">
        {Array.from({ length: count }).map((_, idx) => (
          <svg key={idx} viewBox="0 0 20 20" className="w-4 h-4 shrink-0">
            <circle
              cx="10"
              cy="10"
              r="7.5"
              fill={color}
              stroke="#2563EB"
              strokeWidth="2"
            />
          </svg>
        ))}
      </div>
      <span className="tabular-nums">
        {doseAmount} {pillLabel}
      </span>
    </div>
  );
};

export const FoodTimingBadge: React.FC<{
  timing: FoodTiming;
  label: string;
}> = ({ timing, label }) => {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800/60 text-xs font-medium text-emerald-800 dark:text-emerald-200">
      <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="7" />
        {timing === "before_food" ? (
          <path d="M5 12h3M12 5v3" strokeLinecap="round" />
        ) : (
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
      <span>{label}</span>
    </div>
  );
};
