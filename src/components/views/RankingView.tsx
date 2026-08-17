import React, { useState } from 'react';
import { RankingUserItem } from '../../types';
import { AvatarBadge } from '../AvatarBadge';
import { Illustration } from '../illustrations/IllustrationAssets';
import {
  Medal,
  Crown,
  Trophy,
  Flame,
  Award,
  Users,
  Search,
  Sparkles,
  ChevronUp,
  UserCheck,
  Star
} from 'lucide-react';

interface RankingViewProps {
  rankingKelas: RankingUserItem[];
  rankingAngkatan: RankingUserItem[];
  classRankingEnabled?: boolean;
  cohortRankingEnabled?: boolean;
}

export const RankingView: React.FC<RankingViewProps> = ({
  rankingKelas,
  rankingAngkatan,
  classRankingEnabled = true,
  cohortRankingEnabled = true,
}) => {
  const initialType = classRankingEnabled ? "kelas" : "angkatan";
  const [rankingType, setRankingType] = useState<'kelas' | 'angkatan'>(initialType as 'kelas' | 'angkatan');
  const [searchQuery, setSearchQuery] = useState('');

  const currentList = rankingType === 'kelas' ? rankingKelas : rankingAngkatan;

  if (!classRankingEnabled && !cohortRankingEnabled) {
    return (
      <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-12 text-center">
        <Medal className="w-12 h-12 mx-auto text-slate-300" />
        <h3 className="font-extrabold text-slate-700 mt-3">Ranking tidak tersedia</h3>
        <p className="text-xs text-slate-500 mt-1">Sekolah belum mengaktifkan ranking untuk konteks ini.</p>
      </div>
    );
  }

  const filteredList = currentList.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 rounded-[2.5rem] p-6 md:p-8 lg:p-10 border-4 border-white shadow-2xl shadow-sky-200/80 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black text-white border border-white/30 shadow-xs font-heading">
            <Medal className="w-4 h-4 text-amber-300" />
            <span>Papan Peringkat Siswa Berprestasi</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white font-heading">
            Juara Kebiasaan Terbaik! 🌟
          </h2>
          <p className="text-xs md:text-sm text-sky-100 font-semibold leading-relaxed">
            Ranking ditentukan dari Poin dan hanya tersedia jika sekolah mengaktifkan fitur ranking.
          </p>
        </div>

        {/* Tab Toggle Controls */}
        <div className="bg-white/20 backdrop-blur-md p-2 rounded-3xl flex items-center space-x-2 border-2 border-white/40 self-start md:self-center relative z-10">
          {classRankingEnabled && <button
            onClick={() => setRankingType('kelas')}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition-all duration-200 flex items-center gap-2 font-heading ${
              rankingType === 'kelas'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-300/50 scale-103'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Ranking Kelas</span>
          </button>}
          {cohortRankingEnabled && <button
            onClick={() => setRankingType('angkatan')}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition-all duration-200 flex items-center gap-2 font-heading ${
              rankingType === 'angkatan'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-300/50 scale-103'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Ranking Angkatan</span>
          </button>}
        </div>
      </div>

      {/* TOP 3 PODIUM DISPLAY */}
      <div className="flex items-end justify-center gap-2 sm:gap-4 md:grid md:grid-cols-3 md:items-stretch md:gap-6 pt-5 px-1 sm:px-3">
        {currentList.slice(0, 3).map((user) => {
          const isFirst = user.rank === 1;
          const isSecond = user.rank === 2;
          const medal = isFirst ? "🥇" : isSecond ? "🥈" : "🥉";
          const mobileOrder = isSecond ? "order-1" : isFirst ? "order-2" : "order-3";
          return (
            <div
              key={user.id}
              className={`relative w-[31%] max-w-[245px] md:w-auto md:max-w-none rounded-[2rem] sm:rounded-[2.5rem] p-3 sm:p-5 text-center flex flex-col items-center justify-between bg-white/40 backdrop-blur-md border border-white shadow-xl shadow-sky-100/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animate-podium-in ${mobileOrder} md:order-none ${isFirst ? "min-h-[350px] sm:min-h-[390px] md:min-h-[360px] scale-105 sm:scale-110 md:scale-105 z-10 border-amber-200/90 shadow-amber-200/60" : "min-h-[300px] sm:min-h-[335px] md:min-h-[330px] z-0"}`}
              style={{ animationDelay: `${user.rank * 90}ms` }}
            >
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 text-2xl sm:text-3xl drop-shadow-md">{medal}</div>
              {isFirst && <Crown className="absolute top-3 right-3 w-5 h-5 sm:w-7 sm:h-7 text-amber-500" />}

              <div className="flex flex-col items-center pt-5 sm:pt-6 w-full">
                <div className="relative">
                  <AvatarBadge name={user.name} emoji={user.avatarEmoji} bg={user.avatarBg} avatarUrl={user.avatarUrl} size={isFirst ? "xl" : "lg"} />
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-black bg-slate-950 text-white px-2.5 sm:px-3 py-1 rounded-full z-10 shadow-md border-2 border-white">#{user.rank}</span>
                </div>
                <h3 className="mt-4 sm:mt-5 font-extrabold text-slate-900 text-xs sm:text-base leading-tight line-clamp-2">{user.name}</h3>
                <p className="text-[9px] sm:text-xs text-slate-500 font-bold mt-1">{user.className}</p>
                <div className="mt-3 inline-flex items-center justify-center text-[9px] sm:text-[10px] font-black px-2.5 sm:px-3 py-1.5 rounded-full border border-white bg-white/70 shadow-sm">{medal} Juara {user.rank}</div>
              </div>

              <div className="w-full pt-3 sm:pt-4 border-t border-white/80 grid grid-cols-2 gap-1 text-center">
                <div><p className="text-[8px] sm:text-[9px] text-slate-400 font-bold">Total Poin</p><p className="font-black text-sky-600 text-[11px] sm:text-sm">{user.points} ⭐</p></div>
                <div><p className="text-[8px] sm:text-[9px] text-slate-400 font-bold">Streak</p><p className="font-black text-amber-600 text-[10px] sm:text-sm">🔥 {user.streak}</p></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* LEADERBOARD TABLE — compact and stable on mobile, no horizontal scrolling */}
      <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border-2 sm:border-4 border-white shadow-xl sm:shadow-2xl shadow-sky-100/70 overflow-hidden">
        <div className="p-3 sm:p-6 md:p-7 border-b-2 border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-extrabold text-slate-800 text-sm sm:text-lg md:text-xl flex items-center gap-2 font-heading min-w-0">
            <Award className="w-4 h-4 sm:w-6 sm:h-6 text-sky-500 shrink-0" />
            <span className="truncate">Papan Skor {rankingType === 'kelas' ? 'Kelas VIII-B' : 'Seluruh Angkatan'}</span>
          </h3>
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder="Cari teman sekelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 sm:pl-10 sm:pr-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border-2 border-sky-100 bg-sky-50/40 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            />
            <Search className="w-4 h-4 text-sky-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="overflow-hidden">
          <table className="w-full table-fixed text-left text-[9px] sm:text-xs">
            <colgroup>
              <col className="w-[12%]" />
              <col className="w-[43%]" />
              <col className="w-[15%]" />
              <col className="w-[18%]" />
              <col className="w-[12%]" />
            </colgroup>
            <thead className="bg-gradient-to-r from-sky-50 to-blue-50 text-slate-600 uppercase tracking-wider text-[8px] sm:text-[11px] font-black border-b-2 border-slate-100 font-heading">
              <tr>
                <th className="py-2 sm:py-4 px-1 sm:px-6 text-center">Posisi</th>
                <th className="py-2 sm:py-4 px-1.5 sm:px-6">Siswa</th>
                <th className="py-2 sm:py-4 px-1 sm:px-6 text-center">Level</th>
                <th className="py-2 sm:py-4 px-1 sm:px-6 text-center">Streak</th>
                <th className="py-2 sm:py-4 px-1 sm:px-6 text-right">Poin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((user) => {
                const isCurrentUser = user.isCurrentUser;
                return (
                  <tr
                    key={user.id}
                    className={`transition-all ${isCurrentUser ? 'bg-sky-100/90 font-black text-sky-950 ring-2 ring-sky-400' : 'hover:bg-sky-50/50 text-slate-700'}`}
                  >
                    <td className="py-2 sm:py-4 px-1 sm:px-6 text-center">
                      {user.rank === 1 && <span className="text-sm sm:text-xl">🥇</span>}
                      {user.rank === 2 && <span className="text-sm sm:text-xl">🥈</span>}
                      {user.rank === 3 && <span className="text-sm sm:text-xl">🥉</span>}
                      {user.rank > 3 && <span className="font-black text-slate-600 font-heading">#{user.rank}</span>}
                    </td>
                    <td className="py-2 sm:py-4 px-1.5 sm:px-6 overflow-hidden">
                      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
                        <div className="shrink-0 scale-[0.72] sm:scale-100 origin-left">
                          <AvatarBadge name={user.name} emoji={user.avatarEmoji} bg={user.avatarBg} avatarUrl={user.avatarUrl} size="md" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-900 truncate font-heading text-[9px] sm:text-sm">
                            {user.name}
                            {isCurrentUser && <span className="hidden sm:inline-flex ml-1.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Kamu 🌟</span>}
                          </p>
                          <p className="text-[8px] sm:text-[10px] text-slate-500 font-semibold truncate">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 sm:py-4 px-1 sm:px-6 text-center">
                      <span className="inline-flex max-w-full bg-indigo-100 text-indigo-800 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[11px] font-black border border-indigo-200 font-heading truncate">Lv {user.level}</span>
                    </td>
                    <td className="py-2 sm:py-4 px-1 sm:px-6 text-center font-black text-amber-700">
                      <span className="inline-flex items-center justify-center gap-0.5 sm:gap-1 bg-amber-100 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-heading whitespace-nowrap">
                        <Flame className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-amber-500" /> {user.streak}<span className="hidden sm:inline"> Hari</span>
                      </span>
                    </td>
                    <td className="py-2 sm:py-4 px-1 sm:px-6 text-right whitespace-nowrap">
                      <span className="font-black text-sky-600 text-[10px] sm:text-base font-heading">{user.points.toLocaleString('id-ID')}</span>
                      <span className="text-[9px] sm:text-xs text-amber-500 ml-0.5">⭐</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

