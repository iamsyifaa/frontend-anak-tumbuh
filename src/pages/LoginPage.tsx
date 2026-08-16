import React, { useCallback } from "react";
import { LogIn, ShieldCheck } from "lucide-react";
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
        // QrScanner displays the error and can restart the camera after an invalid scan.
        throw new Error("QR login failed");
      }
    },
    [clearError, loginWithQr, navigate],
  );

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#e9fbfa] p-3 sm:p-4">
      <button
        type="button"
        onClick={() => navigate("/admin/login")}
        className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white/90 px-4 py-2.5 text-sm font-extrabold text-emerald-800 shadow-sm backdrop-blur transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 sm:left-6 sm:top-6"
      >
        <LogIn className="h-4 w-4" aria-hidden="true" />
        Masuk Admin
      </button>

      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <ShieldCheck className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-2xl font-black text-emerald-800">ANAKTUMBUH.ID</h1>
          <p className="mt-1 text-sm text-slate-500">Akses Siswa</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Scan QR siswa untuk masuk ke aplikasi kebiasaanmu.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-100 bg-red-50 p-3 text-center text-sm font-semibold text-red-700"
          >
            {error}
          </div>
        )}

        <div className="mt-7 rounded-2xl border border-teal-100 bg-teal-50/60 p-4">
          <div className="text-center">
            <p className="text-sm font-extrabold text-emerald-800">Masuk dengan QR Siswa</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
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
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-teal-500 bg-white py-3.5 text-sm font-extrabold text-teal-700 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            📷 Scan QR Siswa
          </button>
        </div>

        <p className="mt-6 text-center text-[11px] leading-5 text-slate-400">
          Login username dan password tersedia melalui tombol <span className="font-bold">Masuk Admin</span> di kiri atas.
        </p>
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
