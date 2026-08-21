import React, { useEffect, useState } from "react";
import { ArrowLeft, Award, Gift, Hexagon, LogOut, School, Star, Trophy, UserRound, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { studentProfileService } from "../services/studentProfileService";
import { StudentProfileData } from "../types/studentProfile";
import { AvatarBadge } from "../components/AvatarBadge";

export const StudentProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError("");
    void studentProfileService
      .getProfile(user)
      .then(setProfile)
      .catch((err) => setError(err instanceof Error ? err.message : "Profil siswa belum dapat dimuat."))
      .finally(() => setLoading(false));
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#A4C1FD]/20 px-4 pb-12 pt-5 text-black sm:px-6 md:px-10">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard/siswa")}
            className="inline-flex items-center gap-2 rounded-full border border-[#A4C1FD]/40 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm transition hover:border-[#3A72E3]/40 hover:text-[#3A72E3]"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
          </button>
          <span className="rounded-full bg-[#A4C1FD]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#3A72E3]">
            Profil Siswa
          </span>
        </div>

        {loading && <div className="h-96 animate-pulse rounded-3xl bg-white shadow-sm" />}
        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div>}

        {!loading && profile && (
          <>
            <section className="rounded-3xl bg-[#3A72E3] p-5 text-white shadow-[0_20px_50px_rgba(58,114,227,0.22)] sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <AvatarBadge name={profile.name} avatarUrl={user?.avatarUrl} size="xl" showOnlineStatus />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/70">Profil Saya</p>
                  <h1 className="mt-1 truncate text-3xl font-black">{profile.name}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-white/90">
                    <span className="inline-flex items-center gap-1"><UserRound className="h-3.5 w-3.5" />{profile.className}</span>
                    <span className="h-1 w-1 rounded-full bg-white/50" />
                    <span className="inline-flex items-center gap-1"><School className="h-3.5 w-3.5" />{profile.schoolName}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-4">
                <ProfileStat icon={<Star />} label="Total Poin" value={profile.totalPoints.toLocaleString("id-ID")} />
                <ProfileStat icon={<Zap />} label="EXP" value={profile.totalExp.toLocaleString("id-ID")} />
                <ProfileStat icon={<Award />} label="Badge" value={`${profile.badgeCount}`} />
                <ProfileStat icon={<Gift />} label="Penghargaan" value={`${profile.awardCount}`} />
              </div>
            </section>

            <section className="rounded-[2rem] border border-[#A4C1FD]/30 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3A72E3]">Perjalanan Level</p>
                  <h2 className="mt-1 text-2xl font-black text-black">Level Saat Ini</h2>
                </div>
                <span className="rounded-full bg-[#EEB541]/20 px-3 py-1.5 text-[9px] font-black text-black">Semester Aktif</span>
              </div>

              <div className="flex items-center gap-4 rounded-2xl bg-[#A4C1FD]/10 p-4">
                <div className="relative grid h-20 w-20 shrink-0 place-items-center">
                  <Hexagon className="absolute inset-0 h-20 w-20 fill-[#3A72E3] text-[#3A72E3] drop-shadow-sm" strokeWidth={1.5} />
                  <Trophy className="relative h-7 w-7 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-3xl font-black text-black">Level {profile.currentLevel}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{profile.currentLevelLabel}</p>
                </div>
              </div>
            </section>

            <section>
              <div className="mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3A72E3]">Riwayat Level</p>
                <h2 className="mt-1 text-2xl font-black text-black">History Level per Semester</h2>
              </div>

              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                {profile.levelHistory.map((item) => (
                  <article key={item.id} className={`rounded-2xl border bg-white p-3 text-center shadow-sm ${item.isActive ? "border-[#EEB541]" : "border-[#A4C1FD]/30"}`}>
                    <div className="relative mx-auto grid h-20 w-20 place-items-center">
                      <Hexagon className="absolute inset-0 h-20 w-20 fill-[#3A72E3] text-[#3A72E3] drop-shadow-sm" strokeWidth={1.5} />
                      <span className="relative text-xl font-black text-white">{item.level}</span>
                    </div>
                    <p className="mt-3 text-sm font-black text-black">{item.levelLabel}</p>
                    <p className="mt-1 text-[10px] font-bold text-slate-500">{item.semesterLabel}</p>
                    <p className="mt-0.5 text-[10px] font-semibold text-slate-400">{item.academicYearLabel}</p>
                    <p className="mt-0.5 text-[10px] font-semibold text-slate-400">{item.periodLabel}</p>
                    {item.isActive && (
                      <span className="mt-2 inline-flex rounded-full bg-[#EEB541]/20 px-2 py-1 text-[9px] font-black text-black">Semester Aktif</span>
                    )}
                  </article>
                ))}
              </div>
            </section>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 text-sm font-black text-slate-700 shadow-sm ring-1 ring-[#A4C1FD]/40 transition hover:bg-[#A4C1FD]/10"
            >
              <LogOut className="h-5 w-5" /> Keluar Kembali ke Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const ProfileStat: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="rounded-2xl bg-white px-3 py-3 shadow-sm">
    <div className="flex items-center justify-center gap-1 text-[#EEB541]">
      {icon}
      <span className="text-[9px] font-black uppercase tracking-wide text-slate-500">{label}</span>
    </div>
    <p className="mt-1 text-center text-lg font-black text-black">{value}</p>
  </div>
);

export default StudentProfilePage;
