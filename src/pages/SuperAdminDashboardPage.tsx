import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle, ArrowRight, BarChart3, BookOpen, Building2, CheckCircle2,
  GraduationCap, KeyRound, RefreshCw, Settings2, ShieldCheck,
  Users, UserRoundCheck, CalendarDays,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SUPER_ADMIN_DASHBOARD_PERMISSIONS, superAdminDashboardService } from "../services/superAdminDashboardService";
import { SuperAdminDashboardData } from "../types/superAdminDashboard";

const formatUpdatedAt = (value: string) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
const statusLabel = (value: string) => value === "published" ? "Published" : value === "draft" ? "Draft" : "Belum tersedia";

const overviewCards = [
  ["totalSchools", "Total Sekolah", Building2, "violet"],
  ["totalStudents", "Total Siswa", GraduationCap, "blue"],
  ["totalTeachers", "Total Guru", Users, "emerald"],
  ["totalClassGroups", "Total Rombel", UserRoundCheck, "cyan"],
] as const;

const tones = {
  violet: "bg-[#D7EFFF] text-[#203A5B]",
  blue: "bg-[#D7EFFF] text-[#203A5B]",
  emerald: "bg-[#E8F5FF] text-[#203A5B]",
  cyan: "bg-[#D7EFFF] text-[#203A5B]",
};

