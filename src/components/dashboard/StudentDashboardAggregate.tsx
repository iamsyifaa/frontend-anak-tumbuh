import React, { useState } from "react";
import { Award, BarChart3, BookOpenCheck, ChevronRight, Clock3, FileText, Flame, Medal, RefreshCw, Star, Trophy, Zap } from "lucide-react";
import { StudentDashboardAggregate as Aggregate } from "../../types/studentDashboard";
import { PdfModal } from "../views/PdfModal";
import { CertificateItem } from "../../types";

type AchievementSection = "badges" | "awards" | "certificates";

interface Props {
  data: Aggregate | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onOpenRanking: () => void;
  onOpenAchievements: (section?: AchievementSection) => void;
}

export const StudentDashboardAggregate: React.FC<Props> = ({ data, loading, error, onRetry, onOpenRanking, onOpenAchievements }) => {
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateItem | null>(null);

  if (loading) return <DashboardSkeleton />;
  if (error || !data) return <DashboardError message={error ?? "Dashboard belum tersedia."} onRetry={onRetry} />;
  if (data.student.method === "MANUAL") return <section className="rounded-[2rem] border-2 border-amber-200 bg-amber-50 p-6 md:p-8"><div className="flex gap-4 items-start"><div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0"><BookOpenCheck /></div><div><h2 className="text-xl font-black text-slate-800">Dashboard siswa Manual</h2><p className="mt-1 text-sm text-slate-600 font-semibold">Data siswa tetap tersedia di aplikasi, tetapi pengisian 7 Kebiasaan dilakukan melalui buku fisik. Dashboard tidak menyediakan jalur rekap buku Manual.</p></div></div></section>;

  const unlockedBadges = data.achievements.badges.filter((badge) => badge.isUnlocked).length;
  const recentHistory = data.history.slice(0, 5);

  return <div className="space-y-6 md:space-y-8 animate-fade-in pb-20 md:pb-0">
    {/* STATUS + PROGRES/AKTIVITAS + RANKING
        Desktop/tablet: two independent vertical column groups. Ranking stays in the
        wider left column so it fills the natural whitespace below the chart without
        stretching the metric cards or waiting for the taller right column.
        Mobile: the groups stack into one vertical flow. */}
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start anim-stagger-2">
      {/* KOLOM KIRI — metrik → grafik → ranking */}
      <div className="lg:col-span-2 min-w-0 space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 items-start">
          <MetricCard icon={<Star />} label="Poin" value={data.summary.points.toLocaleString("id-ID")} helper="Sumber ranking" tone="amber" />
          <MetricCard icon={<Zap />} label="EXP" value={data.summary.exp.toLocaleString("id-ID")} helper="Sumber level" tone="violet" />
          <MetricCard icon={<Trophy />} label="Level" value={data.summary.levelLabel} helper="Dari response backend" tone="sky" />
          <div className="lg:hidden min-w-0"><StreakCompactCard data={data} /></div>
        </div>

        <div className="bg-white rounded-[2rem] p-5 md:p-7 shadow-xl shadow-sky-100/60 border border-white">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div><p className="text-xs font-black uppercase tracking-wider text-sky-600">Aktivitas mingguan</p><h2 className="text-xl md:text-2xl font-black text-slate-800 mt-1">Perkembangan 7 Hari</h2></div>
            <BarChart3 className="text-sky-500 w-6 h-6" />
          </div>
          <WeeklyChart items={data.weeklyActivity} />
        </div>

        {/* Ranking dipindahkan ke bawah grafik agar mengisi ruang kosong kiri. */}
        {data.ranking.enabled && <RankingBanner rankLabel={data.summary.rankLabel} onOpenRanking={onOpenRanking} />}
      </div>

      {/* KOLOM KANAN — streak → riwayat */}
      <div className="hidden lg:block min-w-0 space-y-6">
        <StreakCard data={data} />

        <section className="bg-white rounded-[2rem] p-5 md:p-7 shadow-xl shadow-slate-100 border border-white lg:h-[360px] lg:overflow-y-auto">
          <div className="flex items-center justify-between gap-3 mb-5"><div><p className="text-xs font-black uppercase tracking-wider text-slate-400">Aktivitas</p><h2 className="text-xl font-black text-slate-800">Riwayat Terbaru</h2></div><Clock3 className="w-5 h-5 text-slate-400" /></div>
          {recentHistory.length === 0 ? <EmptyState title="Belum ada riwayat" description="Riwayat pengisian digital akan muncul setelah tersedia dari backend." /> : <div className="divide-y divide-slate-100">{recentHistory.map((item) => <HistoryRow key={item.id} item={item} />)}</div>}
        </section>
      </div>
    </section>

    {/* 4. ZONA APRESIASI & KOLEKSI */}
    <section className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-5 anim-stagger-5">
      <SummaryPanel compact title="Badge" icon={<Award className="w-5 h-5 text-amber-500" />} value={`${unlockedBadges}/${data.achievements.badges.length}`} description="badge terbuka" onClick={() => onOpenAchievements("badges")} />
      <SummaryPanel compact title="Penghargaan" icon={<Medal className="w-5 h-5 text-rose-500" />} value={`${data.achievements.awards.length}`} description="penghargaan diterima" onClick={() => onOpenAchievements("awards")} />
      <SummaryPanel compact title="Sertifikat" icon={<FileText className="w-5 h-5 text-sky-500" />} value={`${data.achievements.certificates.length}`} description="dokumen tersedia" onClick={() => onOpenAchievements("certificates")} />
    </section>

    {data.achievements.certificates.length > 0 && <section className="bg-white rounded-[2rem] p-5 md:p-7 shadow-xl shadow-sky-100/50 border border-white anim-stagger-6">
      <div className="flex items-center justify-between gap-3 mb-5"><div><p className="text-xs font-black uppercase tracking-wider text-sky-600">Dokumen</p><h2 className="text-xl font-black text-slate-800">Sertifikat Terbaru</h2></div><FileText className="text-sky-500" /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{data.achievements.certificates.slice(0, 2).map((certificate) => <article key={certificate.id} className="rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-sky-200">
        <div><h3 className="font-black text-slate-800">{certificate.title}</h3><p className="text-xs text-slate-500 mt-1">{certificate.period} · {certificate.issueDate}</p></div>
        <button onClick={() => setSelectedCertificate(certificate)} className="shrink-0 rounded-xl bg-sky-50 text-sky-700 px-3 py-2 text-xs font-black hover:bg-sky-100">Preview</button>
      </article>)}</div>
    </section>}

    <PdfModal certificate={selectedCertificate} onClose={() => setSelectedCertificate(null)} />
  </div>;
};

