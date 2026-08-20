import { UserProfile } from "../types/auth";
import { StudentProfileData } from "../types/studentProfile";

const wait = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

const schoolNames: Record<string, string> = {
  "sch-101": "SDN Anak Tumbuh 01",
};

const classNames: Record<string, string> = {
  "cls-5a": "Kelas 5 — Cendekia",
  "cls-8b": "Kelas 8 — B",
  "cls-9b": "Kelas 9 — B",
};

export const studentProfileService = {
  async getProfile(user: UserProfile): Promise<StudentProfileData> {
    await wait();
    if (user.role !== "siswa") throw new Error("Profil siswa hanya dapat diakses oleh siswa.");
    const currentLevel = 6;
    return {
      id: user.id,
      name: user.name,
      className: classNames[user.classId ?? ""] ?? "Kelas Anda",
      schoolName: schoolNames[user.schoolId ?? ""] ?? "Sekolah Anda",
      currentLevel,
      currentLevelLabel: `Level ${currentLevel}`,
      levelHistory: [
        { id: "sem-2026-2", semesterLabel: "Semester 2", academicYearLabel: "2026/2027", level: currentLevel, levelLabel: `Level ${currentLevel}`, periodLabel: "Juli–Desember 2026" },
        { id: "sem-2026-1", semesterLabel: "Semester 1", academicYearLabel: "2026/2027", level: 5, levelLabel: "Level 5", periodLabel: "Januari–Juni 2026" },
        { id: "sem-2025-2", semesterLabel: "Semester 2", academicYearLabel: "2025/2026", level: 4, levelLabel: "Level 4", periodLabel: "Juli–Desember 2025" },
        { id: "sem-2025-1", semesterLabel: "Semester 1", academicYearLabel: "2025/2026", level: 3, levelLabel: "Level 3", periodLabel: "Januari–Juni 2025" },
      ],
    };
  },
};