export const SuperAdminDashboardPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<SuperAdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!user) return;
    setError(null);
    silent ? setRefreshing(true) : setLoading(true);
    try { setData(await superAdminDashboardService.getOverview(user)); }
    catch (err) { setError(err instanceof Error ? err.message : "Gagal memuat dashboard Super Admin."); }
    finally { silent ? setRefreshing(false) : setLoading(false); }
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  if (!user || user.role !== "super_admin" || !hasPermission(SUPER_ADMIN_DASHBOARD_PERMISSIONS.read)) {
    return <div className="rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-sm"><ShieldCheck className="mx-auto h-11 w-11 text-rose-500" /><h1 className="mt-4 font-heading text-2xl font-extrabold">Akses tidak tersedia</h1><p className="mt-2 text-sm text-slate-500">Backend authorization tetap menjadi sumber kebenaran.</p></div>;
  }

  const quickActions = [
    { label: "Kelola Sekolah", desc: "Sekolah & tahun ajaran", icon: Building2, permission: "read:school_master", path: "/dashboard/admin/schools" },
    { label: "Kelola Guru", desc: "Guru & Wali Kelas", icon: Users, permission: "read:teachers", path: "/dashboard/admin/teachers" },
    { label: "Kelola Siswa", desc: "Data & import siswa", icon: GraduationCap, permission: "read:students", path: "/dashboard/admin/students" },
    { label: "7 Kebiasaan", desc: "Konfigurasi kebiasaan", icon: BookOpen, permission: "read:habit_config", path: "/dashboard/admin/habits" },
    { label: "Poin & EXP", desc: "Aturan poin dan level", icon: BarChart3, permission: "read:point_config", path: "/dashboard/admin/points" },
    { label: "Akun & QR", desc: "Akun digital siswa", icon: KeyRound, permission: "generate:student_qr", path: "/dashboard/admin/student-accounts" },
  ] as const;

  return <div className="space-y-6 bg-transparent">
    <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#203A5B] p-6 text-white shadow-xl shadow-[#203A5B]/15 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#D7EFFF]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#D7EFFF]">Administrasi global</span>
          <h1 className="mt-4 font-heading text-3xl font-extrabold sm:text-4xl">Selamat datang, {user.name}!</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#D7EFFF]">Pusat kendali lintas sekolah untuk master data, akun, metode pengisian, QR, dan konfigurasi sistem.</p>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur transition hover:bg-white/15"><p className="text-[10px] font-black uppercase tracking-wider text-[#D7EFFF]">Data diperbarui</p><p className="mt-1 text-xs font-bold">{data ? formatUpdatedAt(data.updatedAt) : "Memuat..."}</p></div>
      </div>
    </section>

    {error && <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><div className="min-w-0 flex-1"><p className="font-extrabold">Dashboard gagal dimuat</p><p className="mt-0.5 text-xs">{error}</p></div><button onClick={() => void load()} className="rounded-lg bg-white px-3 py-1.5 text-xs font-extrabold">Coba lagi</button></div>}

    {loading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{overviewCards.map(([key]) => <div key={key} className="h-32 animate-pulse rounded-3xl bg-white" />)}</div> : data && <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map(([key, label, Icon, tone]) => <button key={key} type="button" onClick={() => setActivePanel(activePanel === key ? null : key)} className={`group rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-[#D7EFFF] transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#203A5B]/10 focus:outline-none focus:ring-2 focus:ring-[#203A5B]/30 ${activePanel === key ? "ring-2 ring-[#203A5B]/20" : ""}`}><div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tones[tone]} transition group-hover:scale-105`}><Icon className="h-5 w-5" /></div><p className="mt-4 text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 font-heading text-3xl font-extrabold text-[#203A5B]">{data.metrics[key]}</p><div className="mt-3 flex items-center justify-between text-[10px] font-bold text-slate-400"><span>{activePanel === key ? "Dipilih" : "Lihat detail"}</span><ArrowRight className={`h-3.5 w-3.5 transition ${activePanel === key ? "translate-x-1 text-[#203A5B]" : "group-hover:translate-x-1"}`} /></div></button>)}
      </section>

      {activePanel && <div className="rounded-2xl border border-[#D7EFFF] bg-[#D7EFFF]/50 px-4 py-3 text-xs font-semibold text-[#203A5B] transition-all"><span className="font-black">{overviewCards.find(([key]) => key === activePanel)?.[1]}:</span> data aggregate tersedia dari layanan dashboard. Klik kartu lain untuk berpindah fokus.</div>}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="group rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#D7EFFF] transition hover:-translate-y-1 hover:shadow-md"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Sekolah aktif</p><p className="mt-1 text-2xl font-black text-[#203A5B]">{data.metrics.activeSchools}<span className="ml-1 text-sm text-slate-400">/ {data.metrics.totalSchools}</span></p><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#D7EFFF]"><div className="h-full rounded-full bg-[#203A5B]" style={{ width: `${data.metrics.totalSchools ? Math.min(100, (data.metrics.activeSchools / data.metrics.totalSchools) * 100) : 0}%` }} /></div></div>
        <div className="group rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#D7EFFF] transition hover:-translate-y-1 hover:shadow-md"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tahun ajaran aktif</p><p className="mt-1 text-2xl font-black text-[#203A5B]">{data.metrics.activeAcademicYears}<span className="ml-1 text-sm text-slate-400">sekolah</span></p><p className="mt-3 text-[11px] font-semibold text-slate-500">Konteks akademik siap dipantau lintas sekolah.</p></div>
        <div className="group rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#D7EFFF] transition hover:-translate-y-1 hover:shadow-md"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">QR siswa aktif</p><p className="mt-1 text-2xl font-black text-[#203A5B]">{data.metrics.generatedQrStudents}</p><button type="button" onClick={() => navigate("/dashboard/admin/student-accounts")} className="mt-3 inline-flex items-center gap-1 text-[11px] font-black text-[#203A5B] hover:underline">Kelola akun & QR <ArrowRight className="h-3.5 w-3.5" /></button></div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,.8fr)]">
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#D7EFFF] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#203A5B]">Master data</p><h2 className="mt-1 font-heading text-xl font-extrabold text-[#203A5B]">Sekolah</h2><p className="mt-1 text-xs text-slate-500">Scope lintas sekolah berasal dari authorization backend.</p></div>{hasPermission("write:school_master") && <button onClick={() => navigate("/dashboard/admin/schools?create=school")} className="inline-flex items-center gap-2 self-start rounded-xl bg-[#203A5B] px-3 py-2 text-xs font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#162d47]">Tambah sekolah <ArrowRight className="h-4 w-4" /></button>}</div>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-[#D7EFFF]"><table className="w-full min-w-[820px] text-left text-sm"><thead className="bg-[#D7EFFF]/60 text-[10px] uppercase tracking-wider text-[#203A5B]"><tr><th className="px-4 py-3">Sekolah</th><th className="px-4 py-3">Tahun aktif</th><th className="px-4 py-3">Siswa</th><th className="px-4 py-3">Guru</th><th className="px-4 py-3">Digital / Manual</th><th className="px-4 py-3">QR aktif</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-[#D7EFFF]">{data.schools.map((school) => <tr key={school.id} className="transition hover:bg-[#D7EFFF]/30"><td className="px-4 py-4"><p className="font-extrabold text-[#203A5B]">{school.name}</p><p className="text-[11px] text-slate-400">{school.timezone}</p></td><td className="px-4 py-4 font-bold">{school.activeAcademicYear ?? "—"}</td><td className="px-4 py-4 font-bold">{school.studentCount}</td><td className="px-4 py-4 font-bold">{school.teacherCount}</td><td className="px-4 py-4"><span className="font-bold text-[#203A5B]">{school.digitalCount}</span><span className="text-slate-400"> / </span><span className="font-bold text-slate-500">{school.manualCount}</span></td><td className="px-4 py-4 font-bold text-[#203A5B]">{school.generatedQrCount}</td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${school.status === "active" ? "bg-[#D7EFFF] text-[#203A5B]" : "bg-slate-100 text-slate-500"}`}>{school.status === "active" ? "Aktif" : "Nonaktif"}</span></td></tr>)}</tbody></table></div>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#D7EFFF] sm:p-6"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#D7EFFF] text-[#203A5B]"><Users className="h-5 w-5" /></div><div><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Akun & metode</p><h2 className="font-heading text-lg font-extrabold text-[#203A5B]">Status sistem</h2></div></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[#D7EFFF]/70 p-4"><p className="text-[10px] font-black uppercase text-[#203A5B]">Guru aktif</p><p className="mt-1 text-2xl font-black text-[#203A5B]">{data.accounts.activeTeachers}</p></div><div className="rounded-2xl bg-[#D7EFFF]/45 p-4"><p className="text-[10px] font-black uppercase text-[#203A5B]">Digital</p><p className="mt-1 text-2xl font-black text-[#203A5B]">{data.accounts.digitalStudents}</p></div><div className="rounded-2xl bg-[#D7EFFF]/60 p-4"><p className="text-[10px] font-black uppercase text-[#203A5B]">Manual</p><p className="mt-1 text-2xl font-black text-[#203A5B]">{data.accounts.manualStudents}</p></div><div className="rounded-2xl bg-[#D7EFFF]/80 p-4"><p className="text-[10px] font-black uppercase text-[#203A5B]">QR aktif</p><p className="mt-1 text-2xl font-black text-[#203A5B]">{data.accounts.generatedQrStudents}</p></div></div><p className="mt-3 text-[11px] leading-relaxed text-slate-500">Manual adalah metode pengisian siswa, bukan role baru dan tidak memiliki jalur input rekap buku di aplikasi.</p></section>

          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#D7EFFF] sm:p-6"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#D7EFFF] text-[#203A5B]"><Settings2 className="h-5 w-5" /></div><div><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Master konfigurasi</p><h2 className="font-heading text-lg font-extrabold text-[#203A5B]">Status konfigurasi</h2></div></div><div className="mt-4 space-y-2"><StatusRow label="7 Kebiasaan" value={statusLabel(data.configuration.sevenHabits)} /><StatusRow label="Poin & EXP" value={statusLabel(data.configuration.pointsAndExp)} /><StatusRow label="Ranking" value="Dikelola backend" /></div></section>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#D7EFFF] sm:p-6"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#D7EFFF] text-[#203A5B]"><CalendarDays className="h-5 w-5" /></div><div><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Konteks sekolah</p><h2 className="font-heading text-lg font-extrabold text-[#203A5B]">Tahun ajaran</h2></div></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{data.academicYears.map((year) => <div key={year.schoolId} className="rounded-2xl border border-[#D7EFFF] p-3 transition hover:bg-[#D7EFFF]/30"><p className="text-xs font-extrabold text-[#203A5B]">{year.schoolName}</p><p className="mt-1 text-[11px] text-slate-500">Aktif: <span className="font-bold text-[#203A5B]">{year.activeYear ?? "Belum ada"}</span></p><p className="mt-1 text-[10px] text-slate-400">{year.totalYears} tahun tersimpan</p></div>)}</div></section>

        <section className="rounded-3xl bg-[#203A5B] p-5 text-white shadow-lg shadow-[#203A5B]/15 sm:p-6"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#D7EFFF] text-[#203A5B]"><KeyRound className="h-5 w-5" /></div><div><p className="text-[10px] font-black uppercase tracking-wider text-[#D7EFFF]">Administrasi cepat</p><h2 className="font-heading text-lg font-extrabold">Pilih yang ingin dikelola</h2></div></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{quickActions.filter((action) => hasPermission(action.permission)).map(({ label, desc, icon: Icon, path }) => <button key={label} onClick={() => navigate(path)} className="group rounded-2xl border border-white/10 bg-white/10 p-3 text-left transition duration-200 hover:-translate-y-0.5 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-[#D7EFFF]/50"><span className="flex items-center gap-2"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#D7EFFF] text-[#203A5B]"><Icon className="h-4 w-4" /></span><span className="min-w-0"><span className="block text-xs font-extrabold">{label}</span><span className="mt-0.5 block truncate text-[10px] text-[#D7EFFF]">{desc}</span></span><ArrowRight className="ml-auto h-4 w-4 shrink-0 transition group-hover:translate-x-1" /></span></button>)}</div></section>
      </section>

      <section className="rounded-3xl border border-[#D7EFFF] bg-[#D7EFFF]/55 p-5 sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#203A5B]">Kontrol keamanan</p><h2 className="mt-1 font-heading text-lg font-extrabold text-[#203A5B]">Authorization tetap di backend</h2><p className="mt-1 text-xs leading-relaxed text-slate-600">Dashboard hanya menyajikan aggregate dan menu berdasarkan permission. Nilai resmi dan business rule tetap berasal dari backend.</p></div><button onClick={() => void load(true)} disabled={refreshing} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#203A5B] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#162d47] disabled:opacity-60">{refreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Sinkronkan data</button></div></section>
    </>}
  </div>;

};

const StatusRow: React.FC<{ label: string; value: string }> = ({ label, value }) => <div className="flex items-center justify-between rounded-xl bg-[#D7EFFF]/45 px-3 py-2.5"><span className="text-xs font-bold text-slate-600">{label}</span><span className="inline-flex items-center gap-1.5 text-[10px] font-black text-[#203A5B]"><CheckCircle2 className="h-3.5 w-3.5 text-[#203A5B]" />{value}</span></div>;
