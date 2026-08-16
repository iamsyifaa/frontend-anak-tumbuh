export type TabType = 'beranda' | 'kebiasaan' | 'pencapaian' | 'ranking';

export type InitiativeType = 'Sadar Sendiri' | 'Disuruh' | '';

export interface Habit {
  id: string;
  title: string;
  category: string;
  description: string;
  points: number;
  timeTarget: string;
  iconName: string;
  bgPastel: string;
  borderColor: string;
  textColor: string;
  isLocked: boolean;
  completedAt?: string;
  initiative?: InitiativeType;
  reflection?: string;
}

export interface CommentItem {
  id: string;
  senderName: string;
  senderRole: 'Wali Kelas' | 'Siswa' | 'Orang Tua';
  avatarEmoji?: string;
  avatarBg?: string;
  content: string;
  timestamp: string;
  isAudioSimulated?: boolean;
}

export interface ActivityHistory {
  id: string;
  habitId: string;
  habitTitle: string;
  date: string;
  time: string;
  pointsEarned: number;
  initiative: 'Sadar Sendiri' | 'Disuruh';
  reflection: string;
  comments: CommentItem[];
}

export interface BadgeItem {
  id: string;
  title: string;
  category: string;
  description: string;
  iconName: string;
  isUnlocked: boolean;
  unlockedDate?: string;
  progressText?: string;
}

export interface CertificateItem {
  id: string;
  title: string;
  period: string;
  issueDate: string;
  issuerName: string;
  issuerRole: string;
  certificateNumber: string;
  description: string;
}

export interface RankingUserItem {
  rank: number;
  id: string;
  name: string;
  className: string;
  points: number;
  streak: number;
  level: number;
  avatarEmoji?: string;
  avatarBg?: string;
  avatarUrl?: string;
  isCurrentUser: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
}