import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, KeyRound, Printer, QrCode, RefreshCw, ShieldAlert, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { studentService } from "../services/studentService";
import { studentAccountService } from "../services/studentAccountService";
import { schoolMasterService } from "../services/schoolMasterService";
import { Student } from "../types/student";
import { GeneratedQrCredential } from "../types/studentAccount";
import { MockQrCode } from "../components/student/MockQrCode";
import { MasterDialog } from "../components/master/MasterDialog";

const inputClass = "rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-50";

export const StudentAccountManagementPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const canRead = hasPermission("read:students");
  const canGenerate = hasPermission("generate:student_qr");
  const [schoolId, setSchoolId] = useState(user?.schoolId ?? "");
  const [students, setStudents] = useState<Student[]>([]);
  const [years, setYears] = useState<{ id: string; name: string }[]>([]);
  const [groups, setGroups] = useState<{ id: string; name: string; levelName: string; rombelName: string; academicYearId: string }[]>([]);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [scope, setScope] = useState<"ALL_DIGITAL" | "ACADEMIC_YEAR" | "CLASS_GROUP" | "SELECTED">("ALL_DIGITAL");
  const [yearId, setYearId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [credentials, setCredentials] = useState<GeneratedQrCredential[]>([]);
  const [printOpen, setPrintOpen] = useState(false);

  const load = async () => {
    if (!user || !canRead) return;
    setLoading(true); setError("");
    try {
      const availableSchools = await schoolMasterService.listSchools(user);
      const currentSchool = user.role === "super_admin" ? (schoolId || availableSchools[0]?.id || "") : user.schoolId ?? "";
      setSchools(availableSchools); setSchoolId(currentSchool);
      if (currentSchool) {
        const [context, list] = await Promise.all([
          studentService.listImportContext(user, currentSchool),
          studentService.listStudents(user, currentSchool),
        ]);
        setYears(context.years); setGroups(context.groups); setStudents(list);
        if (!yearId) setYearId(context.years[0]?.id ?? "");
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Gagal memuat manajemen akun siswa."); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [user?.id, schoolId]);

  const digitalStudents = useMemo(() => students.filter((s) => s.method === "DIGITAL" && s.status === "active"), [students]);
  const filteredCandidates = useMemo(() => {
    if (scope === "ACADEMIC_YEAR") return digitalStudents.filter((s) => s.academicYearId === yearId);
    if (scope === "CLASS_GROUP") return digitalStudents.filter((s) => s.classGroupId === groupId);
    return digitalStudents;
  }, [digitalStudents, groupId, scope, yearId]);

  const groupName = (id: string) => groups.find((g) => g.id === id) ? `${groups.find((g) => g.id === id)!.levelName} — ${groups.find((g) => g.id === id)!.rombelName}` : "—";

  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const generate = async () => {
    if (!user) return;
    setWorking(true); setError(""); setNotice("");
    try {
      const result = await studentAccountService.bulkGenerate(user, {
        schoolId, scope, academicYearId: scope === "ACADEMIC_YEAR" ? yearId : undefined,
        classGroupId: scope === "CLASS_GROUP" ? groupId : undefined,
        studentIds: scope === "SELECTED" ? selected : undefined,
      });
      setStudents((current) => current.map((student) => result.generated.find((g) => g.id === student.id) ?? student));
      setCredentials(result.credentials);
      setPrintOpen(result.credentials.length > 0);
      setNotice(`${result.generated.length} akun DIGITAL berhasil dibuat. ${result.skippedManual} siswa MANUAL dilewati.`);
      if (!result.credentials.length) setError("Tidak ada akun baru yang perlu dibuat. Siswa yang sudah memiliki QR aktif dilewati.");
    } catch (err) { setError(err instanceof Error ? err.message : "Gagal membuat akun siswa."); }
    finally { setWorking(false); }
  };

  if (!canRead) return <div className="rounded-3xl bg-white p-10 text-center shadow-sm"><ShieldAlert className="mx-auto h-10 w-10 text-rose-500" /><h1 className="mt-4 text-xl font-black">Akses tidak tersedia</h1></div>;
  if (!canGenerate) return <div className="rounded-3xl bg-white p-10 text-center shadow-sm"><ShieldAlert className="mx-auto h-10 w-10 text-rose-500" /><h1 className="mt-4 text-xl font-black">Tidak memiliki izin</h1><p className="mt-2 text-sm text-slate-500">Permission generate QR tidak diberikan pada akun ini.</p></div>;

  return <div className="min-h-full space-y-5">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-[11px] font-black text-violet-700"><KeyRound className="h-3.5 w-3.5" /> Account & QR Management</div><h1 className="text-2xl font-black tracking-tight text-slate-900">Generate Akun & QR Siswa</h1><p className="mt-1 max-w-2xl text-sm text-slate-500">Credential QR hanya dibuat untuk siswa DIGITAL. Credential mentah tidak disimpan di browser dan hanya tersedia selama sesi print.</p></div>
      <button onClick={() => void load()} className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-black text-slate-700"><RefreshCw className="h-4 w-4" />Refresh</button>
    </div>

    {error && <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle className="mt-0.5 h-5 w-5" /><div><p className="font-black">Tidak dapat memproses</p><p className="text-xs">{error}</p></div></div>}
    {notice && <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-700"><CheckCircle2 className="h-5 w-5" />{notice}</div>}

    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="grid gap-3 lg:grid-cols-2">
        {user?.role === "super_admin" && <label className="space-y-1.5 text-xs font-black text-slate-600"><span>Sekolah</span><select className={`${inputClass} w-full`} value={schoolId} onChange={(e) => setSchoolId(e.target.value)}>{schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>}
        <label className="space-y-1.5 text-xs font-black text-slate-600"><span>Target generate</span><select className={`${inputClass} w-full`} value={scope} onChange={(e) => setScope(e.target.value as typeof scope)}><option value="ALL_DIGITAL">Semua siswa DIGITAL aktif</option><option value="ACADEMIC_YEAR">Per tahun ajaran</option><option value="CLASS_GROUP">Per rombel</option><option value="SELECTED">Siswa terpilih</option></select></label>
        {scope === "ACADEMIC_YEAR" && <label className="space-y-1.5 text-xs font-black text-slate-600"><span>Tahun ajaran</span><select className={`${inputClass} w-full`} value={yearId} onChange={(e) => setYearId(e.target.value)}>{years.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}</select></label>}
        {scope === "CLASS_GROUP" && <label className="space-y-1.5 text-xs font-black text-slate-600"><span>Rombel</span><select className={`${inputClass} w-full`} value={groupId} onChange={(e) => setGroupId(e.target.value)}>{groups.map((g) => <option key={g.id} value={g.id}>{g.levelName} — {g.rombelName}</option>)}</select></label>}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-sky-50 p-4"><p className="text-[11px] font-black text-sky-600">DIGITAL aktif</p><p className="mt-1 text-2xl font-black text-sky-700">{digitalStudents.length}</p></div><div className="rounded-2xl bg-emerald-50 p-4"><p className="text-[11px] font-black text-emerald-600">Target saat ini</p><p className="mt-1 text-2xl font-black text-emerald-700">{scope === "SELECTED" ? selected.length : filteredCandidates.length}</p></div><div className="rounded-2xl bg-amber-50 p-4"><p className="text-[11px] font-black text-amber-600">MANUAL</p><p className="mt-1 text-2xl font-black text-amber-700">{students.filter((s) => s.method === "MANUAL").length}</p></div></div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="max-w-2xl text-[11px] font-semibold leading-relaxed text-slate-400">Generate hanya membuat credential baru untuk DIGITAL aktif yang belum memiliki QR aktif. Siswa MANUAL tidak memiliki jalur credential QR.</p><button disabled={working || (scope === "SELECTED" && selected.length === 0)} onClick={() => void generate()} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50">{working ? <><RefreshCw className="h-4 w-4 animate-spin" />Memproses...</> : <><QrCode className="h-4 w-4" />Generate Akun & QR</>}</button></div>
    </section>

    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-3"><div><h2 className="font-black text-slate-900">Daftar Credential</h2><p className="mt-1 text-xs text-slate-400">QR aktif dapat direvoke. Token mentah tidak ditampilkan pada tabel.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-500">{students.length} siswa</span></div>
      {loading ? <div className="mt-5 h-64 animate-pulse rounded-2xl bg-slate-50" /> : <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-100"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Siswa</th><th className="px-4 py-3">Rombel</th><th className="px-4 py-3">Metode</th><th className="px-4 py-3">Akun</th><th className="px-4 py-3">QR</th><th className="px-4 py-3">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{students.map((student) => <tr key={student.id}><td className="px-4 py-3"><p className="font-extrabold text-slate-900">{student.name}</p><p className="text-[10px] text-slate-400">{student.nisn || student.nis || "—"}</p></td><td className="px-4 py-3 text-xs font-bold text-slate-600">{groupName(student.classGroupId)}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${student.method === "DIGITAL" ? "bg-sky-50 text-sky-700" : "bg-amber-50 text-amber-700"}`}>{student.method}</span></td><td className="px-4 py-3 text-xs font-bold">{student.accountStatus === "generated" ? <span className="text-emerald-600">Generated</span> : <span className="text-slate-400">Belum</span>}</td><td className="px-4 py-3 text-xs font-bold">{student.method === "MANUAL" ? <span className="text-slate-400">Tidak tersedia</span> : <span className={student.qrStatus === "active" ? "text-emerald-600" : "text-rose-500"}>{student.qrStatus}</span>}</td><td className="px-4 py-3">{student.method === "DIGITAL" && student.qrStatus === "active" ? <button onClick={async () => { try { if (!user) return; setWorking(true); const updated = await studentAccountService.revoke(user, student); setStudents((current) => current.map((s) => s.id === updated.id ? updated : s)); setNotice(`QR ${student.name} berhasil direvoke.`); } catch (err) { setError(err instanceof Error ? err.message : "Gagal revoke QR."); } finally { setWorking(false); } }} className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[10px] font-black text-rose-600"><X className="h-3.5 w-3.5" />Revoke</button> : <span className="text-[10px] text-slate-400">—</span>}</td></tr>)}</tbody></table></div>}
    </section>

    {printOpen && <MasterDialog open title="QR siap dicetak" description="Credential mentah hanya tersedia selama sesi ini. Tutup dialog untuk menghapusnya dari memory halaman." onClose={() => { setPrintOpen(false); setCredentials([]); }}><div className="space-y-4"><div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800"><KeyRound className="h-5 w-5 shrink-0" /><span>Jangan screenshot, salin, atau simpan token. Setelah dialog ditutup, token mentah tidak dapat ditampilkan kembali.</span></div><div className="flex flex-wrap gap-2"><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-black text-white"><Printer className="h-4 w-4" />Print QR</button><button onClick={() => { setPrintOpen(false); setCredentials([]); }} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-600">Tutup & hapus credential</button></div><div className="qr-print-area grid gap-4 sm:grid-cols-2">{credentials.map((credential) => <div key={credential.studentId} className="qr-card rounded-2xl border border-slate-200 bg-white p-5 text-center"><MockQrCode value={credential.qrToken} size={190} /><h3 className="mt-3 text-lg font-black text-slate-900">{credential.studentName}</h3><p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">ANAKTUMBUH.ID • LOGIN SISWA</p></div>)}</div></div></MasterDialog>}
  </div>;
};
