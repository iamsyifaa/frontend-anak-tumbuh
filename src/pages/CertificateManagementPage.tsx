import React, { useEffect, useMemo, useState } from "react";
import { Award, CheckCircle2, FilePlus2, Filter, Plus, ShieldAlert, UserCheck, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { certificateService } from "../services/certificateService";
import { schoolMasterService } from "../services/schoolMasterService";
import { CertificateManagementContext } from "../types/certificate";
import { habitConfigurationService } from "../services/habitConfigurationService";

const inputClass = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-50";

export const CertificateManagementPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const canManage = hasPermission("manage:certificates");
  const [schoolId, setSchoolId] = useState(user?.schoolId ?? "");
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [context, setContext] = useState<CertificateManagementContext | null>(null);
  const [habits, setHabits] = useState<{ id: string; name: string }[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedWaliId, setSelectedWaliId] = useState("");
  const [basis, setBasis] = useState<"award" | "habit" | "period">("habit");
  const [habitName, setHabitName] = useState("Bangun Pagi");
  const [periodLabel, setPeriodLabel] = useState("Agustus 2026");
  const [descriptionOverride, setDescriptionOverride] = useState("Diberikan kepada {student} atas pencapaian kebiasaan {habit} pada periode {period}.");
  const [awardTitle, setAwardTitle] = useState("");
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [savingTemplateSelection, setSavingTemplateSelection] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  const load = async () => {
    if (!user || !canManage) return;
    setError("");
    try {
      const availableSchools = await schoolMasterService.listSchools(user);
      const selectedSchool = user.role === "super_admin" ? (schoolId || availableSchools[0]?.id || "") : user.schoolId ?? "";
      setSchools(availableSchools);
      setSchoolId(selectedSchool);
      if (selectedSchool) {
        const [nextContext, config] = await Promise.all([
          certificateService.getContext(user, selectedSchool),
          habitConfigurationService.getConfiguration(user, selectedSchool),
        ]);
        setContext(nextContext);
        setHabits(config.habits.filter((habit) => habit.active).map((habit) => ({ id: habit.id, name: habit.name })));
        setSelectedTemplateId((current) => current || nextContext.templates[0]?.id || "");
        setSelectedWaliId((current) => current || nextContext.waliTeachers[0]?.id || "");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat pengaturan sertifikat.");
    }
  };

  useEffect(() => { void load(); }, [user?.id, schoolId]);

  const selectedCount = selectedStudents.length;
  const selectedWali = useMemo(() => context?.waliTeachers.find((teacher) => teacher.id === selectedWaliId) ?? null, [context, selectedWaliId]);
  const activeStudents = useMemo(() => (context?.studentOptions ?? []).filter((student) => !selectedWali?.classGroupId || student.classGroupId === selectedWali.classGroupId), [context, selectedWali]);

  const toggleStudent = (id: string) => {
    setSelectedStudents((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const selectAll = () => setSelectedStudents(activeStudents.map((student) => student.id));
  const clearAll = () => setSelectedStudents([]);

  const createTemplate = async () => {
    if (!user || !schoolId || !templateName.trim()) return;
    setCreatingTemplate(true);
    setError("");
    try {
      const template = await certificateService.createTemplate(user, schoolId, {
        name: templateName.trim(),
        titleTemplate: "Sertifikat Pencapaian {student}",
        descriptionTemplate: "Diberikan kepada {student} atas pencapaian kebiasaan {habit} pada periode {period}.",
        issuerRoleLabel: "Kepala Sekolah",
        active: true,
        templateCode: "classic-blue-gold",
      });
      setTemplateName("");
      setSelectedTemplateId(template.id);
      setNotice(`Template “${template.name}” berhasil dibuat.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat template.");
    } finally {
      setCreatingTemplate(false);
    }
  };

  const issue = async () => {
    if (!user || !schoolId || !selectedTemplateId || !selectedCount || !selectedWaliId) return;
    setIssuing(true);
    setError("");
    try {
      const created = await certificateService.issue(user, {
        schoolId,
        templateId: selectedTemplateId,
        studentIds: selectedStudents,
        basis,
        habitName: basis === "habit" ? habitName : undefined,
        periodLabel,
        waliTeacherId: selectedWaliId,
        awardTitle: basis === "award" ? awardTitle : undefined,
        descriptionOverride,
      });
      setSelectedStudents([]);
      setNotice(`${created.length} sertifikat berhasil dibuat dan diberikan.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memberikan sertifikat.");
    } finally {
      setIssuing(false);
    }
  };

  if (!canManage) return <div className="rounded-3xl bg-white p-10 text-center shadow-sm"><ShieldAlert className="mx-auto h-10 w-10 text-rose-500" /><h1 className="mt-4 text-xl font-black text-slate-900">Akses sertifikat tidak tersedia</h1><p className="mt-2 text-sm text-slate-500">Permission pengelolaan sertifikat harus diberikan oleh backend.</p></div>;

  return <div className="space-y-6">
    <header>
      <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-[11px] font-black text-violet-700"><Award className="h-3.5 w-3.5" /> Achievement • Sertifikat</div>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Pengaturan & Pemberian Sertifikat</h1>
      <p className="mt-1 max-w-3xl text-sm font-medium text-slate-500">Admin membuat template dan memberikan sertifikat kepada Wali Kelas. Wali Kelas kemudian mengunduh sertifikat siswa untuk dicetak.</p>
    </header>

    {user?.role === "super_admin" && <label className="block rounded-3xl border border-slate-200 bg-white p-5 shadow-sm text-sm font-black text-slate-700">Sekolah<select className={inputClass} value={schoolId} onChange={(e) => setSchoolId(e.target.value)}>{schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}</select></label>}
    {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div>}
    {notice && <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700"><CheckCircle2 className="h-5 w-5" />{notice}</div>}

    <section className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3"><div><h2 className="font-black text-slate-900">Template sertifikat</h2><p className="mt-1 text-xs text-slate-500">Template dibuat dari kode layout ANAKTUMBUH yang versioned, tanpa upload foto.</p></div><FilePlus2 className="h-5 w-5 text-violet-500" /></div>
        <div className="mt-4 space-y-3">
          <label className="block text-xs font-black text-slate-600">Template aktif<select className={inputClass} value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}>{(context?.templates ?? []).map((template) => <option key={template.id} value={template.id}>{template.name} · v{template.version}</option>)}</select></label>
          <button type="button" disabled={savingTemplateSelection || !selectedTemplateId} onClick={async () => { if (!user || !schoolId) return; setSavingTemplateSelection(true); setError(""); try { await certificateService.saveSelectedTemplate(user, schoolId, selectedTemplateId); setNotice("Template aktif berhasil disimpan."); await load(); } catch (err) { setError(err instanceof Error ? err.message : "Gagal menyimpan template aktif."); } finally { setSavingTemplateSelection(false); } }} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-xs font-black text-violet-700 disabled:opacity-50">{savingTemplateSelection ? "Menyimpan..." : "Simpan Template Aktif"}</button>
          <button type="button" onClick={() => { setTemplateName(""); setTemplateDialogOpen(true); }} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-xs font-black text-white"><Plus className="h-4 w-4"/>Tambah Template Sertifikat</button>
          <a href="/templates/sertifikat-contoh-ANAKTUMBUH.svg" target="_blank" rel="noreferrer" className="block text-center text-[11px] font-black text-sky-600">Lihat contoh sertifikat</a>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3"><div><h2 className="font-black text-slate-900">Buat & berikan sertifikat</h2><p className="mt-1 text-xs text-slate-500">Pilih target siswa sesuai scope sekolah.</p></div><UserCheck className="h-5 w-5 text-sky-500" /></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-black text-slate-600">Dasar penghargaan<select className={inputClass} value={basis} onChange={(e) => setBasis(e.target.value as typeof basis)}><option value="habit">Kebiasaan</option><option value="award">Penghargaan</option><option value="period">Periode</option></select></label>
          <label className="text-xs font-black text-slate-600">Periode<input className={inputClass} value={periodLabel} onChange={(e) => setPeriodLabel(e.target.value)} /></label>
          {basis === "habit" && <label className="text-xs font-black text-slate-600">Kebiasaan<select className={inputClass} value={habitName} onChange={(e) => setHabitName(e.target.value)}>{habits.map((habit) => <option key={habit.id} value={habit.name}>{habit.name}</option>)}</select></label>}
          {basis === "award" && <label className="text-xs font-black text-slate-600">Nama penghargaan<input className={inputClass} value={awardTitle} onChange={(e) => setAwardTitle(e.target.value)} placeholder="Contoh: Kebiasaan Mandiri" /></label>}
        </div>

        <label className="mt-4 block text-xs font-black text-slate-600">Deskripsi sertifikat<textarea rows={3} className={inputClass} value={descriptionOverride} onChange={(e) => setDescriptionOverride(e.target.value)} placeholder="Contoh: Diberikan kepada {student} atas pencapaian kebiasaan {habit} pada periode {period}." /></label>

        <label className="mt-4 block text-xs font-black text-slate-600">Wali Kelas penerima<select className={inputClass} value={selectedWaliId} onChange={(e) => { setSelectedWaliId(e.target.value); setSelectedStudents([]); }}><option value="">Pilih Wali Kelas</option>{(context?.waliTeachers ?? []).map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name} · {teacher.classGroupName ?? "Belum ditetapkan"}</option>)}</select></label>

        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-black text-slate-700">Penerima ({selectedCount})</p><div className="flex gap-2"><button type="button" onClick={selectAll} className="text-[11px] font-black text-violet-600">Pilih semua</button><button type="button" onClick={clearAll} className="text-[11px] font-black text-slate-500">Kosongkan</button></div></div>
          <div className="mt-3 max-h-48 space-y-1 overflow-y-auto">{activeStudents.map((student) => <label key={student.id} className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2 hover:bg-violet-50"><input type="checkbox" checked={selectedStudents.includes(student.id)} onChange={() => toggleStudent(student.id)} /><span className="min-w-0 text-xs font-bold text-slate-700">{student.name}</span><span className="ml-auto text-[10px] font-semibold text-slate-400">{student.className}</span></label>)}</div>
        </div>
        <button type="button" disabled={issuing || !selectedTemplateId || !selectedCount || !selectedWaliId || !periodLabel.trim()} onClick={() => void issue()} className="mt-4 w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-black text-white disabled:opacity-50">{issuing ? "Membuat sertifikat..." : `Buat & berikan ${selectedCount || ""} sertifikat`}</button>
      </div>
    </section>

    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 p-5"><Filter className="h-5 w-5 text-slate-400" /><div><h2 className="font-black text-slate-900">Riwayat sertifikat</h2><p className="mt-1 text-xs text-slate-500">Preview/PDF final mengikuti storage dan endpoint backend.</p></div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Nomor</th><th className="px-5 py-3">Siswa</th><th className="px-5 py-3">Judul</th><th className="px-5 py-3">Periode</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{context?.issued.map((certificate) => <tr key={certificate.id}><td className="px-5 py-3 font-mono text-[11px] font-bold text-slate-500">{certificate.certificateNumber}</td><td className="px-5 py-3 font-black text-slate-800">{certificate.studentName}</td><td className="px-5 py-3 text-xs font-semibold text-slate-600">{certificate.title}</td><td className="px-5 py-3 text-xs font-semibold text-slate-600">{certificate.periodLabel}</td><td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${certificate.status === "issued" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{certificate.status}</span></td></tr>)}</tbody></table></div>
    </section>

    {templateDialogOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-violet-700"><FilePlus2 className="h-3.5 w-3.5"/> Template Baru</div><h3 className="mt-3 text-xl font-black text-slate-900">Tambah Template Sertifikat</h3><p className="mt-1 text-xs text-slate-500">Template baru akan langsung tersedia sebagai pilihan pada proses pemberian sertifikat.</p></div><button type="button" onClick={() => setTemplateDialogOpen(false)}><X className="text-slate-400"/></button></div><label className="mt-5 block text-xs font-black text-slate-600">Nama template<input autoFocus className={inputClass} value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Contoh: Sertifikat Prestasi Bulanan" /></label><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setTemplateDialogOpen(false)} className="rounded-xl px-4 py-2.5 text-xs font-black text-slate-600">Batal</button><button type="button" disabled={creatingTemplate || !templateName.trim()} onClick={async () => { await createTemplate(); setTemplateDialogOpen(false); }} className="rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-black text-white disabled:opacity-40">{creatingTemplate ? "Menyimpan..." : "Simpan Template"}</button></div></div></div>}
  </div>;
};
