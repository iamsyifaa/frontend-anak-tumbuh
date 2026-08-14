import React, { useState } from 'react';
import { BadgeItem, CertificateItem } from '../../types';
import { PdfModal } from './PdfModal';
import { Illustration } from '../illustrations/IllustrationAssets';
import {
  Trophy,
  Award,
  Lock,
  Sun,
  BookOpen,
  Sparkles,
  Flame,
  HeartHandshake,
  FileText,
  Calendar,
  Eye,
  CheckCircle2,
  Star
} from 'lucide-react';

interface PencapaianViewProps {
  badges: BadgeItem[];
  certificates: CertificateItem[];
}

export const PencapaianView: React.FC<PencapaianViewProps> = ({
  badges,
  certificates
}) => {
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sun':
        return Sun;
      case 'BookOpen':
        return BookOpen;
      case 'Sparkles':
        return Sparkles;
      case 'Flame':
        return Flame;
      case 'HeartHandshake':
        return HeartHandshake;
      default:
        return Trophy;
    }
  };

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner with Smiling Stars & Trophy */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 rounded-[2.5rem] p-6 md:p-8 lg:p-10 border-4 border-white shadow-2xl shadow-amber-200/80 text-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black text-slate-900 border border-white/60 shadow-xs font-heading">
            <Trophy className="w-4 h-4 text-amber-900 animate-bounce" />
            <span>Panggung Juara & Piagam Karakter</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-950 font-heading">
            Piala & Lencana Kebaikanmu! 🏆
          </h2>
          <p className="text-xs md:text-sm text-amber-950 font-bold leading-relaxed">
            Setiap kebiasaan baik yang kamu lakukan membuka lencana emas dan sertifikat resmi dari sekolah!
          </p>
        </div>

        <div className="flex items-center space-x-4 bg-white/40 backdrop-blur-md p-4 rounded-3xl border-2 border-white/80 shadow-lg relative z-10 flex-shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-white p-2 flex items-center justify-center font-bold text-sm shadow-md border-2 border-amber-300 animate-wiggle">
            <Illustration name="bintang" alt="Bintang Senyum" />
          </div>
          <div>
            <p className="text-base font-black text-slate-900 font-heading">{unlockedCount}/{badges.length} Terbuka</p>
            <p className="text-xs text-amber-950 font-bold">
              {unlockedCount} Lencana Aktif Bercahaya ⭐
            </p>
          </div>
        </div>
      </div>

      {/* GRID 1: BADGES / LENCANA */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-800 text-lg md:text-xl flex items-center gap-2 font-heading">
            <Award className="w-6 h-6 text-amber-500" />
            <span>Koleksi Lencana Emas Karakter</span>
          </h3>
          <span className="text-xs text-sky-700 bg-sky-100 font-extrabold px-3 py-1 rounded-full font-heading">
            {unlockedCount} dari {badges.length} Terbuka
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => {
            const Icon = getBadgeIcon(badge.iconName);
            const isUnlocked = badge.isUnlocked;

            return (
              <div
                key={badge.id}
                className={`rounded-[2rem] p-6 border-4 border-white transition-all duration-300 relative overflow-hidden flex flex-col justify-between shadow-xl ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-white via-amber-50/40 to-yellow-50/70 shadow-amber-100/80 hover:-translate-y-2 hover:scale-103 group ring-2 ring-amber-300/30'
                    : 'bg-slate-100/80 border-slate-200 grayscale opacity-60'
                }`}
              >
                <div>
                  {/* Badge Header & Glow */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 border-2 border-white ${
                        isUnlocked
                          ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 shadow-lg shadow-amber-300/50'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      <Icon className="w-8 h-8 animate-pulse" />
                    </div>

                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 text-xs font-black px-3 py-1 rounded-full border border-emerald-300 shadow-2xs font-heading">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> TERBUKA ⭐
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-full border border-slate-300">
                        <Lock className="w-3.5 h-3.5" /> Terkunci
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full block w-max font-heading">
                    {badge.category}
                  </span>
                  <h4 className="font-extrabold text-slate-800 text-lg mt-2 font-heading">{badge.title}</h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-semibold">{badge.description}</p>
                </div>

                {/* Badge Footer */}
                <div className="mt-5 pt-3 border-t-2 border-slate-100 flex items-center justify-between text-xs font-bold">
                  {isUnlocked ? (
                    <span className="text-[11px] text-amber-900 font-extrabold flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-600" /> Diraih: {badge.unlockedDate}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-semibold italic">
                      Syarat: {badge.progressText}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GRID 2: SERTIFIKAT PENGHARGAAN */}
      <div className="space-y-5 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-800 text-lg md:text-xl flex items-center gap-2 font-heading">
            <FileText className="w-6 h-6 text-indigo-600" />
            <span>Sertifikat & Piagam Penghargaan Resmi</span>
          </h3>
          <span className="text-xs text-indigo-700 bg-indigo-100 font-extrabold px-3 py-1 rounded-full font-heading">
            {certificates.length} Dokumen Tersedia
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-[2rem] p-6 md:p-8 border-4 border-white shadow-xl shadow-sky-100/80 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 space-y-4 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-sky-100 text-sky-800 text-xs font-black px-3 py-1 rounded-full border border-sky-200 font-heading">
                    {cert.period}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">{cert.certificateNumber}</span>
                </div>

                <h4 className="font-extrabold text-slate-800 text-lg leading-snug font-heading">{cert.title}</h4>
                <p className="text-xs text-slate-600 font-semibold leading-relaxed">{cert.description}</p>
              </div>

              <div className="pt-4 border-t-2 border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500 font-bold">
                  <span>Penerbit: </span>
                  <strong className="text-slate-800 font-black">{cert.issuerName}</strong>
                </div>

                <button
                  onClick={() => setSelectedCert(cert)}
                  className="px-5 py-2.5 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white rounded-2xl font-black text-xs shadow-md shadow-sky-200 border-2 border-white transition-all flex items-center gap-1.5 active:scale-95 font-heading"
                >
                  <Eye className="w-4 h-4" />
                  <span>Buka Piagam PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PDF View Modal */}
      <PdfModal certificate={selectedCert} onClose={() => setSelectedCert(null)} />
    </div>
  );
};

