import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const DashboardShell: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Shell */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 hidden md:flex">
        <div>
          <div className="px-2 py-4">
            <h2 className="text-xl font-bold text-emerald-400">ANAKTUMBUH</h2>
            <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
              {user?.role.replace("_", " ")}
            </span>
          </div>

          <nav className="mt-6 space-y-1">
            <div className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium">
              📊 Beranda Dashboard
            </div>
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4">
          <div className="text-xs text-slate-400 mb-2">Login sebagai:</div>
          <div className="text-sm font-bold truncate">{user?.name}</div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full rounded-lg bg-red-600/20 py-2 text-xs font-bold text-red-400 hover:bg-red-600 hover:text-white transition-all"
          >
            Keluar (Logout)
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800">Application Shell</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-medium">
              Role: {user?.role}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
