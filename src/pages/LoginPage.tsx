import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { QrScanner } from "../components/QrScanner";

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const { login, loginWithQr, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [showQrScanner, setShowQrScanner] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    try {
      await login({ username });

      // Redirect cerdas berdasarkan role input
      const lowerUser = username.toLowerCase();
      if (lowerUser === "admin")
        navigate("/dashboard/admin", { replace: true });
      else if (lowerUser === "kepsek")
        navigate("/dashboard/kepsek", { replace: true });
      else if (lowerUser === "walikelas")
        navigate("/dashboard/walikelas", { replace: true });
      else navigate("/dashboard/siswa", { replace: true });
    } catch (err) {
      // Error sudah ditangani secara otomatis di dalam AuthContext
    }
  };

  const handleQrScan = useCallback(
    async (qrToken: string) => {
      try {
        clearError();

        await loginWithQr(qrToken);

        setShowQrScanner(false);

        navigate("/dashboard/siswa", {
          replace: true,
        });
      } catch (err) {
        throw err;
      }
    },
    [clearError, loginWithQr, navigate],
  );

  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-emerald-500/10 p-3 sm:p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-8 shadow-2xl">
        {/* Header Branding */}
        <div className="text-center">
          <h1 className="text-2xl font-black text-emerald-800">
            ANAKTUMBUH.ID
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Sistem Kebiasaan Anak Indonesia Hebat
          </p>
        </div>

        {/* Notifikasi Error jika gagal */}
        {error && (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-red-50 p-3 text-xs text-red-600">
            <span>{error}</span>
            <button onClick={clearError} className="font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Form Login Kredensial */}
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Username / ID Pengguna
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: admin, kepsek, walikelas, siswa"
              className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
          >
            {isLoading ? "Memproses Akses..." : "Masuk Aplikasi"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400">
              Atau Akses Cepat
            </span>
          </div>
        </div>

        {/* Tombol Scan QR Khusus Siswa */}
        <button
          type="button"
          onClick={() => {
            clearError();
            setShowQrScanner(true);
          }}
          disabled={isLoading}
          className="w-full rounded-xl border-2 border-dashed border-teal-500 bg-teal-50/50 py-3 text-xs font-bold text-teal-700 transition-all hover:bg-teal-100/50 disabled:opacity-50"
        >
          📷 Scan QR Siswa
        </button>
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
