import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  HelpCircle,
  Loader2,
  Sparkles,
  Lock,
  RefreshCw,
  Lightbulb,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Habit, HabitIndicator } from "../../types/habitConfiguration";
import { StudentActivityComment } from "../../types/studentDashboard";
import { habitSubmissionService } from "../../services/habitSubmissionService";
import { INITIAL_HISTORIES } from "../../data/mockData";
import { studentDashboardService } from "../../services/studentDashboardService";

interface IsiKebiasaanViewProps {}
type Answers = Record<string, string>;

const illustrationFor = (title: string) => {
  const value = title.toLowerCase();
  if (value.includes("bangun")) return "bangun tidur";
  if (value.includes("ibadah") || value.includes("doa")) return "berdoa";
  if (value.includes("olahraga") || value.includes("fisik"))
    return "bermain bola";
  if (value.includes("makan") || value.includes("gizi")) return "makan";
  if (value.includes("belajar") || value.includes("baca")) return "baca buku";
  if (value.includes("masyarakat") || value.includes("bantu")) return "menyapu";
  if (value.includes("tidur")) return "tidur";
  return "karakter_utama";
};

function isIndicatorVisible(indicator: HabitIndicator, answers: Answers) {
  if (!indicator.conditions.length) return true;
  return indicator.conditions.every(
    (condition) =>
      answers[condition.sourceIndicatorId] === condition.sourceOptionId,
  );
}

