import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileBarChart2,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  FileBadge,
  X,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const WaliKelasDashboardShell: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const items = [
    {
      label: "Monitoring Rombel",
      to: "/dashboard/walikelas",
      icon: ClipboardList,
    },
    ...(hasPermission("read:reports")
      ? [
          {
            label: "Report Center",
            to: "/dashboard/walikelas/reports",
            icon: FileBarChart2,
          },
        ]
      : []),
    ...(hasPermission("read:certificates")
      ? [
          {
            label: "Sertifikat Siswa",
            to: "/dashboard/walikelas/certificates",
            icon: FileBadge,
          },
        ]
      : []),
  ];

  const closeMobile = () => setMobileOpen(false);
  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f5f9fc] text-slate-800">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup navigasi"
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#203A5B] shadow-xl transition-all duration-300 lg:z-30 lg:shadow-sm ${
          collapsed ? "w-[82px]" : "w-[260px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-5">
          <button
            type="button"
            onClick={() => navigate("/dashboard/walikelas")}
            className="flex items-center gap-3"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#D7EFFF] text-[#203A5B] shadow-lg shadow-black/20">
              <ShieldCheck className="h-5 w-5" />
            </span>
            {!collapsed && (
              <span className="text-lg font-black tracking-tight">
                <span className="text-white">anak</span>
                <span className="text-[#D7EFFF]">tumbuh</span>
                <span className="text-amber-400">.id</span>
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={closeMobile}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 lg:hidden"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!collapsed && (
          <div className="mx-4 mt-5 rounded-2xl bg-[#203A5B] p-4 text-white shadow-lg shadow-black/20 ring-1 ring-white/10">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">
              Workspace
            </p>
            <p className="mt-1 text-sm font-extrabold">Wali Kelas</p>
            <p className="mt-1 truncate text-[11px] text-white/70">
              {user?.name}
            </p>
          </div>
        )}

        <nav className="mt-6 flex-1 overflow-y-auto px-3 pb-4">
          {!collapsed && (
            <p className="px-3 pb-3 text-[10px] font-black uppercase tracking-[0.16em] text-white/60">
              Menu utama
            </p>
          )}
          <div className="space-y-1.5">
            {items.map((item) => {
              const Icon = item.icon;
              const active =
                location.pathname === item.to ||
                (item.to !== "/dashboard/walikelas" &&
                  location.pathname.startsWith(item.to));
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeMobile}
                  title={collapsed ? item.label : undefined}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
                    active
                      ? "bg-white text-[#203A5B] shadow-sm"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${active ? "text-[#203A5B]" : "text-white/60 group-hover:text-white"}`}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? "Keluar" : undefined}
            className={`flex w-full items-center gap-3 rounded-xl bg-[#203A5B] px-3 py-3 text-sm font-bold text-white transition hover:bg-[#29496f] ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && "Keluar"}
          </button>
        </div>
      </aside>

      <div
        className={`min-h-screen transition-[padding] duration-300 ${collapsed ? "lg:pl-[82px]" : "lg:pl-[260px]"}`}
      >
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-[#203A5B]/10 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden"
              aria-label="Buka navigasi"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="hidden rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 lg:block"
              aria-label="Ciutkan sidebar"
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
            <div className="hidden sm:block">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#203A5B]">
                anaktumbuh.id
              </p>
              <p className="text-sm font-extrabold text-slate-800">
                Wali Kelas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden rounded-xl bg-slate-50 px-3 py-2 text-right sm:block">
              <p className="text-xs font-extrabold text-slate-800">
                {user?.name}
              </p>
              <p className="text-[10px] text-slate-400">{user?.username}</p>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full bg-[#203A5B] text-white font-black lg:hidden"
              aria-label="Profil"
            >
              {user?.name?.slice(0, 1) ?? "W"}
            </button>
            {hasPermission("read:reports") && (
              <button
                type="button"
                onClick={() => navigate("/dashboard/walikelas/reports")}
                className="hidden rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 sm:block"
                title="Report Center"
              >
                <FileBarChart2 className="h-5 w-5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate("/dashboard/walikelas")}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              title="Monitoring Rombel"
            >
              <LayoutDashboard className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="min-h-[calc(100vh-72px)] min-w-0 bg-[#f5f9fc] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
