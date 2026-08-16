import React from "react";
import { TabType } from "../types";
import { Menu, Bell, ChevronDown } from "lucide-react";
import { AvatarBadge } from "./AvatarBadge";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  activeTab: TabType;
  currentStreak: number;
  remainingChances: number;
  currentPoints: number;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ isMobileOpen, setIsMobileOpen, activeTab }) => {
  const { user } = useAuth();
  const studentName = user?.name ?? "Siswa";

  return (
    <header className="absolute top-0 left-0 w-full z-30 bg-transparent px-4 md:px-8 py-4 md:py-6 flex items-center justify-between pointer-events-none">
      <div className="pointer-events-auto">
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="md:hidden p-2.5 rounded-full bg-white shadow-sm text-slate-700 hover:bg-slate-50 focus:outline-none" aria-label="Toggle Menu">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-3 bg-white rounded-[2rem] px-2 sm:px-4 py-1.5 sm:py-2 shadow-[0_4px_20px_rgba(186,230,253,0.4)] border border-white pointer-events-auto ml-auto">
        <button className="relative p-2 rounded-full hover:bg-sky-50 text-slate-500 hover:text-sky-600 transition-colors" title="Notifikasi">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>
        <div className="hidden sm:block w-px h-8 bg-slate-100 mx-1" />
        <button className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-slate-50 transition-colors group" title={activeTab === "beranda" ? "Profil siswa" : "Profil siswa"}>
          <AvatarBadge name={studentName} avatarUrl={user?.avatarUrl} size="md" showOnlineStatus={true} />
          <div className="hidden sm:block text-left">
            <p className="text-sm font-extrabold text-slate-800 leading-tight group-hover:text-sky-600 transition-colors">{studentName}</p>
            <p className="text-xs text-slate-500 leading-tight font-medium">Siswa {user?.classId ? "Kelas VIII-B" : ""}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block group-hover:text-sky-500 transition-colors" />
        </button>
      </div>
    </header>
  );
};
