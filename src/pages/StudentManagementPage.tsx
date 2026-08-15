import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, FileSpreadsheet,
  KeyRound, Plus, QrCode, RefreshCw, Search, ShieldAlert, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { MasterDialog } from "../components/master/MasterDialog";
import { StudentForm } from "../components/student/StudentForm";
import { StudentImportWizard } from "../components/student/StudentImportWizard";
import { AccountStatusBadge, StudentStatusBadge } from "../components/student/StudentStatusBadge";
import { studentService, STUDENT_PERMISSIONS } from "../services/studentService";
import { schoolMasterService } from "../services/schoolMasterService";
import { AcademicYear, ClassGroup, School } from "../types/school";
import { Student, StudentStatus } from "../types/student";

const inputClass = "rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-50";

export const StudentManagementPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const canRead = hasPermission(STUDENT_PERMISSIONS.read);
  const canWrite = hasPermission(STUDENT_PERMISSIONS.write);
  const canImport = hasPermission(STUDENT_PERMISSIONS.import);
  const canQr = hasPermission(STUDENT_PERMISSIONS.generateQr);
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolId, setSchoolId] = useState("");
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [groups, setGroups] = useState<ClassGroup[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<"ALL" | "DIGITAL" | "MANUAL">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | StudentStatus>("ALL");
  const [groupFilter, setGroupFilter] = useState("ALL");
  const [dialog, setDialog] = useState<"student" | "import" | null>(null);

  const load = useCallback(async () => {
    if (!user || !canRead) { setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const availableSchools = await schoolMasterService.listSchools(user);
      const currentSchool = schoolId && availableSchools.some((school) => school.id === schoolId) ? schoolId : availableSchools[0]?.id ?? "";
      setSchools(availableSchools);
      setSchoolId(currentSchool);
      if (currentSchool) {
        const [context, studentList] = await Promise.all([
          studentService.listImportContext(user, currentSchool),
          studentService.listStudents(user, currentSchool),
        ]);
        setYears(context.years);
        setGroups(context.groups);
        setStudents(studentList);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat manajemen siswa.");
    } finally { setLoading(false); }
  }, [canRead, schoolId, user]);

  useEffect(() => { void load(); }, [load]);

  const groupName = useCallback((id: string) => { const group = groups.find((item) => item.id === id); return group ? `${group.levelName} — ${group.rombelName}` : "—"; }, [groups]);
  const yearName = useCallback((id: string) => years.find((year) => year.id === id)?.name ?? "—", [years]);

  const filteredStudents = useMemo(() => students.filter((student) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [student.name, student.nisn, student.nis].some((value) => value?.toLowerCase().includes(q));
    return matchesSearch && (methodFilter === "ALL" || student.method === methodFilter) && (statusFilter === "ALL" || student.status === statusFilter) && (groupFilter === "ALL" || student.classGroupId === groupFilter);
  }), [groupFilter, methodFilter, search, statusFilter, students]);

  const selectedSchool = schools.find((school) => school.id === schoolId);

  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 3000); };
  const handleSchoolChange = (next: string) => { setSchoolId(next); setSearch(""); setGroupFilter("ALL"); };
  const handleQr = async (student: Student) => {
    try {
      setError("");
      const updated = student.qrStatus === "active" ? await studentService.revokeQr(user!, student.id) : await studentService.generateQr(user!, student.id);
      setStudents((current) => current.map((item) => item.id === updated.id ? updated : item));
      notify(updated.qrStatus === "active" ? "QR siswa berhasil dibuat/diaktifkan." : "QR siswa berhasil direvoke.");
    } catch (err) { setError(err instanceof Error ? err.message : "Gagal mengubah status QR."); }
  };

  if (!canRead) return <div className="rounded-3xl border border-rose-100 bg-white p-10 text-center shadow-sm"><ShieldAlert className="mx-auto h-10 w-10 text-rose-500" /><h1 className="mt-4 text-xl font-black">Akses Student Management tidak tersedia</h1><p className="mt-2 text-sm text-slate-500">Permission siswa tidak diberikan pada akun ini.</p></div>;

  return <div className="min-h-full space-y-5">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-black text-sky-700"><Users className="h-3.5 w-3.5" /> Student Management</div><h1 className="text-2xl font-black tracking-tight text-slate-900">Data Siswa</h1><p className="mt-1 max-w-2xl text-sm text-slate-500">Kelola siswa, enrollment, metode DIGITAL/MANUAL, dan import data master. Tidak ada alur input rekap buku manual.</p></div>
      <div className="flex flex-wrap gap-2"><button onClick={() => window.location.assign(user?.role === "super_admin" ? "/dashboard/admin/student-accounts" : "/dashboard/kepsek/student-accounts")} className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5 text-xs font-black text-violet-700"><KeyRound className="h-4 w-4" />Akun & QR</button><button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-black text-slate-700"><RefreshCw className="h-4 w-4" />Refresh</button>{canImport && <button onClick={() => setDialog("import")} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white"><FileSpreadsheet className="h-4 w-4" />Import Excel</button>}{canWrite && <button onClick={() => setDialog("student")} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-black text-white"><Plus className="h-4 w-4" />Tambah Siswa</button>}</div>
    </div>

    {error && <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-black">Terjadi kesalahan</p><p className="mt-0.5 text-xs">{error}</p></div></div>}
    {notice && <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-700"><CheckCircle2 className="h-5 w-5" />{notice}</div>}

    {loading ? <div className="h-96 animate-pulse rounded-3xl bg-white shadow-sm" /> : <>
      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-slate-400">Scope sekolah</p><p className="mt-1 text-sm font-black text-slate-900">{selectedSchool?.name ?? "Tidak ada sekolah"}</p></div>{user?.role === "super_admin" && <select className={inputClass} value={schoolId} onChange={(e) => handleSchoolChange(e.target.value)}>{schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}</select>}</div><div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-[11px] font-black text-slate-400">Total Siswa</p><p className="mt-1 text-2xl font-black">{students.length}</p></div><div className="rounded-2xl bg-sky-50 p-4"><p className="text-[11px] font-black text-sky-600">Digital</p><p className="mt-1 text-2xl font-black text-sky-700">{students.filter((student) => student.method === "DIGITAL").length}</p></div><div className="rounded-2xl bg-amber-50 p-4"><p className="text-[11px] font-black text-amber-600">Manual</p><p className="mt-1 text-2xl font-black text-amber-700">{students.filter((student) => student.method === "MANUAL").length}</p></div></div></section>
      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><div className="flex flex-col gap-3 xl:flex-row xl:items-center"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input className={`${inputClass} w-full pl-9`} placeholder="Cari nama, NISN, atau NIS..." value={search} onChange={(e) => setSearch(e.target.value)} /></div><select className={inputClass} value={methodFilter} onChange={(e) => setMethodFilter(e.target.value as typeof methodFilter)}><option value="ALL">Semua metode</option><option value="DIGITAL">DIGITAL</option><option value="MANUAL">MANUAL</option></select><select className={inputClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}><option value="ALL">Semua status</option><option value="active">Aktif</option><option value="pending">Pending</option><option value="inactive">Nonaktif</option><option value="transferred">Pindah</option><option value="graduated">Lulus</option></select><select className={inputClass} value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}><option value="ALL">Semua rombel</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.levelName} — {group.rombelName}</option>)}</select></div><div className="mt-4 overflow-x-auto rounded-2xl border border-slate-100"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Siswa</th><th className="px-4 py-3">NISN / NIS</th><th className="px-4 py-3">Tahun</th><th className="px-4 py-3">Rombel</th><th className="px-4 py-3">Metode</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">QR</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredStudents.length === 0 ? <tr><td colSpan={7} className="px-4 py-12 text-center text-xs text-slate-400">Tidak ada siswa yang cocok dengan filter.</td></tr> : filteredStudents.map((student) => <tr key={student.id} className="hover:bg-slate-50/70"><td className="px-4 py-3"><p className="font-extrabold text-slate-900">{student.name}</p><p className="text-[10px] text-slate-400">ID: {student.id}</p></td><td className="px-4 py-3 text-xs text-slate-600"><div>{student.nisn || "—"}</div><div>{student.nis || "—"}</div></td><td className="px-4 py-3 text-xs text-slate-500">{yearName(student.academicYearId)}</td><td className="px-4 py-3 text-xs font-bold text-slate-700">{groupName(student.classGroupId)}</td><td className="px-4 py-3"><StudentStatusBadge method={student.method} /></td><td className="px-4 py-3"><AccountStatusBadge status={student.status} /></td><td className="px-4 py-3">{student.method === "DIGITAL" && canQr ? <button title={student.qrStatus === "active" ? "Revoke QR" : "Generate QR"} onClick={() => void handleQr(student)} className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-black ${student.qrStatus === "active" ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700"}`}><QrCode className="h-3.5 w-3.5" />{student.qrStatus === "active" ? "Aktif" : "Generate"}</button> : <span className="text-[10px] text-slate-400">{student.method === "MANUAL" ? "Tidak perlu QR" : "—"}</span>}</td></tr>)}</tbody></table></div><div className="mt-3 text-[10px] font-semibold text-slate-400">Menampilkan {filteredStudents.length} dari {students.length} siswa.</div></section>
    </>}

    {dialog === "student" && user && <MasterDialog open title="Tambah Siswa" description="Pembuatan siswa tetap berada pada master data; metode hanya DIGITAL atau MANUAL." onClose={() => setDialog(null)}><StudentForm user={user} schoolId={schoolId} years={years} groups={groups} onCancel={() => setDialog(null)} onSaved={async () => { setDialog(null); await load(); notify("Siswa berhasil ditambahkan."); }} /></MasterDialog>}
    {dialog === "import" && user && <StudentImportWizard user={user} schoolId={schoolId} years={years} groups={groups} onClose={() => setDialog(null)} onCommitted={async () => { await load(); notify("Import siswa berhasil diproses."); }} />}
  </div>;
};