export const IsiKebiasaanView: React.FC<IsiKebiasaanViewProps> = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [reflection, setReflection] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [locked, setLocked] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [commentThreads, setCommentThreads] = useState<
    Record<string, StudentActivityComment[]>
  >({});
  const [unreadTeacherComments, setUnreadTeacherComments] = useState<
    Set<string>
  >(new Set());
  const [openCommentHabitId, setOpenCommentHabitId] = useState<string | null>(
    null,
  );
  const [commentDraft, setCommentDraft] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const successTimerRef = useRef<number | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const response =
        await habitSubmissionService.getStudentConfiguration(user);
      setHabits(
        response.configuration.habits
          .filter((habit) => habit.active)
          .sort((a, b) => a.order - b.order),
      );
      setCompletedIds(response.completedHabitIds);
      const aggregate = await studentDashboardService.getAggregate(user);
      const grouped = aggregate.teacherComments.reduce<
        Record<string, StudentActivityComment[]>
      >((acc, comment) => {
        (acc[comment.habitId] ??= []).push(comment);
        return acc;
      }, {});
      setCommentThreads(grouped);
      setUnreadTeacherComments(
        new Set(aggregate.teacherComments.map((comment) => comment.habitId)),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat konfigurasi kebiasaan.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.method === "MANUAL") {
      setLoading(false);
      return;
    }
    void load();
    return () => {
      if (successTimerRef.current) window.clearTimeout(successTimerRef.current);
    };
  }, [user]);

  const activeIndicators = useMemo(
    () =>
      selectedHabit?.indicators
        .filter((i) => i.active)
        .sort((a, b) => a.order - b.order) ?? [],
    [selectedHabit],
  );
  const visibleIndicators = activeIndicators.filter((indicator) =>
    isIndicatorVisible(indicator, answers),
  );
  const completedCount = completedIds.length;
  const totalCount = habits.length;
  const scorePercent = totalCount
    ? Math.round((completedCount / totalCount) * 100)
    : 0;
  const recentHistories = INITIAL_HISTORIES.slice(0, 4);

  useEffect(() => {
    setAnswers((current) => {
      const visibleIds = new Set(
        visibleIndicators.map((indicator) => indicator.id),
      );
      const next = Object.fromEntries(
        Object.entries(current).filter(([id]) => visibleIds.has(id)),
      );
      return JSON.stringify(next) === JSON.stringify(current) ? current : next;
    });
  }, [
    selectedHabit,
    JSON.stringify(visibleIndicators.map((indicator) => indicator.id)),
  ]);

  const openHabit = (habit: Habit) => {
    if (completedIds.includes(habit.id)) return;
    setSelectedHabit(habit);
    setAnswers({});
    setReflection("");
    setSubmitError("");
    setLocked(false);
  };

  const back = () => {
    setSelectedHabit(null);
    setAnswers({});
    setReflection("");
    setSubmitError("");
    setLocked(false);
  };

  const openComments = (habitId: string) => {
    if (openCommentHabitId === habitId) {
      closeComments();
      return;
    }
    setOpenCommentHabitId(habitId);
    setUnreadTeacherComments((current) => {
      const next = new Set(current);
      next.delete(habitId);
      return next;
    });
    setCommentDraft("");
    setCommentError("");
  };

  const closeComments = () => {
    setOpenCommentHabitId(null);
    setCommentDraft("");
    setCommentError("");
  };

  const submitComment = async (habitId: string) => {
    if (!user || !commentDraft.trim()) return;
    setCommentSubmitting(true);
    setCommentError("");
    try {
      const thread = commentThreads[habitId] ?? [];
      const parentCommentId = thread.length
        ? thread[thread.length - 1].id
        : undefined;
      const created = await studentDashboardService.addActivityComment({
        user,
        habitId,
        message: commentDraft,
        parentCommentId,
      });
      setCommentThreads((current) => ({
        ...current,
        [habitId]: [...(current[habitId] ?? []), created],
      }));
      setCommentDraft("");
    } catch (err) {
      setCommentError(
        err instanceof Error ? err.message : "Komentar gagal dikirim.",
      );
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !selectedHabit || locked) return;
    setSubmitError("");
    setSubmitting(true);
    try {
      const result = await habitSubmissionService.submit(user, {
        studentId: user.id,
        habitId: selectedHabit.id,
        answers: visibleIndicators
          .filter((i) => answers[i.id])
          .map((i) => ({ indicatorId: i.id, optionId: answers[i.id] })),
        reflection: reflection.trim() || undefined,
      });

      setLocked(result.locked);
      setCompletedIds((prev) => [...new Set([...prev, selectedHabit.id])]);
      setShowSuccessModal(true);

      successTimerRef.current = window.setTimeout(() => {
        setShowSuccessModal(false);
        back();
      }, 1900);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Gagal menyimpan pengisian.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="space-y-6">
        <div className="h-40 rounded-[2.5rem] bg-white animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 rounded-[2rem] bg-white animate-pulse"
            />
          ))}
        </div>
      </div>
    );

  if (error)
    return (
      <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-rose-50 border-2 border-rose-200 text-rose-700">
        <div className="flex gap-3">
          <AlertCircle />
          <div>
            <p className="font-black">Gagal memuat 7 Kebiasaan</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={() => void load()}
              className="mt-4 px-4 py-2 rounded-xl bg-white border font-bold flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Coba lagi
            </button>
          </div>
        </div>
      </div>
    );

  if (user?.method === "MANUAL")
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-[2rem] bg-white border-4 border-white shadow-xl text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center">
          <Lock className="text-amber-600" />
        </div>
        <h2 className="text-2xl font-black mt-5 text-slate-800">
          Pengisian digital tidak tersedia
        </h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Akun siswa Manual tidak diarahkan ke form pengisian 7 Kebiasaan
          digital. Silakan gunakan buku fisik anaktumbuh.id sesuai metode
          pengisian yang ditetapkan sekolah.
        </p>
      </div>
    );

  if (selectedHabit) {
    return (
      <>
        <div className="w-full max-w-3xl mx-auto space-y-6 pb-12">
          <button
            onClick={back}
            disabled={submitting}
            className="flex items-center gap-2 text-slate-500 hover:text-sky-600 font-bold bg-white px-4 py-2 rounded-full shadow-sm disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Laporan Harian
          </button>
          <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl border-4 border-white">
            <div className="flex flex-col md:flex-row items-center gap-6 border-b-2 border-sky-50 pb-6 text-center md:text-left">
              <div className="w-32 h-32 flex-shrink-0 flex items-center justify-center bg-sky-50 rounded-[2rem] p-2 border-2 border-sky-100">
                <img
                  src={`/image/${encodeURIComponent(illustrationFor(selectedHabit.name))}.png`}
                  alt={selectedHabit.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-sky-700 bg-sky-100 px-3 py-1 rounded-full">
                  Form 7 Kebiasaan Digital
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-3">
                  {selectedHabit.name}
                </h2>
                <p className="text-slate-500 mt-2 font-medium">
                  {selectedHabit.description}
                </p>
              </div>
            </div>

            {locked && (
              <div className="mt-6 p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-800">
                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <p className="font-black">Pengisian terkunci</p>
                    <p className="text-sm mt-1">
                      Jawaban sudah berhasil dikirim. Form ini hanya dapat
                      dibaca dan tidak dapat diubah.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!locked && (
              <div className="mt-6 flex gap-3 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 text-amber-900">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="text-sm font-black">
                    Isi dengan jujur dan sesuai keadaan sebenarnya.
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-amber-800">
                    Jawaban digunakan sebagai catatan perkembangan kebiasaan.
                    Jangan memilih jawaban hanya untuk mendapatkan Poin atau EXP
                    yang lebih tinggi.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-7 mt-7">
              {visibleIndicators.map((indicator, index) => (
                <fieldset
                  key={indicator.id}
                  disabled={locked || submitting}
                  className="space-y-3"
                >
                  <legend className="text-sm font-black uppercase tracking-wider text-slate-700">
                    {index + 1}. {indicator.name}{" "}
                    {indicator.required && (
                      <span className="text-rose-500">*</span>
                    )}
                  </legend>
                  {indicator.description && (
                    <p className="text-xs text-slate-500 font-medium">
                      {indicator.description}
                    </p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {indicator.options
                      .filter((option) => option.active)
                      .sort((a, b) => a.order - b.order)
                      .map((option) => (
                        <label
                          key={option.id}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${answers[indicator.id] === option.id ? "border-sky-400 bg-sky-50 shadow-md" : "border-slate-100 bg-white hover:border-sky-200"}`}
                        >
                          <input
                            type="radio"
                            name={indicator.id}
                            value={option.id}
                            checked={answers[indicator.id] === option.id}
                            onChange={() =>
                              setAnswers((prev) => ({
                                ...prev,
                                [indicator.id]: option.id,
                              }))
                            }
                            className="sr-only"
                          />
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-extrabold text-slate-700">
                              {option.label}
                            </span>
                            {answers[indicator.id] === option.id && (
                              <Check className="w-5 h-5 text-sky-600" />
                            )}
                          </div>
                        </label>
                      ))}
                  </div>
                </fieldset>
              ))}

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-700">
                  <HelpCircle className="w-5 h-5 text-sky-500" /> Catatan
                  Pengalaman & Cerita (Opsional)
                </label>
                <textarea
                  disabled={locked || submitting}
                  rows={4}
                  maxLength={1000}
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Ceritakan pengalamanmu hari ini..."
                  className="w-full p-4 rounded-2xl border-2 border-sky-100 bg-sky-50/50 text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400 transition-all resize-none disabled:opacity-60"
                />
                <div className="text-right text-xs text-slate-400">
                  {reflection.length}/1000
                </div>
              </div>
              {submitError && (
                <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl text-sm font-bold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {submitError}
                </div>
              )}
              {!locked && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 text-sm font-black text-white bg-gradient-to-r from-sky-400 to-blue-500 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-6 h-6" /> Simpan Kebiasaan
                    </>
                  )}
                </button>
              )}
            </form>
          </div>
        </div>

        {showSuccessModal && (
          <SuccessModal
            onClose={() => {
              if (successTimerRef.current)
                window.clearTimeout(successTimerRef.current);
              setShowSuccessModal(false);
              back();
            }}
          />
        )}
      </>
    );
  }

  const renderHabitCard = (habit: Habit, index: number) => {
    const isDone = completedIds.includes(habit.id);
    const cardBg = [
      "bg-amber-50",
      "bg-emerald-50",
      "bg-sky-50",
      "bg-orange-50",
      "bg-violet-50",
      "bg-rose-50",
      "bg-teal-50",
    ][index % 7];
    const badgeBg = [
      "bg-amber-400",
      "bg-emerald-400",
      "bg-sky-400",
      "bg-orange-400",
      "bg-violet-400",
      "bg-rose-400",
      "bg-teal-400",
    ][index % 7];
    const isSleepHabit = habit.name.toLowerCase().includes("tidur");
    const thread = commentThreads[habit.id] ?? [];
    const hasTeacherComment = thread.some(
      (comment) => comment.authorRole === "wali_kelas",
    );
    const hasUnreadTeacherComment =
      unreadTeacherComments.has(habit.id) && hasTeacherComment;
    const isCommentsOpen = openCommentHabitId === habit.id;
    return (
      <div
        key={habit.id}
        className={`relative min-w-0 rounded-3xl ${cardBg} p-2.5 pt-5 sm:p-4 sm:pt-6 shadow-md shadow-sky-100/50 transition-all duration-300 group overflow-visible ${isCommentsOpen ? "z-10" : "z-0"}`}
      >
        <button
          type="button"
          onClick={() => openHabit(habit)}
          disabled={isDone}
          className={`w-full text-left ${isDone ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          <span
            className={`absolute top-3 left-3 z-20 w-7 h-7 rounded-full ${badgeBg} text-white text-xs font-black flex items-center justify-center border-2 border-white shadow-sm`}
          >
            {index + 1}
          </span>
          {isDone && (
            <span className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-sm">
              <Check className="w-4 h-4" />
            </span>
          )}
          <div
            className={`flex items-center justify-center ${isSleepHabit ? "h-24 sm:h-36" : "h-24 sm:h-32"}`}
          >
            <img
              src={`/image/${encodeURIComponent(illustrationFor(habit.name))}.png`}
              alt={habit.name}
              className={`${isSleepHabit ? "h-24 sm:h-36" : "h-24 sm:h-full"} w-auto object-contain transition-transform duration-300 ${isDone ? "opacity-50 grayscale" : "group-hover:scale-105"}`}
            />
          </div>
          <div className="bg-white/75 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2.5 sm:p-3 mt-2 sm:mt-3 -mx-0.5 sm:-mx-1">
            <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-0.5 truncate">
              Kebiasaan #{index + 1}
            </p>
            <h4 className="text-[11px] sm:text-sm font-extrabold text-slate-800 leading-tight sm:leading-snug break-words mb-1">
              {habit.name}
            </h4>
            <p className="hidden sm:block text-xs text-slate-500 leading-relaxed line-clamp-2">
              {habit.description}
            </p>
            <div className="mt-2 sm:mt-3 flex items-center justify-between gap-1.5 sm:gap-2">
              <span
                className={`inline-flex items-center gap-1 text-[9px] sm:text-xs font-bold ${isDone ? "text-emerald-700" : "text-sky-600"}`}
              >
                {isDone ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Terkunci
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Isi sekarang
                  </>
                )}
              </span>
              <span className="font-black text-slate-600 bg-white rounded-full px-2 py-1 text-[8px] sm:text-[10px] whitespace-nowrap">
                {isDone ? "Sudah diisi" : "Buka form →"}
              </span>
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => openComments(habit.id)}
          className="relative mt-2 sm:mt-3 w-full inline-flex items-center justify-center gap-1 bg-white/90 border border-sky-100 text-sky-600 rounded-full px-2 sm:px-3 py-1.5 sm:py-2 text-[9px] sm:text-[11px] font-extrabold hover:bg-white hover:border-sky-200 transition-colors"
        >
          <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Komentar
          {hasUnreadTeacherComment && (
            <span
              aria-label="Komentar baru dari wali kelas"
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 border-2 border-white shadow-md"
            />
          )}
        </button>
        {isCommentsOpen && (
          <div
            className="relative mt-3 rounded-2xl bg-white border border-sky-100 p-3 shadow-lg shadow-slate-300/20"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <p className="text-xs font-black text-slate-800">
                  Komentar aktivitas
                </p>
                <p className="text-[10px] text-slate-400">
                  Siswa dan Wali Kelas dapat saling membalas.
                </p>
              </div>
              <button
                type="button"
                onClick={closeComments}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600"
              >
                Tutup
              </button>
            </div>
            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {thread.length === 0 && (
                <p className="text-[11px] text-slate-400 py-2">
                  Belum ada komentar.
                </p>
              )}
              {thread.map((comment) => (
                <div
                  key={comment.id}
                  className={`rounded-2xl px-3 py-2.5 ${comment.authorRole === "wali_kelas" ? "bg-rose-50 border border-rose-100" : "bg-sky-50 border border-sky-100"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-[10px] font-black ${comment.authorRole === "wali_kelas" ? "text-rose-700" : "text-sky-700"}`}
                    >
                      {comment.authorRole === "wali_kelas"
                        ? "Wali Kelas"
                        : "Kamu"}
                    </p>
                    <span className="text-[9px] text-slate-400">
                      {new Intl.DateTimeFormat("id-ID", {
                        day: "numeric",
                        month: "short",
                      }).format(new Date(comment.createdAt))}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                    {comment.message}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <textarea
                value={commentDraft}
                onChange={(event) => setCommentDraft(event.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Tulis komentar atau balasan..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-medium text-slate-700 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100 resize-none"
              />
              {commentError && (
                <p className="text-[10px] font-bold text-rose-600 mt-1">
                  {commentError}
                </p>
              )}
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  disabled={commentSubmitting || !commentDraft.trim()}
                  onClick={() => void submitComment(habit.id)}
                  className="rounded-full bg-sky-500 px-4 py-2 text-[10px] font-black text-white disabled:opacity-50"
                >
                  {commentSubmitting ? "Mengirim..." : "Kirim komentar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-7 animate-fade-in pb-12">
      <section className="bg-gradient-to-r from-sky-400 via-sky-500 to-blue-500 rounded-[2.5rem] p-6 md:p-8 border-4 border-white shadow-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-xs font-black border border-white/30">
            <Sparkles className="w-4 h-4" /> 7 Kebiasaan Anak Hebat
          </div>
          <h2 className="text-2xl md:text-4xl font-black mt-3">
            Laporan Harian 7 Kebiasaan
          </h2>
          <p className="text-xs md:text-sm text-sky-100 font-semibold mt-2">
            Pilih kartu kebiasaan untuk mengisi laporan digital. Kartu yang
            selesai akan otomatis terkunci.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white/20 p-4 rounded-3xl border-2 border-white/40">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl">
            {completedCount}/{habits.length}
          </div>
          <div>
            <p className="text-sm font-black">Progress Hari Ini</p>
            <p className="text-xs font-bold text-sky-100">
              {completedCount === habits.length
                ? "Semua kebiasaan selesai!"
                : `${habits.length - completedCount} kebiasaan lagi`}
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <CompactSummary percent={scorePercent} />
        <CompactPositive
          completedCount={completedCount}
          totalCount={totalCount}
        />
      </div>

      <section className="space-y-6">
        <div className="min-w-0 bg-white rounded-[2rem] p-4 sm:p-6 md:p-7 shadow-xl shadow-sky-100/60">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-sky-600">
                {new Intl.DateTimeFormat("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(new Date())}
              </p>
              <h3 className="text-lg md:text-xl font-extrabold text-slate-800">
                Isi Kebiasaanmu
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
            {habits.map((habit, index) => renderHabitCard(habit, index))}
          </div>
        </div>

        <div className="grid grid-cols-1 items-start lg:grid-cols-2 gap-5 min-w-0">
          <div className="w-full bg-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-sky-100/60">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-slate-800">
                Riwayat Aktivitas
              </h3>
              <span className="text-xs font-bold text-sky-600 bg-sky-50 rounded-full px-3 py-1.5">
                Terbaru
              </span>
            </div>
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
                  <span className="flex-shrink-0 ml-2 w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center text-[11px]">
                    {item.pointsEarned}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative self-start overflow-hidden bg-amber-50 rounded-3xl p-5 shadow-md shadow-amber-100/60">
            <div className="flex items-start gap-3 pr-16">
              <Lightbulb className="w-8 h-8 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-extrabold text-slate-800">
                  Tips Hebat
                </p>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  Kebiasaan yang dilakukan mandiri akan membentuk karakter
                  hebat. Terus semangat ya!
                </p>
              </div>
            </div>
            <img
              src="/image/mengacungkan%20jempol.png"
              alt="Anak memberi jempol"
              className="absolute right-1 bottom-0 w-16 h-16 object-contain"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const CompactSummary: React.FC<{ percent: number }> = ({ percent }) => (
  <div className="min-w-0 h-full rounded-3xl p-[2px] bg-gradient-to-r from-amber-300 via-pink-300 to-sky-300 shadow-lg shadow-sky-100/50">
    <div className="flex h-full min-h-[132px] sm:min-h-[148px] flex-col items-center justify-center rounded-[calc(1.5rem-2px)] bg-white p-2 sm:p-3 text-center">
      <h3 className="mb-1 sm:mb-2 w-full text-center sm:text-left text-[9px] sm:text-[10px] font-black text-indigo-600">
        Ringkasan Hari Ini
      </h3>
      <div className="flex min-w-0 flex-col items-center justify-center gap-1 sm:gap-2">
        <ProgressRing percent={percent} />
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs font-extrabold text-amber-500">
            Tetap semangat!
          </p>
          <p className="mt-1 text-[8px] sm:text-[9px] leading-tight text-slate-500">
            Mulai isi kebiasaanmu.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const CompactPositive: React.FC<{
  completedCount: number;
  totalCount: number;
}> = ({ completedCount, totalCount }) => (
  <div className="min-w-0 h-full min-h-[132px] sm:min-h-[148px] bg-emerald-50 rounded-3xl p-2 sm:p-3 shadow-md shadow-emerald-100/60 flex flex-col items-center justify-center text-center">
    <img
      src="/image/bintang.png"
      alt="Bintang"
      className="w-8 h-8 sm:w-11 sm:h-11 object-contain"
    />
    <p className="text-[9px] sm:text-[10px] font-extrabold text-emerald-800 mt-1">
      Penguatan Positif
    </p>
    <p className="text-[8px] sm:text-[9px] text-emerald-700 leading-tight mt-1">
      {completedCount}/{totalCount} kebiasaan hari ini. Terus semangat!
    </p>
  </div>
);

const ProgressRing: React.FC<{ percent: number }> = ({ percent }) => {
  const radius = 43;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percent / 100) * circumference;
  return (
    <div className="relative w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 104 104">
        <circle
          cx="52"
          cy="52"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="9"
        />
        <circle
          cx="52"
          cy="52"
          r={radius}
          fill="none"
          stroke="#10b981"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg sm:text-2xl font-black text-slate-800">
          {percent}
        </span>
        <span className="text-[9px] font-bold text-slate-400">Skor</span>
      </div>
    </div>
  );
};

const SuccessModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 backdrop-blur-sm p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="habit-success-title"
  >
    <div className="w-full max-w-sm rounded-[2rem] bg-white p-7 text-center shadow-2xl border-4 border-white animate-fade-in">
      <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center shadow-inner">
        <CheckCircle2 className="w-11 h-11 text-emerald-500" />
      </div>
      <h2
        id="habit-success-title"
        className="text-2xl font-black text-slate-800 mt-5"
      >
        Selesai!
      </h2>
      <p className="text-sm text-slate-500 mt-2 leading-relaxed">
        Kebiasaan berhasil disimpan dan otomatis dikunci. Kamu akan kembali ke
        Laporan Harian.
      </p>
      <button
        onClick={onClose}
        className="mt-6 w-full rounded-2xl bg-sky-500 text-white py-3 text-sm font-black hover:bg-sky-600 transition-colors"
      >
        Kembali sekarang
      </button>
    </div>
  </div>
);
