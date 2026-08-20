import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, FileBadge, Printer, RefreshCw, ShieldAlert, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { certificateService } from "../services/certificateService";
import { IssuedCertificate } from "../types/certificate";

const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const buildSvg = (certificate: IssuedCertificate) => `<svg xmlns="http://www.w3.org/2000/svg" width="1123" height="794" viewBox="0 0 1123 794"><rect width="1123" height="794" fill="#f8fbff"/><rect x="26" y="26" width="1071" height="742" rx="18" fill="white" stroke="#d5a62a" stroke-width="6"/><rect x="44" y="44" width="1035" height="706" rx="12" fill="none" stroke="#203a5b" stroke-width="3"/><text x="561" y="130" text-anchor="middle" font-family="Georgia,serif" font-size="28" font-weight="700" fill="#203a5b">ANAKTUMBUH.ID</text><text x="561" y="205" text-anchor="middle" font-family="Georgia,serif" font-size="52" font-weight="700" fill="#173b67">SERTIFIKAT PENGHARGAAN</text><text x="561" y="255" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="#6b7280">Diberikan kepada</text><text x="561" y="335" text-anchor="middle" font-family="Georgia,serif" font-size="46" font-weight="700" fill="#111827">${escapeXml(certificate.studentName)}</text><line x1="300" y1="355" x2="822" y2="355" stroke="#d5a62a" stroke-width="3"/><text x="561" y="410" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" fill="#374151">${escapeXml(certificate.description)}</text><text x="561" y="455" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="#6b7280">Periode ${escapeXml(certificate.periodLabel)}</text><text x="290" y="610" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="#111827">Kepala Sekolah</text><text x="833" y="610" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="#111827">Wali Kelas</text><line x1="180" y1="575" x2="400" y2="575" stroke="#6b7280"/><line x1="723" y1="575" x2="943" y2="575" stroke="#6b7280"/><text x="561" y="685" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#9ca3af">Nomor ${escapeXml(certificate.certificateNumber)}</text></svg>`;

export const WaliKelasCertificatePage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<IssuedCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<IssuedCertificate | null>(null);
  const [searchParams] = useSearchParams();
  const load = useCallback(async () => { if (!user) return; setLoading(true); setError(""); try { const ctx = await certificateService.getWaliContext(user); setItems(ctx.issued); } catch (e) { setError(e instanceof Error ? e.message : "Gagal memuat sertifikat."); } finally { setLoading(false); } }, [user]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { const id = searchParams.get("certificateId"); if (id && items.length) setPreview(items.find((item) => item.id === id) ?? null); }, [items, searchParams]);
  const download = async (certificate: IssuedCertificate) => {
    const svg = buildSvg(certificate);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    try {
      const image = new Image();
      image.decoding = "async";
      image.src = url;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = 1123;
      canvas.height = 794;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Browser tidak mendukung pembuatan PNG.");
      context.drawImage(image, 0, 0);
      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `sertifikat-${certificate.studentName.replace(/[^a-z0-9]+/gi, "-")}.png`;
      a.click();
    } finally {
      URL.revokeObjectURL(url);
    }
  };
  const print = (certificate: IssuedCertificate) => { const win = window.open("", "_blank", "noopener,noreferrer"); if (!win) return; win.document.write(buildSvg(certificate)); win.document.close(); win.focus(); win.print(); };
  if (user?.role !== "wali_kelas") return <div className="rounded-3xl bg-white p-10 text-center"><ShieldAlert className="mx-auto text-rose-500"/><h1 className="mt-3 font-black">Akses tidak tersedia</h1></div>;
  return <div className="space-y-5"><header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-black text-sky-700"><FileBadge className="h-4 w-4"/> Sertifikat Siswa</div><h1 className="mt-2 text-2xl font-black">Sertifikat Rombel</h1><p className="mt-1 text-sm text-slate-500">Unduh atau cetak sertifikat siswa untuk dibagikan dalam versi kertas.</p></div><button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-black"><RefreshCw className="h-4 w-4"/>Refresh</button></header>{error && <div className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div>}{loading ? <div className="h-40 animate-pulse rounded-3xl bg-white"/> : <div className="overflow-x-auto rounded-3xl bg-white shadow-sm ring-1 ring-slate-100"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Siswa</th><th className="px-5 py-3">Kelas / Rombel</th><th className="px-5 py-3">Sertifikat</th><th className="px-5 py-3">Periode</th><th className="px-5 py-3">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{items.map((item)=><tr key={item.id}><td className="px-5 py-3 font-black">{item.studentName}</td><td className="px-5 py-3 text-xs text-slate-500">{item.className}</td><td className="px-5 py-3 text-xs font-semibold">{item.title}</td><td className="px-5 py-3 text-xs text-slate-500">{item.periodLabel}</td><td className="px-5 py-3"><div className="flex flex-wrap gap-2"><button onClick={()=>setPreview(item)} className="inline-flex items-center gap-1 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-[10px] font-black text-violet-700">Lihat</button><button onClick={()=>download(item)} className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-3 py-2 text-[10px] font-black text-sky-700"><Download className="h-3.5 w-3.5"/>Download PNG</button><button onClick={()=>print(item)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-black"><Printer className="h-3.5 w-3.5"/>Cetak</button></div></td></tr>)}</tbody></table>{!items.length && <div className="p-10 text-center text-sm text-slate-500">Belum ada sertifikat yang diberikan kepada Wali Kelas ini.</div>}</div>}
    {preview && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"><div className="flex w-full max-w-3xl max-h-[92vh] flex-col rounded-3xl bg-white p-4 shadow-2xl sm:p-5"><div className="flex shrink-0 items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-wider text-violet-700">Preview Sertifikat</p><h2 className="mt-1 text-xl font-black text-slate-900">{preview.studentName}</h2><p className="mt-1 text-xs text-slate-500">{preview.title} · {preview.periodLabel}</p></div><button type="button" onClick={() => setPreview(null)}><X className="h-5 w-5 text-slate-400"/></button></div><div className="mt-4 flex min-h-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2 sm:p-3"><img alt={`Preview sertifikat ${preview.studentName}`} src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildSvg(preview))}`} className="block max-h-[62vh] w-auto max-w-full rounded-xl bg-white object-contain shadow-sm" /></div><div className="mt-4 flex shrink-0 flex-wrap justify-center gap-2 sm:justify-end"><button type="button" onClick={() => void download(preview)} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-black text-white"><Download className="h-4 w-4"/>Download PNG</button><button type="button" onClick={() => print(preview)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black"><Printer className="h-4 w-4"/>Cetak</button><button type="button" onClick={() => setPreview(null)} className="rounded-xl px-4 py-2.5 text-xs font-black text-slate-600">Tutup</button></div></div></div>}
</div>;
};
