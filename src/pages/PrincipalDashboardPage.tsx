import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileBarChart2,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { reportService } from "../services/reportService";
import { schoolMasterService } from "../services/schoolMasterService";
import { studentService } from "../services/studentService";
import { teacherService } from "../services/teacherService";
import { ReportResult } from "../types/report";
import { AcademicYear, ClassGroup, School } from "../types/school";
import { Student } from "../types/student";
import { Teacher } from "../types/teacher";

const navy = "#203A5B";
const coolBlue = "#D7EFFF";

const formatNumber = (value: number) => new Intl.NumberFormat("id-ID").format(value);

export const PrincipalDashboardPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [school, setSchool] = useState<School | null>(null);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [report, setReport] = useState<ReportResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user || !user.schoolId) return;

    setLoading(true);
    setError("");

    try {
      const schools = await schoolMasterService.listSchools(user);
      const ownSchool = schools.find((item) => item.id === user.schoolId) ?? schools[0] ?? null;
      setSchool(ownSchool);

      if (!ownSchool) {
        setYears([]);
        setClasses([]);
        setStudents([]);
        setTeachers([]);
        setReport(null);
        return;
      }

      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .slice(0, 10);
      const endDate = today.toISOString().slice(0, 10);

      const [academicYears, classGroups, schoolStudents, schoolTeachers, schoolReport] = await Promise.all([
        schoolMasterService.listAcademicYears(user, ownSchool.id),
        schoolMasterService.listClassGroups(user, ownSchool.id),
        hasPermission("read:students")
          ? studentService.listStudents(user, ownSchool.id)
          : Promise.resolve([] as Student[]),
        hasPermission("read:teachers")
          ? teacherService.list(user, ownSchool.id)
          : Promise.resolve([] as Teacher[]),
        hasPermission("read:reports")
          ? reportService.getReport(user, {
              scope: "school",
              periodPreset: "this_month",
              startDate: monthStart,
              endDate,
            })
          : Promise.resolve(null),
      ]);

      setYears(academicYears);
      setClasses(classGroups);
      setStudents(schoolStudents);
      setTeachers(schoolTeachers);
      setReport(schoolReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat dashboard Kepala Sekolah.");
    } finally {
      setLoading(false);
    }
  }, [hasPermission, user]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeYear = useMemo(
    () => years.find((year) => year.status === "active") ?? years[0] ?? null,
    [years],
  );

  const activeClasses = useMemo(
    () => (activeYear ? classes.filter((group) => group.academicYearId === activeYear.id) : classes),
    [activeYear, classes],
  );

  const activeStudents = useMemo(
    () => (activeYear ? students.filter((student) => student.academicYearId === activeYear.id && student.status === "active") : students),
    [activeYear, students],
  );

  const digitalStudents = activeStudents.filter((student) => student.method === "DIGITAL").length;
  const manualStudents = activeStudents.filter((student) => student.method === "MANUAL").length;
  const activityValues = report?.rows.map((row) => row.activityPercent).filter((value): value is number => value != null) ?? [];
  const activityAverage = activityValues.length
    ? Math.round(activityValues.reduce((total, value) => total + value, 0) / activityValues.length)
    : 0;
  const topStudent = report?.rows
    .filter((row) => row.points != null)
    .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))[0];
  const activeRanking = report?.rows.filter((row) => row.points != null).length ?? 0;

  const quickActions = [
    {
      label: "Struktur Sekolah",
      description: "Tahun ajaran, tingkat, rombel, dan Wali Kelas.",
      icon: Building2,
      permission: "read:school_master",
      to: "/dashboard/kepsek/schools",
    },
    {
      label: "Guru & Wali Kelas",
      description: "Kelola akun guru dan penempatan Wali Kelas.",
      icon: Users,
      permission: "read:teachers",
      to: "/dashboard/kepsek/teachers",
    },
    {
      label: "Siswa, Penempatan & Import",
      description: "Kelola siswa, import, serta penempatan/kenaikan sesuai kewenangan.",
      icon: GraduationCap,
      permission: "read:students",
      to: "/dashboard/kepsek/students",
    },
    {
      label: "Akun & QR Siswa",
      description: "Generate atau revoke QR siswa Digital.",
      icon: ShieldCheck,
      permission: "generate:student_qr",
      to: "/dashboard/kepsek/student-accounts",
    },
  ];

  const secondaryActions = [
    {
      label: "7 Kebiasaan",
      description: "Konfigurasi yang diizinkan sekolah.",
      icon: BookOpen,
      permission: "read:habit_config",
      to: "/dashboard/kepsek/habits",
    },
    {
      label: "Poin & EXP",
      description: "Aturan poin dan pengalaman siswa.",
      icon: BarChart3,
      permission: "read:point_config",
      to: "/dashboard/kepsek/points",
    },
    {
      label: "Laporan Sekolah",
      description: "Laporan siswa, rombel, sekolah, dan pencapaian.",
      icon: FileBarChart2,
      permission: "read:reports",
      to: "/dashboard/reports",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-40 rounded-3xl bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => <div key={item} className="h-28 rounded-3xl bg-slate-200" />)}
        </div>
        <div className="h-72 rounded-3xl bg-slate-200" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
        <p className="font-extrabold text-rose-700">Dashboard sekolah gagal dimuat</p>
        <p className="mt-1 text-sm text-rose-600">{error}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-rose-700 shadow-sm"
        >
          <RefreshCw className="h-4 w-4" /> Coba lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section
        className="relative overflow-hidden rounded-3xl p-6 text-white shadow-sm sm:p-7"
        style={{ background: `linear-gradient(135deg, ${navy} 0%, #2f587f 100%)` }}
      >
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-sky-200/10" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] text-sky-100">
              <ShieldCheck className="h-3.5 w-3.5" /> Operasional sekolah
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Selamat datang, Kepala Sekolah</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-sky-100">
              Pantau kondisi sekolah dari satu halaman: struktur, siswa, guru, aktivitas, pencapaian, dan laporan.
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm lg:min-w-[250px]">
            <p className="text-[10px] font-black uppercase tracking-wider text-sky-100">Sekolah aktif</p>
            <p className="mt-1 font-extrabold">{school?.name ?? "Belum tersedia"}</p>
            <p className="mt-1 text-xs text-sky-100">Tahun ajaran {activeYear?.name ?? "belum tersedia"}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <button type="button" onClick={() => navigate("/dashboard/kepsek/students")} className="rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: coolBlue, color: navy }}><GraduationCap className="h-5 w-5" /></div>
          <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Siswa aktif</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{formatNumber(activeStudents.length)}</p>
          <p className="mt-1 text-xs text-slate-500">{digitalStudents} Digital • {manualStudents} Manual</p>
        </button>

        <button type="button" onClick={() => navigate("/dashboard/kepsek/teachers")} className="rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: coolBlue, color: navy }}><Users className="h-5 w-5" /></div>
          <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Guru</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{formatNumber(teachers.length)}</p>
          <p className="mt-1 text-xs text-slate-500">Data dalam sekolah ini</p>
        </button>

        <button type="button" onClick={() => navigate("/dashboard/kepsek/schools")} className="rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: coolBlue, color: navy }}><ClipboardList className="h-5 w-5" /></div>
          <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Rombel aktif</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{formatNumber(activeClasses.length)}</p>
          <p className="mt-1 text-xs text-slate-500">Struktur tahun ajaran aktif</p>
        </button>

        <button type="button" onClick={() => navigate("/dashboard/reports")} className="rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: coolBlue, color: navy }}><BarChart3 className="h-5 w-5" /></div>
          <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Aktivitas bulan ini</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{activityAverage}%</p>
          <p className="mt-1 text-xs text-slate-500">Rata-rata aktivitas digital</p>
        </button>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
        <article className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.16em]" style={{ color: navy }}>Ringkasan sekolah</p>
              <h2 className="mt-1 text-xl font-black text-slate-900">Kondisi sekolah saat ini</h2>
            </div>
            <button type="button" onClick={() => navigate("/dashboard/reports")} className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-extrabold" style={{ background: coolBlue, color: navy }}>
              Lihat laporan <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl p-4" style={{ background: coolBlue }}>
              <p className="text-xs font-bold text-slate-600">Digital</p>
              <p className="mt-1 text-2xl font-black" style={{ color: navy }}>{digitalStudents}</p>
              <p className="text-[11px] text-slate-500">siswa aktif</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-600">Manual</p>
              <p className="mt-1 text-2xl font-black text-slate-800">{manualStudents}</p>
              <p className="text-[11px] text-slate-500">siswa aktif</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-600">Ranking</p>
              <p className="mt-1 text-2xl font-black text-slate-800">{activeRanking}</p>
              <p className="text-[11px] text-slate-500">siswa dengan poin</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-500">Siswa dengan poin tertinggi</p>
                <p className="mt-1 font-black text-slate-900">{topStudent?.studentName ?? "Belum ada data"}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black" style={{ color: navy }}>{topStudent?.points != null ? formatNumber(topStudent.points) : "—"}</p>
                <p className="text-[11px] text-slate-500">Poin</p>
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-3xl p-5 text-white shadow-sm sm:p-6" style={{ background: navy }}>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10"><CalendarDays className="h-5 w-5 text-sky-100" /></div>
            <div><p className="text-[10px] font-black uppercase tracking-wider text-sky-100">Tahun ajaran</p><h2 className="font-black">{activeYear?.name ?? "Belum tersedia"}</h2></div>
          </div>
          <div className="mt-5 space-y-3">
            <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-sky-100">Periode</p><p className="mt-1 font-extrabold">{activeYear ? `${activeYear.startDate} — ${activeYear.endDate}` : "—"}</p></div>
            <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-sky-100">Status sekolah</p><p className="mt-1 inline-flex items-center gap-1 font-extrabold"><CheckCircle2 className="h-4 w-4" /> {school?.status === "active" ? "Aktif" : "Nonaktif"}</p></div>
          </div>
        </article>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.16em]" style={{ color: navy }}>Menu utama</p>
            <h2 className="mt-1 text-xl font-black text-slate-900">Yang paling sering dibutuhkan</h2>
            <p className="mt-1 text-sm text-slate-500">Pilih bagian yang ingin dikelola tanpa harus mencari banyak tombol.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.filter((action) => hasPermission(action.permission)).map(({ label, description, icon: Icon, to }) => (
            <button key={label} type="button" onClick={() => navigate(to)} className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-left transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
              <div className="flex items-center justify-between gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: coolBlue, color: navy }}><Icon className="h-5 w-5" /></div><ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1" /></div>
              <p className="mt-4 font-black text-slate-900">{label}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {secondaryActions.filter((action) => hasPermission(action.permission)).map(({ label, description, icon: Icon, to }) => (
          <button key={label} type="button" onClick={() => navigate(to)} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50" style={{ color: navy }}><Icon className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1"><p className="font-black text-slate-900">{label}</p><p className="mt-0.5 text-xs text-slate-500">{description}</p></div>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
          </button>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-100 p-5 sm:p-6" style={{ background: `${coolBlue}80` }}>
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" style={{ color: navy }} />
          <div>
            <p className="font-extrabold" style={{ color: navy }}>Scope sekolah tetap aman</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">Dashboard ini hanya menampilkan data sekolah yang menjadi tanggung jawab akun Kepala Sekolah. Authorization dan scope final tetap ditentukan backend.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
