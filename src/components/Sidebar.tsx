import React from "react";
import { TabType } from "../types";
import { Home, CheckSquare, Trophy, Medal, Flame } from "lucide-react";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currentPoints: number;
  currentStreak: number;
  remainingChances: number;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  rankingEnabled?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentPoints,
  currentStreak,
  remainingChances,
  isMobileOpen,
  setIsMobileOpen,
  rankingEnabled = false,
}) => {
  const menuItems = [
    { id: "beranda" as TabType, label: "Beranda", icon: Home },
    { id: "kebiasaan" as TabType, label: "Laporan Harian", icon: CheckSquare },
    { id: "pencapaian" as TabType, label: "Pencapaian", icon: Trophy },
    ...(rankingEnabled ? [{ id: "ranking" as TabType, label: "Papan Juara", icon: Medal }] : []),
  ];

  return (
    <>
      {isMobileOpen && <button type="button" aria-label="Tutup menu" onClick={() => setIsMobileOpen?.(false)} className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px] md:hidden" />}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col justify-between bg-[#232852] text-white md:flex">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 flex items-center gap-2">
            <h1 className="font-extrabold text-2xl tracking-tight font-heading"><span className="text-white">anak</span><span className="text-[#A4C1FD]">tumbuh</span><span className="text-[#EEB541]">.id</span></h1>
          </div>

          <div className="mx-6 mb-6 px-4 py-3 bg-white/5 rounded-2xl flex items-center gap-2 text-xs font-bold text-[#A4C1FD] border border-white/10 shadow-sm">
            <Flame className={`w-4 h-4 flex-shrink-0 ${remainingChances > 0 ? "text-[#EEB541]" : "text-slate-500"}`} />
            <span>{currentStreak} hari beruntun • {currentPoints} poin</span>
          </div>

          <nav className="px-4">
            <p className="px-4 text-[11px] uppercase tracking-wider font-extrabold text-slate-400 mb-3">Menu Utama</p>
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileOpen?.(false); }} className={`group w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${isActive ? "bg-[#3A72E3] text-white shadow-md shadow-[#3A72E3]/20" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}>
                  <div className={`transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}><Icon className="w-5 h-5 flex-shrink-0" /></div>
                  <span className={`transition-transform duration-300 ${isActive ? "" : "group-hover:translate-x-1"}`}>{item.label}</span>
                </button>;
              })}
            </div>
          </nav>
        </div>

        <div className="p-4 sm:p-5">
          <div className="relative min-h-[190px] overflow-hidden rounded-[1.75rem] border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_12px_40px_rgba(2,132,199,0.22)]">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400/30 via-blue-500/20 to-indigo-500/30" />
            <div className="absolute -top-12 -right-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
            <div className="relative z-10 px-4 pt-4 text-center">
              <p className="text-sm font-extrabold text-white leading-tight">Anak Hebat, Indonesia Kuat!</p>
              <p className="text-[11px] text-sky-100 leading-snug font-medium mt-1">Jadilah versi terbaik dirimu setiap hari.</p>
            </div>
            <img src="/image/karakter_utama.png" alt="Anak Hebat Indonesia Kuat" className="absolute left-1/2 bottom-[-18px] w-40 h-40 -translate-x-1/2 object-contain drop-shadow-xl" />
          </div>
          <p className="text-[10px] text-slate-500 mt-4 text-center font-semibold">© 2026 anaktumbuh.id — Semua hak dilindungi</p>
        </div>
      </aside>
    </>
  );
};
