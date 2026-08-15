import React from "react";
import { ShieldX } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
        <ShieldX className="mx-auto h-12 w-12 text-rose-500" />
        <h1 className="mt-4 text-xl font-black text-slate-900">Akses ditolak</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">Akun kamu tidak memiliki permission atau scope untuk halaman ini.</p>
        <button onClick={() => navigate(-1)} className="mt-6 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-slate-800">Kembali</button>
      </div>
    </div>
  );
};
