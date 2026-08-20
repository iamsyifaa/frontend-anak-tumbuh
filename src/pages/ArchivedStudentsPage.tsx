import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, RefreshCw, Search, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { studentService, STUDENT_PERMISSIONS } from "../services/studentService";
import { schoolMasterService } from "../services/schoolMasterService";
import { Student } from "../types/student";
import { ClassGroup, School } from "../types/school";

export const ArchivedStudentsPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const canRead = hasPermission(STUDENT_PERMISSIONS.read);
  const [school, setSchool] = useState<School | null>(null);
  const [groups, setGroups] = useState<ClassGroup[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user || !canRead) { setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const schools = await schoolMasterService.listSchools(user);
      const schoolId = user.role === "super_admin" ? schools[0]?.id : user.schoolId;
      if (!schoolId) throw new Error("Sekolah belum tersedia.");
      const [schoolList, context, studentList] = await Promise.all([
        Promise.resolve(schools),
        studentService.listImportContext(user, schoolId),
        studentService.listStudents(user, schoolId),
      ]);
      setSchool(schoolList.find((item) => item.id === schoolId) ?? null);
      setGroups(context.groups);
      setStudents(studentList.filter((student) => student.status === "graduated"));
    } catch (err) { setError(err instanceof Error ? err.message : "Gagal memuat arsip siswa."); }
    finally { setLoading(false); }
  }, [canRead, user]);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => students.filter((student) => {
    const q = search.trim().toLowerCase();
    return !q || [student.name, student.nis, student.nisn].some((value) => value?.toLowerCase().includes(q));
  }), [search, students]);
  const groupName = (id: string) => { const group = groups.find((item) => item.id === id); return group ? `${group.levelName} — ${group.rombelName}` : "—"; };

  if (!canRead) return <div className="rounded-3xl border border-rose-100 bg-white p-10 text-center"><ShieldAlert className="mx-auto h-10 w-10 text-rose-500"/><h1 className="mt-3 text-xl font-black">Akses arsip siswa tidak tersedia</h1></div>;
  return <div className="space-y-5"><header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-700"><Archive className="h-3.5 w-3.5"/> Arsip Siswa</div><h1 className="mt-2 text-2xl font-black">Siswa Lulus / Arsip</h1><p className="mt-1 text-sm text-slate-500">Data siswa yang sudah lulus dipisahkan dari tabel siswa aktif. Histori tetap disimpan.</p></div><button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-black"><RefreshCw className="h-4 w-4"/>Refresh</button></header>
    {school && <div className="rounded-2xl bg-white px-4 py-3 text-sm shadow-sm ring-1 ring-slate-100"><span className="font-black">Sekolah:</span> {school.name}</div>}
    {error && <div className="rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><div className="mb-4 flex items-center justify-between gap-3"><div className="relative max-w-md flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama, NISN, atau NIS..." className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm"/></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{filtered.length} siswa</span></div>
      {loading ? <div className="h-56 animate-pulse rounded-2xl bg-slate-50"/> : <div className="overflow-x-auto rounded-2xl border border-slate-100"><table className="w-full min-w-[820px] text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Nama</th><th className="px-4 py-3">NISN/NIS</th><th className="px-4 py-3">Rombel terakhir</th><th className="px-4 py-3">Status QR</th><th className="px-4 py-3">Tanggal arsip</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((student) => { const last = student.enrollmentHistory?.[student.enrollmentHistory.length - 1]; return <tr key={student.id}><td className="px-4 py-3 font-black">{student.name}</td><td className="px-4 py-3 text-xs text-slate-500">{student.nisn ?? student.nis ?? "—"}</td><td className="px-4 py-3 text-xs text-slate-500">{groupName(last?.classGroupId ?? student.classGroupId)}</td><td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600">{student.qrStatus === "revoked" ? "Nonaktif" : student.qrStatus}</span></td><td className="px-4 py-3 text-xs text-slate-500">{last?.recordedAt ? new Date(last.recordedAt).toLocaleDateString("id-ID") : "—"}</td></tr>; })}</tbody></table>{!filtered.length && <div className="p-10 text-center text-sm text-slate-500">Belum ada siswa yang diarsipkan.</div>}</div>}
    </section></div>;
};
