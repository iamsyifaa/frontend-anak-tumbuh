import React, { useEffect, useState } from "react";
import { ArrowLeft, Award, Gift, LogOut, School, Star, UserRound, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { studentProfileService } from "../services/studentProfileService";
import { StudentProfileData } from "../types/studentProfile";

const levelAsset = (level: number) => `/level/level_${level}.png`;

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
    <div className="min-h-screen bg-gradient-to-b from-white via-[#EEF6FF] to-[#A4C1FD]/35 px-4 pb-12 pt-5 text-black sm:px-6 md:px-10">
      <style>{`
        @keyframes profileLevelGlow {
          0%, 100% { opacity: .38; transform: scale(.96); }
          50% { opacity: .62; transform: scale(1.08); }
        }
      `}</style>

      <div className="mx-auto max-w-4xl space-y-6">
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

        {loading && <div className="h-96 animate-pulse rounded-3xl bg-white/80" />}
        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div>}

        {!loading && profile && (
          <>
            <section className="rounded-[2rem] bg-gradient-to-br from-sky-400 via-blue-400 to-sky-300 p-5 text-white shadow-[0_20px_50px_rgba(58,114,227,0.22)] sm:p-7">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5">
                <div className="relative h-24 w-24 shrink-0">
                  <img
                    src={user?.avatarUrl || "/avatar-placeholder.png"}
                    alt={`Foto profil ${profile.name}`}
                    className="h-full w-full rounded-full border-[4px] border-white object-cover shadow-[0_0_20px_rgba(255,255,255,0.6)]"
                  />
                  <span aria-label="Online" className="absolute bottom-0 right-0 z-10 h-5 w-5 rounded-full border-[3px] border-sky-400 bg-green-400" />
                </div>

                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <p className="hidden text-[10px] font-black uppercase tracking-[0.18em] text-white/80 sm:block">Profil Saya</p>
                  <h1 className="mt-0 truncate text-3xl font-black sm:mt-1">{profile.name}</h1>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs font-bold text-white/95 sm:justify-start">
                    <span className="inline-flex items-center gap-1"><UserRound className="h-3.5 w-3.5" />{profile.className}</span>
                    <span className="hidden h-1 w-1 rounded-full bg-white/50 sm:block" />
                    <span className="inline-flex items-center gap-1"><School className="h-3.5 w-3.5" />{profile.schoolName}</span>
                  </div>
                </div>
              </div>

              <div className="mt-7 grid w-full grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-1 sm:mt-8 sm:px-2 md:px-6">
                <ProfileStat icon={<Star />} label="Total Poin" value={profile.totalPoints.toLocaleString("id-ID")} />
                <MetricDivider />
                <ProfileStat icon={<Zap />} label="EXP" value={profile.totalExp.toLocaleString("id-ID")} />
                <MetricDivider />
                <ProfileStat icon={<Award />} label="Badge" value={`${profile.badgeCount}`} />
                <MetricDivider />
                <ProfileStat icon={<Gift />} label="Penghargaan" value={`${profile.awardCount}`} />
              </div>
            </section>

            <section className="relative overflow-hidden px-1 py-2 sm:px-2 sm:py-4">
              <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[2rem]">
                <div className="absolute left-[8%] top-[22%] h-44 w-44 rounded-full bg-sky-200/45 blur-3xl" />
                <div className="absolute right-[8%] top-[35%] h-52 w-52 rounded-full bg-blue-300/35 blur-3xl" />
                <div className="absolute left-1/2 top-[48%] h-40 w-40 -translate-x-1/2 rounded-full bg-[#A4C1FD]/35 blur-3xl" />
              </div>

              <div className="mb-6 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3A72E3]">Perjalanan Level</p>
                  <h2 className="mt-1 text-2xl font-black text-black">Level Saat Ini</h2>
                </div>
                <span className="rounded-full bg-[#EEB541]/20 px-3 py-1.5 text-[9px] font-black text-black">Semester Aktif</span>
              </div>

              <div className="relative flex flex-col items-center justify-center px-4 py-4 text-center sm:py-6">
                <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-sky-200/65 via-[#A4C1FD]/45 to-transparent blur-3xl" style={{ animation: "profileLevelGlow 3.6s ease-in-out infinite" }} />
                <img
                  src={levelAsset(profile.currentLevel)}
                  alt={`Level ${profile.currentLevel}`}
                  className="relative z-10 h-32 w-32 object-contain transition-transform duration-300 hover:scale-105 sm:h-36 sm:w-36"
                />
                <div className="relative z-10 mt-2">
                  <p className="text-3xl font-black text-slate-900">Level {profile.currentLevel}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{profile.currentLevelLabel}</p>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#3A72E3]">Badge Level Aktif</p>
                </div>
              </div>
            </section>

            <section className="relative px-1 py-2 sm:px-2 sm:py-4">
              <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute left-[10%] top-[18%] h-40 w-40 rounded-full bg-sky-200/35 blur-3xl" />
                <div className="absolute right-[12%] top-[28%] h-48 w-48 rounded-full bg-blue-300/25 blur-3xl" />
                <div className="absolute left-1/2 bottom-[10%] h-40 w-40 -translate-x-1/2 rounded-full bg-[#A4C1FD]/25 blur-3xl" />
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3A72E3]">Riwayat Level</p>
                <h2 className="mt-1 text-2xl font-black text-black">History Level per Semester</h2>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
                {profile.levelHistory.map((item) => (
                  <article key={item.id} className="relative flex min-h-[250px] flex-col items-center justify-start px-2 text-center">
                    {item.isActive && (
                      <div aria-hidden="true" className="absolute left-1/2 top-4 -z-10 h-28 w-28 -translate-x-1/2 rounded-full bg-gradient-to-br from-sky-200/80 via-[#A4C1FD]/55 to-transparent blur-3xl" style={{ animation: "profileLevelGlow 3.6s ease-in-out infinite" }} />
                    )}
                    <div className="relative flex items-center justify-center">
                      {!item.isActive && <div aria-hidden="true" className="absolute h-20 w-20 rounded-full bg-sky-100/35 blur-2xl" />}
                      <img
                        src={levelAsset(item.level)}
                        alt={`Level ${item.level}`}
                        className="relative z-0 h-32 w-32 object-contain transition-transform duration-300 hover:scale-105 sm:h-36 sm:w-36"
                      />
                    </div>
                    <p className="mt-3 text-base font-black text-slate-900">{item.levelLabel}</p>
                    <p className="mt-1 text-xs font-bold text-slate-700">{item.semesterLabel}</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-slate-600">{item.academicYearLabel}</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{item.periodLabel}</p>
                    {item.isActive && (
                      <span className="mt-2 inline-flex rounded-full bg-[#EEB541]/20 px-2.5 py-1 text-[9px] font-black text-slate-900">Semester Aktif</span>
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
  <div className="min-w-0 text-center">
    <div className="flex min-w-0 items-center justify-center gap-1 text-white/90 sm:gap-1.5">
      <span className="shrink-0 text-[#EEB541] [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:shrink-0 sm:[&>svg]:h-4 sm:[&>svg]:w-4">{icon}</span>
      <span className="whitespace-nowrap text-[8px] font-bold uppercase tracking-[0.04em] sm:text-xs sm:tracking-wider">{label}</span>
    </div>
    <p className="mt-1 text-lg font-black text-white sm:text-2xl">{value}</p>
  </div>
);

const MetricDivider = () => <div className="h-10 w-[1.5px] shrink-0 rounded-full bg-white/30" aria-hidden="true" />;

export default StudentProfilePage;
