import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Award, ArrowLeft, Download, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { gamificationService } from "../services/gamificationService";
import { CertificateItem } from "../types";

export const StudentCertificatePage: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [certificate, setCertificate] = useState<CertificateItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    void gamificationService.getOverview(user.id).then((overview) => {
      setCertificate(overview.certificates.find((item) => item.id === certificateId) ?? null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user, certificateId]);

  if (loading) return <div className="min-h-screen bg-slate-100 flex items-center justify-center p-5"><div className="bg-white rounded-3xl p-8 shadow-xl font-black text-slate-700">Memuat sertifikat...</div></div>;
  if (!certificate) return <div className="min-h-screen bg-slate-100 flex items-center justify-center p-5"><div className="bg-white rounded-3xl p-8 shadow-xl text-center"><h1 className="text-xl font-black text-slate-800">Sertifikat tidak ditemukan</h1><button onClick={() => navigate("/dashboard/siswa")} className="mt-5 rounded-xl bg-sky-500 text-white px-4 py-2.5 font-black text-sm">Kembali</button></div></div>;

  return <main className="min-h-screen bg-slate-100 p-3 sm:p-6 md:p-10">
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs sm:text-sm font-black text-slate-700 shadow-sm hover:bg-sky-50"><ArrowLeft className="w-4 h-4" /> Kembali</button>
        <button onClick={() => alert("Mengunduh file PDF Piagam Penghargaan...")} className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-3 py-2 text-xs sm:text-sm font-black text-white shadow-md hover:bg-sky-600"><Download className="w-4 h-4" /> Unduh PDF</button>
      </div>

      <section className="bg-white rounded-[2rem] p-3 sm:p-6 md:p-10 shadow-2xl">
        <div className="border-8 border-double border-amber-300 p-6 sm:p-10 md:p-14 bg-gradient-to-br from-amber-50/50 via-white to-sky-50/40 rounded-3xl shadow-inner text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-4 right-4 opacity-15 pointer-events-none"><ShieldCheck className="w-28 sm:w-36 h-28 sm:h-36 text-amber-600" /></div>
          <div>
            <div className="mx-auto w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3"><Award className="w-7 h-7" /></div>
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-800">SMP ANAKTUMBUH.ID • PROGRAM PEMBIASAAN 7 KEBIASAAN BAIK</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mt-2 tracking-tight">PIAGAM PENGHARGAAN JUARA</h1>
            <p className="text-xs text-slate-500 mt-1 font-mono font-bold">{certificate.certificateNumber}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs text-slate-600 font-bold">Diberikan dengan penuh apresiasi kepada:</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-sky-700 border-b-4 border-amber-400 inline-block pb-1">{user?.name ?? "Siswa"}</h2>
            <p className="text-xs text-slate-600 font-bold">Kelas {user?.classId ?? "-"}</p>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-2xl mx-auto italic font-semibold">"{certificate.description}"</p>
          <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-2 gap-4 text-xs">
            <div><p className="text-slate-400 text-[10px] font-bold">Periode Penghargaan:</p><p className="font-black text-slate-800">{certificate.period}</p></div>
            <div><p className="text-slate-400 text-[10px] font-bold">Tanggal Terbit:</p><p className="font-black text-slate-800">{certificate.issueDate}</p></div>
          </div>
          <div className="pt-4 flex justify-center"><div className="text-center"><div className="w-24 h-0.5 bg-slate-400 mx-auto mb-1" /><p className="font-extrabold text-slate-800 text-xs">{certificate.issuerName}</p><p className="text-[10px] text-slate-500 font-semibold">{certificate.issuerRole}</p></div></div>
        </div>
      </section>
    </div>
  </main>;
};
