import React from "react";

interface CardDashboardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  accent?: "cyan" | "emerald" | "indigo" | "amber";
}

export default function CardDashboard({
  title,
  icon,
  value,
  subtitle = "Current metrics",
  accent = "cyan",
}: CardDashboardProps) {
  const accentStyles = {
    cyan: {
      border: "hover:border-cyan-500/40",
      glow: "hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.2)]",
      badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      light: "from-cyan-500/10 via-transparent to-transparent",
    },
    emerald: {
      border: "hover:border-emerald-500/40",
      glow: "hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.2)]",
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      light: "from-emerald-500/10 via-transparent to-transparent",
    },
    indigo: {
      border: "hover:border-indigo-500/40",
      glow: "hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.2)]",
      badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      light: "from-indigo-500/10 via-transparent to-transparent",
    },
    amber: {
      border: "hover:border-amber-500/40",
      glow: "hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.2)]",
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      light: "from-amber-500/10 via-transparent to-transparent",
    },
  }[accent];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#10131c]/90 border border-neutral-800/90 p-6 flex flex-col justify-between h-40 transition-all duration-300 backdrop-blur-xl group ${accentStyles.border} ${accentStyles.glow}`}
    >
      {/* Subtle top gradient glow */}
      <div
        className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${accentStyles.light} pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity`}
      />

      <div className="flex items-start justify-between z-10">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            {title}
          </span>
          <p className="text-[11px] text-neutral-300 mt-0.5">{subtitle}</p>
        </div>
        <div
          className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${accentStyles.badge}`}
        >
          {icon}
        </div>
      </div>

      <div className="z-10 mt-auto">
        <h3 className="text-2xl font-bold tracking-tight text-white group-hover:text-white transition-colors">
          {value}
        </h3>
      </div>
    </div>
  );
}