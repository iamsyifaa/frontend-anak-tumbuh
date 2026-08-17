import React, { useEffect, useRef } from "react";
import { AwardItem, StreakSummary } from "../../types/gamification";
import { useNavigate } from "react-router-dom";
import { BadgeItem, CertificateItem } from "../../types";
import {
  Trophy, Award, Lock, Sun, BookOpen, Sparkles, Flame, HeartHandshake,
  FileText, Calendar, Eye, CheckCircle2, Medal, Clock3
} from "lucide-react";

interface PencapaianViewProps {
  badges: BadgeItem[];
  awards: AwardItem[];
  certificates: CertificateItem[];
  streak: StreakSummary;
  initialSection?: "badges" | "awards" | "certificates";
}

export const PencapaianView: React.FC<PencapaianViewProps> = ({ badges, awards, certificates, streak, initialSection }) => {
  const navigate = useNavigate();
  const badgeSectionRef = useRef<HTMLElement | null>(null);
  const awardSectionRef = useRef<HTMLElement | null>(null);
  const certificateSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!initialSection) return;
    const target = initialSection === "badges" ? badgeSectionRef.current : initialSection === "awards" ? awardSectionRef.current : certificateSectionRef.current;
    const timer = window.setTimeout(() => target?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    return () => window.clearTimeout(timer);
  }, [initialSection]);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "Sun": return Sun;
      case "BookOpen": return BookOpen;
      case "Sparkles": return Sparkles;
      case "Flame": return Flame;
      case "HeartHandshake": return HeartHandshake;
      default: return Trophy;
    }
  };

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 rounded-[1.75rem] md:rounded-[2.5rem] p-5 sm:p-6 md:p-8 lg:p-10 border-4 border-white shadow-2xl shadow-amber-200/80 text-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black text-slate-900 border border-white/60 font-heading">
            <Trophy className="w-4 h-4 text-amber-900" />
            <span>Panggung Juara & Perkembangan Karakter</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-950 font-heading">Pencapaianmu!</h2>
          <p className="text-xs md:text-sm text-amber-950 font-bold leading-relaxed">Lihat konsistensi, lencana, penghargaan, dan sertifikat yang diberikan oleh sistem dan sekolah.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/40 backdrop-blur-md p-3 sm:p-4 rounded-3xl border-2 border-white/80 shadow-lg relative z-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-2 flex items-center justify-center shadow-md border-2 border-amber-300">
            <img src="/image/bintang.png" alt="Bintang Penghargaan" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-base font-black text-slate-900 font-heading">{unlockedCount}/{badges.length} Badge</p>
            <p className="text-xs text-amber-950 font-bold">Pencapaian yang sudah terbuka</p>
          </div>
        </div>
      </div>

      {/* Streak */}
      <section className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-4 sm:p-6 md:p-7 border-4 border-white shadow-xl shadow-amber-100/70">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-7 h-7 text-orange-500" />
              <h3 className="font-extrabold text-slate-800 text-xl font-heading">Streak Kebiasaan</h3>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-1">Streak aktif ketika minimal satu kebiasaan diisi pada hari tersebut.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-2xl bg-orange-50 border border-orange-200 px-3 py-2.5"><p className="text-[10px] uppercase font-black text-orange-600">Streak Saat Ini</p><p className="text-2xl font-black text-orange-900">{streak.current} hari</p></div>
            <div className="rounded-2xl bg-sky-50 border border-sky-200 px-3 py-2.5"><p className="text-[10px] uppercase font-black text-sky-600">Rekor Terbaik</p><p className="text-2xl font-black text-sky-900">{streak.best} hari</p></div>
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-3 py-2.5"><p className="text-[10px] uppercase font-black text-emerald-600">Kesempatan Bulan Ini</p><p className="text-2xl font-black text-emerald-900">{streak.remainingChances}/{streak.maxMonthlyChances}</p></div>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-2 text-xs font-bold text-slate-500"><Clock3 className="w-4 h-4" /> {streak.monthLabel} · {streak.status === "active" ? "Streak aktif" : streak.status === "paused" ? "Streak berhenti sementara" : "Streak di-reset"}</div>
      </section>

      {/* Badge */}
      <section ref={badgeSectionRef} className="space-y-5 scroll-mt-6">
        <div className="flex items-center justify-between"><h3 className="font-extrabold text-slate-800 text-lg md:text-xl flex items-center gap-2 font-heading"><Award className="w-6 h-6 text-amber-500" />Koleksi Badge</h3><span className="text-xs text-sky-700 bg-sky-100 font-extrabold px-3 py-1 rounded-full">{unlockedCount} dari {badges.length} Terbuka</span></div>
        {badges.length === 0 ? (
          <EmptyState title="Belum ada badge" description="Badge akan muncul setelah master achievement tersedia dari backend." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges.map((badge) => {
              const Icon = getBadgeIcon(badge.iconName);
              return <div key={badge.id} className={`rounded-[2rem] p-6 border-4 border-white shadow-xl ${badge.isUnlocked ? "bg-gradient-to-b from-white to-amber-50/80" : "bg-slate-100/80 grayscale opacity-70"}`}>
                <div className="flex items-start justify-between mb-4"><div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border-2 border-white ${badge.isUnlocked ? "bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950" : "bg-slate-200 text-slate-500"}`}><Icon className="w-8 h-8" /></div>{badge.isUnlocked ? <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 text-xs font-black px-3 py-1 rounded-full border border-emerald-300"><CheckCircle2 className="w-3.5 h-3.5" /> TERBUKA</span> : <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-full border border-slate-300"><Lock className="w-3.5 h-3.5" /> Terkunci</span>}</div>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full">{badge.category}</span>
                <h4 className="font-extrabold text-slate-800 text-lg mt-2 font-heading">{badge.title}</h4><p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-semibold">{badge.description}</p>
                <div className="mt-5 pt-3 border-t-2 border-slate-100 text-xs font-bold">{badge.isUnlocked ? <span className="text-amber-900 flex items-center gap-1.5"><Calendar className="w-4 h-4" />Diraih: {badge.unlockedDate}</span> : <span className="text-slate-500 italic">Syarat: {badge.progressText}</span>}</div>
              </div>;
            })}
          </div>
        )}
      </section>

      {/* Awards */}
      <section ref={awardSectionRef} className="space-y-5 scroll-mt-6">
        <div className="flex items-center justify-between"><h3 className="font-extrabold text-slate-800 text-lg md:text-xl flex items-center gap-2 font-heading"><Medal className="w-6 h-6 text-rose-500" />Penghargaan</h3><span className="text-xs text-rose-700 bg-rose-100 font-extrabold px-3 py-1 rounded-full">{awards.length} diterima</span></div>
        {awards.length === 0 ? <EmptyState title="Belum ada penghargaan" description="Penghargaan akan ditampilkan sesuai kebiasaan dan periode yang diberikan sekolah." /> : <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{awards.map((award) => <article key={award.id} className="bg-white rounded-[2rem] p-6 border-4 border-white shadow-xl shadow-rose-100/60"><div className="flex items-start justify-between gap-4"><div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center"><Medal className="w-6 h-6" /></div><span className="text-xs font-black text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">{award.period}</span></div><h4 className="font-extrabold text-slate-800 text-lg mt-4 font-heading">{award.title}</h4><p className="text-xs text-slate-600 mt-2 leading-relaxed">{award.description}</p><div className="mt-5 pt-4 border-t flex flex-wrap gap-2 text-xs font-bold text-slate-500"><span>Kebiasaan: {award.habitName}</span><span>•</span><span>{award.issuerName}</span></div></article>)}</div>}
      </section>

      {/* Certificates */}
      <section ref={certificateSectionRef} className="space-y-5 pt-2 scroll-mt-6"><div className="flex items-center justify-between"><h3 className="font-extrabold text-slate-800 text-lg md:text-xl flex items-center gap-2 font-heading"><FileText className="w-6 h-6 text-indigo-600" />Sertifikat & Piagam</h3><span className="text-xs text-indigo-700 bg-indigo-100 font-extrabold px-3 py-1 rounded-full">{certificates.length} dokumen</span></div>{certificates.length === 0 ? <EmptyState title="Belum ada sertifikat" description="Sertifikat akan muncul jika penghargaan terkait menghasilkan dokumen sertifikat." /> : <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{certificates.map((cert) => <div key={cert.id} className="bg-white rounded-[2rem] p-6 md:p-8 border-4 border-white shadow-xl shadow-sky-100/80"><div className="flex items-center justify-between"><span className="bg-sky-100 text-sky-800 text-xs font-black px-3 py-1 rounded-full border border-sky-200">{cert.period}</span><span className="text-xs font-mono font-bold text-slate-400">{cert.certificateNumber}</span></div><h4 className="font-extrabold text-slate-800 text-lg mt-4">{cert.title}</h4><p className="text-xs text-slate-600 font-semibold leading-relaxed mt-2">{cert.description}</p><div className="pt-4 mt-4 border-t-2 border-slate-100 flex items-center justify-between gap-4"><div className="text-xs text-slate-500 font-bold">Penerbit: <strong className="text-slate-800">{cert.issuerName}</strong></div><button onClick={() => navigate(`/dashboard/siswa/certificate/${cert.id}`)} className="px-5 py-2.5 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-2xl font-black text-xs shadow-md border-2 border-white flex items-center gap-1.5"><Eye className="w-4 h-4" />Buka PDF</button></div></div>)}</div>}</section>
    </div>
  );
};

const EmptyState: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center"><Award className="w-10 h-10 mx-auto text-slate-300" /><h4 className="font-extrabold text-slate-700 mt-3">{title}</h4><p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">{description}</p></div>
);
