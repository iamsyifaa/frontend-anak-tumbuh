import { Habit, ActivityHistory, BadgeItem, CertificateItem, RankingUserItem } from '../types';

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-1',
    title: 'Salat Subuh & Doa Pagi',
    category: 'Spiritual & Karakter',
    description: 'Melaksanakan ibadah di awal hari dengan khusyuk dan membaca doa kelancaran belajar.',
    points: 50,
    timeTarget: '04.30 - 05.15 WIB',
    iconName: 'Sun',
    bgPastel: 'bg-amber-50/90 hover:bg-amber-100/90 text-amber-900 border-amber-200',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    isLocked: true,
    completedAt: '04:45 WIB',
    initiative: 'Sadar Sendiri',
    reflection: 'Alhamdulillah bangun sebelum azan dan tepat waktu.'
  },
  {
    id: 'habit-2',
    title: 'Olahraga & Peregangan',
    category: 'Kesehatan Fisik',
    description: 'Lakukan senam ringan, jalan kaki, atau peregangan tubuh minimal 15 menit.',
    points: 40,
    timeTarget: '05.30 - 06.00 WIB',
    iconName: 'Dumbbell',
    bgPastel: 'bg-emerald-50/90 hover:bg-emerald-100/90 text-emerald-900 border-emerald-200',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800',
    isLocked: true,
    completedAt: '05:40 WIB',
    initiative: 'Sadar Sendiri',
    reflection: 'Jumping jack 20x dan push up 15x, terasa segar!'
  },
  {
    id: 'habit-3',
    title: 'Sarapan Bergizi & Air Putih',
    category: 'Nutrisi Sehat',
    description: 'Makan makanan bernutrisi seimbang dan minum 2 gelas air putih sebelum berangkat.',
    points: 30,
    timeTarget: '06.00 - 06.30 WIB',
    iconName: 'Utensils',
    bgPastel: 'bg-sky-50/90 hover:bg-sky-100/90 text-sky-900 border-sky-200',
    borderColor: 'border-sky-200',
    textColor: 'text-sky-800',
    isLocked: false,
  },
  {
    id: 'habit-4',
    title: 'Merapikan Tempat Tidur',
    category: 'Kemandirian',
    description: 'Melipat selimut, merapikan bantal, dan membersihkan kamar sendiri.',
    points: 35,
    timeTarget: '06.15 - 06.45 WIB',
    iconName: 'Bed',
    bgPastel: 'bg-indigo-50/90 hover:bg-indigo-100/90 text-indigo-900 border-indigo-200',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-800',
    isLocked: false,
  },
  {
    id: 'habit-5',
    title: 'Membaca Buku 30 Menit',
    category: 'Literasi & Edukasi',
    description: 'Membaca buku pelajaran, novel sains, atau bacaan edukatif di luar jam sekolah.',
    points: 60,
    timeTarget: '16.00 - 17.00 WIB',
    iconName: 'BookOpen',
    bgPastel: 'bg-purple-50/90 hover:bg-purple-100/90 text-purple-900 border-purple-200',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    isLocked: false,
  },
  {
    id: 'habit-6',
    title: 'Membantu Orang Tua',
    category: 'Bakti & Kebaikan',
    description: 'Membantu menyapu rumah, mencuci piring, atau menjaga adik dengan ikhlas.',
    points: 45,
    timeTarget: '17.00 - 18.00 WIB',
    iconName: 'HeartHandshake',
    bgPastel: 'bg-rose-50/90 hover:bg-rose-100/90 text-rose-900 border-rose-200',
    borderColor: 'border-rose-200',
    textColor: 'text-rose-800',
    isLocked: false,
  },
  {
    id: 'habit-7',
    title: 'Belajar & Mengaji Malam',
    category: 'Pengembangan Diri',
    description: 'Mengulang materi pelajaran esok hari serta membaca Al-Quran/Kitab Suci.',
    points: 50,
    timeTarget: '19.00 - 20.30 WIB',
    iconName: 'GraduationCap',
    bgPastel: 'bg-teal-50/90 hover:bg-teal-100/90 text-teal-900 border-teal-200',
    borderColor: 'border-teal-200',
    textColor: 'text-teal-800',
    isLocked: false,
  }
];

