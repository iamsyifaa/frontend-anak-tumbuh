import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types/auth";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  requiredPermission,
}) => {
  const { user, isLoading, hasPermission } = useAuth();
  const location = useLocation(); // Menampilkan Loading State saat sistem sedang verifikasi token

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-emerald-50">
               {" "}
        <div className="text-center">
                   {" "}
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mx-auto"></div>
                   {" "}
          <p className="mt-3 text-sm font-medium text-emerald-800">
                        Memuat sesi pengguna...          {" "}
          </p>
                 {" "}
        </div>
             {" "}
      </div>
    );
  } // 1. Jika belum login, lempar ke halaman login

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  } // 2. Jika ada pembatasan role, cek apakah role user termasuk

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  } // 3. Jika ada pembatasan permission, cek apakah user memiliki permission tersebut

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  } // Jika semua lolos, tampilkan konten anak (halaman dashboard/fitur)

  return <Outlet />;
};
