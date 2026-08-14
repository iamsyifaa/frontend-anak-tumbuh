import React from 'react';
import { CertificateItem } from '../../types';
import { X, Download, Award, Sparkles, ShieldCheck } from 'lucide-react';

interface PdfModalProps {
  certificate: CertificateItem | null;
  onClose: () => void;
}

export const PdfModal: React.FC<PdfModalProps> = ({ certificate, onClose }) => {
  if (!certificate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[2.5rem] max-w-2xl w-full p-6 md:p-8 shadow-2xl border-4 border-white space-y-6 max-h-[90vh] overflow-y-auto animate-pop-in">
        {/* Modal Controls */}
        <div className="flex items-center justify-between border-b-2 border-sky-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base font-heading">Dokumen Sertifikat Digital</h3>
              <p className="text-[10px] text-slate-500 font-semibold">SMP ANAKTUMBUH.ID</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => alert('Mengunduh file PDF Piagam Penghargaan...')}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-all flex items-center gap-1.5 text-xs font-black font-heading shadow-md shadow-sky-200 border-2 border-white"
              title="Unduh PDF"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Unduh PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-sky-50 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Certificate Paper Document Layout */}
        <div className="border-8 border-double border-amber-300 p-8 md:p-10 bg-gradient-to-br from-amber-50/50 via-white to-sky-50/40 rounded-3xl shadow-inner text-center space-y-6 relative overflow-hidden">
          {/* Certificate Stamp Seal */}
          <div className="absolute top-4 right-4 opacity-20 pointer-events-none">
            <ShieldCheck className="w-36 h-36 text-amber-600" />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-widest text-amber-800 font-heading">
              SMP ANAKTUMBUH.ID • PROGRAM PEMBIASAAN 7 KEBIASAAN BAIK
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-2 tracking-tight font-heading">
              PIAGAM PENGHARGAAN JUARA
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-mono font-bold">{certificate.certificateNumber}</p>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs text-slate-600 font-bold">Diberikan dengan penuh apresiasi kepada:</p>
            <h3 className="text-2xl md:text-3xl font-black text-sky-700 border-b-4 border-amber-400 inline-block pb-1 font-heading">
              AHMAD RIZKY
            </h3>
            <p className="text-xs text-slate-600 font-bold">Kelas VIII-B • NISN: 008492019</p>
          </div>

          <p className="text-xs md:text-sm text-slate-700 leading-relaxed max-w-lg mx-auto font-sans italic font-semibold">
            "{certificate.description}"
          </p>

          <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-400 text-[10px] font-bold">Periode Penghargaan:</p>
              <p className="font-black text-slate-800 font-heading">{certificate.period}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold">Tanggal Terbit:</p>
              <p className="font-black text-slate-800 font-heading">{certificate.issueDate}</p>
            </div>
          </div>

          <div className="pt-4 flex justify-around items-end">
            <div className="text-center">
              <div className="w-24 h-0.5 bg-slate-400 mx-auto mb-1"></div>
              <p className="font-extrabold text-slate-800 text-xs font-heading">{certificate.issuerName}</p>
              <p className="text-[10px] text-slate-500 font-semibold">{certificate.issuerRole}</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs rounded-2xl transition-colors shadow-lg font-heading"
        >
          Tutup Piagam
        </button>
      </div>
    </div>
  );
};

