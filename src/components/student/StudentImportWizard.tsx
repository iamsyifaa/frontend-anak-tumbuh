import React, { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import { UserProfile } from "../../types/auth";
import { AcademicYear, ClassGroup } from "../../types/school";
import { ImportStudentRow, ValidatedImportRow } from "../../types/student";
import { parseStudentWorkbook, getCell } from "../../services/excelImport";
import { studentService } from "../../services/studentService";

interface Props { user: UserProfile; schoolId: string; years: AcademicYear[]; groups: ClassGroup[]; onCommitted: () => void; onClose: () => void; }
type Step = "upload" | "preview" | "errors" | "commit";
const steps: { id: Step; label: string }[] = [{ id: "upload", label: "Upload" }, { id: "preview", label: "Preview" }, { id: "errors", label: "Errors" }, { id: "commit", label: "Commit" }];
const inputClass = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-50";

export const StudentImportWizard: React.FC<Props> = ({ user, schoolId, years, groups, onCommitted, onClose }) => {
  const [step, setStep] = useState<Step>("upload");
  const [academicYearId, setAcademicYearId] = useState(years.find((year) => year.status === "active")?.id ?? years[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ValidatedImportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(0);
  const selectedGroups = useMemo(() => groups.filter((group) => group.academicYearId === academicYearId), [groups, academicYearId]);

  const parseFile = async (selected: File) => {
    setError("");
    try {
      const parsed = await parseStudentWorkbook(selected);
      const mapped: ImportStudentRow[] = parsed.rows.map((row, index) => ({
        rowNumber: index + 2,
        name: getCell(row, parsed.headers, ["nama", "nama siswa", "name"]),
        nisn: getCell(row, parsed.headers, ["nisn"]),
        nis: getCell(row, parsed.headers, ["nis", "nomor induk"]),
        levelName: getCell(row, parsed.headers, ["tingkat", "kelas", "level"]),
        rombelName: getCell(row, parsed.headers, ["rombel", "nama rombel"]),
        method: getCell(row, parsed.headers, ["metode", "metode pengisian", "method"]).toUpperCase() as ImportStudentRow["method"],
      }));
      if (!mapped.length) throw new Error("Tidak ada baris siswa setelah header.");
      setFile(selected);
      setLoading(true);
      const validated = await studentService.validateImport(user, schoolId, academicYearId, mapped);
      setRows(validated);
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "File gagal diproses.");
    } finally {
      setLoading(false);
    }
  };

  const validRows = rows.filter((row) => row.valid);
  const invalidRows = rows.filter((row) => !row.valid);

  const commit = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await studentService.commitImport(user, schoolId, rows);
      setResult(response.imported);
      setStep("commit");
      onCommitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import gagal dikomit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><p className="text-xs font-black uppercase tracking-wider text-sky-600">Student Management</p><h2 className="mt-1 text-xl font-black text-slate-900">Import Siswa via Excel</h2></div><button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-50"><X className="h-5 w-5" /></button></div>
        <div className="grid grid-cols-4 border-b border-slate-100 bg-slate-50/70">{steps.map((item, index) => { const active = steps.findIndex((s) => s.id === step) >= index; return <div key={item.id} className={`relative p-3 text-center ${active ? "text-sky-700" : "text-slate-400"}`}><span className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black ${active ? "bg-sky-600 text-white" : "bg-slate-200"}`}>{index + 1}</span><span className="mt-1 block text-[10px] font-black uppercase tracking-wider">{item.label}</span></div>; })}</div>
        <div className="flex-1 overflow-y-auto p-5">
          {error && <div className="mb-4 flex gap-2 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs font-semibold text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
          {step === "upload" && <div className="mx-auto max-w-2xl space-y-5"><div><label className="text-xs font-extrabold text-slate-600">Tahun Ajaran Target *</label><select className={inputClass} value={academicYearId} onChange={(e) => setAcademicYearId(e.target.value)}>{years.map((year) => <option key={year.id} value={year.id}>{year.name}</option>)}</select></div><div className="rounded-3xl border-2 border-dashed border-sky-200 bg-sky-50/40 p-10 text-center"><FileSpreadsheet className="mx-auto h-12 w-12 text-sky-500" /><h3 className="mt-4 text-lg font-black text-slate-900">Upload file siswa</h3><p className="mt-1 text-xs text-slate-500">Format .xlsx atau .csv. Import ini hanya untuk data master siswa, bukan rekap buku Manual.</p><label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-xs font-black text-white hover:bg-sky-700"><Upload className="h-4 w-4" />Pilih File<input type="file" accept=".xlsx,.csv" className="hidden" onChange={(e) => { const selected = e.target.files?.[0]; if (selected) void parseFile(selected); }} /></label>{loading && <p className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-sky-700"><Loader2 className="h-4 w-4 animate-spin" />Memvalidasi file...</p>}{file && <p className="mt-4 text-xs font-bold text-slate-600">{file.name}</p>}</div><div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-600"><p className="font-black text-slate-800">Kolom yang dikenali</p><p className="mt-1">Nama, NISN/NIS, Tingkat/Kelas, Rombel, Metode. Metode hanya DIGITAL atau MANUAL.</p><a href="/templates/student-import-template.csv" download className="mt-3 inline-flex rounded-lg bg-white px-3 py-2 text-[11px] font-black text-sky-700 shadow-sm ring-1 ring-slate-200">Download template CSV</a></div></div>}
          {step === "preview" && <div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-black text-slate-900">Preview hasil validasi</p><p className="text-xs text-slate-500">{rows.length} baris ditemukan · {validRows.length} valid · {invalidRows.length} error</p></div><button onClick={() => setStep("errors")} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700">Lihat Errors ({invalidRows.length})</button></div><div className="overflow-x-auto rounded-2xl border border-slate-100"><table className="w-full min-w-[900px] text-left text-xs"><thead className="bg-slate-50"><tr><th className="px-3 py-3">Row</th><th className="px-3 py-3">Nama</th><th className="px-3 py-3">NISN</th><th className="px-3 py-3">NIS</th><th className="px-3 py-3">Tingkat</th><th className="px-3 py-3">Rombel</th><th className="px-3 py-3">Metode</th><th className="px-3 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row.rowNumber}><td className="px-3 py-3 text-slate-400">{row.rowNumber}</td><td className="px-3 py-3 font-bold">{row.name || "—"}</td><td className="px-3 py-3">{row.nisn || "—"}</td><td className="px-3 py-3">{row.nis || "—"}</td><td className="px-3 py-3">{row.levelName || "—"}</td><td className="px-3 py-3">{row.rombelName || "—"}</td><td className="px-3 py-3"><span className={row.method === "DIGITAL" ? "font-black text-sky-600" : "font-black text-amber-600"}>{row.method || "—"}</span></td><td className="px-3 py-3">{row.valid ? <span className="font-black text-emerald-600">Valid</span> : <span className="font-black text-rose-600">Error</span>}</td></tr>)}</tbody></table></div><div className="flex justify-end gap-2"><button onClick={() => setStep("upload")} className="rounded-xl px-4 py-2.5 text-xs font-black text-slate-600">Kembali</button><button disabled={!rows.length || invalidRows.length > 0} onClick={() => setStep("errors")} className="rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-40">Lanjut</button></div></div>}
          {step === "errors" && <div className="space-y-4"><div className={`rounded-2xl p-4 ${invalidRows.length ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}><p className="flex items-center gap-2 text-sm font-black">{invalidRows.length ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}{invalidRows.length ? `${invalidRows.length} baris perlu diperbaiki.` : "Tidak ada error. Semua baris siap di-commit."}</p></div>{invalidRows.length > 0 && <div className="space-y-2">{invalidRows.map((row) => <div key={row.rowNumber} className="rounded-2xl border border-rose-100 bg-white p-4"><p className="text-xs font-black text-slate-900">Baris {row.rowNumber} — {row.name || "Nama kosong"}</p><ul className="mt-2 list-disc pl-5 text-xs text-rose-700">{row.errors.map((item, index) => <li key={index}>{item.field ? `${item.field}: ` : ""}{item.message}</li>)}</ul></div>)}</div>}<div className="flex justify-end gap-2"><button onClick={() => setStep("preview")} className="rounded-xl px-4 py-2.5 text-xs font-black text-slate-600">Kembali</button><button disabled={invalidRows.length > 0 || loading} onClick={() => setStep("commit")} className="rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-black text-white disabled:opacity-40">Siap Commit</button></div></div>}
          {step === "commit" && <div className="mx-auto max-w-xl py-8 text-center">{result > 0 ? <><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 className="h-8 w-8" /></div><h3 className="mt-4 text-xl font-black text-slate-900">Import berhasil</h3><p className="mt-2 text-sm text-slate-500">{result} siswa berhasil ditambahkan ke tahun ajaran {years.find((year) => year.id === academicYearId)?.name}.</p><button onClick={onClose} className="mt-6 rounded-xl bg-sky-600 px-5 py-3 text-xs font-black text-white">Selesai</button></> : <><h3 className="text-xl font-black text-slate-900">Siap melakukan commit</h3><p className="mt-2 text-sm text-slate-500">Pastikan semua baris valid. Setelah commit, data masuk ke master siswa.</p><button disabled={loading} onClick={() => void commit()} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-xs font-black text-white disabled:opacity-60">{loading && <Loader2 className="h-4 w-4 animate-spin" />}Commit {validRows.length} Siswa</button></>}</div>}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-[10px] font-semibold text-slate-500"><span>{selectedGroups.length} rombel tersedia untuk tahun ajaran terpilih.</span><span>Backend tetap menjadi sumber kebenaran.</span></div>
      </div>
    </div>
  );
};
