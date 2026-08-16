import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileSpreadsheet,
  GraduationCap,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SUPER_ADMIN_DASHBOARD_PERMISSIONS, superAdminDashboardService } from "../services/superAdminDashboardService";
import { SuperAdminDashboardData } from "../types/superAdminDashboard";

const statCards = [
  { key: "totalSchools", label: "Total Sekolah", icon: Building2, tone: "violet" },
  { key: "activeSchools", label: "Sekolah Aktif", icon: CheckCircle2, tone: "blue" },
  { key: "totalStudents", label: "Total Siswa", icon: GraduationCap, tone: "pink" },
  { key: "totalClassGroups", label: "Total Rombel", icon: Users, tone: "cyan" },
] as const;

const toneClasses = {
  violet: "bg-violet-50 text-violet-600",
  blue: "bg-blue-50 text-blue-600",
  pink: "bg-pink-50 text-pink-600",
  cyan: "bg-cyan-50 text-cyan-600",
};

const formatUpdatedAt = (value: string) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export const SuperAdminDashboardPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<SuperAdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!user) return;
    setError(null);
    silent ? setRefreshing(true) : setLoading(true);
    try {
      setData(await superAdminDashboardService.getOverview(user));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat dashboard Super Admin.");
    } finally {
      silent ? setRefreshing(false) : setLoading(false);
    }
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  if (!user || user.role !== "super_admin" || !hasPermission(SUPER_ADMIN_DASHBOARD_PERMISSIONS.read)) {
    return <div className="rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-sm"><ShieldCheck className="mx-auto h-11 w-11 text-rose-500" /><h1 className="mt-4 font-heading text-2xl font-extrabold">Akses tidak tersedia</h1><p className="mt-2 text-sm text-slate-500">Backend authorization tetap menjadi sumber kebenaran.</p></div>;
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500 p-6 text-white shadow-xl shadow-violet-200 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em]">Administrasi global</span>
            <h1 className="mt-4 font-heading text-3xl font-extrabold sm:text-4xl">Selamat datang, {user.name}!</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-violet-100">Kelola sekolah, data master, akun siswa, konfigurasi 7 Kebiasaan, serta Poin/EXP dari satu dashboard.</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-[10px] font-black uppercase tracking-wider text-violet-100">Data diperbarui</p>
            <p className="mt-1 text-xs font-bold">{data ? formatUpdatedAt(data.updatedAt) : "Memuat..."}</p>
          </div>
        </div>
      </section>

      {error && <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><div className="min-w-0 flex-1"><p className="font-extrabold">Dashboard gagal dimuat</p><p className="mt-0.5 text-xs">{error}</p></div><button onClick={() => void load()} className="rounded-lg bg-white px-3 py-1.5 text-xs font-extrabold">Coba lagi</button></div>}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{statCards.map((card) => <div key={card.key} className="h-32 animate-pulse rounded-3xl bg-white" />)}</div>
      ) : data ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => { const Icon = card.icon; return <div key={card.key} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"><div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClasses[card.tone]}`}><Icon className="h-5 w-5" /></div><p className="mt-4 text-[10px] font-black uppercase tracking-wider text-slate-400">{card.label}</p><p className="mt-1 font-heading text-3xl font-extrabold text-slate-900">{data.metrics[card.key]}</p></div>; })}
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,.8fr)]">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-500">Monitoring global</p><h2 className="mt-1 font-heading text-xl font-extrabold">Sekolah yang dikelola</h2><p className="mt-1 text-xs text-slate-500">Scope lintas sekolah berasal dari authorization backend.</p></div><button onClick={() => navigate("/dashboard/admin/schools")} className="inline-flex items-center gap-2 self-start rounded-xl bg-violet-50 px-3 py-2 text-xs font-extrabold text-violet-700">Kelola sekolah <ArrowRight className="h-4 w-4" /></button></div>
              <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-100"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Sekolah</th><th className="px-4 py-3">Siswa</th><th className="px-4 py-3">Digital</th><th className="px-4 py-3">Manual</th><th className="px-4 py-3">Rombel</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{data.schools.map((school) => <tr key={school.id} className="hover:bg-violet-50/30"><td className="px-4 py-4"><p className="font-extrabold">{school.name}</p><p className="text-[11px] text-slate-400">{school.timezone}</p></td><td className="px-4 py-4 font-bold">{school.studentCount}</td><td className="px-4 py-4 font-bold text-blue-600">{school.digitalCount}</td><td className="px-4 py-4 font-bold text-amber-600">{school.manualCount}</td><td className="px-4 py-4 font-bold">{school.classGroupCount}</td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${school.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{school.status === "active" ? "Aktif" : "Nonaktif"}</span></td></tr>)}</tbody></table></div>
            </div>

            <div className="space-y-6">
              <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-50 text-violet-600"><Settings2 className="h-5 w-5" /></div><div><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Metode pengisian</p><h2 className="font-heading text-lg font-extrabold">Digital & Manual</h2></div></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-blue-50 p-4"><p className="text-[10px] font-black uppercase tracking-wider text-blue-600">Digital</p><p className="mt-1 font-heading text-2xl font-extrabold text-blue-700">{data.metrics.digitalStudents}</p></div><div className="rounded-2xl bg-amber-50 p-4"><p className="text-[10px] font-black uppercase tracking-wider text-amber-600">Manual</p><p className="mt-1 font-heading text-2xl font-extrabold text-amber-700">{data.metrics.manualStudents}</p></div></div><p className="mt-3 text-[11px] leading-relaxed text-slate-500">Siswa Manual tetap terdaftar dan tidak memiliki jalur input rekap buku di aplikasi.</p></section>
              <section className="rounded-3xl bg-slate-900 p-5 text-white shadow-sm sm:p-6"><div className="flex items-center gap-2"><FileSpreadsheet className="h-5 w-5 text-fuchsia-300" /><h2 className="font-heading text-lg font-extrabold">Aksi cepat</h2></div><div className="mt-4 grid gap-2">{hasPermission("write:school_master") && <button onClick={() => navigate("/dashboard/admin/schools?create=school")} className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-3 text-left text-xs font-extrabold hover:bg-white/15"><span>Tambah sekolah</span><ArrowRight className="h-4 w-4" /></button>}{hasPermission("read:students") && <button onClick={() => navigate("/dashboard/admin/students")} className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-3 text-left text-xs font-extrabold hover:bg-white/15"><span>Kelola siswa & import</span><ArrowRight className="h-4 w-4" /></button>}{hasPermission("generate:student_qr") && <button onClick={() => navigate("/dashboard/admin/student-accounts")} className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-3 text-left text-xs font-extrabold hover:bg-white/15"><span>Generate / kelola QR</span><ArrowRight className="h-4 w-4" /></button>}{hasPermission("read:habit_config") && <button onClick={() => navigate("/dashboard/admin/habits")} className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-3 text-left text-xs font-extrabold hover:bg-white/15"><span>Konfigurasi 7 Kebiasaan</span><ArrowRight className="h-4 w-4" /></button>}{hasPermission("read:point_config") && <button onClick={() => navigate("/dashboard/admin/points")} className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-3 text-left text-xs font-extrabold hover:bg-white/15"><span>Konfigurasi Poin & EXP</span><ArrowRight className="h-4 w-4" /></button>}</div></section>
            </div>
          </section>

          <section className="rounded-3xl border border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50 p-5 sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-600">Kontrol keamanan</p><h2 className="mt-1 font-heading text-lg font-extrabold">Authorization & audit tetap di backend</h2><p className="mt-1 text-xs leading-relaxed text-slate-500">Frontend hanya menampilkan menu berdasarkan permission yang diterima dan tidak menjalankan business rule penting.</p></div><button onClick={() => void load(true)} disabled={refreshing} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-violet-700 shadow-sm">{refreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Sinkronkan data</button></div></section>
        </>
      ) : null}
    </div>
  );
};
