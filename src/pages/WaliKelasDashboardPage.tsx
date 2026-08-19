import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Award, Download, FileBarChart2, MessageCircle, Mic, RefreshCw, Search, Send, TrendingUp, Users, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { classMonitoringService } from "../services/classMonitoringService";
import { ClassMonitoringAggregate, ClassMonitoringDetail, MonitoringActivityStatus, MonitoringComment } from "../types/classMonitoring";

const statusLabel: Record<MonitoringActivityStatus, string> = { completed: "Lengkap", partial: "Sebagian", not_started: "Belum mulai" };
const speechCtor = () => {
  const w = window as Window & { SpeechRecognition?: new () => SpeechRecognition; webkitSpeechRecognition?: new () => SpeechRecognition };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
};

type SpeechRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export const WaliKelasDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState<ClassMonitoringAggregate | null>(null);
  const [selected, setSelected] = useState<ClassMonitoringDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState<"ALL" | "DIGITAL" | "MANUAL">("ALL");
  const [activity, setActivity] = useState<"ALL" | MonitoringActivityStatus>("ALL");
  const [comment, setComment] = useState("");
  const [commentActivityId, setCommentActivityId] = useState("");
  const [replyTo, setReplyTo] = useState<MonitoringComment | null>(null);
  const [replyText, setReplyText] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [savingComment, setSavingComment] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true); setError(null);
    try { setData(await classMonitoringService.getAggregate(user)); }
    catch (e) { setError(e instanceof Error ? e.message : "Gagal memuat dashboard."); }
    finally { setLoading(false); }
  }, [user]);
  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => data?.students.filter((student) => {
    const q = query.trim().toLowerCase();
    return (!q || student.name.toLowerCase().includes(q) || student.nis?.toLowerCase().includes(q)) &&
      (method === "ALL" || student.method === method) && (activity === "ALL" || student.activityStatus === activity);
  }) ?? [], [data, query, method, activity]);

  const exportCsv = () => {
    if (!data?.permissions.canExport) return;
    const rows = filtered.map((s) => [s.name, s.nis ?? "", s.method, statusLabel[s.activityStatus], s.progressPercent, s.points, s.exp, s.level, s.streak, s.badgeCount, s.awardCount, s.commentCount]);
    const csv = [["Nama", "NIS", "Metode", "Aktivitas", "Perkembangan (%)", "Poin", "EXP", "Level", "Streak", "Badge", "Penghargaan", "Komentar"], ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = `laporan-${data.classGroup.rombelName.replace(/\s+/g, "-")}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const openDetail = async (id: string) => {
    if (!user) return;
    try {
      setSelected(await classMonitoringService.getStudentDetail(user, id));
      setComment(""); setCommentActivityId(""); setReplyTo(null); setReplyText(""); setCommentError(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Detail siswa gagal dimuat."); }
  };

  const refreshSelected = async () => {
    if (user && selected) setSelected(await classMonitoringService.getStudentDetail(user, selected.id));
  };

  const submitComment = async () => {
    if (!user || !selected) return;
    setSavingComment(true); setCommentError(null);
    try { await classMonitoringService.addComment(user, selected.id, comment, commentActivityId); await refreshSelected(); setComment(""); setCommentActivityId(""); }
    catch (e) { setCommentError(e instanceof Error ? e.message : "Komentar gagal dikirim."); }
    finally { setSavingComment(false); }
  };

  const submitReply = async () => {
    if (!user || !selected || !replyTo) return;
    setSavingComment(true); setCommentError(null);
    try { await classMonitoringService.replyComment(user, selected.id, replyTo.id, replyText); await refreshSelected(); setReplyTo(null); setReplyText(""); }
    catch (e) { setCommentError(e instanceof Error ? e.message : "Balasan gagal dikirim."); }
    finally { setSavingComment(false); }
  };

  const startVoice = (target: "comment" | "reply") => {
    if (listening) return;
    const recognition = speechCtor();
    if (!recognition) { setSpeechSupported(false); return; }
    setListening(true); recognition.lang = "id-ID"; recognition.interimResults = false; recognition.continuous = false;
    recognition.onresult = (event) => {
      const text = Array.from(event.results).map((r) => r[0]?.transcript ?? "").join(" ").trim();
      if (target === "comment") setComment((v) => `${v}${v ? " " : ""}${text}`.slice(0, 500));
      else setReplyText((v) => `${v}${v ? " " : ""}${text}`.slice(0, 500));
    };
    recognition.onend = () => setListening(false); recognition.onerror = () => setListening(false); recognition.start();
  };

  if (loading) return <div className="min-h-full bg-[#f6fbff] p-4 md:p-8"><div className="mx-auto max-w-7xl animate-pulse space-y-6"><div className="h-32 rounded-3xl bg-white"/><div className="grid grid-cols-2 gap-4 lg:grid-cols-5">{[1,2,3,4,5].map((i)=><div key={i} className="h-28 rounded-2xl bg-white"/>)}</div><div className="h-96 rounded-3xl bg-white"/></div></div>;
  if (error || !data) return <div className="flex min-h-full items-center justify-center bg-[#f6fbff] p-6"><div className="w-full max-w-md rounded-3xl border bg-white p-8 text-center shadow-sm"><h2 className="text-xl font-extrabold">Dashboard tidak dapat dimuat</h2><p className="mt-2 text-sm text-slate-500">{error ?? "Data monitoring belum tersedia."}</p><button onClick={() => void load()} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#203A5B] px-4 py-2.5 text-sm font-bold text-white"><RefreshCw className="h-4 w-4"/>Coba lagi</button></div></div>;

  return <div className="min-h-full bg-[#f6fbff] p-4 md:p-8">
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-[2rem] bg-gradient-to-br from-[#203A5B] to-[#294a70] p-5 text-white shadow-lg md:p-7"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-semibold text-[#D7EFFF]">Monitoring Wali Kelas</p><h1 className="mt-1 text-2xl font-extrabold md:text-3xl">{data.classGroup.levelName} • {data.classGroup.rombelName}</h1><p className="mt-1 text-sm text-[#D7EFFF]">Tahun Ajaran {data.classGroup.academicYearName} · {user?.name}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold"><RefreshCw className="h-4 w-4"/>Muat ulang</button><button disabled={!data.permissions.canExport} onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl bg-[#D7EFFF] px-4 py-2.5 text-sm font-bold text-[#203A5B] disabled:opacity-50"><Download className="h-4 w-4"/>Export laporan</button><button onClick={() => { logout(); window.location.href="/login"; }} className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold">Keluar</button></div></div></header>

      <section className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-5">{[{label:"Siswa",value:data.summary.totalStudents,icon:Users},{label:"Digital",value:data.summary.digitalStudents,icon:Activity},{label:"Manual",value:data.summary.manualStudents,icon:Users},{label:"Aktif Hari Ini",value:data.summary.activeToday,icon:TrendingUp},{label:"Rata-rata Perkembangan",value:`${data.summary.averageProgressPercent}%`,icon:Award}].map(({label,value,icon:Icon})=><div key={label} className="rounded-2xl border bg-white p-4 shadow-sm md:p-5"><Icon className="h-5 w-5 text-[#203A5B]"/><p className="mt-3 text-xs font-bold text-slate-500">{label}</p><p className="mt-1 text-xl font-extrabold md:text-2xl">{value}</p></div>)}</section>

      <section className="grid gap-4 lg:grid-cols-[1fr_300px]"><div className="rounded-3xl border bg-white p-4 shadow-sm md:p-5"><div className="flex flex-col gap-3 lg:flex-row lg:items-center"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Cari nama atau NIS..." className="w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none focus:border-[#203A5B]"/></div><div className="grid grid-cols-2 gap-2 sm:flex"><select value={method} onChange={(e)=>setMethod(e.target.value as typeof method)} className="rounded-xl border px-3 py-3 text-sm font-semibold"><option value="ALL">Semua metode</option><option value="DIGITAL">Digital</option><option value="MANUAL">Manual</option></select><select value={activity} onChange={(e)=>setActivity(e.target.value as typeof activity)} className="rounded-xl border px-3 py-3 text-sm font-semibold"><option value="ALL">Semua aktivitas</option><option value="completed">Lengkap</option><option value="partial">Sebagian</option><option value="not_started">Belum mulai</option></select></div></div></div><div className="rounded-3xl border bg-white p-4 shadow-sm"><div className="flex gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#D7EFFF] text-[#203A5B]"><FileBarChart2 className="h-5 w-5"/></div><div><p className="font-extrabold">Laporan & Pencapaian</p><p className="mt-1 text-xs text-slate-500">Sesuai scope rombel dan hasil filter.</p></div></div><button disabled={!data.permissions.canReadReports || !data.permissions.canExport} onClick={exportCsv} className="mt-3 w-full rounded-xl bg-[#203A5B] px-3 py-2.5 text-xs font-bold text-white disabled:opacity-40">Export laporan rombel</button></div></section>

      <section className="overflow-hidden rounded-3xl border bg-white shadow-sm"><div className="border-b p-4 md:p-5"><h2 className="font-extrabold">Daftar Siswa</h2><p className="mt-1 text-xs text-slate-500">Menampilkan {filtered.length} dari {data.students.length} siswa dalam scope rombel.</p></div><div className="hidden overflow-x-auto md:block"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="px-5 py-3 text-left">Siswa</th><th className="px-5 py-3 text-left">Metode</th><th className="px-5 py-3 text-left">Aktivitas</th><th className="px-5 py-3 text-left">Perkembangan</th><th className="px-5 py-3 text-left">Pencapaian</th><th className="px-5 py-3 text-right">Aksi</th></tr></thead><tbody>{filtered.map((s)=><tr key={s.id} className="border-t hover:bg-[#D7EFFF]/30"><td className="px-5 py-4"><p className="font-extrabold">{s.name}</p><p className="text-xs text-slate-400">NIS {s.nis ?? "—"}</p></td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${s.method === "DIGITAL" ? "bg-[#D7EFFF] text-[#203A5B]" : "bg-amber-100 text-amber-700"}`}>{s.method}</span></td><td className="px-5 py-4"><span className="font-bold">{statusLabel[s.activityStatus]}</span><p className="text-xs text-slate-400">{s.activityLabel}</p></td><td className="min-w-44 px-5 py-4"><div className="flex justify-between text-xs font-bold"><span>{s.progressPercent}%</span><span>Lv. {s.level}</span></div><div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#203A5B]" style={{width:`${s.progressPercent}%`}}/></div></td><td className="px-5 py-4"><p className="font-bold">{s.badgeCount} Badge · {s.awardCount} Award</p><p className="text-xs text-slate-400">{s.commentCount} komentar</p></td><td className="px-5 py-4 text-right"><button onClick={()=>void openDetail(s.id)} className="rounded-xl bg-[#D7EFFF] px-3 py-2 text-xs font-extrabold text-[#203A5B]">Lihat monitoring</button></td></tr>)}</tbody></table></div><div className="divide-y md:hidden">{filtered.map((s)=><button key={s.id} onClick={()=>void openDetail(s.id)} className="w-full p-4 text-left"><div className="flex items-start justify-between gap-3"><div><p className="font-extrabold">{s.name}</p><p className="mt-1 text-xs text-slate-400">NIS {s.nis ?? "—"}</p></div><span className={`rounded-full px-2 py-1 text-[11px] font-bold ${s.method === "DIGITAL" ? "bg-[#D7EFFF] text-[#203A5B]" : "bg-amber-100 text-amber-700"}`}>{s.method}</span></div><div className="mt-4 grid grid-cols-3 gap-3 text-xs"><div><p className="text-slate-400">Aktivitas</p><p className="mt-1 font-bold">{statusLabel[s.activityStatus]}</p></div><div><p className="text-slate-400">Progress</p><p className="mt-1 font-bold">{s.progressPercent}%</p></div><div><p className="text-slate-400">Komentar</p><p className="mt-1 font-bold">{s.commentCount}</p></div></div></button>)}</div>{!filtered.length && <div className="p-10 text-center text-sm text-slate-500">Tidak ada siswa yang sesuai filter.</div>}</section>
    </div>

    {selected && <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40" onMouseDown={(e)=>{if(e.currentTarget===e.target)setSelected(null)}}><aside className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl"><div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-5 py-4"><div><h2 className="font-extrabold">Monitoring Siswa</h2><p className="text-xs text-slate-500">{selected.name} · {selected.method}</p></div><button onClick={()=>setSelected(null)} className="rounded-full p-2 hover:bg-slate-100"><X className="h-5 w-5"/></button></div><div className="space-y-6 p-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[["Poin",selected.points],["EXP",selected.exp],["Level",`Lv. ${selected.level}`],["Streak",`${selected.streak} hari`]].map(([k,v])=><div key={String(k)} className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-400">{k}</p><p className="mt-1 text-lg font-extrabold">{v}</p></div>)}</div>
      <section className="rounded-3xl border border-[#D7EFFF] bg-[#f8fcff] p-4 md:p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-extrabold text-[#203A5B]">Isi 7 Kebiasaan</h3><p className="mt-1 text-xs text-slate-500">Aktivitas dan jawaban digital siswa dalam rombel ini.</p></div><span className="rounded-full bg-[#D7EFFF] px-3 py-1 text-[11px] font-extrabold text-[#203A5B]">{selected.method}</span></div>{selected.method === "MANUAL" ? <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Siswa Manual menggunakan buku fisik. Tidak ada input atau rekap buku manual melalui aplikasi oleh Wali Kelas.</div> : <div className="mt-4 grid gap-3 sm:grid-cols-2">{selected.habits.map((h, index)=><div key={h.id} className={`rounded-2xl border bg-white p-4 shadow-sm ${h.status === "done" ? "border-emerald-100" : "border-slate-200"}`}><div className="flex items-start gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#D7EFFF] text-xs font-black text-[#203A5B]">{index + 1}</span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><span className="text-sm font-extrabold text-slate-800">{h.name}</span><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-extrabold ${h.status === "done" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{h.status === "done" ? "Selesai" : "Belum"}</span></div>{h.indicatorLabel && <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">{h.indicatorLabel}</p>}</div></div></div>)}</div>}</section>
      <section><h3 className="font-extrabold">Perkembangan 7 Hari</h3>{selected.weeklyActivity.length ? <div className="mt-3 rounded-2xl bg-slate-50 p-4"><div className="flex h-32 items-end gap-2">{selected.weeklyActivity.map(d=><div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1"><div className="w-full rounded-t bg-[#203A5B]" style={{height:`${Math.max(8,d.activityPercent)}%`}} title={`${d.activityPercent}%`}/><span className="text-[9px] text-slate-400">{new Date(d.date).getDate()}</span></div>)}</div><p className="mt-2 text-center text-xs text-slate-500">Persentase aktivitas harian siswa Digital.</p></div> : <p className="mt-3 text-sm text-slate-500">Belum ada riwayat aktivitas digital.</p>}</section>
      <section><h3 className="font-extrabold">Pencapaian</h3><div className="mt-3 grid gap-2 sm:grid-cols-3">{selected.achievements.length ? selected.achievements.map(a=><div key={a.id} className="rounded-xl border p-3"><p className="text-sm font-bold">{a.title}</p><p className="mt-1 text-xs capitalize text-slate-400">{a.type} · {a.date ?? "—"}</p></div>) : <p className="text-sm text-slate-500">Belum ada pencapaian.</p>}</div></section>
      <section><div className="flex items-center gap-2"><MessageCircle className="h-5 w-5 text-[#203A5B]"/><div><h3 className="font-extrabold">Komentar pada Aktivitas</h3><p className="text-xs text-slate-500">Komentar tetap tersedia walaupun jawaban sudah terkunci.</p></div></div><div className="mt-3 space-y-3">{selected.comments.length ? selected.comments.map(c=><div key={c.id} className={`rounded-2xl p-3 ${c.parentCommentId ? "ml-5 bg-sky-50" : c.authorRole === "wali_kelas" ? "bg-[#D7EFFF]" : "bg-slate-50"}`}><div className="flex justify-between gap-3"><div><p className="text-xs font-extrabold">{c.authorName}</p>{c.activityName && <p className="mt-0.5 text-[10px] font-bold text-[#203A5B]">Aktivitas: {c.activityName}</p>}</div><p className="text-[10px] text-slate-400">{formatDate(c.createdAt)}</p></div><p className="mt-1 text-sm text-slate-600">{c.message}</p>{data.permissions.canComment && !c.parentCommentId && <button onClick={()=>{setReplyTo(c);setReplyText("");}} className="mt-2 text-xs font-extrabold text-[#203A5B]">Balas komentar</button>}</div>) : <p className="text-sm text-slate-500">Belum ada komentar pada aktivitas.</p>}</div>
        {data.permissions.canComment && selected.method === "DIGITAL" && <div className="mt-4 rounded-2xl bg-slate-50 p-4">{replyTo ? <div className="mb-3 flex items-center justify-between rounded-xl bg-white p-3"><p className="text-xs font-semibold text-slate-600">Membalas: {replyTo.message}</p><button onClick={()=>setReplyTo(null)}><X className="h-4 w-4"/></button></div> : <select value={commentActivityId} onChange={(e)=>setCommentActivityId(e.target.value)} className="mb-3 w-full rounded-xl border bg-white px-3 py-2.5 text-sm font-semibold"><option value="">Pilih aktivitas yang dikomentari</option>{selected.habits.map(h=><option key={h.id} value={h.id}>{h.name}</option>)}</select>}<div className="relative"><textarea value={replyTo ? replyText : comment} onChange={(e)=>replyTo ? setReplyText(e.target.value) : setComment(e.target.value)} maxLength={500} rows={3} placeholder={replyTo ? "Tulis balasan..." : "Tulis komentar pada aktivitas..."} className="w-full rounded-xl border bg-white p-3 pr-12 text-sm outline-none focus:border-[#203A5B]"/><button type="button" onClick={()=>startVoice(replyTo ? "reply" : "comment")} className="absolute right-2 top-2 rounded-lg bg-[#D7EFFF] p-2 text-[#203A5B]" title="Voice-to-text"><Mic className="h-4 w-4"/></button></div><div className="mt-2 flex items-center justify-between gap-2"><span className="text-xs text-slate-400">{(replyTo ? replyText : comment).length}/500 {listening && <span className="font-bold text-rose-600">Mendengarkan...</span>}</span><button disabled={savingComment || !(replyTo ? replyText.trim() : comment.trim()) || (!replyTo && !commentActivityId)} onClick={()=>void (replyTo ? submitReply() : submitComment())} className="inline-flex items-center gap-2 rounded-xl bg-[#203A5B] px-4 py-2 text-xs font-bold text-white disabled:opacity-40"><Send className="h-4 w-4"/>{replyTo ? "Kirim balasan" : "Kirim komentar"}</button></div>{!speechSupported && <p className="mt-2 text-xs font-semibold text-amber-700">Voice-to-text tidak tersedia di browser ini; silakan ketik komentar.</p>}{commentError && <p className="mt-2 text-xs font-semibold text-rose-600">{commentError}</p>}</div>}
      </section>
    </div></aside></div>}
  </div>;
};
