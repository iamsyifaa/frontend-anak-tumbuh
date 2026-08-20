import React, { useEffect, useState } from "react";
import { ArrowLeft, GraduationCap, LogOut, School, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { studentProfileService } from "../services/studentProfileService";
import { StudentProfileData } from "../types/studentProfile";

export const StudentProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    void studentProfileService.getProfile(user)
      .then(setProfile)
      .catch((err) => setError(err instanceof Error ? err.message : "Profil siswa belum dapat dimuat."))
      .finally(() => setLoading(false));
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f4f7fc] px-4 py-5 sm:px-6 md:px-10">
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => navigate("/dashboard/siswa")} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </button>
          <div className="rounded-full bg-sky-50 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-sky-700">Profil Siswa</div>
        </div>

        {loading && <div className="h-80 animate-pulse rounded-[2rem] bg-white" />}
        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div>}

        {!loading && profile && (
          <>
            <section className="rounded-[2rem] bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 p-6 text-white shadow-xl shadow-sky-200/60 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-sky-100">Profil Saya</p>
                  <h1 className="mt-2 truncate text-3xl font-black">{profile.name}</h1>
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                    <Info icon={<UserRound className="h-4 w-4" />} label="Kelas" value={profile.className} />
                    <Info icon={<School className="h-4 w-4" />} label="Sekolah" value={profile.schoolName} />
                    <Info icon={<GraduationCap className="h-4 w-4" />} label="Level" value={profile.currentLevelLabel} />
                  </div>
                </div>
                <div className="grid h-24 w-24 shrink-0 place-items-center rounded-3xl bg-white/20 ring-2 ring-white/30 backdrop-blur"><div className="text-center"><p className="text-[10px] font-black uppercase tracking-widest text-sky-100">Saat ini</p><p className="mt-1 text-4xl font-black">{profile.currentLevel}</p></div></div>
              </div>
            </section>

            <section className="rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-100 sm:p-7">
              <div><p className="text-[11px] font-black uppercase tracking-[0.16em] text-sky-600">Perjalanan Level</p><h2 className="mt-1 text-xl font-black text-slate-800">History Level per Semester</h2><p className="mt-1 text-xs font-semibold text-slate-500">Setiap semester mempunyai periode level sendiri. Histori semester sebelumnya tetap tersimpan.</p></div>
              <div className="mt-5 space-y-3">
                {profile.levelHistory.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-black ${index === 0 ? "bg-sky-500 text-white" : "bg-white text-sky-700 ring-1 ring-slate-200"}`}>{item.level}</div>
                    <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-black text-slate-800">{item.semesterLabel}</p>{index === 0 && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-700">Semester aktif</span>}</div><p className="mt-1 text-xs font-semibold text-slate-500">{item.academicYearLabel} · {item.periodLabel}</p></div>
                    <p className="shrink-0 text-sm font-black text-slate-700">{item.levelLabel}</p>
                  </div>
                ))}
              </div>
            </section>

            <button type="button" onClick={handleLogout} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-50 px-4 py-3.5 text-sm font-black text-rose-700 ring-1 ring-rose-100 hover:bg-rose-100">
              <LogOut className="h-5 w-5" /> Keluar dari Akun
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const Info: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="rounded-2xl bg-white/10 px-3 py-3 ring-1 ring-white/15 backdrop-blur">
    <div className="flex items-center gap-2 text-sky-100">{icon}<span className="text-[10px] font-black uppercase tracking-wider">{label}</span></div>
    <p className="mt-1 truncate font-extrabold text-white">{value}</p>
  </div>
);

export default StudentProfilePage;
