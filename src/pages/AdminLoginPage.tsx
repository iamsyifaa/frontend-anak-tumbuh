import React, { useEffect, useState } from "react";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types/auth";

const ROLE_REDIRECTS: Record<Exclude<UserRole, "siswa">, string> = {
  super_admin: "/dashboard/admin",
  kepala_sekolah: "/dashboard/kepsek",
  wali_kelas: "/dashboard/walikelas",
};

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, isLoading, error, clearError } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user && user.role !== "siswa") {
      navigate(ROLE_REDIRECTS[user.role], { replace: true });
    }
  }, [navigate, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearError();

    try {
      await login({ username: username.trim(), password });
      // Redirect is intentionally based on the authenticated role returned by authService.
    } catch {
      // AuthContext exposes the error to the form; no sensitive auth details are shown.
    }
  };

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
  const isFromProtectedPage = Boolean(from && from !== "/login" && from !== "/admin/login");

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#e9fbfa] p-4">
      <button
        type="button"
        onClick={() => navigate("/login")}
        className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white/90 px-4 py-2.5 text-sm font-extrabold text-emerald-800 shadow-sm backdrop-blur transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke Scan QR Siswa
      </button>

      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <ShieldCheck className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-2xl font-black text-emerald-800">ANAKTUMBUH.ID</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">Login Administrasi</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Gunakan akun Super Admin, Kepala Sekolah, atau Wali Kelas.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={clearError}
              className="font-bold text-red-500 hover:text-red-700"
              aria-label="Tutup pesan error"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="admin-username"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700"
            >
              Username
            </label>
            <input
              id="admin-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                if (error) clearError();
              }}
              placeholder="Masukkan username"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              required
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700"
            >
              Password
            </label>
            <div className="relative mt-1.5">
              <LockKeyhole
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (error) clearError();
                }}
                placeholder="Masukkan password"
                className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-10 pr-12 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !username.trim() || !password}
            className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Memverifikasi..." : "Masuk ke Dashboard"}
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-xs leading-5 text-emerald-800">
          <p className="font-extrabold">Akun pengembangan</p>
          <p className="mt-1">admin / admin123 · kepsek / kepsek123 · walikelas / walikelas123</p>
        </div>

        {isFromProtectedPage && (
          <p className="mt-4 text-center text-xs text-slate-400">
            Selesaikan login untuk melanjutkan ke halaman yang membutuhkan akses.
          </p>
        )}
      </div>
    </div>
  );
};