export const INITIAL_HISTORIES: ActivityHistory[] = [
  {
    id: 'hist-1',
    habitId: 'habit-1',
    habitTitle: 'Salat Subuh & Doa Pagi',
    date: 'Hari Ini, 12 Agustus 2026',
    time: '04.45 WIB',
    pointsEarned: 50,
    initiative: 'Sadar Sendiri',
    reflection: 'Bangun tepat waktu jam 04.20. Melaksanakan salat berjamaah di masjid kompleks.',
    comments: [
      {
        id: 'c-101',
        senderName: 'Ibu Maya Indriani, S.Pd.',
        senderRole: 'Wali Kelas',
        avatarEmoji: '👩‍🏫',
        avatarBg: 'from-amber-400 to-rose-400 border-amber-300',
        content: 'Luar biasa Rizky! Konsistensi bangun subuh mandiri ini menjadi teladan yang baik untuk kawan-kawan di kelas. Pertahankan ya!',
        timestamp: '06.10 WIB'
      },
      {
        id: 'c-102',
        senderName: 'Ahmad Rizky (Anda)',
        senderRole: 'Siswa',
        avatarEmoji: '👦',
        avatarBg: 'from-sky-400 to-indigo-500 border-sky-300',
        content: 'Terima kasih banyak Ibu Maya! Saya juga dibantu oleh alarm buatan sendiri dan pengingat dari ibu di rumah.',
        timestamp: '06.25 WIB'
      }
    ]
  },
  {
    id: 'hist-2',
    habitId: 'habit-2',
    habitTitle: 'Olahraga & Peregangan',
    date: 'Hari Ini, 12 Agustus 2026',
    time: '05.40 WIB',
    pointsEarned: 40,
    initiative: 'Sadar Sendiri',
    reflection: 'Jumping jack 20x, push up 15x, dan jogging pendek di halaman rumah.',
    comments: [
      {
        id: 'c-201',
        senderName: 'Ibu Maya Indriani, S.Pd.',
        senderRole: 'Wali Kelas',
        avatarEmoji: '👩‍🏫',
        avatarBg: 'from-amber-400 to-rose-400 border-amber-300',
        content: 'Bagus sekali! Olahraga sebelum jam sekolah membuat pikiran lebih fokus saat menerima pelajaran jam pertama.',
        timestamp: '07.00 WIB'
      }
    ]
  },
  {
    id: 'hist-3',
    habitId: 'habit-5',
    habitTitle: 'Membaca Buku 30 Menit',
    date: 'Kemarin, 11 Agustus 2026',
    time: '16.30 WIB',
    pointsEarned: 60,
    initiative: 'Sadar Sendiri',
    reflection: 'Membaca bab 4 tentang Tata Surya di buku Sains Populer Remaja. Menemukan fakta menarik tentang Planet Yupiter.',
    comments: [
      {
        id: 'c-301',
        senderName: 'Ibu Maya Indriani, S.Pd.',
        senderRole: 'Wali Kelas',
        avatarEmoji: '👩‍🏫',
        avatarBg: 'from-amber-400 to-rose-400 border-amber-300',
        content: 'Wah menarik sekali! Nanti saat jam pembelajaran IPA, Rizky boleh berbagi cerita singkat tentang Yupiter ke depan kelas ya.',
        timestamp: '18.15 WIB'
      },
      {
        id: 'c-302',
        senderName: 'Ahmad Rizky (Anda)',
        senderRole: 'Siswa',
        avatarEmoji: '👦',
        avatarBg: 'from-sky-400 to-indigo-500 border-sky-300',
        content: 'Siap Bu Maya, saya sudah membuat rangkuman poin utamanya di buku catatan!',
        timestamp: '19.05 WIB'
      }
    ]
  },
  {
    id: 'hist-4',
    habitId: 'habit-6',
    habitTitle: 'Membantu Orang Tua',
    date: 'Kemarin, 11 Agustus 2026',
    time: '17.30 WIB',
    pointsEarned: 45,
    initiative: 'Disuruh',
    reflection: 'Disuruh ibu menyapu ruang tamu dan membuang sampah ke tempat penampungan luar.',
    comments: [
      {
        id: 'c-401',
        senderName: 'Ibu Maya Indriani, S.Pd.',
        senderRole: 'Wali Kelas',
        avatarEmoji: '👩‍🏫',
        avatarBg: 'from-amber-400 to-rose-400 border-amber-300',
        content: 'Tetap patut diapresiasi Rizky! Langkah awal dari disuruh nantinya akan menjadi kebiasaan sadar sendiri. Semangat!',
        timestamp: '20.00 WIB'
      }
    ]
  }
];

