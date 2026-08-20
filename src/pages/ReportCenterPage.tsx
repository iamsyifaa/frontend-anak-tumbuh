import React, { useEffect, useMemo, useState } from "react";
import { Download, FileText, Filter, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { reportService } from "../services/reportService";
import { ReportFilter, ReportResult, ReportScope, InitiativeReportValue } from "../types/report";

const iso = (date: Date) => date.toISOString().slice(0, 10);
const today = new Date();
const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

export interface ReportCenterPageProps { variant?: "default" | "wali_kelas"; }

export const ReportCenterPage: React.FC<ReportCenterPageProps> = ({ variant = "default" }) => {
  const isWali = variant === "wali_kelas";
  const accent = isWali ? "#203A5B" : "#0284C7";
  const { user, hasPermission } = useAuth();
  const [contextLoading, setContextLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReportResult | null>(null);
  const [availableScopes, setAvailableScopes] = useState<ReportScope[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [habits, setHabits] = useState<{ id: string; name: string }[]>([]);
  const [filter, setFilter] = useState<ReportFilter>({ scope: "student", periodPreset: "this_month", startDate: iso(monthStart), endDate: iso(today), initiatives: ["Sadar sendiri", "Disuruh"] });

  useEffect(() => {
    if (!user) return;
    setContextLoading(true);
    reportService.getContext(user).then((ctx) => {
      const scopes = ctx.availableReports.map((report) => report.id);
      setAvailableScopes(scopes);
      setClasses(ctx.availableClasses);
      setHabits(ctx.availableHabits);
      setFilter((current) => ({ ...current, scope: scopes.includes("student") ? "student" : (scopes[0] ?? "student"), classId: user.role === "kepala_sekolah" ? ctx.availableClasses[0]?.id : undefined, habitId: ctx.availableHabits[0]?.id, initiatives: ["Sadar sendiri", "Disuruh"] }));
    }).catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat Report Center.")).finally(() => setContextLoading(false));
  }, [user]);

  const updatePreset = (preset: ReportFilter["periodPreset"]) => {
    const now = new Date();
    let start = new Date(now);
    if (preset === "this_week") { const day = now.getDay() || 7; start.setDate(now.getDate() - day + 1); }
    else if (preset === "this_month") start = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (preset === "this_term") { start = new Date(now.getFullYear(), 6, 1); if (now < start) start = new Date(now.getFullYear() - 1, 6, 1); }
    setFilter((current) => ({ ...current, periodPreset: preset, startDate: iso(start), endDate: iso(now) }));
  };

  const selectScope = (scope: ReportScope) => setFilter((current) => ({ ...current, scope, studentId: undefined, habitId: scope === "habit" ? (habits[0]?.id ?? current.habitId) : current.habitId, initiatives: scope === "habit" ? ["Sadar sendiri", "Disuruh"] : current.initiatives, classId: user?.role === "kepala_sekolah" ? current.classId : undefined }));

  const runReport = async () => {
    if (!user) return;
    setError(null); setLoading(true);
    try { setResult(await reportService.getReport(user, filter)); }
    catch (err) { setError(err instanceof Error ? err.message : "Gagal memuat laporan."); }
    finally { setLoading(false); }
  };

  const handleExport = async (format: "csv" | "pdf") => {
    if (!user || !hasPermission("export:reports")) return;
    setExporting(format); setError(null);
    try {
      const blob = await reportService.exportReport(user, filter, format);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `anaktumbuh-${filter.scope}-${filter.startDate}-${filter.endDate}.${format}`;
      anchor.click(); URL.revokeObjectURL(url);
    } catch (err) { setError(err instanceof Error ? err.message : "Export gagal."); }
    finally { setExporting(null); }
  };

  const formatCell = (value: unknown) => value == null || value === "" ? "—" : String(value);
  const classFilterVisible = user?.role === "kepala_sekolah";
  const currentColumns = useMemo(() => result?.columns ?? [], [result]);

  if (contextLoading) return <div className="animate-pulse space-y-5"><div className="h-9 w-72 rounded-xl bg-slate-200" /><div className="h-28 rounded-3xl bg-slate-200" /><div className="h-80 rounded-3xl bg-slate-200" /></div>;
  if (!availableScopes.length) return <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center"><ShieldCheck className="mx-auto h-10 w-10 text-slate-400" /><h2 className="mt-3 font-heading text-xl font-bold">Report Center tidak tersedia</h2><p className="mt-1 text-sm text-slate-500">Fitur laporan hanya tersedia untuk Kepala Sekolah dan Wali Kelas.</p></div>;

  return <section className={`space-y-6 ${isWali ? "min-h-[calc(100vh-120px)]" : ""}`}>
    <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><div className="flex items-center gap-2 text-sm font-bold" style={{ color: accent }}><FileText className="h-4 w-4" /> Report Center</div><h1 className="mt-1 font-heading text-3xl font-extrabold text-slate-900">Laporan ANAKTUMBUH</h1><p className="mt-1 max-w-2xl text-sm text-slate-500">Pilih jenis laporan. Struktur tabel otomatis berubah mengikuti jenis yang dipilih dan filter scope akun.</p></div><div className="rounded-2xl px-4 py-3 text-xs font-semibold" style={{ background: `${accent}14`, color: accent }}>Role: {user?.role.replaceAll("_", " ")}</div></header>

    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center gap-2 font-heading text-lg font-bold text-slate-900"><Filter className="h-5 w-5" style={{ color: accent }} /> Filter laporan</div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm font-bold text-slate-700">Jenis laporan<select value={filter.scope} onChange={(e) => selectScope(e.target.value as ReportScope)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-medium outline-none">{availableScopes.map((scope) => <option key={scope} value={scope}>{scope === "student" ? "Siswa" : scope === "class" ? "Rombel / Kelas" : scope === "achievement" ? "Pencapaian" : scope === "habit" ? "Per Kebiasaan" : "Per Inisiatif"}</option>)}</select></label>
        {filter.scope === "habit" && <label className="text-sm font-bold text-slate-700">Kebiasaan<select value={filter.habitId ?? ""} onChange={(e) => setFilter({ ...filter, habitId: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-medium outline-none">{habits.map((habit) => <option key={habit.id} value={habit.id}>{habit.name}</option>)}</select></label>}
        {filter.scope === "habit" && (
          <div className="self-end pb-0">
            <p className="mb-2 text-sm font-bold text-slate-700">Inisiatif</p>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                <input type="checkbox" className="accent-violet-600" checked={(filter.initiatives ?? []).includes("Sadar sendiri")} onChange={() => setFilter((current) => {
                  const currentValues = current.initiatives ?? [];
                  return { ...current, initiatives: currentValues.includes("Sadar sendiri") ? currentValues.filter((x) => x !== "Sadar sendiri") : [...currentValues, "Sadar sendiri"] };
                })} />
                Sadar sendiri
              </label>
              <label className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                <input type="checkbox" className="accent-violet-600" checked={(filter.initiatives ?? []).includes("Disuruh")} onChange={() => setFilter((current) => {
                  const currentValues = current.initiatives ?? [];
                  return { ...current, initiatives: currentValues.includes("Disuruh") ? currentValues.filter((x) => x !== "Disuruh") : [...currentValues, "Disuruh"] };
                })} />
                Disuruh
              </label>
            </div>
          </div>
        )}
        
        {classFilterVisible && <label className="text-sm font-bold text-slate-700">Rombel / Kelas<select value={filter.classId ?? ""} onChange={(e) => setFilter({ ...filter, classId: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-medium outline-none"><option value="">Semua kelas</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
        <label className="text-sm font-bold text-slate-700">Periode<select value={filter.periodPreset} onChange={(e) => updatePreset(e.target.value as ReportFilter["periodPreset"])} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-medium outline-none"><option value="this_week">Minggu ini</option><option value="this_month">Bulan ini</option><option value="this_term">Semester / periode</option><option value="custom">Custom</option></select></label>
        <label className="text-sm font-bold text-slate-700">Mulai<input type="date" value={filter.startDate} onChange={(e) => setFilter({ ...filter, startDate: e.target.value, periodPreset: "custom" })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-medium outline-none" /></label>
        <label className="text-sm font-bold text-slate-700">Sampai<input type="date" value={filter.endDate} onChange={(e) => setFilter({ ...filter, endDate: e.target.value, periodPreset: "custom" })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-medium outline-none" /></label>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 text-xs text-slate-500"><ShieldCheck className="h-4 w-4" /> Authorization dan scope final tetap ditentukan backend Laravel.</div><button onClick={runReport} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-extrabold text-white transition disabled:opacity-60" style={{ background: accent }}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />{loading ? "Memuat..." : "Tampilkan laporan"}</button></div>
    </div>

    {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

    {result && <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Siswa", result.totals.students], ["Digital", result.totals.digital], ["Manual", result.totals.manual], ["Hari aktif", result.totals.activeDays]].map(([label, value]) => <div key={String(label)} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-2 font-heading text-3xl font-extrabold text-slate-900">{value}</p></div>)}</div>
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="font-heading text-xl font-bold text-slate-900">{result.title}</h2><p className="mt-1 text-xs font-semibold text-slate-500">{result.subtitle} · {result.period.startDate} — {result.period.endDate}</p></div><div className="flex flex-col gap-2 sm:flex-row"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={filter.search ?? ""} onChange={(e) => setFilter({ ...filter, search: e.target.value })} placeholder="Cari siswa..." className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none sm:w-56" /></div><button onClick={() => handleExport("csv")} disabled={!!exporting || !hasPermission("export:reports")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-extrabold text-slate-700 disabled:opacity-50"><Download className="h-4 w-4" />{exporting === "csv" ? "Export..." : "CSV"}</button><button onClick={() => handleExport("pdf")} disabled={!!exporting || !hasPermission("export:reports")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-extrabold text-slate-700 disabled:opacity-50"><Download className="h-4 w-4" />{exporting === "pdf" ? "Export..." : "PDF"}</button></div></div><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500"><tr>{currentColumns.map((column) => <th key={column.key} className="px-5 py-3">{column.label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{result.rows.map((row) => <tr key={row.id} className="hover:bg-sky-50/30">{currentColumns.map((column) => <td key={column.key} className="px-5 py-3 text-xs font-semibold text-slate-600">{formatCell((row as unknown as Record<string, unknown>)[column.key])}</td>)}</tr>)}</tbody></table>{!result.rows.length && <div className="p-8 text-center text-sm font-semibold text-slate-500">Tidak ada data untuk filter ini.</div>}</div></div>
    </>}
  </section>;
};
