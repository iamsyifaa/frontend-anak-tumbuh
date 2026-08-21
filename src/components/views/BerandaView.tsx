import React from "react";
import { ArrowRight } from "lucide-react";
import { TabType } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { StudentDashboardAggregate } from "../../types/studentDashboard";

interface BerandaViewProps {
  onTabChange: (tab: TabType) => void;
  data?: StudentDashboardAggregate | null;
}

export const BerandaView: React.FC<BerandaViewProps> = ({
  onTabChange,
  data,
}) => {
  const { user } = useAuth();
  const studentName = data?.student.name ?? user?.name ?? "Siswa";

  return (
    <div className="relative overflow-hidden px-5 pb-12 pt-24 sm:px-8 sm:pt-28 md:px-12 md:pb-16 md:pt-28 lg:px-16">
      <div className="pointer-events-none absolute -right-40 -top-24 h-[26rem] w-[26rem] rounded-full bg-white/70 blur-[110px]" />
      <div className="pointer-events-none absolute -left-24 top-1/2 h-80 w-80 rounded-full bg-white/35 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-[26rem] w-[26rem] rounded-full bg-[#EEB541]/10 blur-[110px]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="w-full text-left">
          <p className="text-base font-semibold text-slate-600">
            Selamat pagi,
          </p>
          <h1 className="mt-1 break-words text-3xl font-extrabold text-black md:text-4xl lg:text-5xl">
            Hai, {studentName}!
          </h1>
          <p className="mt-3 w-full text-base text-slate-700 sm:max-w-2xl">
            Yuk, terus lakukan{" "}
            <button
              type="button"
              onClick={() => onTabChange("kebiasaan")}
              className="font-bold text-[#3A72E3] underline-offset-2 hover:underline"
            >
              7 Kebiasaan Anak Indonesia Hebat
            </button>{" "}
            setiap hari!
          </p>
          <button
            type="button"
            onClick={() => onTabChange("kebiasaan")}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#3A72E3] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#3A72E3]/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
          >
            Isi Kebiasaan Hari Ini
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BerandaView;