export const INITIAL_BADGES: BadgeItem[] = [
  {
    id: 'badge-1',
    title: 'Pejuang Pagi',
    category: 'Kedisiplinan',
    description: 'Berhasil menyelesaikan ibadah & persiapan pagi sebelum pukul 06.00 WIB selama 7 hari berturut-turut.',
    iconName: 'Sun',
    isUnlocked: true,
    unlockedDate: '05 Agustus 2026'
  },
  {
    id: 'badge-2',
    title: 'Bintang Literasi',
    category: 'Edukasi',
    description: 'Membaca buku non-pelajaran lebih dari 300 menit dalam kurun waktu satu bulan.',
    iconName: 'BookOpen',
    isUnlocked: true,
    unlockedDate: '08 Agustus 2026'
  },
  {
    id: 'badge-3',
    title: 'Anak Mandiri',
    category: 'Karakter',
    description: 'Mengisi 20 kebiasaan harian dengan inisiatif "Sadar Sendiri" tanpa perlu diingatkan.',
    iconName: 'Sparkles',
    isUnlocked: true,
    unlockedDate: '10 Agustus 2026'
  },
  {
    id: 'badge-4',
    title: 'Konsistensi Emas 30 Hari',
    category: 'Pencapaian Tinggi',
    description: 'Mempertahankan streak kebiasaan harian tanpa putus selama 30 hari berturut-turut.',
    iconName: 'Flame',
    isUnlocked: false,
    progressText: '12 / 30 Hari'
  },
  {
    id: 'badge-5',
    title: 'Raja Kebaikan Rumah',
    category: 'Bakti & Karakter',
    description: 'Membantu orang tua di rumah sebanyak 15 kali dalam kurun waktu dua minggu.',
    iconName: 'HeartHandshake',
    isUnlocked: false,
    progressText: '8 / 15 Kali'
  },
  {
    id: 'badge-6',
    title: 'Juara Poin Angkatan',
    category: 'Kompetisi Sehat',
    description: 'Berhasil menduduki peringkat Top 3 dalam leaderboard angkatan sekolah.',
    iconName: 'Trophy',
    isUnlocked: false,
    progressText: 'Peringkat 5 Angkatan'
  }
];

export const INITIAL_CERTIFICATES: CertificateItem[] = [
  {
    id: 'cert-1',
    title: 'Piagam Penghargaan Siswa Mandiri Teladan',
    period: 'Bulan Juli 2026',
    issueDate: '01 Agustus 2026',
    issuerName: 'Dra. Endang Sulistyo, M.Pd.',
    issuerRole: 'Kepala Sekolah SMP ANAKTUMBUH.ID',
    certificateNumber: 'CERT/AT-ID/2026/07/042',
    description: 'Diberikan kepada Ahmad Rizky atas dedikasi dan konsistensi tinggi dalam menerapkan kebiasaan positif harian dengan inisiatif mandiri secara berkelanjutan.'
  },
  {
    id: 'cert-2',
    title: 'Sertifikat Puncak Streak Pagi Hari',
    period: 'Minggu Ke-1 Agustus 2026',
    issueDate: '07 Agustus 2026',
    issuerName: 'Ibu Maya Indriani, S.Pd.',
    issuerRole: 'Wali Kelas VIII-B',
    certificateNumber: 'CERT/AT-ID/2026/08/019',
    description: 'Penghargaan atas keaktifan luar biasa dalam pembiasaan salat subuh, olahraga pagi, dan kerapian diri tanpa pernah terputus.'
  }
];

