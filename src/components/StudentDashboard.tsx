import React, { useEffect, useState } from "react";
import { TabType } from "../types";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BerandaView } from "./views/BerandaView";
import { IsiKebiasaanView } from "./views/IsiKebiasaanView";
import { PencapaianView } from "./views/PencapaianView";
import { RankingView } from "./views/RankingView";
import { useAuth } from "../context/AuthContext";
import { gamificationService } from "../services/gamificationService";
import { GamificationOverview } from "../types/gamification";
import { StudentDashboardAggregate as StudentDashboardAggregateView } from "./dashboard/StudentDashboardAggregate";
import { studentDashboardService } from "../services/studentDashboardService";
import { StudentDashboardAggregate as StudentDashboardAggregateType } from "../types/studentDashboard";

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [gamificationLoading, setGamificationLoading] = useState(true);
  const [gamificationOverview, setGamificationOverview] = useState<GamificationOverview | null>(null);
  const [gamificationError, setGamificationError] = useState<string | null>(null);
  const [dashboardAggregate, setDashboardAggregate] = useState<StudentDashboardAggregateType | null>(null);
  const [dashboardAggregateLoading, setDashboardAggregateLoading] = useState(true);
  const [dashboardAggregateError, setDashboardAggregateError] = useState<string | null>(null);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [remainingChances, setRemainingChances] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>("beranda");
  const [achievementSection, setAchievementSection] = useState<"badges" | "awards" | "certificates" | undefined>(undefined);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "siswa") {
      setGamificationLoading(false);
      setDashboardAggregateLoading(false);
      return;
    }

    setGamificationLoading(true);
    setGamificationError(null);
    setDashboardAggregateLoading(true);
    setDashboardAggregateError(null);

    void studentDashboardService.getAggregate(user)
      .then((aggregate) => {
        setDashboardAggregate(aggregate);
        setCurrentPoints(aggregate.summary.points);
        setCurrentStreak(aggregate.streak.current);
        setRemainingChances(aggregate.streak.remainingChances);
      })
      .catch(() => {
        setDashboardAggregate(null);
        setDashboardAggregateError("Data dashboard siswa belum dapat dimuat. Coba lagi.");
      })
      .finally(() => setDashboardAggregateLoading(false));

    void gamificationService.getOverview(user.id)
      .then((overview) => {
        setGamificationOverview(overview);
        setCurrentStreak(overview.streak.current);
        setRemainingChances(overview.streak.remainingChances);
      })
      .catch(() => {
        setGamificationOverview(null);
        setGamificationError("Data gamifikasi belum dapat dimuat. Coba lagi.");
      })
      .finally(() => setGamificationLoading(false));
  }, [user]);

  useEffect(() => {
    if (activeTab === "ranking" && !gamificationOverview?.features.rankingEnabled) {
      setActiveTab("beranda");
    }
  }, [activeTab, gamificationOverview]);

  const reloadDashboardAggregate = () => {
    if (!user || user.role !== "siswa") return;
    setDashboardAggregateLoading(true);
    setDashboardAggregateError(null);
    void studentDashboardService.getAggregate(user)
      .then((aggregate) => {
        setDashboardAggregate(aggregate);
        setCurrentPoints(aggregate.summary.points);
        setCurrentStreak(aggregate.streak.current);
        setRemainingChances(aggregate.streak.remainingChances);
      })
      .catch(() => setDashboardAggregateError("Data dashboard siswa belum dapat dimuat. Coba lagi."))
      .finally(() => setDashboardAggregateLoading(false));
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f4f7fc] text-slate-900 flex font-sans antialiased selection:bg-sky-200">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentPoints={currentPoints}
        currentStreak={currentStreak}
        remainingChances={remainingChances}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        rankingEnabled={Boolean(gamificationOverview?.features.rankingEnabled)}
      />

      <div className="flex-1 md:pl-72 flex flex-col min-w-0 min-h-screen transition-all duration-300">
        {activeTab === "beranda" && (
          <Header
            activeTab={activeTab}
            currentStreak={currentStreak}
            remainingChances={remainingChances}
            currentPoints={currentPoints}
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
          />
        )}

        <main className="flex-1 w-full max-w-7xl mx-auto px-3 py-3 pt-1 sm:px-4 sm:py-5 md:px-8 md:py-8">
          {activeTab === "beranda" && (
            <div className="space-y-7">
              <BerandaView onTabChange={setActiveTab} />
              <StudentDashboardAggregateView
                data={dashboardAggregate}
                loading={dashboardAggregateLoading}
                error={dashboardAggregateError}
                onRetry={reloadDashboardAggregate}
                onOpenRanking={() => setActiveTab("ranking")}
                onOpenAchievements={(section) => { setAchievementSection(section); setActiveTab("pencapaian"); }}
              />
            </div>
          )}

          {activeTab === "kebiasaan" && <IsiKebiasaanView />}

          {activeTab === "pencapaian" && (
            gamificationLoading ? (
              <GamificationLoading />
            ) : gamificationError ? (
              <GamificationError message={gamificationError} />
            ) : gamificationOverview ? (
              <PencapaianView
                badges={gamificationOverview.badges}
                awards={gamificationOverview.awards}
                certificates={gamificationOverview.certificates}
                streak={gamificationOverview.streak}
                initialSection={achievementSection}
              />
            ) : (
              <GamificationError message="Data pencapaian belum tersedia." />
            )
          )}

          {activeTab === "ranking" && gamificationOverview?.features.rankingEnabled && (
            gamificationLoading ? (
              <GamificationLoading />
            ) : gamificationError ? (
              <GamificationError message={gamificationError} />
            ) : (
              <RankingView
                rankingKelas={gamificationOverview.ranking.class}
                rankingAngkatan={gamificationOverview.ranking.cohort}
                classRankingEnabled={gamificationOverview.features.classRankingEnabled}
                cohortRankingEnabled={gamificationOverview.features.cohortRankingEnabled}
              />
            )
          )}
        </main>
      </div>
    </div>
  );
};

const GamificationLoading: React.FC = () => (
  <div className="space-y-5">
    <div className="h-36 animate-pulse rounded-[2rem] bg-white" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="h-48 animate-pulse rounded-[2rem] bg-white" />
      <div className="h-48 animate-pulse rounded-[2rem] bg-white" />
    </div>
  </div>
);

const GamificationError: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-white rounded-[2rem] border-2 border-dashed border-rose-200 p-10 text-center">
    <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-black">!</div>
    <h3 className="font-extrabold text-slate-800 mt-3">Gagal memuat gamifikasi</h3>
    <p className="text-xs text-slate-500 mt-1">{message}</p>
  </div>
);

export default StudentDashboard;
