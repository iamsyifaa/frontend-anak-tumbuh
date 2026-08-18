import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types/auth";

const ROLE_REDIRECTS: Record<Exclude<UserRole, "siswa">, string> = {
  super_admin: "/dashboard/admin",
  kepala_sekolah: "/dashboard/kepsek",
  wali_kelas: "/dashboard/wali-kelas",
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

  const from = (location.state as { from?: { pathname?: string } } | null)?.from
    ?.pathname;
  const isFromProtectedPage = Boolean(
    from && from !== "/login" && from !== "/admin/login",
  );

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#A4C1FD] via-[#EAF2FF] to-white px-3 py-20 sm:px-4 sm:py-24">
      {/* Soft playful background blobs — visual only, no impact on login logic. */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#3A72E3]/20 blur-3xl animate-pulse sm:h-80 sm:w-80" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[#EEB541]/25 blur-3xl animate-pulse sm:h-96 sm:w-96" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-3xl animate-pulse sm:h-72 sm:w-72" />

      <button
        type="button"
        onClick={() => navigate("/login")}
        className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-[#A4C1FD]/70 bg-white/70 px-4 py-2.5 text-xs font-black text-[#232852] shadow-sm backdrop-blur transition-all hover:bg-white hover:text-[#3A72E3] hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#3A72E3]/15 sm:left-6 sm:top-6 sm:px-5 sm:py-3 sm:text-sm"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>Kembali ke Scan QR Siswa</span>
      </button>

      <section className="relative z-10 w-full max-w-md rounded-[2.5rem] border border-white/80 bg-white p-5 shadow-[0_24px_60px_rgba(164,193,253,0.42)] sm:p-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A4C1FD]/30 text-[#3A72E3] shadow-sm sm:h-16 sm:w-16">
            <ShieldCheck className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true" />
          </div>

          <h1 className="mt-4 text-2xl font-black tracking-tight text-[#232852] sm:text-3xl">
            ANAKTUMBUH.ID
          </h1>
          <p className="mt-1 text-sm font-bold text-[#232852]/75 sm:text-base">
            Login Administrasi
          </p>
          <p className="mx-auto mt-2 max-w-sm text-xs font-semibold leading-5 text-[#232852]/55 sm:text-sm">
            Gunakan akun Super Admin, Kepala Sekolah, atau Wali Kelas.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start justify-between gap-3 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-700"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={clearError}
              className="rounded-lg px-2 font-black text-red-500 transition hover:bg-red-100 hover:text-red-700"
              aria-label="Tutup pesan error"
            >
              ×
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 sm:mt-7 sm:space-y-5"
        >
          <div>
            <label
              htmlFor="admin-username"
              className="block text-xs font-black uppercase tracking-wider text-[#232852]"
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
              className="mt-2 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-[#232852] outline-none transition-all placeholder:text-slate-400 focus:border-[#3A72E3] focus:ring-4 focus:ring-[#3A72E3]/20 sm:py-4"
              required
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-black uppercase tracking-wider text-[#232852]"
            >
              Password
            </label>
            <div className="relative mt-2">
              <LockKeyhole
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 sm:h-5 sm:w-5"
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
                className="w-full rounded-2xl border-2 border-slate-200 bg-white py-3.5 pl-11 pr-12 text-sm font-semibold text-[#232852] outline-none transition-all placeholder:text-slate-400 focus:border-[#3A72E3] focus:ring-4 focus:ring-[#3A72E3]/20 sm:py-4"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 transition hover:bg-[#A4C1FD]/15 hover:text-[#3A72E3] focus:outline-none focus:ring-2 focus:ring-[#3A72E3]/20"
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !username.trim() || !password}
            className="group w-full rounded-2xl border-b-4 border-[#232852] bg-[#3A72E3] py-3.5 text-sm font-black text-white shadow-lg shadow-[#3A72E3]/40 transition-all hover:scale-[1.02] hover:bg-[#3268D5] active:scale-95 active:translate-y-1 active:border-b-0 active:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:py-4 sm:text-base"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <span>
                {isLoading ? "Memverifikasi..." : "Masuk ke Dashboard"}
              </span>
              {!isLoading && (
                <Sparkles
                  className="h-4 w-4 transition-transform group-hover:rotate-12"
                  aria-hidden="true"
                />
              )}
            </span>
          </button>
        </form>

        {isFromProtectedPage && (
          <p className="mt-4 text-center text-xs font-semibold leading-5 text-[#232852]/50">
            Selesaikan login untuk melanjutkan ke halaman yang membutuhkan
            akses.
          </p>
        )}
      </section>
    </main>
  );
};
