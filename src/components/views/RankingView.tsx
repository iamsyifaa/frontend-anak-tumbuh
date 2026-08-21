import React, { useMemo, useState } from "react";
import { Crown, Flame, Medal, Search, Trophy, Users, ChevronRight } from "lucide-react";
import { RankingUserItem } from "../../types";
import { AvatarBadge } from "../AvatarBadge";

interface RankingViewProps {
  rankingKelas: RankingUserItem[];
  rankingAngkatan: RankingUserItem[];
  classRankingEnabled?: boolean;
  cohortRankingEnabled?: boolean;
}

/** Gaming-inspired ranking: podium Top 3 + compact leaderboard cards. */
export const RankingView: React.FC<RankingViewProps> = ({
  rankingKelas,
  rankingAngkatan,
  classRankingEnabled = true,
  cohortRankingEnabled = true,
}) => {
  const initialType = classRankingEnabled ? "kelas" : "angkatan";
  const [rankingType, setRankingType] = useState<"kelas" | "angkatan">(initialType);
  const [searchQuery, setSearchQuery] = useState("");

  const currentList = rankingType === "kelas" ? rankingKelas : rankingAngkatan;
  const filteredList = useMemo(
    () => currentList.filter((student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.className.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
    [currentList, searchQuery],
  );

  if (!classRankingEnabled && !cohortRankingEnabled) {
    return (
      <div className="rounded-3xl border border-[#A4C1FD]/30 bg-white p-10 text-center shadow-sm">
        <Medal className="mx-auto h-12 w-12 text-[#A4C1FD]" />
        <h3 className="mt-3 font-black text-black">Ranking tidak tersedia</h3>
        <p className="mt-1 text-xs font-semibold text-slate-500">Sekolah belum mengaktifkan ranking.</p>
      </div>
    );
  }

  const podiumOrder = [currentList.find((student) => student.rank === 2), currentList.find((student) => student.rank === 1), currentList.find((student) => student.rank === 3)].filter(Boolean) as RankingUserItem[];
  const podiumLabels = ["2nd", "1st", "3rd"];
  const podiumColors = ["from-white to-[#A4C1FD]/10", "from-white to-[#EEB541]/15", "from-white to-[#A4C1FD]/10"];
  const podiumBorders = ["border-[#A4C1FD]/70", "border-[#EEB541]", "border-[#A4C1FD]/70"];
  const podiumIcons = [
    <Medal key="silver" className="h-4 w-4 text-[#3A72E3]" />,
    <Crown key="crown" className="h-4 w-4 text-[#EEB541]" />,
    <Medal key="bronze" className="h-4 w-4 text-[#EEB541]" />,
  ];

  return (
    <div className="space-y-5 pb-8">
      <section className="rounded-[2rem] border border-[#A4C1FD]/40 bg-[#3A72E3] p-4 text-white shadow-[0_18px_40px_rgba(58,114,227,0.18)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#A4C1FD]">Papan Peringkat</p>
            <h1 className="mt-1 text-2xl font-black sm:text-3xl">Rank</h1>
            <p className="mt-1 text-xs font-semibold text-white/65">Ranking menggunakan Poin, bukan EXP.</p>
          </div>
          <div className="inline-flex w-full max-w-[220px] rounded-full bg-white/15 p-1 ring-1 ring-white/15 sm:w-auto">
            {classRankingEnabled && (
              <button type="button" onClick={() => setRankingType("kelas")} className={`min-w-0 flex-1 rounded-full px-2 py-1.5 text-[9px] font-black whitespace-nowrap sm:flex-none sm:px-4 sm:py-2 sm:text-[10px] ${rankingType === "kelas" ? "bg-white text-[#3A72E3]" : "text-white/75 hover:text-white"}`}>
                <Users className="mr-1 inline h-3.5 w-3.5" /> Kelas
              </button>
            )}
            {cohortRankingEnabled && (
              <button type="button" onClick={() => setRankingType("angkatan")} className={`min-w-0 flex-1 rounded-full px-2 py-1.5 text-[9px] font-black whitespace-nowrap sm:flex-none sm:px-4 sm:py-2 sm:text-[10px] ${rankingType === "angkatan" ? "bg-white text-[#3A72E3]" : "text-white/75 hover:text-white"}`}>
                <Trophy className="mr-1 inline h-3.5 w-3.5" /> Angkatan
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 items-end gap-2 sm:gap-4">
          {podiumOrder.map((student, index) => {
            const isFirst = student.rank === 1;
            return (
              <article key={student.id} className={`relative overflow-hidden rounded-3xl border bg-gradient-to-b ${podiumColors[index]} ${podiumBorders[index]} p-3 text-center text-black shadow-sm sm:p-4 ${isFirst ? "-translate-y-2" : ""}`}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full bg-white/80 px-2 py-1 text-[9px] font-black">{podiumLabels[index]}</span>
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-white/80">{podiumIcons[index]}</span>
                </div>
                <AvatarBadge name={student.name} emoji={student.avatarEmoji} bg={student.avatarBg} avatarUrl={student.avatarUrl} size={isFirst ? "lg" : "md"} />
                <p className="mt-2 line-clamp-1 text-xs font-black sm:text-sm">{student.name}</p>
                <p className="mt-0.5 text-[9px] font-semibold text-slate-500">{student.className}</p>
                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  <MiniMetric label="Poin" value={student.points.toLocaleString("id-ID")} />
                  <MiniMetric label="Streak" value={`${student.streak}`} icon={<Flame className="h-3 w-3 text-[#EEB541]" />} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#A4C1FD]/30 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#A4C1FD]/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3A72E3]">Leaderboard</p>
            <h2 className="text-xl font-black text-black">{rankingType === "kelas" ? "Ranking Kelas" : "Ranking Angkatan"}</h2>
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
        </div>

        <div className="space-y-2 p-3 sm:p-4">
          {filteredList.filter((student) => student.rank > 3).map((student) => {
            const isCurrentUser = student.isCurrentUser;
            return (
              <div key={student.id} className={`flex items-center gap-3 rounded-2xl border px-3 py-3 transition ${isCurrentUser ? "border-[#3A72E3]/40 bg-[#A4C1FD]/15" : "border-slate-100 bg-white hover:border-[#A4C1FD]/40"}`}>
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#A4C1FD]/30 text-[10px] font-black text-[#3A72E3]">
                  {student.rank}
                </div>
                <AvatarBadge name={student.name} emoji={student.avatarEmoji} bg={student.avatarBg} avatarUrl={student.avatarUrl} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-black text-black">{student.name}</p>
                    {isCurrentUser && <span className="rounded-full bg-[#3A72E3] px-2 py-0.5 text-[8px] font-black text-white">Kamu</span>}
                  </div>
                  <p className="text-[10px] font-semibold text-slate-500">{student.className}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-black text-black">{student.points.toLocaleString("id-ID")}</p>
                  <p className="text-[9px] font-semibold text-slate-400">poin</p>
                </div>
                <div className="text-right">
                  <p className="inline-flex items-center gap-1 text-[10px] font-black text-[#3A72E3]"><Flame className="h-3.5 w-3.5 text-[#EEB541]" />{student.streak}</p>
                  <ChevronRight className="ml-auto mt-1 h-3.5 w-3.5 text-slate-300" />
                </div>
              </div>
            );
          })}
          {filteredList.filter((student) => student.rank > 3).length === 0 && <div className="p-8 text-center text-xs font-semibold text-slate-500">Tidak ada siswa di peringkat 4+ yang cocok dengan pencarian.</div>}
        </div>
      </section>
    </div>
  );
};

const MiniMetric: React.FC<{ label: string; value: string; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="rounded-xl bg-white/85 px-2 py-1.5 ring-1 ring-[#A4C1FD]/35">
    <p className="text-[8px] font-black uppercase tracking-wide text-slate-400">{label}</p>
    <div className="mt-0.5 flex items-center justify-center gap-1 text-xs font-black text-black">{icon}{value}</div>
  </div>
);

export default RankingView;
