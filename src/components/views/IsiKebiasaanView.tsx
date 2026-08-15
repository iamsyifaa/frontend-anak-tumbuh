import React, { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { AlertCircle, ArrowLeft, Check, CheckCircle2, Clock, HelpCircle, Loader2, Sparkles, Lock, RefreshCw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Habit, HabitIndicator } from "../../types/habitConfiguration";
import { habitSubmissionService } from "../../services/habitSubmissionService";

interface IsiKebiasaanViewProps {}

type Answers = Record<string, string>;

const illustrationFor = (title: string) => {
  const value = title.toLowerCase();
  if (value.includes("bangun")) return "bangun tidur";
  if (value.includes("ibadah") || value.includes("doa")) return "berdoa";
  if (value.includes("olahraga") || value.includes("fisik")) return "bermain bola";
  if (value.includes("makan") || value.includes("gizi")) return "makan";
  if (value.includes("belajar") || value.includes("baca")) return "baca buku";
  if (value.includes("masyarakat") || value.includes("bantu")) return "menyapu";
  if (value.includes("tidur")) return "tidur";
  return "karakter_utama";
};

function isIndicatorVisible(indicator: HabitIndicator, answers: Answers) {
  if (!indicator.conditions.length) return true;
  return indicator.conditions.every((condition) => answers[condition.sourceIndicatorId] === condition.sourceOptionId);
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
  const [successMessage, setSuccessMessage] = useState("");

  const load = async () => {
    if (!user) return;
    setLoading(true); setError("");
    try {
      const response = await habitSubmissionService.getStudentConfiguration(user);
      setHabits(response.configuration.habits.filter((habit) => habit.active).sort((a, b) => a.order - b.order));
      setCompletedIds(response.completedHabitIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat konfigurasi kebiasaan.");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (user?.method === "MANUAL") {
      setLoading(false);
      return;
    }
    void load();
  }, [user]);

  const activeIndicators = useMemo(() => selectedHabit?.indicators.filter((i) => i.active).sort((a, b) => a.order - b.order) ?? [], [selectedHabit]);
  const visibleIndicators = activeIndicators.filter((indicator) => isIndicatorVisible(indicator, answers));

  useEffect(() => {
    setAnswers((current) => {
      const visibleIds = new Set(visibleIndicators.map((indicator) => indicator.id));
      const next = Object.fromEntries(Object.entries(current).filter(([id]) => visibleIds.has(id)));
      return JSON.stringify(next) === JSON.stringify(current) ? current : next;
    });
  }, [selectedHabit, JSON.stringify(visibleIndicators.map((indicator) => indicator.id))]);

  const completedCount = completedIds.length;

  const openHabit = (habit: Habit) => {
    if (completedIds.includes(habit.id)) return;
    setSelectedHabit(habit); setAnswers({}); setReflection(""); setSubmitError(""); setSuccessMessage(""); setLocked(false);
  };

  const back = () => { setSelectedHabit(null); setAnswers({}); setReflection(""); setSubmitError(""); setSuccessMessage(""); setLocked(false); };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !selectedHabit || locked) return;
    setSubmitError(""); setSubmitting(true);
    try {
      const result = await habitSubmissionService.submit(user, {
        studentId: user.id,
        habitId: selectedHabit.id,
        answers: visibleIndicators.filter((i) => answers[i.id]).map((i) => ({ indicatorId: i.id, optionId: answers[i.id] })),
        reflection: reflection.trim() || undefined,
      });
      setLocked(result.locked); setCompletedIds((prev) => [...new Set([...prev, selectedHabit.id])]);
      setSuccessMessage("Pengisian berhasil disimpan dan dikunci. Kamu tidak dapat mengubah jawaban hari ini.");
      confetti({ particleCount: 70, spread: 65, origin: { y: 0.65 } });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Gagal menyimpan pengisian.");
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="space-y-6"><div className="h-40 rounded-[2.5rem] bg-white animate-pulse" /><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3,4,5,6].map((i) => <div key={i} className="h-64 rounded-[2rem] bg-white animate-pulse" />)}</div></div>;
  if (error) return <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-rose-50 border-2 border-rose-200 text-rose-700"><div className="flex gap-3"><AlertCircle /><div><p className="font-black">Gagal memuat 7 Kebiasaan</p><p className="text-sm mt-1">{error}</p><button onClick={() => void load()} className="mt-4 px-4 py-2 rounded-xl bg-white border font-bold flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Coba lagi</button></div></div></div>;

  if (user?.method === "MANUAL") return <div className="max-w-2xl mx-auto p-8 rounded-[2rem] bg-white border-4 border-white shadow-xl text-center"><div className="mx-auto w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center"><Lock className="text-amber-600" /></div><h2 className="text-2xl font-black mt-5 text-slate-800">Pengisian digital tidak tersedia</h2><p className="text-sm text-slate-500 mt-2 leading-relaxed">Akun siswa Manual tidak diarahkan ke form pengisian 7 Kebiasaan digital. Silakan gunakan buku fisik ANAKTUMBUH sesuai metode pengisian yang ditetapkan sekolah.</p></div>;

  if (selectedHabit) {
    const initiative = selectedHabit.indicators.find((i) => i.name.trim().toLowerCase() === "inisiatif");
    return <div className="w-full max-w-3xl mx-auto space-y-6 pb-12">
      <button onClick={back} disabled={submitting} className="flex items-center gap-2 text-slate-500 hover:text-sky-600 font-bold bg-white px-4 py-2 rounded-full shadow-sm disabled:opacity-50"><ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Misi</button>
      <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl border-4 border-white">
        <div className="flex flex-col md:flex-row items-center gap-6 border-b-2 border-sky-50 pb-6 text-center md:text-left">
          <div className="w-32 h-32 flex-shrink-0 flex items-center justify-center bg-sky-50 rounded-[2rem] p-2 border-2 border-sky-100"><img src={`/image/${encodeURIComponent(illustrationFor(selectedHabit.name))}.png`} alt={selectedHabit.name} className="w-full h-full object-contain" /></div>
          <div><span className="text-xs font-black uppercase tracking-wider text-sky-700 bg-sky-100 px-3 py-1 rounded-full">Form 7 Kebiasaan Digital</span><h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-3">{selectedHabit.name}</h2><p className="text-slate-500 mt-2 font-medium">{selectedHabit.description}</p></div>
        </div>

        {locked && <div className="mt-6 p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-800"><div className="flex gap-3 items-start"><CheckCircle2 className="w-6 h-6 flex-shrink-0" /><div><p className="font-black">Pengisian terkunci</p><p className="text-sm mt-1">Jawaban sudah berhasil dikirim. Form ini hanya dapat dibaca dan tidak dapat diubah.</p></div></div></div>}
        {successMessage && <div className="mt-4 p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-700 text-sm font-bold">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="space-y-7 mt-7">
          {visibleIndicators.map((indicator, index) => <fieldset key={indicator.id} disabled={locked || submitting} className="space-y-3">
            <legend className="text-sm font-black uppercase tracking-wider text-slate-700">{index + 1}. {indicator.name} {indicator.required && <span className="text-rose-500">*</span>}</legend>
            {indicator.description && <p className="text-xs text-slate-500 font-medium">{indicator.description}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {indicator.options.filter((option) => option.active).sort((a,b) => a.order-b.order).map((option) => <label key={option.id} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${answers[indicator.id] === option.id ? "border-sky-400 bg-sky-50 shadow-md" : "border-slate-100 bg-white hover:border-sky-200"}`}>
                <input type="radio" name={indicator.id} value={option.id} checked={answers[indicator.id] === option.id} onChange={() => setAnswers((prev) => ({ ...prev, [indicator.id]: option.id }))} className="sr-only" />
                <div className="flex items-center justify-between gap-3"><span className="font-extrabold text-slate-700">{option.label}</span>{answers[indicator.id] === option.id && <Check className="w-5 h-5 text-sky-600" />}</div>
              </label>)}
            </div>
          </fieldset>)}

          <div className="space-y-3"><label className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-700"><HelpCircle className="w-5 h-5 text-sky-500" /> Catatan Pengalaman & Cerita (Opsional)</label><textarea disabled={locked || submitting} rows={4} maxLength={1000} value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="Ceritakan pengalamanmu hari ini..." className="w-full p-4 rounded-2xl border-2 border-sky-100 bg-sky-50/50 text-sm font-medium text-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-400 transition-all resize-none disabled:opacity-60" /><div className="text-right text-xs text-slate-400">{reflection.length}/1000</div></div>
          {submitError && <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl text-sm font-bold text-rose-700 flex items-center gap-2"><AlertCircle className="w-5 h-5 flex-shrink-0" />{submitError}</div>}
          {!locked && <button type="submit" disabled={submitting} className="w-full py-4 text-sm font-black text-white bg-gradient-to-r from-sky-400 to-blue-500 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60">{submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</> : <><CheckCircle2 className="w-6 h-6" /> Simpan Kebiasaan 🎉</>}</button>}
        </form>
      </div>
    </div>;
  }

  return <div className="space-y-7 animate-fade-in pb-12">
    <div className="bg-gradient-to-r from-sky-400 via-sky-500 to-blue-500 rounded-[2.5rem] p-6 md:p-8 border-4 border-white shadow-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6"><div><div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-xs font-black border border-white/30"><Sparkles className="w-4 h-4" /> 7 Kebiasaan Anak Hebat</div><h2 className="text-2xl md:text-4xl font-black mt-3">Isi Kebiasaan Kebaikanmu! 🎯</h2><p className="text-xs md:text-sm text-sky-100 font-semibold mt-2">Pertanyaan di bawah mengikuti konfigurasi sekolah yang aktif.</p></div><div className="flex items-center gap-4 bg-white/20 p-4 rounded-3xl border-2 border-white/40"><div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl">{completedCount}/{habits.length}</div><div><p className="text-sm font-black">Target Hari Ini</p><p className="text-xs font-bold text-sky-100">{completedCount === habits.length ? "🎉 Semua kebiasaan selesai!" : `${habits.length - completedCount} kebiasaan lagi!`}</p></div></div></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {habits.map((habit, index) => { const isLocked = completedIds.includes(habit.id); return <button type="button" key={habit.id} onClick={() => openHabit(habit)} disabled={isLocked} className={`text-left relative rounded-[2rem] p-6 border-4 border-white transition-all shadow-xl overflow-hidden ${isLocked ? "bg-slate-50 cursor-not-allowed" : "bg-white hover:shadow-2xl hover:-translate-y-1"}`}><div className="w-full h-36 mb-4 flex items-center justify-center"><img src={`/image/${encodeURIComponent(illustrationFor(habit.name))}.png`} alt={habit.name} className={`w-28 h-28 object-contain ${isLocked ? "opacity-50 grayscale" : ""}`} /></div><div className="flex items-start justify-between gap-2"><div><span className="text-[11px] font-black uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full">#{index + 1}</span><h3 className="text-lg font-extrabold text-slate-800 mt-2">{habit.name}</h3></div>{isLocked ? <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full"><Check className="w-4 h-4" /> Selesai</span> : <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-700 text-xs font-black px-3 py-1 rounded-full"><Clock className="w-4 h-4" /> Isi</span>}</div><p className="text-xs text-slate-500 leading-relaxed mt-3">{habit.description}</p>{isLocked && <div className="mt-4 flex items-center gap-2 text-emerald-700 text-xs font-black"><Lock className="w-4 h-4" /> Sudah dikunci</div>}</button>; })}
    </div>
  </div>;
};
