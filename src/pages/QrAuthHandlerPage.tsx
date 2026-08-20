import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const QrAuthHandlerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { loginWithQr, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [missingToken, setMissingToken] = useState(false);

  useEffect(() => {
    if (!token) {
      setMissingToken(true);
      return;
    }

    let isActive = true;

    const handleQrLogin = async () => {
      try {
        clearError();
        await loginWithQr(token);
        if (isActive) {
          navigate("/dashboard/siswa", { replace: true });
        }
      } catch {
        // Ditangani lewat error state dari AuthContext
      }
    };

    handleQrLogin();

    return () => {
      isActive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const displayError = missingToken
    ? "Kode QR tidak lengkap atau rusak."
    : error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-teal-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl text-center">
        {!displayError ? (
          <>
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
            <h2 className="mt-4 text-lg font-bold text-gray-800">
              Memvalidasi Akses QR...
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Satu Scan untuk Masuk Layanan
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold text-xl">
              ✕
            </div>
            <h2 className="mt-3 text-lg font-bold text-red-600">
              Autentikasi Gagal
            </h2>
            <p className="mt-1 text-sm text-gray-600">{displayError}</p>
            <button
              onClick={() => navigate("/login")}
              className="mt-5 w-full rounded-xl bg-teal-600 py-2.5 text-white font-semibold hover:bg-teal-700"
            >
              Kembali ke Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};
