import React, { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Info, Loader2, Plus, RefreshCw, Save, Settings2, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { POINT_CONFIG_PERMISSIONS, pointConfigurationService } from "../services/pointConfigurationService";
import { LevelThreshold, PointConfiguration } from "../types/pointConfiguration";

const inputClass = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-50";

export const PointConfigurationPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const canRead = !!user && (user.role === "super_admin" || hasPermission(POINT_CONFIG_PERMISSIONS.read));
  const canWrite = !!user && (user.role === "super_admin" || hasPermission(POINT_CONFIG_PERMISSIONS.write));
  const schoolId = user?.schoolId ?? "sch-101";
  const [config, setConfig] = useState<PointConfiguration | null>(null);
  const [bonus, setBonus] = useState(0);
  const [levels, setLevels] = useState<LevelThreshold[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = useCallback(async () => {
    if (!user || !canRead) { setLoading(false); return; }
    setLoading(true); setError("");
    try { const result = await pointConfigurationService.getConfiguration(user, schoolId); setConfig(result); setBonus(result.initiativeBonusPoints); setLevels(result.levelThresholds); }
    catch (err) { setError(err instanceof Error ? err.message : "Gagal memuat konfigurasi Poin/EXP."); }
    finally { setLoading(false); }
  }, [canRead, schoolId, user]);
  useEffect(() => { void load(); }, [load]);

  const saveBonus = async () => { if (!user || !canWrite) return; setSaving(true); setError(""); try { const result = await pointConfigurationService.updateInitiativeBonus(user, schoolId, bonus); setConfig(result); setNotice("Bonus inisiatif tersimpan sebagai draft."); } catch (err) { setError(err instanceof Error ? err.message : "Gagal menyimpan bonus."); } finally { setSaving(false); } };
  const saveLevels = async () => { if (!user || !canWrite) return; setSaving(true); setError(""); try { const result = await pointConfigurationService.saveLevelThresholds(user, schoolId, levels); setConfig(result); setNotice("Threshold level tersimpan sebagai draft."); } catch (err) { setError(err instanceof Error ? err.message : "Gagal menyimpan threshold."); } finally { setSaving(false); } };
  const publish = async () => { if (!user || !canWrite) return; setSaving(true); setError(""); try { const result = await pointConfigurationService.publish(user, schoolId); setConfig(result); setConfirmOpen(false); setNotice(`Konfigurasi v${result.version} berhasil dipublish.`); } catch (err) { setError(err instanceof Error ? err.message : "Gagal publish konfigurasi."); } finally { setSaving(false); } };

  const updateLevel = (index: number, key: keyof LevelThreshold, value: string) => setLevels((items) => items.map((item, i) => i === index ? { ...item, [key]: Number(value) } : item));
  const addLevel = () => setLevels((items) => [...items, { level: items.length + 1, requiredExp: (items.at(-1)?.requiredExp ?? 0) + 100 }]);
  const removeLevel = (index: number) => setLevels((items) => items.length <= 1 ? items : items.filter((_, i) => i !== index).map((item, i) => ({ ...item, level: i + 1 })));

  if (!canRead) return <div className="rounded-3xl border border-rose-100 bg-white p-10 text-center shadow-sm"><AlertCircle className="mx-auto h-10 w-10 text-rose-500" /><h1 className="mt-4 text-xl font-black text-slate-900">Akses tidak tersedia</h1><p className="mt-2 text-sm text-slate-500">Konfigurasi Poin/EXP mengikuti authorization backend dan scope sekolah.</p></div>;
  if (loading) return <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white"><Loader2 className="h-7 w-7 animate-spin text-sky-500" /><span className="ml-2 text-sm font-bold text-slate-500">Memuat konfigurasi...</span></div>;

  return <div className="min-h-full space-y-5">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-extrabold text-sky-700"><Settings2 className="h-3.5 w-3.5" /> Gamifikasi</div><h1 className="text-2xl font-black tracking-tight text-slate-900">Konfigurasi Poin & EXP</h1><p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-500">Poin dan EXP adalah dua sistem berbeda. Poin menjadi sumber ranking, sedangkan EXP menentukan Level. Frontend hanya mengatur konfigurasi dan menampilkan response backend.</p></div><div className="flex flex-wrap gap-2">{config && <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-extrabold text-slate-600">v{config.version} · {config.status === "published" ? "Published" : "Draft"}</div>}<button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-extrabold text-slate-700"><RefreshCw className="h-4 w-4" /> Refresh</button>{canWrite && <button disabled={saving} onClick={() => setConfirmOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-extrabold text-white disabled:opacity-50"><CheckCircle2 className="h-4 w-4" /> Publish</button>}</div></div>
    {error && <div className="flex gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle className="h-5 w-5 shrink-0" /><span>{error}</span></div>}
    {notice && <div className="flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-700"><CheckCircle2 className="h-5 w-5" />{notice}</div>}

    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-base font-black text-slate-900">Bonus Inisiatif</h2><p className="mt-1 text-xs leading-relaxed text-slate-500">Sadar sendiri dapat memberi bonus Poin. Disuruh tidak memberikan bonus inisiatif. Nilai akhir tetap diproses backend.</p><label className="mt-5 block text-xs font-extrabold uppercase tracking-wide text-slate-500">Bonus Poin</label><input type="number" min="0" step="1" value={bonus} disabled={!canWrite} onChange={(e) => setBonus(Number(e.target.value))} className={inputClass} /><button disabled={!canWrite || saving} onClick={() => void saveBonus()} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-white disabled:opacity-40"><Save className="h-4 w-4" /> Simpan bonus</button></section>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start gap-3"><Info className="mt-0.5 h-5 w-5 text-sky-500" /><div><h2 className="text-base font-black text-slate-900">Aturan sistem</h2><p className="mt-1 text-xs leading-relaxed text-slate-500">Ranking mengambil nilai dari transaksi Poin. Level ditentukan dari total EXP. Perubahan threshold tidak boleh mengubah histori transaksi.</p></div></div></section>
    </div>

    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-base font-black text-slate-900">Threshold Level</h2><p className="mt-1 text-xs text-slate-500">Nilai EXP meningkat bertahap. Angka final balancing dapat disesuaikan melalui konfigurasi.</p></div>{canWrite && <button onClick={addLevel} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-700"><Plus className="h-4 w-4" /> Tambah level</button>}</div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400"><th className="px-3 py-3">Level</th><th className="px-3 py-3">Minimal EXP</th><th className="px-3 py-3">Makna</th><th className="px-3 py-3" /></tr></thead><tbody>{levels.map((item, index) => <tr key={item.level} className="border-b border-slate-50"><td className="px-3 py-3 font-black">Lv. {item.level}</td><td className="px-3 py-3"><input type="number" min="0" disabled={!canWrite || index === 0} value={item.requiredExp} onChange={(e) => updateLevel(index, "requiredExp", e.target.value)} className="w-40 rounded-lg border border-slate-200 px-3 py-2" /></td><td className="px-3 py-3 text-xs text-slate-500">Backend menentukan Level dari total EXP.</td><td className="px-3 py-3 text-right">{canWrite && index > 0 && <button onClick={() => removeLevel(index)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>}</td></tr>)}</tbody></table></div><button disabled={!canWrite || saving} onClick={() => void saveLevels()} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-white disabled:opacity-40"><Save className="h-4 w-4" /> Simpan threshold</button></section>

    {confirmOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><h3 className="text-lg font-black text-slate-900">Publish konfigurasi?</h3><p className="mt-2 text-sm leading-relaxed text-slate-500">Konfigurasi akan menjadi versi aktif baru. Histori transaksi Poin/EXP tidak dihitung ulang oleh frontend.</p><div className="mt-5 flex justify-end gap-2"><button onClick={() => setConfirmOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-extrabold">Batal</button><button disabled={saving} onClick={() => void publish()} className="rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-extrabold text-white disabled:opacity-50">{saving ? "Publishing..." : "Ya, publish"}</button></div></div></div>}
  </div>;
};
