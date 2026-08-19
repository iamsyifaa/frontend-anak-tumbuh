import React, { useEffect, useMemo, useState } from "react";
import { Download, FileText, Filter, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { reportService } from "../services/reportService";
import { ReportFilter, ReportResult, ReportScope } from "../types/report";

const iso = (date: Date) => date.toISOString().slice(0, 10);
const today = new Date();
const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

export interface ReportCenterPageProps {
  variant?: "default" | "wali_kelas";
}

export const ReportCenterPage: React.FC<ReportCenterPageProps> = ({ variant = "default" }) => {
  const isWali = variant === "wali_kelas";
  const accentText = isWali ? "text-[#203A5B]" : "text-sky-600";
  const accentIcon = isWali ? "text-[#203A5B]" : "text-sky-500";
  const accentSoft = isWali ? "bg-[#D7EFFF] text-[#203A5B]" : "bg-sky-50 text-sky-800";
  const accentButton = isWali ? "bg-[#203A5B] hover:bg-[#29496f] shadow-lg shadow-[#203A5B]/20" : "bg-sky-500 hover:bg-sky-600 shadow-sm";
  const accentFocus = isWali ? "focus:border-[#203A5B]" : "focus:border-sky-400";
  const accentRow = isWali ? "hover:bg-[#D7EFFF]/40" : "hover:bg-sky-50/40";
  const { user, hasPermission } = useAuth();
  const [contextLoading, setContextLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReportResult | null>(null);
  const [availableScopes, setAvailableScopes] = useState<ReportScope[]>([]);
  const [filter, setFilter] = useState<ReportFilter>({
    scope: "student",
    periodPreset: "this_month",
    startDate: iso(monthStart),
    endDate: iso(today),
  });

  useEffect(() => {
    if (!user) return;
    reportService.getContext(user)
      .then((ctx) => {
        setAvailableScopes(ctx.availableReports.map((report) => report.id));
        setFilter((current) => ({ ...current, scope: ctx.availableReports[0]?.id ?? "student", classId: user.classId }));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat Report Center."))
      .finally(() => setContextLoading(false));
  }, [user]);

  const visibleRows = useMemo(() => result?.rows ?? [], [result]);

  const updatePreset = (preset: ReportFilter["periodPreset"]) => {
    const now = new Date();
    let start = new Date(now);
    if (preset === "this_week") {
      const day = now.getDay() || 7;
      start.setDate(now.getDate() - day + 1);
    } else if (preset === "this_month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (preset === "this_term") {
      start = new Date(now.getFullYear(), 6, 1);
      if (now < start) start = new Date(now.getFullYear() - 1, 6, 1);
    }
    setFilter((current) => ({ ...current, periodPreset: preset, startDate: iso(start), endDate: iso(now) }));
  };

  const runReport = async () => {
    if (!user) return;
    setError(null);
    setLoading(true);
    try {
      setResult(await reportService.getReport(user, filter));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat laporan.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setFilter((current) => ({ ...current, search: value }));
  };

  const handleExport = async (format: "csv" | "pdf") => {
    if (!user || !hasPermission("export:reports")) return;
    setError(null);
    setExporting(format);
    try {
      const blob = await reportService.exportReport(user, filter, format);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `anaktumbuh-${filter.scope}-${filter.startDate}-${filter.endDate}.${format}`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export gagal.");
    } finally {
      setExporting(null);
    }
  };

  if (contextLoading) {
    return <div className="animate-pulse space-y-5"><div className="h-9 w-72 rounded-xl bg-slate-200" /><div className="h-28 rounded-3xl bg-slate-200" /><div className="h-80 rounded-3xl bg-slate-200" /></div>;
  }

  if (!availableScopes.length) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center"><ShieldCheck className="mx-auto h-10 w-10 text-slate-400" /><h2 className="mt-3 font-heading text-xl font-bold">Tidak ada laporan yang tersedia</h2><p className="mt-1 text-sm text-slate-500">Backend belum memberikan permission laporan untuk akun ini.</p></div>;
  }

  return (
    <section className={`space-y-6 ${isWali ? "min-h-[calc(100vh-120px)]" : ""}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className={`flex items-center gap-2 text-sm font-bold ${accentText}`}><FileText className="h-4 w-4" /> Report Center</div>
          <h1 className="mt-1 font-heading text-3xl font-extrabold text-slate-900">Laporan ANAKTUMBUH</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">Hanya laporan yang sesuai role dan scope akun yang ditampilkan. Periode yang dipilih juga menjadi dasar export.</p>
        </div>
        <div className={`rounded-2xl px-4 py-3 text-xs font-semibold ${accentSoft}`}>Role: {user?.role.replaceAll("_", " ")}</div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2 font-heading text-lg font-bold text-slate-900"><Filter className={`h-5 w-5 ${accentIcon}`} /> Filter laporan</div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm font-bold text-slate-700">Jenis laporan<select value={filter.scope} onChange={(e) => setFilter({ ...filter, scope: e.target.value as ReportScope, studentId: undefined })} className={`mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-medium outline-none ${accentFocus}`}>{availableScopes.map((scope) => <option key={scope} value={scope}>{scope === "student" ? "Siswa" : scope === "class" ? "Rombel / Kelas" : scope === "school" ? "Sekolah" : "Pencapaian"}</option>)}</select></label>
          <label className="text-sm font-bold text-slate-700">Periode<select value={filter.periodPreset} onChange={(e) => updatePreset(e.target.value as ReportFilter["periodPreset"])} className={`mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-medium outline-none ${accentFocus}`}><option value="this_week">Minggu ini</option><option value="this_month">Bulan ini</option><option value="this_term">Semester / periode</option><option value="custom">Custom</option></select></label>
          <label className="text-sm font-bold text-slate-700">Mulai<input type="date" value={filter.startDate} onChange={(e) => setFilter({ ...filter, startDate: e.target.value, periodPreset: "custom" })} className={`mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-medium outline-none ${accentFocus}`} /></label>
          <label className="text-sm font-bold text-slate-700">Sampai<input type="date" value={filter.endDate} onChange={(e) => setFilter({ ...filter, endDate: e.target.value, periodPreset: "custom" })} className={`mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-medium outline-none ${accentFocus}`} /></label>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500"><ShieldCheck className="h-4 w-4" /> Scope dan authorization final ditentukan backend.</div>
          <button onClick={runReport} disabled={loading} className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 disabled:opacity-60 ${accentButton}`}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />{loading ? "Memuat..." : "Tampilkan laporan"}</button>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

      {result && <>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[["Siswa", result.totals.students], ["Digital", result.totals.digital], ["Manual", result.totals.manual], ["Hari aktif", result.totals.activeDays]].map(([label, value]) => <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-2 font-heading text-3xl font-extrabold text-slate-900">{value}</p></div>)}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div><h2 className="font-heading text-xl font-bold text-slate-900">{result.title}</h2><p className="mt-1 text-xs font-semibold text-slate-500">Periode: {result.period.startDate} — {result.period.endDate}</p></div>
            <div className="flex flex-col gap-2 sm:flex-row"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={filter.search ?? ""} onChange={(e) => handleSearch(e.target.value)} placeholder="Cari siswa..." className={`w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none ${accentFocus} sm:w-56`} /></div><div className="flex gap-2"><button onClick={() => handleExport("csv")} disabled={!!exporting || !hasPermission("export:reports")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><Download className="h-4 w-4" />{exporting === "csv" ? "Export..." : "CSV"}</button><button onClick={() => handleExport("pdf")} disabled={!!exporting || !hasPermission("export:reports")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-extrabold text-white hover:bg-slate-800 disabled:opacity-50"><Download className="h-4 w-4" />{exporting === "pdf" ? "Export..." : "PDF"}</button></div></div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Siswa</th><th className="px-5 py-3">Metode</th><th className="px-5 py-3">Aktivitas</th><th className="px-5 py-3">Poin</th><th className="px-5 py-3">EXP</th><th className="px-5 py-3">Level</th><th className="px-5 py-3">Streak</th><th className="px-5 py-3">Pencapaian</th></tr></thead><tbody className="divide-y divide-slate-100">{visibleRows.map((row) => <tr key={row.id} className={accentRow}><td className="px-5 py-4"><p className="font-bold text-slate-900">{row.studentName}</p><p className="text-xs text-slate-500">{row.nis} • {row.className}</p></td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${row.method === "DIGITAL" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{row.method}</span></td><td className="px-5 py-4 font-semibold">{row.activityPercent == null ? "—" : `${row.activityPercent}%`}</td><td className="px-5 py-4 font-bold">{row.points ?? "—"}</td><td className="px-5 py-4 font-bold">{row.exp ?? "—"}</td><td className="px-5 py-4 font-bold">{row.level == null ? "—" : `Lv. ${row.level}`}</td><td className="px-5 py-4">{row.streak == null ? "—" : `${row.streak} hari`}</td><td className="px-5 py-4 font-semibold">{row.badges} badge • {row.awards} award</td></tr>)}{visibleRows.length === 0 && <tr><td colSpan={8} className="px-5 py-12 text-center text-sm font-semibold text-slate-500">Tidak ada data sesuai filter.</td></tr>}</tbody></table>
          </div>
          <div className="border-t border-slate-100 px-5 py-4 text-xs font-semibold text-slate-500">Export menggunakan filter periode dan scope yang sedang aktif.</div>
        </div>
      </>}
    </section>
  );
};
