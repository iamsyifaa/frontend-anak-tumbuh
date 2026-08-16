import React from 'react';
import { Illustration } from './illustrations/IllustrationAssets';

interface AvatarBadgeProps {
  name: string;
  role?: string;
  emoji?: string;
  bg?: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showOnlineStatus?: boolean;
  className?: string;
}

export const AvatarBadge: React.FC<AvatarBadgeProps> = ({
  name,
  role,
  emoji,
  bg,
  avatarUrl,
  size = 'md',
  showOnlineStatus = false,
  className = ''
}) => {
  const isBoy = name.includes('Ahmad') || name.includes('Bintang') || name.includes('Bagas') || name.includes('Fikri') || name.includes('Farhan') || name.includes('Rian') || name.includes('Rizky');
  const isTeacher = role === 'Wali Kelas';
  const isParent = role === 'Orang Tua';

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm border-2',
    md: 'w-11 h-11 text-base border-3',
    lg: 'w-14 h-14 text-2xl border-4',
    xl: 'w-20 h-20 text-4xl border-4'
  };

  const statusSize = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5'
  };

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full border-white shadow-md shadow-sky-200/60 overflow-hidden flex items-center justify-center select-none bg-white`}>
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : isTeacher ? (
          <div className="w-full h-full bg-gradient-to-tr from-amber-300 to-rose-300 flex items-center justify-center text-xl">👩‍🏫</div>
        ) : isParent ? (
          <div className="w-full h-full bg-gradient-to-tr from-emerald-300 to-teal-300 flex items-center justify-center text-xl">👨‍👩‍👧</div>
        ) : isBoy ? (
          <div className="w-full h-full p-0.5"><Illustration name="laki_laki" alt={name} /></div>
        ) : (
          <div className="w-full h-full p-0.5"><Illustration name="perempuan" alt={name} /></div>
        )}
      </div>
      {showOnlineStatus && <span className={`absolute bottom-0 right-0 ${statusSize[size]} bg-emerald-400 border-2 border-white rounded-full ring-2 ring-emerald-200`} title="Online" />}
    </div>
  );
};
