import React, { useCallback, useEffect, useState } from "react";
import { ArrowRight, BarChart3, Building2, CalendarDays, GraduationCap, RefreshCw, Settings2, ShieldCheck, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { schoolMasterService } from "../services/schoolMasterService";
import { School, AcademicYear, ClassGroup } from "../types/school";

const stat = (label: string, value: string | number, icon: React.ElementType, tone: string) => ({ label, value, icon, tone });

export const PrincipalDashboardPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [school, setSchool] = useState<School | null>(null);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true); setError("");
    try {
      const schools = await schoolMasterService.listSchools(user);
      const ownSchool = schools[0] ?? null;
      setSchool(ownSchool);
      if (ownSchool) {
        const [academicYears, classGroups] = await Promise.all([
          schoolMasterService.listAcademicYears(user, ownSchool.id),
          schoolMasterService.listClassGroups(user, ownSchool.id),
        ]);
        setYears(academicYears); setClasses(classGroups);
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Gagal memuat dashboard sekolah."); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <div className="space-y-6 animate-pulse"><div className="h-36 rounded-3xl bg-slate-200"/><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map(i => <div key={i} className="h-28 rounded-3xl bg-slate-200"/>)}</div><div className="h-80 rounded-3xl bg-slate-200"/></div>;
  if (error) return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6"><p className="font-extrabold text-rose-700">Dashboard sekolah gagal dimuat</p><p className="mt-1 text-sm text-rose-600">{error}</p><button onClick={() => void load()} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-rose-700"><RefreshCw className="h-4 w-4"/>Coba lagi</button></div>;

  const stats = [
    stat("Rombel", classes.length, Users, "bg-violet-50 text-violet-600"),
    stat("Tahun ajaran", years.filter(y => y.isActive).length || years.length, CalendarDays, "bg-blue-50 text-blue-600"),
    stat("Status sekolah", school?.status === "active" ? "Aktif" : "Nonaktif", Building2, "bg-emerald-50 text-emerald-600"),
    stat("Konfigurasi", "Sekolah", Settings2, "bg-amber-50 text-amber-600"),
  ];

  return <div className="space-y-6">
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-violet-600">Operasional sekolah</p><h1 className="mt-2 font-heading text-3xl font-black text-slate-900 sm:text-4xl">Dashboard Kepala Sekolah</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">Pantau struktur sekolah, rombel, siswa, konfigurasi, pencapaian, dan laporan dalam scope sekolah ini.</p></div>
        <div className="rounded-2xl bg-violet-50 px-4 py-3 text-left lg:min-w-[210px]"><p className="text-[10px] font-black uppercase tracking-wider text-violet-500">Sekolah aktif</p><p className="mt-1 font-extrabold text-slate-900">{school?.name ?? "Belum tersedia"}</p></div>
      </div>
    </section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({label,value,icon:Icon,tone}) => <article key={label} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><div className={`grid h-11 w-11 place-items-center rounded-2xl ${tone}`}><Icon className="h-5 w-5"/></div><p className="mt-4 text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-2xl font-black text-slate-900">{value}</p></article>)}</section>

    <section className="grid gap-6 lg:grid-cols-[1.45fr_.85fr]">
      <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-violet-500">Struktur sekolah</p><h2 className="mt-1 text-xl font-black text-slate-900">Rombel yang terdaftar</h2></div><button onClick={() => navigate("/dashboard/kepsek?tab=class-group")} className="inline-flex items-center gap-1 rounded-xl bg-violet-50 px-3 py-2 text-xs font-extrabold text-violet-700">Kelola <ArrowRight className="h-4 w-4"/></button></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{classes.slice(0,6).map(group => <div key={group.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"><div className="flex items-center justify-between gap-2"><p className="font-extrabold text-slate-800">{group.name}</p><span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-500">Rombel</span></div></div>)}{classes.length === 0 && <div className="sm:col-span-2 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">Belum ada rombel.</div>}</div></article>
      <article className="rounded-3xl bg-slate-900 p-5 text-white shadow-sm sm:p-6"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10"><BarChart3 className="h-5 w-5 text-fuchsia-300"/></div><div><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Aksi cepat</p><h2 className="font-black">Kelola sekolah</h2></div></div><div className="mt-5 space-y-2">{hasPermission("read:students") && <button onClick={() => navigate("/dashboard/kepsek/students")} className="flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-left text-xs font-extrabold hover:bg-white/15">Siswa & import <ArrowRight className="h-4 w-4"/></button>}{hasPermission("generate:student_qr") && <button onClick={() => navigate("/dashboard/kepsek/student-accounts")} className="flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-left text-xs font-extrabold hover:bg-white/15">Akun & QR siswa <ArrowRight className="h-4 w-4"/></button>}{hasPermission("read:habit_config") && <button onClick={() => navigate("/dashboard/kepsek/habits")} className="flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-left text-xs font-extrabold hover:bg-white/15">7 Kebiasaan <ArrowRight className="h-4 w-4"/></button>}{hasPermission("read:point_config") && <button onClick={() => navigate("/dashboard/kepsek/points")} className="flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-left text-xs font-extrabold hover:bg-white/15">Poin & EXP <ArrowRight className="h-4 w-4"/></button>}</div></article>
    </section>

    <section className="rounded-3xl border border-violet-100 bg-violet-50/70 p-5 sm:p-6"><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-violet-600"/><div><p className="font-extrabold text-slate-900">Scope sekolah tetap dikunci backend</p><p className="mt-1 text-xs leading-relaxed text-slate-600">Dashboard hanya menampilkan data yang diberikan API untuk sekolah akun ini. Frontend tidak menentukan akses lintas sekolah.</p></div></div></section>
  </div>;
};