export const RANKING_KELAS: RankingUserItem[] = [
  {
    rank: 1,
    id: 'user-2',
    name: 'Siti Nur Aisyah',
    className: 'Kelas VIII-B',
    points: 1620,
    streak: 18,
    level: 6,
    avatarEmoji: '👧',
    avatarBg: 'from-pink-400 to-rose-500 border-pink-300',
    isCurrentUser: false
  },
  {
    rank: 2,
    id: 'user-3',
    name: 'Bagas Prasetyo',
    className: 'Kelas VIII-B',
    points: 1510,
    streak: 15,
    level: 5,
    avatarEmoji: '👦',
    avatarBg: 'from-amber-400 to-orange-500 border-amber-300',
    isCurrentUser: false
  },
  {
    rank: 3,
    id: 'user-1',
    name: 'Ahmad Rizky (Anda)',
    className: 'Kelas VIII-B',
    points: 1450,
    streak: 12,
    level: 5,
    avatarEmoji: '👦',
    avatarBg: 'from-sky-400 to-indigo-500 border-sky-300',
    isCurrentUser: true
  },
  {
    rank: 4,
    id: 'user-4',
    name: 'Dewi Anjani',
    className: 'Kelas VIII-B',
    points: 1380,
    streak: 10,
    level: 4,
    avatarEmoji: '👧',
    avatarBg: 'from-purple-400 to-indigo-500 border-purple-300',
    isCurrentUser: false
  },
  {
    rank: 5,
    id: 'user-5',
    name: 'Fikri Ramadhan',
    className: 'Kelas VIII-B',
    points: 1290,
    streak: 9,
    level: 4,
    avatarEmoji: '👦',
    avatarBg: 'from-teal-400 to-emerald-500 border-teal-300',
    isCurrentUser: false
  },
  {
    rank: 6,
    id: 'user-6',
    name: 'Nadia Putri',
    className: 'Kelas VIII-B',
    points: 1210,
    streak: 7,
    level: 4,
    avatarEmoji: '👧',
    avatarBg: 'from-rose-400 to-red-500 border-rose-300',
    isCurrentUser: false
  }
];

export const RANKING_ANGKATAN: RankingUserItem[] = [
  {
    rank: 1,
    id: 'user-101',
    name: 'Muhammad Farhan',
    className: 'Kelas VIII-A',
    points: 1890,
    streak: 25,
    level: 7,
    avatarEmoji: '🚀',
    avatarBg: 'from-blue-500 to-indigo-600 border-blue-400',
    isCurrentUser: false
  },
  {
    rank: 2,
    id: 'user-2',
    name: 'Siti Nur Aisyah',
    className: 'Kelas VIII-B',
    points: 1620,
    streak: 18,
    level: 6,
    avatarEmoji: '👧',
    avatarBg: 'from-pink-400 to-rose-500 border-pink-300',
    isCurrentUser: false
  },
  {
    rank: 3,
    id: 'user-102',
    name: 'Keisha Amanda',
    className: 'Kelas VIII-C',
    points: 1580,
    streak: 16,
    level: 6,
    avatarEmoji: '⭐',
    avatarBg: 'from-amber-400 to-yellow-500 border-amber-300',
    isCurrentUser: false
  },
  {
    rank: 4,
    id: 'user-3',
    name: 'Bagas Prasetyo',
    className: 'Kelas VIII-B',
    points: 1510,
    streak: 15,
    level: 5,
    avatarEmoji: '👦',
    avatarBg: 'from-amber-400 to-orange-500 border-amber-300',
    isCurrentUser: false
  },
  {
    rank: 5,
    id: 'user-1',
    name: 'Ahmad Rizky (Anda)',
    className: 'Kelas VIII-B',
    points: 1450,
    streak: 12,
    level: 5,
    avatarEmoji: '👦',
    avatarBg: 'from-sky-400 to-indigo-500 border-sky-300',
    isCurrentUser: true
  },
  {
    rank: 6,
    id: 'user-103',
    name: 'Rian Hidayat',
    className: 'Kelas VIII-A',
    points: 1410,
    streak: 11,
    level: 5,
    avatarEmoji: '👦',
    avatarBg: 'from-cyan-400 to-blue-500 border-cyan-300',
    isCurrentUser: false
  }
];