const RankingBanner: React.FC<{ rankLabel?: string | null; onOpenRanking: () => void }> = ({ rankLabel, onOpenRanking }) => <section className="rounded-[2rem] p-5 md:p-7 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xl shadow-sky-200/60 anim-stagger-4">
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
    <div><p className="text-xs font-black uppercase tracking-wider text-sky-100">Ranking aktif</p><h2 className="text-2xl font-black mt-1">Kamu berada di {rankLabel ?? "ranking tersedia"}</h2><p className="text-sm text-sky-100 mt-1 font-semibold">Ranking menggunakan Poin, bukan EXP.</p></div>
    <button onClick={onOpenRanking} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-sky-700 px-5 py-3 text-sm font-black shadow-lg hover:-translate-y-0.5 transition">Lihat ranking <ChevronRight className="w-4 h-4" /></button>
  </div>
</section>;

const StreakCompactCard: React.FC<{ data: Aggregate }> = ({ data }) => <div className="h-full min-h-[156px] bg-gradient-to-br from-orange-50 to-amber-50 rounded-[1.6rem] p-4 border-2 border-amber-100 shadow-lg shadow-amber-100/40 flex flex-col">
  <div className="flex items-center gap-1.5"><Flame className="w-4 h-4 text-orange-500" /><h2 className="text-sm font-black text-slate-800">Streak</h2></div>
  <p className="text-[9px] text-slate-500 font-semibold mt-0.5 truncate">{data.streak.monthLabel}</p>
  <div className="flex items-end gap-1.5 mt-3"><span className="text-3xl font-black text-orange-600 leading-none">{data.streak.current}</span><span className="pb-0.5 text-[10px] font-black text-orange-800">hari</span></div>
  <div className="mt-auto pt-2 flex items-center justify-between gap-2"><p className="text-[8px] font-black uppercase text-slate-500">Rekor</p><p className="text-[11px] font-black text-slate-800">{data.streak.best} hari</p></div>
</div>;

const StreakCard: React.FC<{ data: Aggregate }> = ({ data }) => <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-[2rem] p-5 md:p-7 border-2 border-amber-100 shadow-xl shadow-amber-100/50">
  <div className="flex items-center gap-2"><Flame className="text-orange-500" /><h2 className="text-xl font-black text-slate-800">Streak</h2></div>
  <p className="text-xs text-slate-500 font-semibold mt-1">{data.streak.monthLabel}</p>
  <div className="flex items-end gap-3 mt-6"><span className="text-5xl font-black text-orange-600">{data.streak.current}</span><span className="pb-2 text-sm font-black text-orange-800">hari</span></div>
  <div className="grid grid-cols-2 gap-3 mt-5"><SmallStat label="Rekor" value={`${data.streak.best} hari`} /><SmallStat label="Kesempatan" value={`${data.streak.remainingChances}/${data.streak.maxMonthlyChances}`} /></div>
  <p className="mt-5 text-xs font-bold text-orange-900/70 flex gap-2 items-center"><Clock3 className="w-4 h-4" /> {data.streak.status === "active" ? "Streak aktif" : data.streak.status}</p>
</div>;

