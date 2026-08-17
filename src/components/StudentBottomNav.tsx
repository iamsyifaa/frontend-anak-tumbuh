import React from "react";
import { Home, CheckSquare, Trophy, Medal } from "lucide-react";
import { TabType } from "../types";

interface StudentBottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  rankingEnabled?: boolean;
}

export const StudentBottomNav: React.FC<StudentBottomNavProps> = ({
  activeTab,
  setActiveTab,
  rankingEnabled = false,
}) => {
  const items = [
    { id: "beranda" as TabType, label: "Beranda", icon: Home },
    { id: "kebiasaan" as TabType, label: "Laporan Harian", icon: CheckSquare },
    { id: "pencapaian" as TabType, label: "Pencapaian", icon: Trophy },
    ...(rankingEnabled ? [{ id: "ranking" as TabType, label: "Papan Juara", icon: Medal }] : []),
  ];

  return (
    <nav
      aria-label="Navigasi siswa"
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-white/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-3xl border-t border-slate-100 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex w-full max-w-md items-stretch justify-around gap-1">
        {items.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 text-[10px] font-extrabold transition-colors ${
                active ? "text-sky-500" : "text-slate-400"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                  active ? "bg-sky-50 text-sky-500" : "text-slate-400"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="max-w-full truncate">{label}</span>
              {active && <span className="absolute bottom-0 h-1 w-8 rounded-full bg-sky-500" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
