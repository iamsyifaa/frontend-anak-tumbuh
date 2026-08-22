import React, { useMemo, useState } from "react";
import {
  ChevronRight,
  Coins,
  Crown,
  Flame,
  Medal,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import { RankingUserItem } from "../../types";
import { AvatarBadge } from "../AvatarBadge";

interface RankingViewProps {
  rankingKelas: RankingUserItem[];
  rankingAngkatan: RankingUserItem[];
  classRankingEnabled?: boolean;
  cohortRankingEnabled?: boolean;
}

/** Student ranking UI: Top 3 podium + leaderboard starting at rank 4. */
export const RankingView: React.FC<RankingViewProps> = ({
  rankingKelas,
  rankingAngkatan,
  classRankingEnabled = true,
  cohortRankingEnabled = true,
}) => {
  const initialType = classRankingEnabled ? "kelas" : "angkatan";
  const [rankingType, setRankingType] = useState<"kelas" | "angkatan">(
    initialType,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const currentList = rankingType === "kelas" ? rankingKelas : rankingAngkatan;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredList = useMemo(
    () =>
      currentList.filter(
        (student) =>
          !normalizedQuery ||
          student.name.toLowerCase().includes(normalizedQuery) ||
          student.className.toLowerCase().includes(normalizedQuery),
      ),
    [currentList, normalizedQuery],
  );

  if (!classRankingEnabled && !cohortRankingEnabled) {
    return (
      <div className="rounded-3xl border border-[#A4C1FD]/30 bg-white p-10 text-center shadow-sm">
        <Medal className="mx-auto h-12 w-12 text-[#A4C1FD]" />
        <h3 className="mt-3 font-black text-black">Ranking tidak tersedia</h3>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          Sekolah belum mengaktifkan ranking.
        </p>
      </div>
    );
  }

  // Podium is intentionally built by rank, not by array position, so rank 3
  // stays visible even when the incoming list ordering changes.
  const podiumRanks = [2, 1, 3] as const;
  const podiumStudents = podiumRanks.map((rank) =>
    currentList.find((student) => student.rank === rank),
  );

  return (
    <div className="space-y-5 pb-8">
      <section className="rounded-[2rem] border border-[#A4C1FD]/40 bg-[#3A72E3] p-4 text-white shadow-[0_18px_40px_rgba(58,114,227,0.18)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/80">
              Papan Peringkat
            </p>
            <h1 className="mt-1 text-2xl font-black sm:text-3xl">Rank</h1>
            <p className="mt-1 text-xs font-semibold text-white/80">
              Ranking menggunakan Poin, bukan EXP.
            </p>
          </div>

          <div className="inline-flex w-full max-w-[168px] shrink-0 rounded-full bg-white/15 p-1 ring-1 ring-white/20 sm:w-auto">
            {classRankingEnabled && (
              <button
                type="button"
                onClick={() => setRankingType("kelas")}
                className={`min-w-0 flex-1 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[9px] font-black transition sm:flex-none sm:px-3 sm:text-[10px] ${
                  rankingType === "kelas"
                    ? "bg-white text-[#3A72E3]"
                    : "text-white/80 hover:text-white"
                }`}
              >
                <Users className="mr-1 inline h-3.5 w-3.5" /> Kelas
              </button>
            )}
            {cohortRankingEnabled && (
              <button
                type="button"
                onClick={() => setRankingType("angkatan")}
                className={`min-w-0 flex-1 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[9px] font-black transition sm:flex-none sm:px-3 sm:text-[10px] ${
                  rankingType === "angkatan"
                    ? "bg-white text-[#3A72E3]"
                    : "text-white/80 hover:text-white"
                }`}
              >
                <Trophy className="mr-1 inline h-3.5 w-3.5" /> Angkatan
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 items-end gap-2 sm:gap-4">
          {podiumStudents.map((student, index) => {
            const rank = podiumRanks[index];
            const isFirst = rank === 1;
            const isSecond = rank === 2;
            const icon = isFirst ? (
              <Crown
                className="h-6 w-6 text-[#EEB541] sm:h-7 sm:w-7"
                strokeWidth={2.2}
              />
            ) : (
              <Medal
                className={`h-6 w-6 sm:h-7 sm:w-7 ${isSecond ? "text-[#3A72E3]" : "text-[#EEB541]"}`}
                strokeWidth={2.2}
              />
            );

            return (
              <article
                key={rank}
                className={`relative flex min-h-[205px] flex-col items-center justify-between rounded-[2rem] border bg-gradient-to-b from-white to-[#A4C1FD]/35 p-3 text-center text-black shadow-sm sm:min-h-[225px] sm:p-4 ${
                  isFirst
                    ? "-translate-y-2 border-[#EEB541]"
                    : "border-[#A4C1FD]/70"
                }`}
              >
                <div className="flex w-full items-start justify-between">
                  <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-black text-slate-800 shadow-sm">
                    {rank === 1 ? "1st" : rank === 2 ? "2nd" : "3rd"}
                  </span>
                  <span className="-mr-0.5 -mt-1">
                    {React.cloneElement(icon, {
                      className: `${icon.props.className?.replace(/h-6 w-6|h-7 w-7/g, "h-5 w-5")} sm:h-6 sm:w-6`,
                    })}
                  </span>
                </div>

                {student ? (
                  <>
                    <AvatarBadge
                      name={student.name}
                      emoji={student.avatarEmoji}
                      bg={student.avatarBg}
                      avatarUrl={student.avatarUrl}
                      size={isFirst ? "lg" : "md"}
                    />
                    <div className="mt-1 min-w-0">
                      <p className="line-clamp-1 text-xs font-black sm:text-sm">
                        {student.name}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-[9px] font-semibold text-slate-500">
                        {student.className}
                      </p>
                    </div>

                    <div className="relative mt-2 w-full pt-2 px-1 sm:px-3">
                      <div className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                      <div className="flex items-center justify-center gap-3 sm:gap-4">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-[8px] font-black uppercase tracking-[0.03em] text-black sm:text-[9px]">
                            Poin
                          </span>
                          <span className="text-[11px] font-black leading-none text-black sm:text-xs">
                            {student.points.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="h-6 w-px bg-black/10" />
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-[8px] font-black uppercase tracking-[0.03em] text-black sm:text-[9px]">
                            Streak
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-black leading-none text-black sm:text-xs">
                            <Flame className="h-2.5 w-2.5 shrink-0 text-[#EEB541] sm:h-3 sm:w-3" />
                            {student.streak}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-1 items-center justify-center text-[10px] font-bold text-slate-400">
                    Data peringkat {rank} belum tersedia
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#A4C1FD]/30 bg-white shadow-sm">
        <div className="relative flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3A72E3]">
              Leaderboard
            </p>
            <h2 className="text-xl font-black text-black">
              {rankingType === "kelas" ? "Ranking Kelas" : "Ranking Angkatan"}
            </h2>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3A72E3]" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cari siswa..."
              className="w-full rounded-xl border border-[#A4C1FD]/40 bg-[#A4C1FD]/10 py-2.5 pl-10 pr-4 text-xs font-bold text-black outline-none focus:border-[#3A72E3]"
            />
          </div>
          <div className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-[#A4C1FD]/40 to-transparent sm:inset-x-5" />
        </div>

        <div className="space-y-2 p-3 sm:p-4">
          {filteredList
            .filter((student) => student.rank > 3)
            .map((student) => {
              const isCurrentUser = student.isCurrentUser;
              return (
                <div
                  key={student.id}
                  className={`flex items-center gap-3 rounded-2xl border px-3 py-3 transition ${
                    isCurrentUser
                      ? "border-[#3A72E3]/40 bg-[#A4C1FD]/15"
                      : "border-slate-100 bg-white hover:border-[#A4C1FD]/40"
                  }`}
                >
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#A4C1FD]/30 text-[10px] font-black text-[#3A72E3]">
                    {student.rank}
                  </div>
                  <AvatarBadge
                    name={student.name}
                    emoji={student.avatarEmoji}
                    bg={student.avatarBg}
                    avatarUrl={student.avatarUrl}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-black text-black">
                        {student.name}
                      </p>
                      {isCurrentUser && (
                        <span className="rounded-full bg-[#3A72E3] px-2 py-0.5 text-[8px] font-black text-white">
                          Kamu
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-semibold text-slate-500">
                      {student.className}
                    </p>
                  </div>
                  <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 whitespace-nowrap sm:gap-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-black sm:text-xs">
                        <Coins className="h-2.5 w-2.5 shrink-0 text-[#3A72E3] sm:h-3 sm:w-3" />
                        <span>{student.points.toLocaleString("id-ID")}</span>
                      </span>
                      <div className="h-5 w-px rounded-full bg-[#A4C1FD]/80" />
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#3A72E3] sm:text-xs">
                        <Flame className="h-2.5 w-2.5 shrink-0 text-[#EEB541] sm:h-3 sm:w-3" />
                        <span>{student.streak}</span>
                      </span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 sm:h-4 sm:w-4" />
                  </div>
                </div>
              );
            })}
          {filteredList.filter((student) => student.rank > 3).length === 0 && (
            <div className="p-8 text-center text-xs font-semibold text-slate-500">
              Tidak ada siswa di peringkat 4+ yang cocok dengan pencarian.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default RankingView;
