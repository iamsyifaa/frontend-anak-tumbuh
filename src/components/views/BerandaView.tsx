import React from "react";
import { ArrowRight } from "lucide-react";
import { TabType } from "../../types";
import { useAuth } from "../../context/AuthContext";

interface BerandaViewProps {
  onTabChange: (tab: TabType) => void;
}

export const BerandaView: React.FC<BerandaViewProps> = ({ onTabChange }) => {
  const { user } = useAuth();
  const studentName = user?.name ?? "Siswa";

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-300 via-sky-200 to-[#f4f7fc] -mx-3 sm:-mx-4 md:-mx-8 -mt-3 sm:-mt-5 md:-mt-8 px-5 sm:px-8 md:px-12 lg:px-16 pt-20 sm:pt-24 md:pt-28 pb-12 sm:pb-14 md:pb-16 font-poppins anim-stagger-1">
      {/* Soft breathing blobs — decorative only, never cover the text. */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-sky-300/40 blur-[60px] animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute top-1/3 left-1/4 h-48 w-48 rounded-full bg-white/60 blur-[60px] animate-[pulse_10s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-amber-200/30 blur-[60px] animate-[pulse_9s_ease-in-out_infinite]" />

      <div className="relative z-10 w-full">
        <div className="w-full text-left">
          <p className="text-base font-semibold text-slate-500">Selamat pagi,</p>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-800 break-words md:text-4xl lg:text-5xl">
            Hai, {studentName}!
          </h1>
          <p className="mt-3 w-full max-w-none text-base text-slate-600 sm:max-w-2xl">
            Yuk, terus lakukan{" "}
            <button
              onClick={() => onTabChange("kebiasaan")}
              className="font-bold text-sky-600 underline-offset-2 hover:underline"
            >
              7 Kebiasaan Anak Indonesia Hebat
            </button>{" "}
            setiap hari!
          </p>
          <button
            onClick={() => onTabChange("kebiasaan")}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-300/50 transition-all duration-300 hover:-translate-y-0.5 hover:bg-sky-600 hover:shadow-xl active:translate-y-0"
          >
            Isi Kebiasaan Hari Ini
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