const MetricCard: React.FC<{ icon: React.ReactNode; label: string; value: string; helper: string; tone: "amber" | "violet" | "sky" }> = ({ icon, label, value, helper, tone }) => {
  const tones = { amber: "bg-amber-50 text-amber-700", violet: "bg-violet-50 text-violet-700", sky: "bg-sky-50 text-sky-700" };
  return <div className="bg-white rounded-[1.6rem] p-4 md:p-5 shadow-lg shadow-slate-100 border border-slate-100 min-w-0 min-h-[156px] h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone]}`}>{icon}</div>
    <p className="text-xs font-black text-slate-500 mt-4">{label}</p>
    <p className="text-2xl md:text-3xl font-black text-slate-800 truncate mt-0.5">{value}</p>
    <p className="text-[10px] md:text-xs font-bold text-slate-400 mt-1">{helper}</p>
  </div>;
};

const WeeklyChart: React.FC<{ items: Aggregate["weeklyActivity"] }> = ({ items }) => <div className="h-52 flex items-end gap-2 md:gap-4">{items.map((item) => <div key={item.date} className="flex-1 h-full flex flex-col justify-end items-center gap-2"><div className="w-full max-w-12 h-40 flex items-end rounded-xl bg-slate-50 overflow-hidden"><div title={`${item.completedHabits} kebiasaan`} className="w-full rounded-t-xl bg-sky-400 transition-all" style={{ height: `${item.activityPercent}%` }} /></div><span className="text-[10px] font-black text-slate-500">{item.dayLabel}</span></div>)}</div>;

const SummaryPanel: React.FC<{ title: string; icon: React.ReactNode; value: string; description: string; onClick: () => void; compact?: boolean }> = ({ title, icon, value, description, onClick, compact = false }) => <button onClick={onClick} className={`text-left bg-white rounded-[1.4rem] sm:rounded-[1.75rem] p-2.5 sm:p-4 md:p-5 border-2 border-slate-100 shadow-lg hover:-translate-y-1 hover:shadow-xl hover:border-sky-200 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-sky-100 min-w-0 ${compact ? "min-h-[112px] sm:min-h-[130px]" : ""}`}>
  <div className="flex items-center justify-between gap-1"><div className="flex items-center gap-1.5 min-w-0">{icon}<h3 className="font-black text-slate-800 text-[11px] sm:text-sm truncate">{title}</h3></div><ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" /></div>
  <p className="text-xl sm:text-3xl font-black text-slate-800 mt-2.5 sm:mt-4 leading-none">{value}</p><p className="text-[8px] sm:text-[11px] leading-tight text-slate-500 font-bold mt-1 break-words">{description}</p>
</button>;

const SmallStat: React.FC<{ label: string; value: string }> = ({ label, value }) => <div className="rounded-2xl bg-white/70 border border-white p-3"><p className="text-[10px] uppercase font-black text-slate-500">{label}</p><p className="text-lg font-black text-slate-800 mt-0.5">{value}</p></div>;
const HistoryRow: React.FC<{ item: Aggregate["history"][number] }> = ({ item }) => <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2"><BookOpenCheck className="w-4 h-4 text-sky-500 shrink-0" /><p className="font-black text-slate-800 truncate">{item.habitName}</p></div><p className="text-xs text-slate-500 mt-1 font-semibold">{item.dateLabel} · {item.initiative}</p></div><div className="flex items-center gap-3 text-xs font-black"><span className="rounded-full bg-amber-50 text-amber-700 px-3 py-1.5">+{item.pointsAwarded} Poin</span><span className="rounded-full bg-violet-50 text-violet-700 px-3 py-1.5">+{item.expAwarded} EXP</span></div></div>;
const EmptyState: React.FC<{ title: string; description: string }> = ({ title, description }) => <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center"><p className="font-black text-slate-700">{title}</p><p className="text-xs text-slate-500 mt-1">{description}</p></div>;
const DashboardSkeleton = () => <div className="space-y-5 animate-pulse"><div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(18rem,.7fr)] gap-5"><div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5">{[1,2,3].map((x) => <div key={x} className="h-36 rounded-[1.6rem] bg-white" />)}</div><div className="h-36 rounded-[2rem] bg-white" /></div><div className="grid grid-cols-1 xl:grid-cols-[1.15fr_.85fr] gap-5"><div className="h-80 rounded-[2rem] bg-white" /><div className="h-80 rounded-[2rem] bg-white" /></div><div className="h-36 rounded-[2rem] bg-white" /><div className="grid grid-cols-1 lg:grid-cols-3 gap-5">{[1,2,3].map((x) => <div key={x} className="h-40 rounded-[2rem] bg-white" />)}</div></div>;
const DashboardError: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => <section className="rounded-[2rem] bg-white border-2 border-red-100 p-10 text-center shadow-lg"><div className="w-12 h-12 mx-auto rounded-2xl bg-red-50 text-red-500 flex items-center justify-center"><RefreshCw /></div><h2 className="font-black text-slate-800 mt-4">Dashboard belum dapat dimuat</h2><p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">{message}</p><button onClick={onRetry} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-sky-500 text-white px-4 py-2.5 text-sm font-black"><RefreshCw className="w-4 h-4" /> Coba lagi</button></section>;
