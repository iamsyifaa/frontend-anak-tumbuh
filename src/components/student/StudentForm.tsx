import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { UserProfile } from "../../types/auth";
import { AcademicYear, ClassGroup } from "../../types/school";
import { CreateStudentInput, Student, StudentMethod, StudentStatus } from "../../types/student";
import { studentService } from "../../services/studentService";

const inputClass = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-50";

interface Props {
  user: UserProfile;
  schoolId: string;
  years: AcademicYear[];
  groups: ClassGroup[];
  onSaved: () => void;
  onCancel: () => void;
}

export const StudentForm: React.FC<Props> = ({ user, schoolId, years, groups, onSaved, onCancel }) => {
  const activeYear = years.find((year) => year.status === "active") ?? years[0];
  const [form, setForm] = useState<CreateStudentInput>({
    schoolId,
    academicYearId: activeYear?.id ?? "",
    classGroupId: "",
    name: "",
    nisn: "",
    nis: "",
    method: "DIGITAL",
    status: "active",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredGroups = useMemo(() => groups.filter((group) => group.academicYearId === form.academicYearId), [groups, form.academicYearId]);

  useEffect(() => {
    setForm((current) => ({ ...current, schoolId, academicYearId: activeYear?.id ?? current.academicYearId, classGroupId: filteredGroups.some((group) => group.id === current.classGroupId) ? current.classGroupId : filteredGroups[0]?.id ?? "" }));
  }, [activeYear?.id, filteredGroups, schoolId]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await studentService.createStudent(user, form);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan siswa.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <div className="flex gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
      <div>
        <label className="text-xs font-extrabold text-slate-600">Nama Siswa *</label>
        <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className="text-xs font-extrabold text-slate-600">NISN</label><input className={inputClass} value={form.nisn} onChange={(e) => setForm({ ...form, nisn: e.target.value })} /></div>
        <div><label className="text-xs font-extrabold text-slate-600">NIS</label><input className={inputClass} value={form.nis} onChange={(e) => setForm({ ...form, nis: e.target.value })} /></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className="text-xs font-extrabold text-slate-600">Tahun Ajaran *</label><select className={inputClass} value={form.academicYearId} onChange={(e) => setForm({ ...form, academicYearId: e.target.value, classGroupId: "" })} required>{years.map((year) => <option key={year.id} value={year.id}>{year.name}</option>)}</select></div>
        <div><label className="text-xs font-extrabold text-slate-600">Rombel *</label><select className={inputClass} value={form.classGroupId} onChange={(e) => setForm({ ...form, classGroupId: e.target.value })} required><option value="">Pilih rombel</option>{filteredGroups.map((group) => <option key={group.id} value={group.id}>{group.levelName} — {group.rombelName}</option>)}</select></div>
      </div>
      <div>
        <label className="text-xs font-extrabold text-slate-600">Metode Pengisian *</label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(["DIGITAL", "MANUAL"] as StudentMethod[]).map((method) => <button key={method} type="button" onClick={() => setForm({ ...form, method })} className={`rounded-xl border p-3 text-left ${form.method === method ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-white"}`}><p className="text-xs font-black">{method}</p><p className="mt-1 text-[11px] text-slate-500">{method === "DIGITAL" ? "Menggunakan aplikasi dan QR." : "Menggunakan buku fisik."}</p></button>)}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={onCancel} className="rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-600 hover:bg-slate-50">Batal</button><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-extrabold text-white disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Simpan Siswa</button></div>
    </form>
  );
};
