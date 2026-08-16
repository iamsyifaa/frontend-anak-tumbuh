import React, { useEffect, useMemo, useState } from "react";
import { MessageCircle, Search, Download, RefreshCw, ShieldCheck, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { reportService } from "../services/reportService";
import { ReportRow } from "../types/report";

export const WaliKelasDashboardPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState<"ALL" | "DIGITAL" | "MANUAL">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<ReportRow | null>(null);
  const [comment, setComment] = useState("");
  const [commentSent, setCommentSent] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true); setError("");
    try {
      const result = await reportService.getReport(user, {
        scope: "class",
        periodPreset: "this_month",
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
      });
      setRows(result.rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat monitoring rombel.");
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [user]);

  const visibleRows = useMemo(() => rows.filter((row) => {
    const matchSearch = `${row.studentName} ${row.nis}`.toLowerCase().includes(search.toLowerCase());
    const matchMethod = method === "ALL" || row.method === method;
    return matchSearch && matchMethod;
  }), [rows, search, method]);

  const exportClass = async () => {
    if (!user || !hasPermission("export:reports")) return;
    setExporting(true);
    try {
      const blob = await reportService.exportReport(user, {
        scope: "class",
        periodPreset: "this_month",
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        search: search || undefined,
      }, "csv");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "anaktumbuh-monitoring-rombel.csv"; a.click(); URL.revokeObjectURL(url);
    } catch (err) { setError(err instanceof Error ? err.message : "Export gagal."); }
    finally { setExporting(false); }
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-12 rounded-2xl bg-slate-200" /><div className="h-24 rounded-3xl bg-slate-200" /><div className="h-80 rounded-3xl bg-slate-200" /></div>;
  if (error) return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700"><b>Monitoring rombel gagal dimuat.</b><p className="mt-1 text-sm">{error}</p><button onClick={() => void load()} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-bold"><RefreshCw className="h-4 w-4" /> Coba lagi</button></div>;

  return <section className="space-y-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-sm font-bold text-sky-600">Monitoring Rombel</p><h1 className="text-3xl font-black text-slate-900">Wali Kelas</h1><p className="mt-1 text-sm text-slate-500">Hanya siswa pada rombel tanggung jawab akun ini.</p></div>
      <button onClick={() => void exportClass()} disabled={exporting || !hasPermission("export:reports")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Download className="h-4 w-4" />{exporting ? "Export..." : "Export"}</button>
    </div>
    <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-xs font-bold text-slate-400">Siswa</p><p className="mt-1 text-2xl font-black">{rows.length}</p></div><div className="rounded-2xl bg-emerald-50 p-4"><p className="text-xs font-bold text-emerald-600">Digital</p><p className="mt-1 text-2xl font-black text-emerald-700">{rows.filter(r => r.method === "DIGITAL").length}</p></div><div className="rounded-2xl bg-amber-50 p-4"><p className="text-xs font-bold text-amber-600">Manual</p><p className="mt-1 text-2xl font-black text-amber-700">{rows.filter(r => r.method === "MANUAL").length}</p></div></div>
    <div className="rounded-3xl bg-white p-4 shadow-sm"><div className="grid gap-3 sm:grid-cols-2"><label className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama/NIS" className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3" /></label><select value={method} onChange={e => setMethod(e.target.value as typeof method)} className="rounded-xl border border-slate-200 px-3 py-2.5"><option value="ALL">Semua metode</option><option value="DIGITAL">DIGITAL</option><option value="MANUAL">MANUAL</option></select></div></div>
    <div className="overflow-x-auto rounded-3xl bg-white shadow-sm"><table className="min-w-[760px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Siswa</th><th className="px-5 py-3">Metode</th><th className="px-5 py-3">Aktivitas</th><th className="px-5 py-3">Perkembangan</th><th className="px-5 py-3">Pencapaian</th><th className="px-5 py-3">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{visibleRows.map(row => <tr key={row.id}><td className="px-5 py-4"><b>{row.studentName}</b><p className="text-xs text-slate-400">{row.nis}</p></td><td className="px-5 py-4"><span className={`rounded-full px-2 py-1 text-xs font-bold ${row.method === "DIGITAL" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{row.method}</span></td><td className="px-5 py-4">{row.activityPercent == null ? "—" : `${row.activityPercent}%`}</td><td className="px-5 py-4">{row.points == null ? "—" : `${row.points} Poin • Lv. ${row.level}`}</td><td className="px-5 py-4">{row.badges} badge • {row.awards} award</td><td className="px-5 py-4"><button onClick={() => { setSelected(row); setComment(""); setCommentSent(false); }} className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700">Detail</button></td></tr>)}{visibleRows.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">Tidak ada siswa sesuai filter.</td></tr>}</tbody></table></div>
    <p className="flex items-center gap-2 text-xs font-semibold text-slate-500"><ShieldCheck className="h-4 w-4" /> Authorization dan scope final ditentukan backend.</p>
    {selected && <div className="fixed inset-0 z-50 bg-slate-900/40 p-3 sm:p-6" onClick={() => setSelected(null)}><aside className="ml-auto h-full w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl" onClick={e => e.stopPropagation()}><div className="flex items-start justify-between"><div><h2 className="text-2xl font-black">{selected.studentName}</h2><p className="text-sm text-slate-500">{selected.nis} • {selected.method}</p></div><button onClick={() => setSelected(null)}><X /></button></div><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-400">Aktivitas</p><b>{selected.activityPercent == null ? "Tidak tersedia" : `${selected.activityPercent}%`}</b></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-400">Pencapaian</p><b>{selected.badges} badge • {selected.awards} award</b></div></div>{selected.method === "MANUAL" ? <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">Siswa Manual menggunakan buku fisik. Tidak ada input atau rekap buku melalui aplikasi.</div> : <div className="mt-5 rounded-2xl bg-sky-50 p-4 text-sm text-sky-800">Aktivitas digital dan perkembangan ditampilkan dari response backend.</div>}<div className="mt-6"><h3 className="font-black">Komentar</h3><div className="mt-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">Belum ada komentar pada mock data.</div>{selected.method === "DIGITAL" && <div className="mt-3"><textarea value={comment} onChange={e => setComment(e.target.value)} maxLength={500} placeholder="Tulis komentar..." className="w-full rounded-xl border border-slate-200 p-3" /><div className="mt-2 flex items-center justify-between"><span className="text-xs text-slate-400">{comment.length}/500</span><button disabled={!comment.trim() || commentSent || !hasPermission("write:teacher_notes")} onClick={() => setCommentSent(true)} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><MessageCircle className="h-4 w-4" />{commentSent ? "Terkirim" : "Kirim"}</button></div></div>}</div></aside></div>}
  </section>;
};
