import React, { useState } from "react";
import { TabType, Habit, ActivityHistory } from "../../types";
import {
  ArrowRight,
  ArrowLeft,
  Calendar,
  Check,
  Circle,
  Lightbulb,
  Minus,
  Plus,
  RotateCcw,
  Flame,
  MessageCircle,
  Send,
} from "lucide-react";

interface BerandaViewProps {
  currentPoints: number;
  currentStreak: number;
  remainingChances: number;
  habits: Habit[];
  histories: ActivityHistory[];
  onTabChange: (tab: TabType) => void;
  onUpdateStreakChances: (delta: number) => void;
  onResetStreakChances: () => void;
}

interface CommentItem {
  id: string;
  author: "siswa" | "wali";
  name: string;
  text: string;
  time: string;
}

const STUDENT_NAME = "Ahmad Rizky";

const getIllustrationKey = (index: number): string => {
  switch (index) {
    case 0:
      return "bangun tidur";
    case 1:
      return "berdoa";
    case 2:
      return "bermain bola";
    case 3:
      return "makan";
    case 4:
      return "baca buku";
    case 5:
      return "menyapu";
    case 6:
      return "tidur";
    default:
      return "karakter_utama";
  }
};

const cardStyles = [
  { bg: "bg-amber-50", badge: "bg-amber-400" },
  { bg: "bg-emerald-50", badge: "bg-emerald-400" },
  { bg: "bg-sky-50", badge: "bg-sky-400" },
  { bg: "bg-orange-50", badge: "bg-orange-400" },
  { bg: "bg-violet-50", badge: "bg-violet-400" },
  { bg: "bg-rose-50", badge: "bg-rose-400" },
  { bg: "bg-teal-50", badge: "bg-teal-400" },
];

