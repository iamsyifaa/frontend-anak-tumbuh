import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Plus, RefreshCw, Search, UserRound, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { teacherService, TEACHER_PERMISSIONS } from "../services/teacherService";
import { schoolMasterService } from "../services/schoolMasterService";
import { Teacher, TeacherStatus } from "../types/teacher";
import { School, ClassGroup } from "../types/school";

const input = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-50";

export const TeacherManagementPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const canRead = hasPermission(TEACHER_PERMISSIONS.read);
  const canWrite = hasPermission(TEACHER_PERMISSIONS.write);
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolId, setSchoolId] = useState(user?.schoolId ?? "");
  const [groups, setGroups] = useState<ClassGroup[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    if (!user || !canRead) { setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const available = await schoolMasterService.listSchools(user);
      const selected = schoolId && available.some((s) => s.id === schoolId) ? schoolId : available[0]?.id ?? "";
      setSchools(available); setSchoolId(selected);
      if (selected) {
        const [list, classList] = await Promise.all([teacherService.list(user, selected), schoolMasterService.listClassGroups(user, selected)]);
        setTeachers(list); setGroups(classList);
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal memuat data guru."); }
    finally { setLoading(false); }
  }, [canRead, schoolId, user]);

  useEffect(() => { void load(); }, [load]);
  const filtered = useMemo(() => teachers.filter((t) => `${t.name} ${t.username}`.toLowerCase().includes(search.toLowerCase())), [teachers, search]);
  const save = async (data: { name: string; username: string; status: TeacherStatus; classGroupId?: string }) => {
    if (!user || !schoolId) return;
    try {
      if (editing) await teacherService.update(user, editing.id, { ...data, schoolId });
      else await teacherService.create(user, { ...data, schoolId });
      setOpen(false); setEditing(null); setNotice("Data guru berhasil disimpan."); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal menyimpan guru."); }
  };

  if (!canRead) return <div className="rounded-3xl bg-white p-10 text-center shadow-sm"><AlertCircle className="mx-auto text-rose-500"/><h1 className="mt-3 font-black">Akses tidak tersedia</h1></div>;
  return <div className="space-y-5">
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div><div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-[11px] font-black text-violet-700"><UserRound className="h-3.5 w-3.5"/> Master Guru</div><h1 className="mt-2 text-2xl font-black">Guru & Wali Kelas</h1><p className="mt-1 text-sm text-slate-500">Kelola akun guru dalam scope sekolah. Penetapan rombel tetap mengikuti constraint backend.</p></div>
      <div className="flex gap-2">{user?.role === "super_admin" && <select className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold" value={schoolId} onChange={(e)=>setSchoolId(e.target.value)}>{schools.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>}<button onClick={()=>void load()} className="rounded-xl border border-slate-200 bg-white p-2.5"><RefreshCw className="h-4 w-4"/></button>{canWrite && <button onClick={()=>{setEditing(null);setOpen(true)}} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-black text-white"><Plus className="h-4 w-4"/> Tambah Guru</button>}</div>
    </header>
    {error && <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700"><b>Terjadi kesalahan.</b> {error}</div>}
    {notice && <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700"><CheckCircle2 className="h-5 w-5"/>{notice}</div>}
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="mb-4 flex items-center justify-between gap-3"><div className="relative max-w-md flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm" placeholder="Cari nama atau username..." value={search} onChange={e=>setSearch(e.target.value)}/></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{filtered.length} guru</span></div>
      {loading ? <div className="h-40 animate-pulse rounded-2xl bg-slate-50"/> : <div className="overflow-x-auto rounded-2xl border border-slate-100"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Nama</th><th className="px-4 py-3">Username</th><th className="px-4 py-3">Rombel</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map(t=><tr key={t.id} className="hover:bg-slate-50"><td className="px-4 py-3 font-bold">{t.name}</td><td className="px-4 py-3 text-slate-500">{t.username}</td><td className="px-4 py-3 text-slate-500">{t.classGroupName ?? "Belum ditetapkan"}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${t.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{t.status === "active" ? "Aktif" : "Nonaktif"}</span></td><td className="px-4 py-3 text-right">{canWrite && <button onClick={()=>{setEditing(t);setOpen(true)}} className="text-xs font-black text-violet-600">Edit</button>}</td></tr>)}</tbody></table></div>}
    </section>
    {open && <TeacherDialog teacher={editing} groups={groups} onClose={()=>{setOpen(false);setEditing(null)}} onSave={save}/>} 
  </div>;
};

const TeacherDialog: React.FC<{teacher: Teacher|null;groups: ClassGroup[];onClose:()=>void;onSave:(data:{name:string;username:string;status:TeacherStatus;classGroupId?:string})=>Promise<void>}> = ({teacher,groups,onClose,onSave}) => {
  const [name,setName]=useState(teacher?.name??""); const [username,setUsername]=useState(teacher?.username??""); const [status,setStatus]=useState<TeacherStatus>(teacher?.status??"active"); const [classGroupId,setClassGroupId]=useState(teacher?.classGroupId??""); const [error,setError]=useState(""); const [saving,setSaving]=useState(false);
  const submit=async(e:React.FormEvent)=>{e.preventDefault();if(!name.trim()||!username.trim()){setError("Nama dan username wajib diisi.");return;}setSaving(true);setError("");try{await onSave({name,username,status,classGroupId:classGroupId||undefined})}catch(e){setError(e instanceof Error?e.message:"Gagal menyimpan.")}finally{setSaving(false)}};
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><form onSubmit={submit} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h2 className="text-lg font-black">{teacher?"Edit Guru":"Tambah Guru"}</h2><p className="mt-1 text-xs text-slate-500">Password tidak ditampilkan atau disimpan oleh frontend.</p></div><button type="button" onClick={onClose}><X className="text-slate-400"/></button></div>{error&&<div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-700">{error}</div>}<div className="mt-5 space-y-4"><div><label className="text-xs font-black">Nama Guru *</label><input className={input} value={name} onChange={e=>setName(e.target.value)}/></div><div><label className="text-xs font-black">Username *</label><input className={input} value={username} onChange={e=>setUsername(e.target.value)}/></div><div><label className="text-xs font-black">Rombel / Wali Kelas</label><select className={input} value={classGroupId} onChange={e=>setClassGroupId(e.target.value)}><option value="">Belum ditetapkan</option>{groups.map(g=><option key={g.id} value={g.id}>{g.levelName} — {g.rombelName}</option>)}</select></div><div><label className="text-xs font-black">Status</label><select className={input} value={status} onChange={e=>setStatus(e.target.value as TeacherStatus)}><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select></div></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-xs font-black">Batal</button><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-black text-white disabled:opacity-60">{saving&&<Loader2 className="h-4 w-4 animate-spin"/>}Simpan</button></div></form></div>;
};
