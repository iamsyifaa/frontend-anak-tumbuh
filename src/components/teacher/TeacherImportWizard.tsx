import React, { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import { UserProfile } from "../../types/auth";
import { ClassGroup } from "../../types/school";
import { ImportTeacherRow, ValidatedTeacherImportRow } from "../../types/teacher";
import { parseStudentWorkbook, getCell } from "../../services/excelImport";
import { teacherService } from "../../services/teacherService";

interface Props { user: UserProfile; schoolId: string; groups: ClassGroup[]; onClose: () => void; onCommitted: () => void; }
const steps = ["upload", "preview", "errors", "commit"] as const;
type Step = typeof steps[number];

export const TeacherImportWizard: React.FC<Props> = ({ user, schoolId, groups, onClose, onCommitted }) => {
  const [step, setStep] = useState<Step>("upload");
  const [rows, setRows] = useState<ValidatedTeacherImportRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(0);
  const [credentials, setCredentials] = useState<{teacherId:string;teacherName:string;username:string;temporaryPassword:string;classGroupName?:string}[]>([]);
  const validRows = useMemo(() => rows.filter((row) => row.valid), [rows]);
  const invalidRows = useMemo(() => rows.filter((row) => !row.valid), [rows]);

  const parseFile = async (file: File) => {
    setLoading(true); setError(""); setFileName(file.name);
    try {
      const parsed = await parseStudentWorkbook(file);
      const mapped: ImportTeacherRow[] = parsed.rows.map((row, index) => ({
        rowNumber: index + 2,
        name: getCell(row, parsed.headers, ["nama", "nama guru", "name"]),
                status: (() => { const value = getCell(row, parsed.headers, ["status"]).toLowerCase(); return value === "aktif" ? "active" : value === "nonaktif" ? "inactive" : (value || "active"); })() as ImportTeacherRow["status"],
        levelName: getCell(row, parsed.headers, ["tingkat", "kelas", "level"]),
        rombelName: getCell(row, parsed.headers, ["rombel", "nama rombel"]),
      }));
      const validated = await teacherService.validateImport(user, schoolId, mapped);
      setRows(validated); setStep("preview");
    } catch (e) { setError(e instanceof Error ? e.message : "File guru gagal diproses."); }
    finally { setLoading(false); }
  };

  const commit = async () => {
    setLoading(true); setError("");
    try { const response = await teacherService.commitImport(user, schoolId, rows); setResult(response.imported); setCredentials(response.credentials); setStep("commit"); onCommitted(); }
    catch (e) { setError(e instanceof Error ? e.message : "Import guru gagal dikomit."); }
    finally { setLoading(false); }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
    <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><p className="text-xs font-black uppercase tracking-wider text-sky-600">Teacher Management</p><h2 className="mt-1 text-xl font-black">Import Guru via Excel</h2></div><button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-50"><X className="h-5 w-5" /></button></div>
      <div className="grid grid-cols-4 border-b border-slate-100 bg-slate-50/70">{steps.map((item, index) => { const active = steps.indexOf(step) >= index; return <div key={item} className={`p-3 text-center ${active ? "text-sky-700" : "text-slate-400"}`}><span className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black ${active ? "bg-sky-600 text-white" : "bg-slate-200"}`}>{index + 1}</span><span className="mt-1 block text-[10px] font-black uppercase tracking-wider">{item}</span></div>; })}</div>
      <div className="flex-1 overflow-y-auto p-5">
        {error && <div className="mb-4 flex gap-2 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs font-semibold text-rose-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
        {step === "upload" && <div className="mx-auto max-w-2xl space-y-5"><div className="rounded-3xl border-2 border-dashed border-sky-200 bg-sky-50/40 p-10 text-center"><FileSpreadsheet className="mx-auto h-12 w-12 text-sky-500" /><h3 className="mt-4 text-lg font-black">Upload data guru</h3><p className="mt-1 text-xs text-slate-500">Format .xlsx atau .csv. Kolom: Nama, Status, Tingkat, Rombel. Username dan password dibuat otomatis setelah import.</p><label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-xs font-black text-white hover:bg-sky-700"><Upload className="h-4 w-4" />Pilih File<input type="file" accept=".xlsx,.csv" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void parseFile(file); }} /></label>{loading && <p className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-sky-700"><Loader2 className="h-4 w-4 animate-spin" />Memvalidasi...</p>}{fileName && <p className="mt-4 text-xs font-bold text-slate-600">{fileName}</p>}</div><div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-600"><p className="font-black text-slate-800">Catatan</p><p className="mt-1">Penempatan rombel bersifat opsional. Jika kosong, guru masuk sebagai guru tanpa rombel dan dapat ditetapkan kemudian.</p></div></div>}
        {step === "preview" && <div className="space-y-4"><div className="flex items-center justify-between"><div><p className="text-sm font-black">Preview hasil validasi</p><p className="text-xs text-slate-500">{rows.length} baris · {validRows.length} valid · {invalidRows.length} error</p></div><button onClick={() => setStep("errors")} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700">Lihat Errors</button></div><div className="overflow-x-auto rounded-2xl border border-slate-100"><table className="w-full min-w-[850px] text-left text-xs"><thead className="bg-slate-50"><tr><th className="px-3 py-3">Row</th><th className="px-3 py-3">Nama</th><th className="px-3 py-3">Username otomatis</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Rombel</th><th className="px-3 py-3">Status Validasi</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row) => { const group = row.classGroupId ? groups.find((g) => g.id === row.classGroupId) : undefined; return <tr key={row.rowNumber}><td className="px-3 py-3 text-slate-400">{row.rowNumber}</td><td className="px-3 py-3 font-bold">{row.name || "—"}</td><td className="px-3 py-3 font-bold text-sky-700">{row.generatedUsername || "—"}</td><td className="px-3 py-3">{row.status || "active"}</td><td className="px-3 py-3">{group ? `${group.levelName} — ${group.rombelName}` : "Belum ditetapkan"}</td><td className="px-3 py-3">{row.valid ? <span className="font-black text-emerald-600">Valid</span> : <span className="font-black text-rose-600">Error</span>}</td></tr>; })}</tbody></table></div><div className="flex justify-end gap-2"><button onClick={() => setStep("upload")} className="rounded-xl px-4 py-2.5 text-xs font-black text-slate-600">Kembali</button><button disabled={!rows.length || invalidRows.length > 0} onClick={() => setStep("errors")} className="rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-black text-white disabled:opacity-40">Lanjut</button></div></div>}
        {step === "errors" && <div className="space-y-4"><div className={`rounded-2xl p-4 ${invalidRows.length ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}><p className="flex items-center gap-2 text-sm font-black">{invalidRows.length ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}{invalidRows.length ? `${invalidRows.length} baris perlu diperbaiki.` : "Tidak ada error. Semua baris siap diimport."}</p></div>{invalidRows.map((row) => <div key={row.rowNumber} className="rounded-2xl border border-rose-100 bg-white p-4"><p className="text-xs font-black">Baris {row.rowNumber} — {row.name || "Nama kosong"}</p><ul className="mt-2 list-disc pl-5 text-xs text-rose-700">{row.errors.map((message) => <li key={message}>{message}</li>)}</ul></div>)}<div className="flex justify-end gap-2"><button onClick={() => setStep("preview")} className="rounded-xl px-4 py-2.5 text-xs font-black">Kembali</button><button disabled={invalidRows.length > 0} onClick={() => setStep("commit")} className="rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-black text-white disabled:opacity-40">Siap Commit</button></div></div>}
        {step === "commit" && <div className="mx-auto max-w-xl py-10 text-center">{result > 0 ? <><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 className="h-8 w-8" /></div><h3 className="mt-4 text-xl font-black">Import guru berhasil</h3><p className="mt-2 text-sm text-slate-500">{result} guru berhasil ditambahkan ke sekolah. Simpan credential sementara ini untuk login pertama kali.</p><div className="mt-5 overflow-x-auto rounded-2xl border border-slate-100"><table className="w-full min-w-[640px] text-left text-xs"><thead className="bg-slate-50"><tr><th className="px-3 py-3">Nama</th><th className="px-3 py-3">Username</th><th className="px-3 py-3">Password sementara</th><th className="px-3 py-3">Rombel</th></tr></thead><tbody className="divide-y divide-slate-100">{credentials.map((item)=><tr key={item.teacherId}><td className="px-3 py-3 font-bold">{item.teacherName}</td><td className="px-3 py-3 font-mono">{item.username}</td><td className="px-3 py-3 font-mono font-bold text-rose-600">{item.temporaryPassword}</td><td className="px-3 py-3">{item.classGroupName ?? "Belum ditetapkan"}</td></tr>)}</tbody></table></div><button onClick={onClose} className="mt-6 rounded-xl bg-sky-600 px-5 py-3 text-xs font-black text-white">Selesai</button></> : <><h3 className="text-xl font-black">Siap melakukan commit</h3><p className="mt-2 text-sm text-slate-500">Pastikan semua baris valid sebelum data dimasukkan ke master guru.</p><button disabled={loading} onClick={() => void commit()} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-xs font-black text-white disabled:opacity-60">{loading && <Loader2 className="h-4 w-4 animate-spin" />}Commit {validRows.length} Guru</button></>}</div>}
      </div>
    </div>
  </div>;
};
