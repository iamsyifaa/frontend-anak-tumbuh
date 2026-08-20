import React, { useMemo, useState } from "react";
import { Archive, BarChart3, BookOpen, ChevronLeft, ChevronRight, FileBarChart2, GraduationCap, LayoutDashboard, LogOut, Menu, ShieldCheck, Users, X } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface NavItem { label: string; to: string; icon: React.ComponentType<{ className?: string }>; permission?: string; }

const navItems: NavItem[] = [
  { label: "Dashboard Sekolah", to: "/dashboard/kepsek", icon: LayoutDashboard },
  { label: "Sekolah & Struktur", to: "/dashboard/kepsek/schools", icon: GraduationCap, permission: "read:school_master" },
  { label: "Guru & Wali Kelas", to: "/dashboard/kepsek/teachers", icon: Users, permission: "read:teachers" },
  { label: "Siswa", to: "/dashboard/kepsek/students", icon: Users, permission: "read:students" },
  { label: "Arsip Siswa", to: "/dashboard/kepsek/students/archive", icon: Archive, permission: "read:students" },
  { label: "Akun & QR Siswa", to: "/dashboard/kepsek/student-accounts", icon: ShieldCheck, permission: "generate:student_qr" },
  { label: "7 Kebiasaan", to: "/dashboard/kepsek/habits", icon: BookOpen, permission: "read:habit_config" },
  { label: "Poin & EXP", to: "/dashboard/kepsek/points", icon: BarChart3, permission: "read:point_config" },
  { label: "Report Center", to: "/dashboard/kepsek/reports", icon: FileBarChart2, permission: "read:reports" },
  { label: "Sertifikat", to: "/dashboard/kepsek/certificates", icon: ShieldCheck, permission: "manage:certificates" },
];

export const PrincipalDashboardShell: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const items = useMemo(() => navItems.filter((item) => !item.permission || hasPermission(item.permission)), [hasPermission]);

  const handleLogout = () => { logout(); navigate("/admin/login", { replace: true }); };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {mobileOpen && <button type="button" aria-label="Tutup navigasi" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#203A5B] text-white shadow-xl transition-all duration-300 lg:z-30 lg:shadow-sm ${collapsed ? "w-[82px]" : "w-[260px]"} ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-5"><button type="button" onClick={() => navigate("/dashboard/kepsek")} className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#203A5B] text-white shadow-lg shadow-black/20"><ShieldCheck className="h-5 w-5" /></span>{!collapsed && <span className="text-lg font-black tracking-tight"><span className="text-white">anak</span><span className="text-[#D7EFFF]">tumbuh</span><span className="text-amber-400">.id</span></span>}</button><button type="button" onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-slate-300 hover:bg-white/10 lg:hidden" aria-label="Tutup"><X className="h-5 w-5" /></button></div>
        {!collapsed && <div className="mx-4 mt-5 rounded-2xl bg-[#203A5B]/15 p-4 text-white ring-1 ring-[#D7EFFF]/20"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#D7EFFF]">Workspace</p><p className="mt-1 text-sm font-extrabold">Kepala Sekolah</p><p className="mt-1 truncate text-[11px] text-slate-300">{user?.name}</p></div>}
        <nav className="mt-6 flex-1 overflow-y-auto px-3 pb-4">{!collapsed && <p className="px-3 pb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Menu utama</p>}<div className="space-y-1.5">{items.map((item) => { const Icon = item.icon; const isArchiveRoute = location.pathname.startsWith("/dashboard/kepsek/students/archive"); const active = item.to === "/dashboard/kepsek/students" && isArchiveRoute ? false : location.pathname === item.to || (item.to !== "/dashboard/kepsek" && location.pathname.startsWith(item.to)); return <NavLink key={item.to} to={item.to} onClick={() => setMobileOpen(false)} title={collapsed ? item.label : undefined} className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${active ? "bg-[#355477] text-white shadow-md shadow-black/20 ring-1 ring-white/10" : "text-slate-300 hover:bg-[#29496f] hover:text-white"} ${collapsed ? "justify-center" : ""}`}><Icon className={`h-5 w-5 shrink-0 ${active ? "text-white" : "text-slate-400 group-hover:text-[#D7EFFF]"}`} />{!collapsed && <span className="truncate">{item.label}</span>}</NavLink>; })}</div></nav>
        <div className="border-t border-white/10 p-3"><button type="button" onClick={handleLogout} title={collapsed ? "Keluar" : undefined} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200 ${collapsed ? "justify-center" : ""}`}><LogOut className="h-5 w-5" />{!collapsed && "Keluar"}</button></div>
      </aside>
      <div className={`min-h-screen transition-[padding] duration-300 ${collapsed ? "lg:pl-[82px]" : "lg:pl-[260px]"}`}>
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6"><div className="flex items-center gap-3"><button type="button" onClick={() => setMobileOpen(true)} className="rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden" aria-label="Buka navigasi"><Menu className="h-5 w-5" /></button><button type="button" onClick={() => setCollapsed((value) => !value)} className="hidden rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 lg:block" aria-label="Ciutkan sidebar">{collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}</button><div className="hidden sm:block"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#203A5B]">ANAKTUMBUH.ID</p><p className="text-sm font-extrabold text-slate-800">Kepala Sekolah</p></div></div><div className="flex items-center gap-2 sm:gap-3"><div className="hidden rounded-xl bg-slate-50 px-3 py-2 text-right sm:block"><p className="text-xs font-extrabold text-slate-800">{user?.name}</p><p className="text-[10px] text-slate-400">{user?.username}</p></div><button type="button" onClick={() => navigate("/dashboard/kepsek")} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" title="Dashboard"><LayoutDashboard className="h-5 w-5" /></button></div></header>
        <main className="min-w-0 p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
};
