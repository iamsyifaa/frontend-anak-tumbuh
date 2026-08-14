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
}

export const RankingView: React.FC<RankingViewProps> = ({
  rankingKelas,
  rankingAngkatan
}) => {
  const [rankingType, setRankingType] = useState<'kelas' | 'angkatan'>('kelas');
  const [searchQuery, setSearchQuery] = useState('');

  const currentList = rankingType === 'kelas' ? rankingKelas : rankingAngkatan;

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
            <Medal className="w-4 h-4 text-amber-300 animate-spin" />
            <span>Papan Peringkat Siswa Berprestasi</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white font-heading">
            Juara Kebiasaan Terbaik! 🌟
          </h2>
          <p className="text-xs md:text-sm text-sky-100 font-semibold leading-relaxed">
            Kumpulkan poin setiap hari dan pertahankan streak untuk menjadi yang teratas di kelas dan angkatan!
          </p>
        </div>

        {/* Tab Toggle Controls */}
        <div className="bg-white/20 backdrop-blur-md p-2 rounded-3xl flex items-center space-x-2 border-2 border-white/40 self-start md:self-center relative z-10">
          <button
            onClick={() => setRankingType('kelas')}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition-all duration-200 flex items-center gap-2 font-heading ${
              rankingType === 'kelas'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-300/50 scale-103'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Ranking Kelas (VIII-B)</span>
          </button>
          <button
            onClick={() => setRankingType('angkatan')}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition-all duration-200 flex items-center gap-2 font-heading ${
              rankingType === 'angkatan'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-300/50 scale-103'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Ranking Angkatan</span>
          </button>
        </div>
      </div>

      {/* TOP 3 PODIUM DISPLAY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {currentList.slice(0, 3).map((user) => {
          let rankBadge = {
            bg: 'bg-amber-100 border-amber-300 text-amber-950',
            icon: '🥇 Juara 1 Emas',
            crown: true,
            cardBg: 'bg-gradient-to-b from-amber-50/90 via-white to-amber-100/50 border-amber-300 shadow-amber-200/80 ring-4 ring-amber-300/40 md:-translate-y-2'
          };
          if (user.rank === 2) {
            rankBadge = {
              bg: 'bg-slate-100 border-slate-300 text-slate-900',
              icon: '🥈 Juara 2 Perak',
              crown: false,
              cardBg: 'bg-gradient-to-b from-slate-50 via-white to-sky-50 border-slate-300 shadow-sky-100/70'
            };
          } else if (user.rank === 3) {
            rankBadge = {
              bg: 'bg-orange-100 border-orange-300 text-orange-950',
              icon: '🥉 Juara 3 Perunggu',
              crown: false,
              cardBg: 'bg-gradient-to-b from-orange-50/70 via-white to-orange-100/40 border-orange-200 shadow-orange-100/70'
            };
          }

          return (
            <div
              key={user.id}
              className={`rounded-[2.5rem] p-7 border-4 border-white text-center relative overflow-hidden flex flex-col items-center justify-between transition-all duration-300 hover:-translate-y-3 hover:scale-102 shadow-2xl ${rankBadge.cardBg}`}
            >
              {rankBadge.crown && (
                <div className="absolute top-4 right-4 text-amber-500 animate-bounce">
                  <Crown className="w-8 h-8" />
                </div>
              )}

              <div className="flex flex-col items-center space-y-3.5">
                <div className="relative">
                  <AvatarBadge
                    name={user.name}
                    emoji={user.avatarEmoji}
                    bg={user.avatarBg}
                    size="xl"
                  />
                  <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-xs font-black bg-slate-950 text-white px-3 py-1 rounded-full z-10 shadow-md border-2 border-white font-heading">
                    #{user.rank}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg flex items-center justify-center gap-1 font-heading">
                    {user.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold">{user.className}</p>
                </div>

                <div className="inline-block text-xs font-black px-4 py-1.5 rounded-full border-2 border-white shadow-sm font-heading bg-white/80">
                  {rankBadge.icon}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t-2 border-slate-100 w-full flex justify-around text-xs font-bold">
                <div>
                  <p className="text-slate-400 text-[10px] font-bold">Total Poin</p>
                  <p className="font-black text-sky-600 text-sm font-heading">{user.points} ⭐</p>
                </div>
                <div className="border-r-2 border-slate-100"></div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold">Streak Hebat</p>
                  <p className="font-black text-amber-600 flex items-center justify-center gap-1 text-sm font-heading">
                    <Flame className="w-4 h-4 text-amber-500" /> {user.streak} Hari
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* LEADERBOARD TABLE */}
      <div className="bg-white rounded-[2.5rem] border-4 border-white shadow-2xl shadow-sky-100/70 overflow-hidden">
        {/* Table Search & Title */}
        <div className="p-6 md:p-7 border-b-2 border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-extrabold text-slate-800 text-lg md:text-xl flex items-center gap-2 font-heading">
            <Award className="w-6 h-6 text-sky-500" />
            <span>Papan Skor {rankingType === 'kelas' ? 'Kelas VIII-B' : 'Seluruh Angkatan'}</span>
          </h3>

          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Cari teman sekelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-sky-100 bg-sky-50/40 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            />
            <Search className="w-4 h-4 text-sky-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Table Rendering */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gradient-to-r from-sky-50 to-blue-50 text-slate-600 uppercase tracking-wider text-[11px] font-black border-b-2 border-slate-100 font-heading">
              <tr>
                <th className="py-4 px-6 text-center">Posisi</th>
                <th className="py-4 px-6">Siswa</th>
                <th className="py-4 px-6">Kelas</th>
                <th className="py-4 px-6 text-center">Level</th>
                <th className="py-4 px-6 text-center">Streak</th>
                <th className="py-4 px-6 text-right">Total Bintang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((user) => {
                const isCurrentUser = user.isCurrentUser;
                return (
                  <tr
                    key={user.id}
                    className={`transition-all ${
                      isCurrentUser
                        ? 'bg-sky-100/90 font-black text-sky-950 ring-2 ring-sky-400'
                        : 'hover:bg-sky-50/50 text-slate-700'
                    }`}
                  >
                    {/* Rank Number / Medal */}
                    <td className="py-4 px-6 text-center">
                      {user.rank === 1 && <span className="text-xl">🥇</span>}
                      {user.rank === 2 && <span className="text-xl">🥈</span>}
                      {user.rank === 3 && <span className="text-xl">🥉</span>}
                      {user.rank > 3 && (
                        <span className="font-black text-slate-600 font-heading">#{user.rank}</span>
                      )}
                    </td>

                    {/* Student Info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3.5">
                        <AvatarBadge
                          name={user.name}
                          emoji={user.avatarEmoji}
                          bg={user.avatarBg}
                          size="md"
                        />
                        <div>
                          <p className="font-extrabold text-slate-900 flex items-center gap-2 font-heading">
                            {user.name}
                            {isCurrentUser && (
                              <span className="bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                                Kamu 🌟
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-500 font-semibold">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-bold text-slate-600">{user.className}</td>

                    <td className="py-4 px-6 text-center">
                      <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-[11px] font-black border border-indigo-200 font-heading">
                        Level {user.level}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-center font-black text-amber-700">
                      <span className="inline-flex items-center gap-1 bg-amber-100 px-3 py-1 rounded-full text-xs font-heading">
                        <Flame className="w-4 h-4 text-amber-500" /> {user.streak} Hari
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <span className="font-black text-sky-600 text-base font-heading">
                        {user.points.toLocaleString('id-ID')}
                      </span>
                      <span className="text-xs text-amber-500 ml-1">⭐</span>
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

