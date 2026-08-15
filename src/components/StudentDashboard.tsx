import React, { useEffect, useState } from "react";
import { TabType, Habit, ActivityHistory, ToastMessage } from "../types";
import {
  INITIAL_HABITS,
  INITIAL_HISTORIES,
  INITIAL_BADGES,
  INITIAL_CERTIFICATES,
  RANKING_KELAS,
  RANKING_ANGKATAN,
} from "../data/mockData";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Toast } from "./Toast";

import { BerandaView } from "./views/BerandaView";
import { IsiKebiasaanView } from "./views/IsiKebiasaanView";
import { PencapaianView } from "./views/PencapaianView";
import { RankingView } from "./views/RankingView";
import { GamificationSummary } from "./gamification/GamificationSummary";
import { pointConfigurationService } from "../services/pointConfigurationService";
import { useAuth } from "../context/AuthContext";
import { GamificationSummary as GamificationSummaryType } from "../types/pointConfiguration";

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [gamification, setGamification] = useState<GamificationSummaryType | null>(null);
  const [gamificationLoading, setGamificationLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "siswa") { setGamificationLoading(false); return; }
    void pointConfigurationService.getStudentSummary(user).then((summary) => { setGamification(summary); setCurrentPoints(summary.points); }).catch(() => setGamification(null)).finally(() => setGamificationLoading(false));
  }, [user]);

  // Main Navigation View State
  const [activeTab, setActiveTab] = useState<TabType>("beranda");

  // Student State Logic as requested by prompt
  const [currentPoints, setCurrentPoints] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(12);
  const [remainingChances, setRemainingChances] = useState<number>(7);

  // Data Collections State
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [histories, setHistories] =
    useState<ActivityHistory[]>(INITIAL_HISTORIES);
  const [badges] = useState(INITIAL_BADGES);
  const [certificates] = useState(INITIAL_CERTIFICATES);
  const [rankingKelas, setRankingKelas] = useState(RANKING_KELAS);
  const [rankingAngkatan, setRankingAngkatan] = useState(RANKING_ANGKATAN);

  // Toast Notification State
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Mobile Drawer State
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Handle Habit Completion (Modal Submit)
  const handleCompleteHabit = async (
    habitId: string,
    initiative: "Sadar Sendiri" | "Disuruh",
    reflection: string,
  ) => {
    const targetHabit = habits.find((h) => h.id === habitId);
    if (!targetHabit) return;

    // 1. Lock the Habit Card
    const updatedHabits = habits.map((h) => {
      if (h.id === habitId) {
        return {
          ...h,
          isLocked: true,
          completedAt: "Baru Saja",
          initiative,
          reflection: reflection || "Melaksanakan kebiasaan dengan tertib.",
        };
      }
      return h;
    });
    setHabits(updatedHabits);

    // 2. Submit to backend boundary. Frontend does not calculate Poin/EXP/Level.
    const backendResult = await pointConfigurationService.submitHabitAndGetSummary(user!, user!.id, habitId, initiative);
    const earnedPoints = backendResult.pointsAwarded;
    const newTotalPoints = backendResult.summary.points;
    setGamification(backendResult.summary);
    setCurrentPoints(newTotalPoints);

    // Update User Points in Leaderboard from backend response
    setRankingKelas((prev) => prev.map((u) => (u.isCurrentUser ? { ...u, points: newTotalPoints } : u)));
    setRankingAngkatan((prev) => prev.map((u) => (u.isCurrentUser ? { ...u, points: newTotalPoints } : u)));

    // 3. Add to History Timeline
    const newHistoryItem: ActivityHistory = {
      id: `hist-${Date.now()}`,
      habitId: targetHabit.id,
      habitTitle: targetHabit.title,
      date: "Hari Ini, 12 Agustus 2026",
      time:
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }) + " WIB",
      pointsEarned: earnedPoints,
      initiative,
      reflection:
        reflection || "Melaksanakan kebiasaan dengan penuh tanggung jawab.",
      comments: [
        {
          id: `c-auto-${Date.now()}`,
          senderName: "Ibu Maya Indriani, S.Pd.",
          senderRole: "Wali Kelas",
          avatarEmoji: "guru",
          avatarBg: "bg-rose-100",
          content: `Hebat Rizky! Kebiasaan "${targetHabit.title}" telah tercatat (${initiative}). Pertahankan terus ya!`,
          timestamp: "Baru saja",
        },
      ],
    };
    setHistories([newHistoryItem, ...histories]);

    // 4. Trigger Success Toast Notification
    setToast({
      id: `toast-${Date.now()}`,
      type: "success",
      title: "Kebiasaan Terkunci & Berhasil Diisi! 🎉",
      message: `Selamat, kamu mendapatkan +${earnedPoints} Poin Karakter (${initiative}).`,
    });
  };

  // Streak Simulation Helper
  const handleUpdateStreakChances = (delta: number) => {
    setRemainingChances((prev) => Math.max(0, Math.min(7, prev + delta)));
  };

  const handleResetStreakChances = () => {
    setRemainingChances(7);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fc] text-slate-900 flex font-sans antialiased selection:bg-sky-200">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentPoints={currentPoints}
        currentStreak={currentStreak}
        remainingChances={remainingChances}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-72 flex flex-col min-w-0 transition-all duration-300">
        <Header
          activeTab={activeTab}
          currentStreak={currentStreak}
          remainingChances={remainingChances}
          currentPoints={currentPoints}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "beranda" && (
            <div className="space-y-5">
              {!gamificationLoading && gamification && <GamificationSummary summary={gamification} />}
              {gamificationLoading && <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><div className="h-28 animate-pulse rounded-2xl bg-white" /><div className="h-28 animate-pulse rounded-2xl bg-white" /><div className="h-28 animate-pulse rounded-2xl bg-white" /><div className="h-28 animate-pulse rounded-2xl bg-white" /></div>}
              <BerandaView
              currentPoints={currentPoints}
              currentStreak={currentStreak}
              remainingChances={remainingChances}
              habits={habits}
              histories={histories}
              onTabChange={setActiveTab}
              onUpdateStreakChances={handleUpdateStreakChances}
              onResetStreakChances={handleResetStreakChances}
            />
            </div>
          )}

          {activeTab === "kebiasaan" && (
            <IsiKebiasaanView />
          )}

          {activeTab === "pencapaian" && (
            <PencapaianView badges={badges} certificates={certificates} />
          )}

          {activeTab === "ranking" && (
            <RankingView
              rankingKelas={rankingKelas}
              rankingAngkatan={rankingAngkatan}
            />
          )}
        </main>
      </div>

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default StudentDashboard;
