import React, { useState } from "react";
import { Habit, InitiativeType } from "../../types";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Check,
  ArrowLeft,
  HelpCircle,
  AlertCircle,
} from "lucide-react";

interface IsiKebiasaanViewProps {
  habits: Habit[];
  onCompleteHabit: (
    habitId: string,
    initiative: InitiativeType,
    reflection: string,
  ) => void;
}

export const IsiKebiasaanView: React.FC<IsiKebiasaanViewProps> = ({
  habits,
  onCompleteHabit,
}) => {
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  // State untuk form pengisian (halaman baru)
  const [initiative, setInitiative] = useState<InitiativeType>("Sadar Sendiri");
  const [reflection, setReflection] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const getIllustrationKey = (habitTitle: string): string => {
    const title = habitTitle.toLowerCase();
    if (title.includes("bangun")) return "bangun tidur";
    if (title.includes("ibadah") || title.includes("doa")) return "berdoa";
    if (title.includes("olahraga") || title.includes("fisik"))
      return "bermain bola";
    if (title.includes("makan") || title.includes("gizi")) return "makan";
    if (title.includes("belajar") || title.includes("baca")) return "baca buku";
    if (title.includes("bantu") || title.includes("masyarakat"))
      return "menyapu";
    if (title.includes("tidur")) return "tidur";
    return "karakter_utama";
  };

  const completedCount = habits.filter((h) => h.isLocked).length;

  const handleBackToList = () => {
    setSelectedHabit(null);
    setInitiative("Sadar Sendiri");
    setReflection("");
    setErrorMsg("");
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initiative) {
      setErrorMsg("Pilih salah satu inisiatif (Sadar Sendiri atau Disuruh).");
      return;
    }

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#38bdf8", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6"],
    });

    if (selectedHabit) {
      onCompleteHabit(selectedHabit.id, initiative, reflection);
    }
    handleBackToList();
  };

  // ==========================================
  // TAMPILAN HALAMAN FORM PENGISIAN (BARU)
  // ==========================================
  if (selectedHabit) {
    const illustrationKey = getIllustrationKey(selectedHabit.title);

    return (
      <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
        {/* Tombol Kembali */}
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 text-slate-500 hover:text-sky-600 font-bold bg-white px-4 py-2 rounded-full shadow-sm w-max transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Misi</span>
        </button>

        {/* Header Halaman Form */}
        <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-sky-100 border-4 border-white">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left border-b-2 border-sky-50 pb-6">
            <div className="w-32 h-32 flex-shrink-0 flex items-center justify-center bg-sky-50 rounded-[2rem] p-2 border-2 border-sky-100">
              <img
                src={`/image/${encodeURIComponent(illustrationKey)}.png`}
                alt={selectedHabit.title}
                className="w-full h-full object-contain drop-shadow-md animate-float-slow"
              />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-sky-700 bg-sky-100 px-3 py-1 rounded-full">
                Form Misi Kebaikan
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-3">
                {selectedHabit.title}
              </h2>
              <p className="text-slate-500 mt-2 font-medium leading-relaxed">
                {selectedHabit.description}
              </p>
            </div>
          </div>

          {/* Habit Info Tag */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 py-6">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
              <Clock className="w-5 h-5 text-sky-500" />
              <span className="text-sm font-bold text-slate-700">
                Target: {selectedHabit.timeTarget}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-bold text-slate-700">
                +{selectedHabit.points} Poin Karakter
              </span>
            </div>
          </div>

          {/* Form Pengisian */}
          <form onSubmit={handleSubmitForm} className="space-y-6">
            {/* Pilihan Inisiatif */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-700">
                <span>1. Inisiatif Pengisian (WAJIB)</span>
                <span className="text-rose-500">*</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label
                  className={`p-5 rounded-2xl border-4 cursor-pointer flex items-center space-x-4 transition-all ${
                    initiative === "Sadar Sendiri"
                      ? "border-sky-400 bg-sky-50 text-sky-900 shadow-lg shadow-sky-100 scale-102"
                      : "border-slate-100 bg-white hover:border-sky-200 text-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="initiative"
                    value="Sadar Sendiri"
                    checked={initiative === "Sadar Sendiri"}
                    onChange={() => {
                      setInitiative("Sadar Sendiri");
                      setErrorMsg("");
                    }}
                    className="w-5 h-5 text-sky-500 focus:ring-sky-500"
                  />
                  <div>
                    <p className="text-base font-extrabold flex items-center gap-1.5">
                      <span>Sadar Sendiri</span> ⭐
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Melakukan atas kemauan sendiri
                    </p>
                  </div>
                </label>

                <label
                  className={`p-5 rounded-2xl border-4 cursor-pointer flex items-center space-x-4 transition-all ${
                    initiative === "Disuruh"
                      ? "border-amber-400 bg-amber-50 text-amber-900 shadow-lg shadow-amber-100 scale-102"
                      : "border-slate-100 bg-white hover:border-amber-200 text-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="initiative"
                    value="Disuruh"
                    checked={initiative === "Disuruh"}
                    onChange={() => {
                      setInitiative("Disuruh");
                      setErrorMsg("");
                    }}
                    className="w-5 h-5 text-amber-500 focus:ring-amber-500"
                  />
                  <div>
                    <p className="text-base font-extrabold flex items-center gap-1.5">
                      <span>Disuruh</span> 👨‍👩‍👧
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Diingatkan oleh orang tua/guru
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Catatan Cerita */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-700">
                <HelpCircle className="w-5 h-5 text-sky-500" />
                <span>2. Catatan Pengalaman & Cerita (Opsional)</span>
              </label>
              <textarea
                rows={4}
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Ceritakan pengalamanmu hari ini... (Contoh: Aku bangun pagi tepat jam 05:00 dan langsung wudhu!)"
                className="w-full p-4 rounded-2xl border-2 border-sky-100 bg-sky-50/50 text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400 transition-all resize-none"
              ></textarea>
            </div>

            {errorMsg && (
              <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl text-sm font-bold text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Tombol Kirim Utama */}
            <button
              type="submit"
              className="w-full py-4 text-sm font-black text-white bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 rounded-2xl shadow-xl shadow-sky-200/80 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-6 h-6" />
              <span>Simpan Misi Kebaikan! 🎉</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // TAMPILAN GRID UTAMA (DAFTAR MISI)
  // ==========================================
  return (
    <div className="space-y-7 animate-fade-in pb-12">
      {/* View Header Info */}
      <div className="bg-gradient-to-r from-sky-400 via-sky-500 to-blue-500 rounded-[2.5rem] p-6 md:p-8 border-4 border-white shadow-2xl shadow-sky-200/80 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black text-white border border-white/30 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span>Misi 7 Kebiasaan Anak Hebat</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white">
            Isi Kebiasaan Kebaikanmu! 🎯
          </h2>
          <p className="text-xs md:text-sm text-sky-100 font-semibold leading-relaxed">
            Klik kartu kebiasaan yang telah kamu laksanakan untuk mencatat
            jurnal harian dan dapatkan bintang karakter!
          </p>
        </div>

        <div className="flex items-center space-x-4 bg-white/20 backdrop-blur-md p-4 rounded-3xl border-2 border-white/40 shadow-lg relative z-10 flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md border-2 border-white animate-bounce">
            {completedCount}/7
          </div>
          <div>
            <p className="text-sm font-black text-white">Target Hari Ini</p>
            <p className="text-xs font-bold text-sky-100">
              {completedCount === 7
                ? "🎉 Hebat! Semua Misi Selesai!"
                : `${7 - completedCount} kebiasaan lagi!`}
            </p>
          </div>
        </div>
      </div>

      {/* GRID 7 KARTU KEBIASAAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits.map((habit, index) => {
          const illustrationKey = getIllustrationKey(habit.title);
          const isLocked = habit.isLocked;

          return (
            <div
              key={habit.id}
              onClick={() => {
                if (!isLocked) {
                  setSelectedHabit(habit);
                }
              }}
              className={`relative rounded-[2rem] p-6 border-4 border-white transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl ${
                isLocked
                  ? "bg-slate-50 border-slate-100/90 cursor-not-allowed shadow-sm"
                  : "bg-white shadow-sky-100/70 hover:shadow-2xl hover:shadow-sky-200/80 cursor-pointer hover:-translate-y-2 hover:scale-105 active:scale-95 group"
              }`}
            >
              <div>
                {/* 
                  Gambar Karakter - Box/Background Dihapus 
                  Gambar sekarang mengambang bebas dengan efek drop-shadow
                */}
                <div className="w-full h-40 mb-4 flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-110">
                  <img
                    src={`/image/${encodeURIComponent(illustrationKey)}.png`}
                    alt={habit.title}
                    className={`w-32 h-32 object-contain drop-shadow-xl ${
                      isLocked ? "opacity-50 grayscale" : ""
                    }`}
                  />
                </div>

                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100 block w-max mb-2">
                      #{index + 1} {habit.category}
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-800 tracking-tight leading-snug">
                      {habit.title}
                    </h3>
                  </div>

                  {isLocked ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-300 flex-shrink-0">
                      <Check className="w-4 h-4 text-emerald-600" /> Selesai
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-300 to-yellow-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-sm border border-white flex-shrink-0">
                      +{habit.points} ⭐
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 leading-relaxed mb-4 font-medium line-clamp-2">
                  {habit.description}
                </p>
              </div>

              <div className="pt-4 border-t-2 border-slate-50 flex items-center justify-between text-xs font-bold mt-auto">
                <span className="flex items-center gap-1.5 text-slate-400 text-[11px] font-extrabold">
                  <Clock className="w-4 h-4 text-sky-400" /> {habit.timeTarget}
                </span>

                {isLocked ? (
                  <div className="flex items-center space-x-1 text-emerald-700 font-black bg-emerald-50 px-3 py-1.5 rounded-xl text-xs border border-emerald-100">
                    <span>{habit.initiative || "Mandiri"}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="bg-sky-100 text-sky-600 hover:bg-sky-500 hover:text-white px-4 py-2 rounded-xl font-black text-xs transition-colors flex items-center gap-1 group-hover:bg-sky-500 group-hover:text-white"
                  >
                    <span>Isi Sekarang ✍️</span>
                  </button>
                )}
              </div>

              {isLocked && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                  <CheckCircle2 className="w-48 h-48 text-emerald-900" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
