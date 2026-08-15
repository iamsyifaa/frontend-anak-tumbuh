import { BadgeItem, CertificateItem, RankingUserItem } from "../types";
import { GamificationOverview } from "../types/gamification";
import { INITIAL_BADGES, INITIAL_CERTIFICATES, RANKING_ANGKATAN, RANKING_KELAS } from "../data/mockData";

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const badges: BadgeItem[] = INITIAL_BADGES.map((badge) =>
  badge.id === "badge-4"
    ? {
        ...badge,
        title: "Konsistensi Kebiasaan 30 Hari",
        description: "Mencapai target pengisian kebiasaan yang ditetapkan sekolah pada 30 hari terpilih.",
        iconName: "Calendar",
        progressText: "18 / 30 Hari target tercapai",
      }
    : badge,
);

const certificates: CertificateItem[] = INITIAL_CERTIFICATES.map((certificate) => ({
  ...certificate,
  description: certificate.id === "cert-2"
    ? "Diberikan berdasarkan pencapaian kebiasaan dan periode yang ditetapkan sekolah."
    : certificate.description,
}));

const awards = [
  {
    id: "award-1",
    title: "Penghargaan Kebiasaan Mandiri",
    description: "Penghargaan atas pencapaian target kebiasaan mandiri pada periode Juli 2026.",
    habitName: "Inisiatif Sadar Sendiri",
    period: "Juli 2026",
    awardedAt: "01 Agustus 2026",
    issuerName: "SMP ANAKTUMBUH.ID",
    certificateId: "cert-1",
  },
  {
    id: "award-2",
    title: "Apresiasi Gemar Belajar",
    description: "Penghargaan berdasarkan pencapaian target kebiasaan belajar pada periode minggu pertama Agustus.",
    habitName: "Gemar Belajar",
    period: "Minggu 1 Agustus 2026",
    awardedAt: "08 Agustus 2026",
    issuerName: "Wali Kelas VIII-B",
    certificateId: null,
  },
];

export const gamificationService = {
  async getOverview(_studentId: string): Promise<GamificationOverview> {
    await delay();
    return {
      streak: {
        current: 12,
        best: 18,
        remainingChances: 7,
        maxMonthlyChances: 7,
        monthLabel: "Agustus 2026",
        status: "active",
      },
      badges,
      awards,
      certificates,
      ranking: {
        class: RANKING_KELAS,
        cohort: RANKING_ANGKATAN,
      },
      // Backend owns this flag. Flip to false to verify the OFF state.
      features: {
        rankingEnabled: true,
        classRankingEnabled: true,
        cohortRankingEnabled: true,
      },
      source: "backend",
      updatedAt: new Date().toISOString(),
    };
  },
};
