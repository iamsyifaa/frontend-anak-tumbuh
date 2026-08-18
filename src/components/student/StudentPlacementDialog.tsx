import React, { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, GraduationCap, Loader2, X } from "lucide-react";
import { UserProfile } from "../../types/auth";
import { AcademicYear, ClassGroup } from "../../types/school";
import { Student } from "../../types/student";
import { studentService } from "../../services/studentService";

interface Props { user: UserProfile; schoolId: string; students: Student[]; years: AcademicYear[]; groups: ClassGroup[]; onClose: () => void; onSaved: () => void; }

type Mode = "student" | "group";

export const StudentPlacementDialog: React.FC<Props> = ({ user, schoolId, students, years, groups, onClose, onSaved }) => {
  const [mode, setMode] = useState<Mode>("student");
  const [targetYearId, setTargetYearId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [sourceGroupId, setSourceGroupId] = useState("");
  const [targetGroupId, setTargetGroupId] = useState("");
  const [studentTargets, setStudentTargets] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const activeStudents = useMemo(() => students.filter((student) => student.status === "active"), [students]);
  const sourceGroups = useMemo(() => groups.filter((group) => group.academicYearId !== targetYearId), [groups, targetYearId]);
  const targetGroups = useMemo(() => groups.filter((group) => group.academicYearId === targetYearId), [groups, targetYearId]);
  const selectedGroupStudents = useMemo(() => activeStudents.filter((student) => student.classGroupId === sourceGroupId), [activeStudents, sourceGroupId]);

  const submit = async () => {
    setSaving(true); setError("");
    try {
      if (!targetYearId) throw new Error("Pilih tahun ajaran target.");
      let selectedIds: string[] = [];
      let targets: Record<string, string> = {};
      if (mode === "student") {
        if (!studentId) throw new Error("Pilih siswa.");
        if (!studentTargets[studentId]) throw new Error("Pilih rombel target.");
        selectedIds = [studentId]; targets = { [studentId]: studentTargets[studentId] };
      } else {
        if (!sourceGroupId) throw new Error("Pilih rombel asal.");
        if (!targetGroupId) throw new Error("Pilih rombel target.");
        if (!selectedGroupStudents.length) throw new Error("Tidak ada siswa aktif pada rombel asal.");
        selectedIds = selectedGroupStudents.map((student) => student.id);
        targets = Object.fromEntries(selectedIds.map((id) => [id, targetGroupId]));
      }
      await studentService.placeStudents(user, schoolId, { studentIds: selectedIds, targetAcademicYearId: targetYearId, targetClassGroupIdByStudent: targets });
      onSaved();
    } catch (e) { setError(e instanceof Error ? e.message : "Penempatan siswa gagal."); }
    finally { setSaving(false); }
  };

  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm">
    <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl">
      <div className="flex items-start justify-between border-b border-slate-100 p-5"><div><div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-sky-700"><GraduationCap className="h-3.5 w-3.5" /> Tahun Ajaran & Penempatan</div><h2 className="mt-2 text-xl font-black">Kenaikan / Penempatan Siswa</h2><p className="mt-1 text-xs text-slate-500">Riwayat enrollment lama tetap disimpan saat siswa dipindahkan ke tahun ajaran baru.</p></div><button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-50"><X className="h-5 w-5" /></button></div>
      <div className="p-5">
        {error && <div className="mb-4 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-700">{error}</div>}
        <div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setMode("student")} className={`rounded-2xl border p-4 text-left ${mode === "student" ? "border-sky-300 bg-sky-50" : "border-slate-200"}`}><p className="text-sm font-black">Per siswa</p><p className="mt-1 text-xs text-slate-500">Pilih satu siswa lalu tentukan rombel tujuan.</p></button><button type="button" onClick={() => setMode("group")} className={`rounded-2xl border p-4 text-left ${mode === "group" ? "border-sky-300 bg-sky-50" : "border-slate-200"}`}><p className="text-sm font-black">Massal per rombel</p><p className="mt-1 text-xs text-slate-500">Naikkan seluruh siswa aktif dari satu rombel sekaligus.</p></button></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><div><label className="text-xs font-black text-slate-700">Tahun ajaran target *</label><select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" value={targetYearId} onChange={(e) => { setTargetYearId(e.target.value); setTargetGroupId(""); setStudentTargets({}); }}>{<option value="">Pilih tahun ajaran</option>}{years.map((year) => <option key={year.id} value={year.id}>{year.name}{year.status === "active" ? " — Aktif" : ""}</option>)}</select></div><div className="flex items-end gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-600"><ArrowRight className="h-4 w-4 shrink-0 text-sky-600" />Pilih target setelah tahun ajaran tersedia.</div></div>
        {mode === "student" ? <div className="mt-5 space-y-4"><div><label className="text-xs font-black">Siswa *</label><select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" value={studentId} onChange={(e) => setStudentId(e.target.value)}><option value="">Pilih siswa</option>{activeStudents.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select></div>{studentId && <div><label className="text-xs font-black">Rombel target *</label><select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" value={studentTargets[studentId] ?? ""} onChange={(e) => setStudentTargets((current) => ({ ...current, [studentId]: e.target.value }))}><option value="">Pilih rombel target</option>{targetGroups.map((group) => <option key={group.id} value={group.id}>{group.levelName} — {group.rombelName}</option>)}</select></div>}</div> : <div className="mt-5 grid gap-4 sm:grid-cols-2"><div><label className="text-xs font-black">Rombel asal *</label><select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" value={sourceGroupId} onChange={(e) => setSourceGroupId(e.target.value)}><option value="">Pilih rombel asal</option>{sourceGroups.map((group) => <option key={group.id} value={group.id}>{group.levelName} — {group.rombelName}</option>)}</select></div><div><label className="text-xs font-black">Rombel target *</label><select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" value={targetGroupId} onChange={(e) => setTargetGroupId(e.target.value)}><option value="">Pilih rombel target</option>{targetGroups.map((group) => <option key={group.id} value={group.id}>{group.levelName} — {group.rombelName}</option>)}</select></div>{sourceGroupId && <div className="sm:col-span-2 rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">{selectedGroupStudents.length} siswa aktif akan ditempatkan ke rombel target.</div>}</div>}
        <div className="mt-6 flex justify-end gap-2"><button onClick={onClose} className="rounded-xl px-4 py-2.5 text-xs font-black text-slate-600">Batal</button><button disabled={saving} onClick={() => void submit()} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-black text-white disabled:opacity-50">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Simpan Penempatan</button></div>
      </div>
    </div>
  </div>;
};
