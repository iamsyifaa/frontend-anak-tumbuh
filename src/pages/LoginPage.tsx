import React, { useCallback } from "react";
import { Camera, LogIn, QrCode, ShieldCheck, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { QrScanner } from "../components/QrScanner";

export const LoginPage: React.FC = () => {
  const { loginWithQr, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [showQrScanner, setShowQrScanner] = React.useState(false);

  const handleQrScan = useCallback(
    async (qrToken: string) => {
      try {
        clearError();
        await loginWithQr(qrToken);
        setShowQrScanner(false);
        navigate("/dashboard/siswa", { replace: true });
      } catch {
        throw new Error("QR login failed");
      }
    },
    [clearError, loginWithQr, navigate],
  );

  return (
    <div className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#A4C1FD] via-white to-[#EEF5FF] px-4 py-20 sm:px-6 sm:py-24">
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#3A72E3]/20 blur-3xl animate-pulse sm:h-72 sm:w-72" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#EEB541]/25 blur-3xl animate-pulse sm:h-80 sm:w-80" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-44 w-44 -translate-x-1/2 rounded-full bg-[#3A72E3]/15 blur-[60px] animate-pulse sm:h-56 sm:w-56" />

      <button
        type="button"
        onClick={() => navigate("/admin/login")}
        className="absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/60 px-3.5 py-2.5 text-xs font-black text-[#232852] shadow-[0_8px_25px_rgba(164,193,253,0.35)] backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#3A72E3]/40 sm:left-6 sm:top-6 sm:px-4 sm:text-sm"
      >
        <LogIn className="h-4 w-4" aria-hidden="true" />
        Masuk Admin
      </button>

      <div className="relative z-10 w-full max-w-lg rounded-[2.5rem] border border-white/80 bg-white p-5 shadow-[0_24px_70px_rgba(164,193,253,0.45)] sm:p-8 md:p-9">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A4C1FD]/30 text-[#3A72E3] sm:h-14 sm:w-14">
            <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
          </div>

          <h1 className="mt-4 text-2xl font-black tracking-tight text-[#232852] sm:text-3xl">
            anaktumbuh.id
          </h1>
          <p className="mt-1 text-sm font-semibold text-[#232852]/65 sm:text-base">
            Akses Siswa
          </p>
          <p className="mx-auto mt-2 max-w-xs text-xs font-semibold leading-5 text-[#232852]/55 sm:max-w-sm sm:text-sm">
            Scan QR siswa untuk masuk ke aplikasi kebiasaanmu.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-3 text-center text-sm font-bold text-red-700"
          >
            {error}
          </div>
        )}

        <div className="relative mt-6 overflow-hidden rounded-[2rem] border border-[#A4C1FD]/60 bg-[#EEF5FF]/75 p-4 sm:mt-7 sm:p-5">
          <Sparkles
            className="pointer-events-none absolute right-4 top-4 h-5 w-5 text-[#EEB541]/70"
            aria-hidden="true"
          />
          <div className="text-center">
            <p className="text-base font-black text-[#232852] sm:text-lg">
              Masuk dengan QR Siswa
            </p>
            <p className="mt-1 text-xs font-semibold leading-5 text-[#232852]/60 sm:text-sm">
              Arahkan kamera ke QR yang diberikan sekolah.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              clearError();
              setShowQrScanner(true);
            }}
            disabled={isLoading}
            className="group mt-4 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border-b-4 border-[#232852] bg-[#3A72E3] px-4 py-3.5 text-sm font-black text-white shadow-[0_8px_0_rgba(35,40,82,0.12)] transition duration-200 hover:scale-[1.02] hover:bg-[#3269D4] active:translate-y-1 active:border-b-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-16 sm:text-base"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEB541] text-[#232852] shadow-inner sm:h-10 sm:w-10">
              <QrCode className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>Scan QR Siswa</span>
            <Camera className="h-5 w-5 opacity-90" aria-hidden="true" />
          </button>
        </div>
      </div>

      {showQrScanner && (
        <QrScanner
          onScan={handleQrScan}
          onClose={() => setShowQrScanner(false)}
        />
      )}
    </div>
  );
};
