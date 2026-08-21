import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, CheckSquare, Trophy, Medal, UserRound } from "lucide-react";
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
  const navigate = useNavigate();

  const items = [
    { id: "beranda" as TabType, label: "Beranda", icon: Home },
    { id: "kebiasaan" as TabType, label: "Laporan", icon: CheckSquare },
    { id: "pencapaian" as TabType, label: "Pencapaian", icon: Trophy },
    ...(rankingEnabled ? [{ id: "ranking" as TabType, label: "Papan Juara", icon: Medal }] : []),
    { id: "profile" as const, label: "Profil", icon: UserRound },
  ];

  return (
    <nav
      aria-label="Navigasi siswa"
      className="fixed bottom-6 left-1/2 z-50 flex w-[calc(100%-2rem)] -translate-x-1/2 items-center rounded-full border border-[#A4C1FD]/40 bg-white px-2 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.1)] md:hidden"
    >
      <div className="flex w-full items-center justify-around gap-1">
        {items.map(({ id, label, icon: Icon }) => {
          const isProfile = id === "profile";
          const active = isProfile ? false : activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                if (isProfile) {
                  navigate("/dashboard/siswa/profile");
                  return;
                }
                setActiveTab(id as TabType);
              }}
              aria-current={active ? "page" : undefined}
              className={`group flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[9px] font-black transition-all ${
                active ? "text-[#3A72E3]" : "text-slate-400"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                  active ? "-translate-y-2 bg-[#A4C1FD]/30" : "bg-transparent"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-[#3A72E3]" : "text-slate-400"}`} />
              </span>
              <span className={active ? "-mt-2" : ""}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