export const BerandaView: React.FC<BerandaViewProps> = ({
  currentPoints,
  currentStreak,
  remainingChances,
  habits,
  histories,
  onTabChange,
  onUpdateStreakChances,
  onResetStreakChances,
}) => {
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);
  // Digabung jadi satu baris — pemecahan generic ke banyak baris sebelumnya
  // memicu error parser TypeScript di file .tsx
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>(
    {},
  );
  const [commentsByHabit, setCommentsByHabit] = useState<
    Record<string, CommentItem[]>
  >({});

  const completedCount = habits.filter((h) => h.isLocked).length;
  const totalCount = habits.length;
  const scorePercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (scorePercent / 100) * circumference;

  const recentHistories = histories.slice(0, 5);

  const toggleCommentThread = (habitId: string) => {
    setExpandedHabitId((prev) => (prev === habitId ? null : habitId));
  };

  const handleAddComment = (habitId: string) => {
    const text = (commentDrafts[habitId] || "").trim();
    if (!text) return;

    const newComment: CommentItem = {
      id: `${habitId}-${Date.now()}`,
      author: "siswa",
      name: STUDENT_NAME,
      text,
      time: "Baru saja",
    };

    setCommentsByHabit((prev) => ({
      ...prev,
      [habitId]: [...(prev[habitId] || []), newComment],
    }));
    setCommentDrafts((prev) => ({ ...prev, [habitId]: "" }));
  };

  return (
    <div className="w-full min-w-0 space-y-6 anim-page-fade-in pb-12">
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
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
        @keyframes page-fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes card-fade-in {
          0% { opacity: 0; transform: translateY(14px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .anim-float-slow { animation: float-slow 4s ease-in-out infinite; }
        .anim-float-slower { animation: float-slower 5.5s ease-in-out infinite; }
        .anim-float-cloud { animation: float-cloud 7s ease-in-out infinite; }
        .anim-sway-slow { animation: sway-slow 6s ease-in-out infinite; }
        .anim-page-fade-in { animation: page-fade-in 0.6s ease-out both; }
        .anim-card-fade-in { animation: card-fade-in 0.5s ease-out both; }
      `}</style>

      {/* Greeting Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-100 via-sky-50 to-blue-50 -mx-4 sm:-mx-6 md:-mx-8 -mt-4 sm:-mt-6 md:-mt-8 px-5 sm:px-8 md:px-12 lg:px-16 py-8 sm:py-10 md:py-12 font-poppins">
        {/* Kumpulan Awan yang Diperbanyak */}
        <img
          src="/image/awan.png"
          alt=""
          className="hidden sm:block absolute top-10 md:top-12 left-[6%] w-16 md:w-20 opacity-70 anim-float-cloud pointer-events-none select-none"
        />
        <img
          src="/image/awan.png"
          alt=""
          className="hidden sm:block absolute top-24 md:top-28 left-[20%] w-20 md:w-24 opacity-50 anim-sway-slow pointer-events-none select-none"
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
        {/* Awan Tambahan Baru */}
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

        {/* Decorative glow blobs */}
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-sky-200/40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-amber-100/40 blur-3xl pointer-events-none" />

        {/* Tambahan pt-14 md:pt-16 di sini agar seluruh teks dan karakter turun menjauhi header */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 pt-14 md:pt-16">
          <div className="min-w-0 text-center sm:text-left">
            <p className="text-base font-semibold text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
              Selamat pagi, <span className="text-xl">👋</span>
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-800 mt-1 break-words">
              Hai, Ahmad Rizky!
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
              className="mt-5 inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg shadow-sky-300/50 hover:shadow-xl hover:shadow-sky-300/60 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
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
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8 items-start">
        {/* Laporan Harian - 7 Kebiasaan */}
        <div className="min-w-0 lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 md:p-7 shadow-xl shadow-sky-100/60 anim-card-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h3 className="text-lg font-extrabold text-slate-800">
              Laporan Harian - 7 Kebiasaan
            </h3>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 flex-shrink-0">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Hari Ini</span>
              <button className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
            {habits.map((habit, index) => {
              const illustrationKey = getIllustrationKey(index);
              const isDone = habit.isLocked;
              const style = cardStyles[index % cardStyles.length];
              const isThreadOpen = expandedHabitId === habit.id;
              const thread = commentsByHabit[habit.id] || [];

              return (
                <div
                  key={habit.id}
                  onClick={() => onTabChange("kebiasaan")}
                  style={{ animationDelay: `${index * 80}ms` }}
                  className={`relative min-w-0 rounded-3xl ${style.bg} p-4 pt-6 cursor-pointer shadow-md shadow-sky-100/50 hover:shadow-xl hover:shadow-sky-200/60 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 group overflow-hidden anim-card-fade-in`}
                >
                  <span
                    className={`absolute top-3 left-3 z-20 w-7 h-7 rounded-full ${style.badge} text-white text-xs font-black flex items-center justify-center border-2 border-white shadow-sm`}
                  >
                    {index + 1}
                  </span>

                  {isDone && (
                    <span className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-sm">
                      <Check className="w-4 h-4" />
                    </span>
                  )}

                  <div className="flex items-center justify-center h-28 sm:h-32 md:h-36">
                    <img
                      src={`/image/${encodeURIComponent(illustrationKey)}.png`}
                      alt={habit.title}
                      className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>

                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 mt-3 -mx-1">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-0.5 truncate">
                      {habit.category}
                    </p>
                    <h4 className="text-sm font-extrabold text-slate-800 leading-snug break-words mb-1.5">
                      {habit.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-2.5 line-clamp-2 break-words">
                      {habit.description}
                    </p>
                    <div className="flex items-center justify-between text-xs gap-2">
                      {isDone ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold min-w-0 truncate">
                          <Check className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">
                            {habit.initiative || "Mandiri"}
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 font-semibold">
                          <Circle className="w-3.5 h-3.5 flex-shrink-0" />
                          Belum diisi
                        </span>
                      )}
                      <span className="font-black text-amber-600 bg-amber-100 rounded-full px-2.5 py-1 flex-shrink-0 shadow-sm shadow-amber-200/70">
                        +{habit.points} ⭐
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCommentThread(habit.id);
                    }}
                    className={`mt-2.5 w-full flex items-center justify-center gap-1.5 text-xs font-bold rounded-full py-1.5 transition-colors ${
                      isThreadOpen
                        ? "bg-sky-500 text-white"
                        : "bg-white/80 text-sky-600 hover:bg-sky-100 border border-sky-100"
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>
                      Komentar{thread.length > 0 ? ` (${thread.length})` : ""}
                    </span>
                  </button>

                  {isThreadOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 bg-white rounded-2xl border border-slate-100 p-3 space-y-3 animate-fade-in shadow-inner"
                    >
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                        Thread Komentar · {habit.title}
                      </p>

                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {thread.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-4 leading-relaxed">
                            Belum ada komentar.
                            <br />
                            Yuk mulai diskusi dengan Wali Kelas!
                          </p>
                        ) : (
                          thread.map((c) => (
                            <div
                              key={c.id}
                              className={`flex ${c.author === "siswa" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${
                                  c.author === "siswa"
                                    ? "bg-sky-500 text-white rounded-br-sm"
                                    : "bg-slate-50 border border-slate-200 text-slate-700 rounded-bl-sm"
                                }`}
                              >
                                <p
                                  className={`text-[10px] font-bold mb-0.5 ${
                                    c.author === "siswa"
                                      ? "text-sky-100"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {c.name}
                                </p>
                                <p className="leading-relaxed break-words">
                                  {c.text}
                                </p>
                                <p
                                  className={`text-[9px] mt-1 ${
                                    c.author === "siswa"
                                      ? "text-sky-100/80"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {c.time}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleAddComment(habit.id);
                        }}
                        className="flex items-center gap-2 pt-1"
                      >
                        <input
                          value={commentDrafts[habit.id] || ""}
                          onChange={(e) =>
                            setCommentDrafts((prev) => ({
                              ...prev,
                              [habit.id]: e.target.value,
                            }))
                          }
                          placeholder="Tulis komentar..."
                          className="flex-1 min-w-0 text-xs px-3 py-2 rounded-full border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all"
                        />
                        <button
                          type="submit"
                          disabled={!commentDrafts[habit.id]?.trim()}
                          className="w-8 h-8 flex-shrink-0 rounded-full bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:hover:bg-sky-500 text-white flex items-center justify-center transition-colors"
                          title="Kirim komentar"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tips Hebat */}
          <div className="mt-6 flex items-center gap-4 bg-amber-50 rounded-2xl p-5 shadow-md shadow-amber-100/60 anim-card-fade-in">
            <Lightbulb className="w-9 h-9 text-amber-500 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-slate-800 mb-0.5">
                Tips Hebat
              </p>
              <p className="text-xs text-slate-600 leading-relaxed break-words">
                Kebiasaan yang dilakukan mandiri akan membentuk karakter hebat!
                Terus semangat ya, Ahmad!
              </p>
            </div>
            <img
              src="/image/mengacungkan%20jempol.png"
              alt="Maskot memberi jempol"
              className="w-24 h-24 object-contain flex-shrink-0 hidden sm:block"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full min-w-0 space-y-6">
          {/* Ringkasan Hari Ini */}
          <div className="w-full min-w-0 rounded-3xl p-[2px] bg-gradient-to-r from-amber-300 via-pink-300 to-sky-300 shadow-xl shadow-sky-100/60 anim-card-fade-in">
            <div className="relative overflow-hidden bg-white rounded-[calc(1.5rem-2px)] p-5 sm:p-6">
              <h3 className="text-sm font-extrabold text-indigo-600 mb-5">
                Ringkasan Hari Ini
              </h3>
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 aspect-square flex-shrink-0">
                  <svg
                    className="w-full h-full -rotate-90"
                    viewBox="0 0 128 128"
                  >
                    <circle
                      cx="64"
                      cy="64"
                      r={radius}
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="10"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r={radius}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl sm:text-3xl font-black text-slate-800">
                      {scorePercent}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Skor Hebat
                    </span>
                  </div>
                </div>

                <div className="min-w-0 flex flex-col items-center text-center">
                  <img
                    src="/image/bintang.png"
                    alt=""
                    className="w-16 h-auto sm:w-[4.5rem] object-contain pointer-events-none select-none"
                  />
                  <p className="text-base font-extrabold text-amber-500 mt-1">
                    Hebat! 😊
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1 break-words">
                    Pertahankan kebiasaan baikmu!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Penguatan Positif */}
          <div className="w-full min-w-0 bg-emerald-50 rounded-3xl p-5 flex items-start gap-3 shadow-md shadow-emerald-100/60 anim-card-fade-in">
            <img
              src="/image/bintang.png"
              alt="Bintang"
              className="w-16 h-16 object-contain flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-emerald-800 mb-1">
                Penguatan Positif
              </p>
              <p className="text-xs text-emerald-700 leading-relaxed break-words">
                Kamu sudah melakukan {completedCount} dari {totalCount}{" "}
                kebiasaan hari ini!{" "}
                {completedCount === totalCount
                  ? "Luar biasa!"
                  : "Terus semangat!"}
              </p>
            </div>
          </div>

          {/* Riwayat Aktivitas */}
          <div className="w-full min-w-0 bg-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-sky-100/60 anim-card-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-slate-800">
                Riwayat Aktivitas
              </h3>
              <button className="text-xs font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-full px-3 py-1.5 transition-colors duration-300">
                Lihat Semua
              </button>
            </div>

            {recentHistories.length > 0 ? (
              <div className="space-y-2">
                {recentHistories.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs py-2.5 border-b border-slate-50 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-700 truncate">
                        {item.date}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {item.habitTitle}
                      </p>
                    </div>
                    <span className="flex-shrink-0 ml-2 w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center text-[11px] shadow-sm shadow-emerald-200/70">
                      {item.pointsEarned}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">
                Belum ada riwayat aktivitas.
              </p>
            )}
          </div>

          {/* Streak Widget */}
          <div className="w-full min-w-0 bg-white rounded-3xl p-5 shadow-xl shadow-sky-100/60 anim-card-fade-in">
            <div className="flex items-center gap-2 min-w-0">
              <Flame
                className={`w-5 h-5 flex-shrink-0 ${
                  remainingChances > 0 ? "text-amber-500" : "text-slate-300"
                }`}
              />
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-slate-800 truncate">
                  {currentStreak} Hari Beruntun
                </p>
                <p className="text-[11px] text-amber-600 font-bold bg-amber-50 inline-block px-2 py-0.5 rounded-full mt-0.5">
                  Kesempatan: {remainingChances}/7
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
