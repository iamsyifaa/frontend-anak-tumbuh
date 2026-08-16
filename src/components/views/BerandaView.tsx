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
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-300 via-sky-200 to-bg-[#f4f7fc] -mx-3 sm:-mx-4 md:-mx-8 -mt-3 sm:-mt-5 md:-mt-8 px-5 sm:px-8 md:px-12 lg:px-16 pt-20 sm:pt-24 md:pt-28 pb-12 sm:pb-14 md:pb-16 font-poppins anim-stagger-1">
      <style>{`
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes float-cloud {
          0%, 100% { transform: translate(0px, 0px); }
          50% { transform: translate(4px, -14px); }
        }
        @keyframes sway-slow {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(6px); }
        }
        .anim-float-slower { animation: float-slower 5.5s ease-in-out infinite; }
        .anim-float-cloud { animation: float-cloud 7s ease-in-out infinite; }
        .anim-sway-slow { animation: sway-slow 6s ease-in-out infinite; }
      `}</style>

      <img
        src="/image/awan.png"
        alt=""
        className="hidden sm:block absolute top-10 left-[6%] w-16 md:w-20 opacity-70 anim-float-cloud pointer-events-none select-none"
      />
      <img
        src="/image/awan.png"
        alt=""
        className="hidden sm:block absolute top-24 left-[20%] w-20 md:w-24 opacity-50 anim-sway-slow pointer-events-none select-none"
      />
      <img
        src="/image/awan.png"
        alt=""
        className="hidden md:block absolute bottom-8 left-[38%] w-24 opacity-40 anim-float-slower pointer-events-none select-none"
      />
      <img
        src="/image/awan.png"
        alt=""
        className="hidden lg:block absolute top-6 right-[40%] w-16 opacity-50 anim-float-cloud pointer-events-none select-none"
        style={{ animationDelay: "1.5s" }}
      />
      <img
        src="/image/awan.png"
        alt=""
        className="absolute top-12 right-[8%] w-14 md:w-18 opacity-60 anim-float-cloud pointer-events-none select-none"
        style={{ animationDelay: "0.5s" }}
      />
      <img
        src="/image/awan.png"
        alt=""
        className="hidden sm:block absolute bottom-10 right-[25%] w-20 opacity-45 anim-sway-slow pointer-events-none select-none"
        style={{ animationDelay: "2.2s" }}
      />
      <img
        src="/image/awan.png"
        alt=""
        className="absolute top-40 left-[2%] w-12 opacity-40 anim-float-slower pointer-events-none select-none"
        style={{ animationDelay: "1.2s" }}
      />

      <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-sky-300/35 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-56 h-56 rounded-full bg-white/80 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8">
        <div className="min-w-0 text-center sm:text-left max-w-2xl">
          <p className="text-base font-semibold text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
            Selamat pagi,
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-800 mt-1 break-words">
            Hai, {studentName}!
          </h1>
          <p className="text-base text-slate-600 mt-3 max-w-md mx-auto sm:mx-0">
            Yuk, terus lakukan{" "}
            <button
              onClick={() => onTabChange("kebiasaan")}
              className="text-sky-600 font-bold hover:underline underline-offset-2"
            >
              7 Kebiasaan Anak Indonesia Hebat
            </button>{" "}
            setiap hari!
          </p>
          <button
            onClick={() => onTabChange("kebiasaan")}
            className="mt-5 inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg shadow-sky-300/50 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
          >
            Isi Kebiasaan Hari Ini
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="relative flex-shrink-0 w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 aspect-square">
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-70"
            style={{
              background:
                "radial-gradient(circle, rgba(186,230,253,0.9) 0%, rgba(224,242,254,0.4) 55%, rgba(224,242,254,0) 75%)",
            }}
          />
          <img
            src="/image/karakter_utama.png"
            alt="Karakter Anak Hebat"
            className="relative z-10 w-full h-full object-contain drop-shadow-xl anim-float-slower"
          />
        </div>
      </div>
    </section>
  );
};
