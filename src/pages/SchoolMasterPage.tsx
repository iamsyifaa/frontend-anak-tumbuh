import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  LayoutGrid,
  Loader2,
  Plus,
  RefreshCw,
  School as SchoolIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { MasterDialog } from "../components/master/MasterDialog";
import { FieldError } from "../components/master/FieldError";
import { schoolMasterService, MASTER_PERMISSIONS } from "../services/schoolMasterService";
import {
  AcademicYear,
  ClassGroup,
  CreateAcademicYearInput,
  CreateClassGroupInput,
  School,
  SchoolStatus,
} from "../types/school";

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-50";
const labelClass = "text-xs font-extrabold uppercase tracking-wide text-slate-600";

const EmptyState: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
      <LayoutGrid className="h-5 w-5" />
    </div>
    <h3 className="mt-3 text-sm font-extrabold text-slate-800">{title}</h3>
    <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500">{description}</p>
  </div>
);

export const SchoolMasterPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const canRead = hasPermission(MASTER_PERMISSIONS.read);
  const canWrite = hasPermission(MASTER_PERMISSIONS.write);
  const isSuperAdmin = user?.role === "super_admin";

  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [activeTab, setActiveTab] = useState<"school" | "academic-year" | "class-group">("school");
  const [loading, setLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dialog, setDialog] = useState<"school" | "academic-year" | "class-group" | null>(null);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);

  const selectedSchool = useMemo(
    () => schools.find((school) => school.id === selectedSchoolId) ?? null,
    [schools, selectedSchoolId],
  );

  const loadSchools = useCallback(async () => {
    if (!user || !canRead) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await schoolMasterService.listSchools(user);
      setSchools(result);
      setSelectedSchoolId((current) => {
        if (current && result.some((school) => school.id === current)) return current;
        return result[0]?.id ?? "";
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data sekolah.");
    } finally {
      setLoading(false);
    }
  }, [canRead, user]);

  const loadSchoolChildren = useCallback(async () => {
    if (!user || !selectedSchoolId || !canRead) return;
    setSectionLoading(true);
    setError("");
    try {
      const [years, groups] = await Promise.all([
        schoolMasterService.listAcademicYears(user, selectedSchoolId),
        schoolMasterService.listClassGroups(user, selectedSchoolId),
      ]);
      setAcademicYears(years);
      setClassGroups(groups);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat struktur sekolah.");
    } finally {
      setSectionLoading(false);
    }
  }, [canRead, selectedSchoolId, user]);

  useEffect(() => {
    void loadSchools();
  }, [loadSchools]);

  useEffect(() => {
    void loadSchoolChildren();
  }, [loadSchoolChildren]);

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-rose-100 bg-white p-10 text-center shadow-sm">
        <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
        <h1 className="mt-4 text-xl font-extrabold text-slate-900">Akses tidak tersedia</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
          Backend authorization tetap menjadi sumber kebenaran. Akun ini tidak memiliki permission untuk membaca master sekolah.
        </p>
      </div>
    );
  }

  const notifySuccess = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  };

  const handleSchoolSaved = async () => {
    setDialog(null);
    setEditingSchool(null);
    await loadSchools();
    notifySuccess("Data sekolah berhasil disimpan.");
  };

  const handleAcademicYearSaved = async () => {
    setDialog(null);
    await loadSchoolChildren();
    notifySuccess("Tahun ajaran berhasil disimpan.");
  };

  const handleClassGroupSaved = async () => {
    setDialog(null);
    await loadSchoolChildren();
    notifySuccess("Rombel berhasil disimpan.");
  };

  return (
    <div className="min-h-full space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-extrabold text-sky-700">
            <SchoolIcon className="h-3.5 w-3.5" /> Master Sekolah
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Sekolah & Tahun Ajaran</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
            Kelola konteks sekolah dan tahun ajaran. Struktur tingkat/rombel disiapkan sebagai skeleton dan tetap mengikuti konfigurasi backend.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadSchools()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-extrabold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          {isSuperAdmin && canWrite && (
            <button
              type="button"
              onClick={() => setDialog("school")}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-sky-700"
            >
              <Plus className="h-4 w-4" /> Tambah Sekolah
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="font-extrabold">Terjadi kesalahan</p>
            <p className="mt-0.5 text-xs">{error}</p>
          </div>
          <button type="button" onClick={() => setError("")} className="text-xs font-bold">Tutup</button>
        </div>
      )}

      {notice && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
          <CheckCircle2 className="h-5 w-5" /> {notice}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((item) => <div key={item} className="h-28 animate-pulse rounded-3xl bg-white shadow-sm ring-1 ring-slate-100" />)}
        </div>
      ) : (
        <>
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Scope sekolah</p>
                <h2 className="mt-1 text-lg font-black text-slate-900">{isSuperAdmin ? "Pilih sekolah" : "Sekolah Anda"}</h2>
              </div>
              {isSuperAdmin && (
                <div className="relative w-full md:w-80">
                  <select
                    value={selectedSchoolId}
                    onChange={(event) => setSelectedSchoolId(event.target.value)}
                    className={`${inputClass} appearance-none pr-10`}
                    aria-label="Pilih sekolah"
                  >
                    {schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-4 h-4 w-4 text-slate-400" />
                </div>
              )}
            </div>

            {selectedSchool ? (
              <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto]">
                <div className="rounded-2xl bg-sky-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-extrabold text-slate-900">{selectedSchool.name}</h3>
                      <p className="mt-1 text-xs text-slate-500">Timezone sekolah: {selectedSchool.timezone}</p>
                      <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-extrabold ${selectedSchool.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {selectedSchool.status === "active" ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                  </div>
                </div>
                {canWrite && (
                  <button
                    type="button"
                    onClick={() => { setEditingSchool(selectedSchool); setDialog("school"); }}
                    className="self-stretch rounded-2xl border border-slate-200 px-5 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
                  >
                    Edit Sekolah
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-5"><EmptyState title="Belum ada sekolah" description="Data sekolah akan muncul setelah backend mengembalikan resource yang sesuai dengan scope akun." /></div>
            )}
          </section>

          <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="flex overflow-x-auto border-b border-slate-100 px-2 pt-2">
              {[
                ["school", "Sekolah", Building2],
                ["academic-year", "Tahun Ajaran", CalendarDays],
                ["class-group", "Kelas / Rombel", GraduationCap],
              ].map(([id, label, Icon]) => (
                <button
                  key={id as string}
                  type="button"
                  onClick={() => setActiveTab(id as typeof activeTab)}
                  className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-extrabold ${activeTab === id ? "border-sky-500 text-sky-700" : "border-transparent text-slate-400 hover:text-slate-700"}`}
                >
                  <Icon className="h-4 w-4" /> {label as string}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === "school" && (
                <div>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div><h3 className="font-extrabold text-slate-900">Daftar Sekolah</h3><p className="text-xs text-slate-500">Super Admin melihat lintas sekolah; Kepala Sekolah hanya melihat scope sekolahnya.</p></div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">{schools.length} sekolah</span>
                  </div>
                  {schools.length === 0 ? <EmptyState title="Belum ada data sekolah" description="Belum ada resource sekolah yang dapat ditampilkan." /> : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-100">
                      <table className="w-full min-w-[640px] text-left text-sm">
                        <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                          <tr><th className="px-4 py-3 font-extrabold">Nama Sekolah</th><th className="px-4 py-3 font-extrabold">Timezone</th><th className="px-4 py-3 font-extrabold">Status</th><th className="px-4 py-3 text-right font-extrabold">Aksi</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {schools.map((school) => <tr key={school.id} className="hover:bg-slate-50/60"><td className="px-4 py-3 font-bold text-slate-800">{school.name}</td><td className="px-4 py-3 text-slate-500">{school.timezone}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${school.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{school.status === "active" ? "Aktif" : "Nonaktif"}</span></td><td className="px-4 py-3 text-right">{canWrite && <button type="button" onClick={() => { setSelectedSchoolId(school.id); setEditingSchool(school); setDialog("school"); }} className="text-xs font-extrabold text-sky-600 hover:text-sky-800">Edit</button>}</td></tr>)}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "academic-year" && (
                <div>
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-extrabold text-slate-900">Tahun Ajaran</h3><p className="text-xs text-slate-500">Enrollment baru menggunakan konteks tahun ajaran tanpa menghapus histori lama.</p></div>{canWrite && selectedSchool && <button type="button" onClick={() => setDialog("academic-year")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-sky-700"><Plus className="h-4 w-4" /> Tambah Tahun Ajaran</button>}</div>
                  {sectionLoading ? <div className="h-32 animate-pulse rounded-2xl bg-slate-50" /> : academicYears.length === 0 ? <EmptyState title="Belum ada tahun ajaran" description="Buat konteks tahun ajaran dari sekolah yang dipilih." /> : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-100"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3 font-extrabold">Tahun Ajaran</th><th className="px-4 py-3 font-extrabold">Mulai</th><th className="px-4 py-3 font-extrabold">Selesai</th><th className="px-4 py-3 font-extrabold">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{academicYears.map((year) => <tr key={year.id}><td className="px-4 py-3 font-bold text-slate-800">{year.name}</td><td className="px-4 py-3 text-slate-500">{year.startDate}</td><td className="px-4 py-3 text-slate-500">{year.endDate}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${year.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{year.status === "active" ? "Aktif" : "Tidak Aktif"}</span></td></tr>)}</tbody></table></div>
                  )}
                </div>
              )}

              {activeTab === "class-group" && (
                <div>
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-extrabold text-slate-900">Skeleton Kelas / Rombel</h3><p className="text-xs text-slate-500">Nama tingkat dan rombel tidak di-hard-code; backend tetap menentukan validasi scope dan assignment Wali Kelas.</p></div>{canWrite && selectedSchool && <button type="button" onClick={() => setDialog("class-group")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-sky-700"><Plus className="h-4 w-4" /> Tambah Rombel</button>}</div>
                  {sectionLoading ? <div className="h-32 animate-pulse rounded-2xl bg-slate-50" /> : classGroups.length === 0 ? <EmptyState title="Belum ada rombel" description="Skeleton ini siap menerima struktur tingkat/rombel dari backend." /> : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-100"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3 font-extrabold">Tahun Ajaran</th><th className="px-4 py-3 font-extrabold">Tingkat</th><th className="px-4 py-3 font-extrabold">Rombel</th><th className="px-4 py-3 font-extrabold">Wali Kelas</th></tr></thead><tbody className="divide-y divide-slate-100">{classGroups.map((group) => { const year = academicYears.find((item) => item.id === group.academicYearId); return <tr key={group.id}><td className="px-4 py-3 text-slate-500">{year?.name ?? "—"}</td><td className="px-4 py-3 font-bold text-slate-800">{group.levelName}</td><td className="px-4 py-3 text-slate-700">{group.rombelName}</td><td className="px-4 py-3 text-slate-500">{group.homeroomTeacherName ?? "Belum ditetapkan"}</td></tr>; })}</tbody></table></div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <MasterDialog open={dialog === "school"} title={editingSchool ? "Edit Sekolah" : "Tambah Sekolah"} description="Field minimal mock UI; kontrak endpoint final mengikuti backend." onClose={() => { setDialog(null); setEditingSchool(null); }}>
        <SchoolForm
          school={editingSchool}
          isSuperAdmin={isSuperAdmin}
          onSaved={handleSchoolSaved}
          onError={setError}
        />
      </MasterDialog>

      <MasterDialog open={dialog === "academic-year"} title="Tambah Tahun Ajaran" description={selectedSchool?.name} onClose={() => setDialog(null)}>
        <AcademicYearForm schoolId={selectedSchoolId} onSaved={handleAcademicYearSaved} onError={setError} />
      </MasterDialog>

      <MasterDialog open={dialog === "class-group"} title="Tambah Kelas / Rombel" description={selectedSchool?.name} onClose={() => setDialog(null)}>
        <ClassGroupForm schoolId={selectedSchoolId} academicYears={academicYears} onSaved={handleClassGroupSaved} onError={setError} />
      </MasterDialog>
    </div>
  );
};

const SchoolForm: React.FC<{ school: School | null; isSuperAdmin: boolean; onSaved: () => void; onError: (message: string) => void }> = ({ school, isSuperAdmin, onSaved, onError }) => {
  const { user } = useAuth();
  const [name, setName] = useState(school?.name ?? "");
  const [timezone, setTimezone] = useState(school?.timezone ?? "Asia/Jakarta");
  const [status, setStatus] = useState<SchoolStatus>(school?.status ?? "active");
  const [fieldError, setFieldError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFieldError("");
    if (!name.trim()) { setFieldError("Nama sekolah wajib diisi."); return; }
    if (!user) return;
    setSaving(true);
    try {
      if (school) await schoolMasterService.updateSchool(user, school.id, { name, timezone, status });
      else if (isSuperAdmin) await schoolMasterService.createSchool(user, { name, timezone });
      else throw new Error("Akun ini tidak dapat membuat sekolah.");
      onSaved();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan sekolah.";
      setFieldError(message);
      onError(message);
    } finally { setSaving(false); }
  };

  return <form onSubmit={submit} className="space-y-4">
    <div><label className={labelClass}>Nama Sekolah</label><input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: SDN Anak Tumbuh 01" autoFocus /><FieldError message={fieldError} /></div>
    <div><label className={labelClass}>Timezone Sekolah</label><select className={inputClass} value={timezone} onChange={(e) => setTimezone(e.target.value)}><option value="Asia/Jakarta">Asia/Jakarta (WIB)</option><option value="Asia/Makassar">Asia/Makassar (WITA)</option><option value="Asia/Jayapura">Asia/Jayapura (WIT)</option></select></div>
    {school && <div><label className={labelClass}>Status</label><select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as SchoolStatus)}><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select></div>}
    <div className="flex justify-end gap-2 pt-2"><button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-sky-700 disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />} {saving ? "Menyimpan..." : "Simpan"}</button></div>
  </form>;
};

const AcademicYearForm: React.FC<{ schoolId: string; onSaved: () => void; onError: (message: string) => void }> = ({ schoolId, onSaved, onError }) => {
  const { user } = useAuth();
  const [form, setForm] = useState<Omit<CreateAcademicYearInput, "schoolId">>({ name: "", startDate: "", endDate: "", status: "active" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Nama tahun ajaran wajib diisi.";
    if (!form.startDate) next.startDate = "Tanggal mulai wajib diisi.";
    if (!form.endDate) next.endDate = "Tanggal selesai wajib diisi.";
    if (form.startDate && form.endDate && form.endDate <= form.startDate) next.endDate = "Tanggal selesai harus setelah tanggal mulai.";
    setFieldErrors(next);
    if (Object.keys(next).length || !user) return;
    setSaving(true);
    try { await schoolMasterService.createAcademicYear(user, { schoolId, ...form }); onSaved(); }
    catch (err) { const message = err instanceof Error ? err.message : "Gagal menyimpan tahun ajaran."; setFieldErrors({ name: message }); onError(message); }
    finally { setSaving(false); }
  };

  return <form onSubmit={submit} className="space-y-4">
    <div><label className={labelClass}>Nama Tahun Ajaran</label><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="2026/2027" autoFocus /><FieldError message={fieldErrors.name} /></div>
    <div className="grid gap-4 sm:grid-cols-2"><div><label className={labelClass}>Tanggal Mulai</label><input type="date" className={inputClass} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /><FieldError message={fieldErrors.startDate} /></div><div><label className={labelClass}>Tanggal Selesai</label><input type="date" className={inputClass} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /><FieldError message={fieldErrors.endDate} /></div></div>
    <div><label className={labelClass}>Status</label><select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AcademicYear["status"] })}><option value="active">Aktif</option><option value="inactive">Tidak Aktif</option></select><p className="mt-1 text-[11px] text-slate-400">Saat status aktif dibuat, mock API menonaktifkan tahun ajaran aktif lain pada sekolah yang sama.</p></div>
    <div className="flex justify-end"><button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-sky-700 disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />} {saving ? "Menyimpan..." : "Simpan Tahun Ajaran"}</button></div>
  </form>;
};

const ClassGroupForm: React.FC<{ schoolId: string; academicYears: AcademicYear[]; onSaved: () => void; onError: (message: string) => void }> = ({ schoolId, academicYears, onSaved, onError }) => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<{ id: string; schoolId: string; name: string }[]>([]);
  const [form, setForm] = useState({ academicYearId: academicYears.find((year) => year.status === "active")?.id ?? academicYears[0]?.id ?? "", levelName: "", rombelName: "", homeroomTeacherId: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (user && schoolId) void schoolMasterService.listTeachers(user, schoolId).then(setTeachers).catch(() => setTeachers([])); }, [schoolId, user]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!form.academicYearId) next.academicYearId = "Tahun ajaran wajib dipilih.";
    if (!form.levelName.trim()) next.levelName = "Tingkat wajib diisi.";
    if (!form.rombelName.trim()) next.rombelName = "Nama rombel wajib diisi.";
    setErrors(next);
    if (Object.keys(next).length || !user) return;
    setSaving(true);
    try { const input: CreateClassGroupInput = { schoolId, ...form, homeroomTeacherId: form.homeroomTeacherId || undefined }; await schoolMasterService.createClassGroup(user, input); onSaved(); }
    catch (err) { const message = err instanceof Error ? err.message : "Gagal menyimpan rombel."; setErrors({ rombelName: message }); onError(message); }
    finally { setSaving(false); }
  };

  return <form onSubmit={submit} className="space-y-4">
    <div><label className={labelClass}>Tahun Ajaran</label><select className={inputClass} value={form.academicYearId} onChange={(e) => setForm({ ...form, academicYearId: e.target.value })}><option value="">Pilih tahun ajaran</option>{academicYears.map((year) => <option key={year.id} value={year.id}>{year.name}{year.status === "active" ? " — aktif" : ""}</option>)}</select><FieldError message={errors.academicYearId} /></div>
    <div className="grid gap-4 sm:grid-cols-2"><div><label className={labelClass}>Nama Tingkat</label><input className={inputClass} value={form.levelName} onChange={(e) => setForm({ ...form, levelName: e.target.value })} placeholder="Contoh: Kelas 5 / TK A1" /><FieldError message={errors.levelName} /></div><div><label className={labelClass}>Nama Rombel</label><input className={inputClass} value={form.rombelName} onChange={(e) => setForm({ ...form, rombelName: e.target.value })} placeholder="Contoh: Cendekia / A" /><FieldError message={errors.rombelName} /></div></div>
    <div><label className={labelClass}>Wali Kelas (skeleton)</label><select className={inputClass} value={form.homeroomTeacherId} onChange={(e) => setForm({ ...form, homeroomTeacherId: e.target.value })}><option value="">Belum ditetapkan</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}</select><p className="mt-1 text-[11px] text-slate-400">Constraint satu Wali Kelas/satu rombel aktif tetap harus ditegakkan backend.</p></div>
    <div className="flex justify-end"><button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-sky-700 disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />} {saving ? "Menyimpan..." : "Simpan Rombel"}</button></div>
  </form>;
};
