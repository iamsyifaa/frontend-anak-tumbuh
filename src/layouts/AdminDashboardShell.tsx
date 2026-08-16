import React, { useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileBarChart2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/dashboard/admin", icon: LayoutDashboard, roles: ["super_admin"] },
  { label: "Dashboard Sekolah", to: "/dashboard/kepsek", icon: LayoutDashboard, roles: ["kepala_sekolah"] },
  { label: "Monitoring Rombel", to: "/dashboard/walikelas", icon: ClipboardList, roles: ["wali_kelas"] },
  { label: "Sekolah & Master Data", to: "/dashboard/admin/schools", icon: GraduationCap, permission: "read:school_master", roles: ["super_admin", "kepala_sekolah"] },
  { label: "Guru & Wali Kelas", to: "/dashboard/admin/teachers", icon: Users, permission: "read:teachers", roles: ["super_admin", "kepala_sekolah"] },
  { label: "Siswa", to: "/dashboard/admin/students", icon: Users, permission: "read:students", roles: ["super_admin", "kepala_sekolah"] },
  { label: "Akun & QR Siswa", to: "/dashboard/admin/student-accounts", icon: ShieldCheck, permission: "generate:student_qr", roles: ["super_admin", "kepala_sekolah"] },
  { label: "7 Kebiasaan", to: "/dashboard/admin/habits", icon: BookOpen, permission: "read:habit_config", roles: ["super_admin", "kepala_sekolah"] },
  { label: "Poin & EXP", to: "/dashboard/admin/points", icon: BarChart3, permission: "read:point_config", roles: ["super_admin", "kepala_sekolah"] },
  { label: "Report Center", to: "/dashboard/reports", icon: FileBarChart2, permission: "read:reports", roles: ["super_admin", "kepala_sekolah", "wali_kelas"] },
];

export const AdminDashboardShell: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const items = useMemo(() => navItems.filter((item) => {
    const roleAllowed = !item.roles || (!!user && item.roles.includes(user.role));
    return roleAllowed && (!item.permission || hasPermission(item.permission));
  }), [hasPermission, user]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  const roleLabel = user?.role === "super_admin"
    ? "Super Admin"
    : user?.role === "kepala_sekolah"
      ? "Kepala Sekolah"
      : "Wali Kelas";

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-[#f5f3f8] text-slate-800">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup navigasi"
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white shadow-xl transition-all duration-300 lg:z-30 lg:shadow-sm ${
          collapsed ? "w-[82px]" : "w-[260px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-slate-100 px-5">
          <button type="button" onClick={() => navigate(user?.role === "super_admin" ? "/dashboard/admin" : user?.role === "kepala_sekolah" ? "/dashboard/kepsek" : "/dashboard/walikelas")} className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-200">
              <ShieldCheck className="h-5 w-5" />
            </span>
            {!collapsed && <span className="text-lg font-black tracking-tight"><span className="text-violet-600">anak</span>tumbuh<span className="text-fuchsia-500">.id</span></span>}
          </button>
          <button type="button" onClick={closeMobile} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 lg:hidden" aria-label="Tutup"><X className="h-5 w-5" /></button>
        </div>

        {!collapsed && (
          <div className="mx-4 mt-5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 p-4 text-white shadow-lg shadow-violet-100">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/75">Workspace</p>
            <p className="mt-1 text-sm font-extrabold">{roleLabel}</p>
            <p className="mt-1 truncate text-[11px] text-white/75">{user?.name}</p>
          </div>
        )}

        <nav className="mt-6 flex-1 overflow-y-auto px-3 pb-4">
          {!collapsed && <p className="px-3 pb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Menu utama</p>}
          <div className="space-y-1.5">
            {items.map((item) => {
              const Icon = item.icon;
              const itemPath = user?.role === "kepala_sekolah" ? item.to.replace("/dashboard/admin", "/dashboard/kepsek") : item.to;
              const active = location.pathname === itemPath || (itemPath !== "/dashboard/admin" && location.pathname.startsWith(itemPath));
              return (
                <NavLink
                  key={item.to}
                  to={user?.role === "kepala_sekolah" ? item.to.replace("/dashboard/admin", "/dashboard/kepsek") : item.to}
                  onClick={closeMobile}
                  title={collapsed ? item.label : undefined}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
                    active ? "bg-violet-50 text-violet-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${active ? "text-violet-600" : "text-slate-400 group-hover:text-violet-500"}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-slate-100 p-3">
          <button type="button" onClick={handleLogout} title={collapsed ? "Keluar" : undefined} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50 ${collapsed ? "justify-center" : ""}`}>
            <LogOut className="h-5 w-5" />
            {!collapsed && "Keluar"}
          </button>
        </div>
      </aside>

      <div className={`min-h-screen transition-[padding] duration-300 ${collapsed ? "lg:pl-[82px]" : "lg:pl-[260px]"}`}>
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-100 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMobileOpen(true)} className="rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden" aria-label="Buka navigasi"><Menu className="h-5 w-5" /></button>
            <button type="button" onClick={() => setCollapsed((value) => !value)} className="hidden rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 lg:block" aria-label="Ciutkan sidebar">
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
            <div className="hidden sm:block">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-500">ANAKTUMBUH.ID</p>
              <p className="text-sm font-extrabold text-slate-800">{roleLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden rounded-xl bg-slate-50 px-3 py-2 text-right sm:block">
              <p className="text-xs font-extrabold text-slate-800">{user?.name}</p>
              <p className="text-[10px] text-slate-400">{user?.username}</p>
            </div>
            <button type="button" onClick={() => setMobileOpen(true)} className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-700 font-black lg:hidden" aria-label="Profil">{user?.name?.slice(0, 1) ?? "A"}</button>
            <button type="button" onClick={() => navigate("/dashboard/reports")} className="hidden rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 sm:block" title="Report Center"><FileBarChart2 className="h-5 w-5" /></button>
            <button type="button" onClick={() => navigate(user?.role === "super_admin" ? "/dashboard/admin" : user?.role === "kepala_sekolah" ? "/dashboard/kepsek" : "/dashboard/walikelas")} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" title="Beranda"><LayoutDashboard className="h-5 w-5" /></button>
          </div>
        </header>

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
