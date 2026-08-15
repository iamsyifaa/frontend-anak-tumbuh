import React from "react";
import { Award, BarChart3, Star, Trophy } from "lucide-react";
import { GamificationSummary as Summary } from "../../types/pointConfiguration";

interface Props { summary: Summary; compact?: boolean; }
export const GamificationSummary: React.FC<Props> = ({ summary, compact = false }) => {
  const cards = [
    { label: "Poin", value: summary.points.toLocaleString("id-ID"), icon: Trophy, note: "Sumber ranking" },
    { label: "EXP", value: summary.exp.toLocaleString("id-ID"), icon: Star, note: "Progress level" },
    { label: "Level", value: `Lv. ${summary.level}`, icon: Award, note: "Ditentukan backend" },
    { label: "Ranking", value: summary.rank == null ? "—" : `#${summary.rank}`, icon: BarChart3, note: "Berdasarkan Poin" },
  ];
  return <div className={`grid gap-3 ${compact ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"}`}>
    {cards.map(({ label, value, icon: Icon, note }) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">{label}</span><Icon className="h-4 w-4 text-sky-500" /></div><p className="mt-2 text-2xl font-black text-slate-900">{value}</p><p className="mt-1 text-[11px] font-semibold text-slate-500">{note}</p></div>)}
  </div>;
};
