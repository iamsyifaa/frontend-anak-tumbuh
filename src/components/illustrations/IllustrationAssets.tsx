import React from "react";

export type IllustrationType =
  | "karakter_utama"
  | "bintang"
  | "awan"
  | "matahari"
  | "laki_laki"
  | "perempuan"
  | "bangun_tidur"
  | "berdoa"
  | "baca_buku"
  | "makan"
  | "bermain_bola"
  | "menyapu"
  | "tidur"
  | "mengacungkan_jempol";

interface IllustrationProps {
  name: IllustrationType;
  className?: string;
  alt?: string;
}

export const Illustration: React.FC<IllustrationProps> = ({
  name,
  className = "w-full h-full object-contain",
  alt = "Ilustrasi Anak",
}) => {
  // Detailed SVG Renderers for the 14 uploaded kid illustrations
  switch (name) {
    case "karakter_utama":
      return (
        <div
          className={`relative flex items-center justify-center ${className}`}
          title={alt}
        >
          {/* Main Hero Jumping Kids Illustration (Boy & Girl Jumping Ceria) */}
          <svg
            viewBox="0 0 400 320"
            className="w-full h-full drop-shadow-md select-none"
          >
            <defs>
              <linearGradient id="skyGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
              <linearGradient id="girlDress" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#db2777" />
              </linearGradient>
              <linearGradient id="boyShirt" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>

            {/* Sparkles around kids */}
            <g className="animate-pulse">
              <path
                d="M 60 80 L 64 68 L 76 64 L 64 60 L 60 48 L 56 60 L 44 64 L 56 68 Z"
                fill="#fbbf24"
              />
              <path
                d="M 340 70 L 344 58 L 356 54 L 344 50 L 340 38 L 336 50 L 324 54 L 336 58 Z"
                fill="#fbbf24"
              />
              <circle cx="90" cy="120" r="4" fill="#f43f5e" />
              <circle cx="310" cy="110" r="5" fill="#38bdf8" />
              <circle cx="200" cy="40" r="6" fill="#facc15" />
            </g>

            {/* BOY (Left) */}
            <g transform="translate(40, 30)">
              {/* Left raised arm */}
              <path
                d="M 90 140 Q 50 100 40 70 Q 55 60 70 85 Q 85 105 100 135"
                fill="#fed7aa"
                stroke="#c2410c"
                strokeWidth="2"
              />
              {/* Hand */}
              <circle
                cx="42"
                cy="65"
                r="14"
                fill="#fed7aa"
                stroke="#c2410c"
                strokeWidth="2"
              />
              {/* Right raised arm */}
              <path
                d="M 125 140 Q 155 115 170 95 Q 180 105 165 125 Q 145 145 125 155"
                fill="#fed7aa"
                stroke="#c2410c"
                strokeWidth="2"
              />
              <circle
                cx="172"
                cy="98"
                r="13"
                fill="#fed7aa"
                stroke="#c2410c"
                strokeWidth="2"
              />

              {/* Legs in jump pose */}
              <path
                d="M 95 210 Q 80 250 70 270"
                stroke="#fed7aa"
                strokeWidth="16"
                strokeLinecap="round"
              />
              <path
                d="M 125 210 Q 145 245 155 265"
                stroke="#fed7aa"
                strokeWidth="16"
                strokeLinecap="round"
              />
              {/* Blue Shoes */}
              <ellipse cx="65" cy="275" rx="16" ry="10" fill="#0284c7" />
              <ellipse cx="160" cy="270" rx="16" ry="10" fill="#0284c7" />

              {/* Shorts */}
              <path
                d="M 85 190 L 135 190 L 140 220 L 115 220 L 110 205 L 105 220 L 80 220 Z"
                fill="#1e40af"
              />

              {/* T-Shirt */}
              <path
                d="M 85 130 Q 110 120 135 130 L 140 195 L 80 195 Z"
                fill="url(#boyShirt)"
              />
              <rect
                x="80"
                y="155"
                width="60"
                height="12"
                fill="#ffffff"
                rx="4"
              />

              {/* Head & Face */}
              <ellipse cx="110" cy="90" rx="36" ry="34" fill="#fed7aa" />
              {/* Cheeks */}
              <ellipse
                cx="88"
                cy="98"
                rx="8"
                ry="5"
                fill="#fb7185"
                opacity="0.6"
              />
              <ellipse
                cx="132"
                cy="98"
                rx="8"
                ry="5"
                fill="#fb7185"
                opacity="0.6"
              />
              {/* Eyes */}
              <circle cx="96" cy="86" r="6" fill="#1e293b" />
              <circle cx="98" cy="84" r="2" fill="#ffffff" />
              <circle cx="124" cy="86" r="6" fill="#1e293b" />
              <circle cx="126" cy="84" r="2" fill="#ffffff" />
              {/* Eyebrows */}
              <path
                d="M 90 74 Q 96 70 102 74"
                stroke="#451a03"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 118 74 Q 124 70 130 74"
                stroke="#451a03"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              {/* Smile */}
              <path
                d="M 100 100 Q 110 116 120 100 Z"
                fill="#e11d48"
                stroke="#be123c"
                strokeWidth="1.5"
              />

              {/* Hair */}
              <path
                d="M 72 80 Q 80 45 110 45 Q 145 45 150 75 Q 155 90 148 100 Q 146 72 135 60 Q 115 55 95 62 Q 80 72 72 80 Z"
                fill="#451a03"
              />
            </g>

            {/* GIRL (Right) */}
            <g transform="translate(190, 20)">
              {/* Raised arms */}
              <path
                d="M 75 140 Q 45 110 35 85 Q 45 75 60 95 Q 75 115 85 140"
                fill="#fce7f3"
                stroke="#be185d"
                strokeWidth="2"
              />
              <circle
                cx="35"
                cy="80"
                r="13"
                fill="#fed7aa"
                stroke="#be185d"
                strokeWidth="1.5"
              />
              <path
                d="M 125 140 Q 165 105 180 80 Q 190 90 175 115 Q 150 145 130 155"
                fill="#fce7f3"
                stroke="#be185d"
                strokeWidth="2"
              />
              <circle
                cx="185"
                cy="80"
                r="13"
                fill="#fed7aa"
                stroke="#be185d"
                strokeWidth="1.5"
              />

              {/* Jump Legs */}
              <path
                d="M 90 220 Q 75 255 70 275"
                stroke="#fed7aa"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d="M 120 220 Q 135 255 145 270"
                stroke="#fed7aa"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Pink Shoes */}
              <ellipse cx="68" cy="280" rx="14" ry="9" fill="#ec4899" />
              <ellipse cx="150" cy="275" rx="14" ry="9" fill="#ec4899" />

              {/* Dress Skirt */}
              <path
                d="M 85 170 L 125 170 L 150 225 L 60 225 Z"
                fill="url(#girlDress)"
              />
              {/* Yellow inner shirt */}
              <path
                d="M 85 130 Q 105 120 125 130 L 125 170 L 85 170 Z"
                fill="#fde047"
              />

              {/* Head & Face */}
              <ellipse cx="105" cy="90" rx="34" ry="32" fill="#fed7aa" />
              {/* Cheeks */}
              <ellipse
                cx="85"
                cy="96"
                rx="8"
                ry="5"
                fill="#fb7185"
                opacity="0.7"
              />
              <ellipse
                cx="125"
                cy="96"
                rx="8"
                ry="5"
                fill="#fb7185"
                opacity="0.7"
              />
              {/* Eyes */}
              <circle cx="93" cy="85" r="6" fill="#1e293b" />
              <circle cx="95" cy="83" r="2" fill="#ffffff" />
              <circle cx="117" cy="85" r="6" fill="#1e293b" />
              <circle cx="119" cy="83" r="2" fill="#ffffff" />
              {/* Smile */}
              <path d="M 97 98 Q 105 114 113 98 Z" fill="#e11d48" />

              {/* Long Hair & Pink Ribbon */}
              <path
                d="M 68 85 Q 65 140 50 160 Q 75 145 75 105 Z"
                fill="#381b0e"
              />
              <path
                d="M 142 85 Q 145 140 160 160 Q 135 145 135 105 Z"
                fill="#381b0e"
              />
              <path
                d="M 70 80 Q 75 45 105 45 Q 135 45 140 80 Q 135 60 105 58 Q 78 60 70 80 Z"
                fill="#381b0e"
              />
              {/* Bow Ribbon */}
              <circle cx="138" cy="50" r="7" fill="#f43f5e" />
              <ellipse cx="128" cy="46" rx="9" ry="6" fill="#f43f5e" />
              <ellipse cx="148" cy="54" rx="9" ry="6" fill="#f43f5e" />
            </g>
          </svg>
        </div>
      );

    case "bintang":
      return (
        <div
          className={`relative flex items-center justify-center ${className}`}
          title={alt}
        >
          {/* Smiling Golden Star */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-md select-none"
          >
            <defs>
              <linearGradient id="starGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="30%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
            </defs>
            {/* Star Body */}
            <path
              d="M 50 8 C 52 8 54 13 58 24 C 62 35 68 39 79 40 C 90 41 95 44 94 48 C 93 52 86 58 77 65 C 68 72 65 77 68 88 C 71 99 68 102 64 99 C 60 96 50 88 40 94 C 30 100 27 97 30 86 C 33 75 30 70 21 63 C 12 56 5 50 4 46 C 3 42 8 39 19 38 C 30 37 36 33 40 22 C 44 11 48 8 50 8 Z"
              fill="url(#starGrad)"
              stroke="#ca8a04"
              strokeWidth="2.5"
            />
            {/* Highlights */}
            <path
              d="M 50 14 C 48 24 43 32 34 37 C 25 42 16 43 14 44 C 18 43 28 41 36 34 C 44 27 48 18 50 14 Z"
              fill="#ffffff"
              opacity="0.6"
            />
            {/* Cheeks */}
            <circle cx="34" cy="56" r="6" fill="#f87171" opacity="0.6" />
            <circle cx="66" cy="56" r="6" fill="#f87171" opacity="0.6" />
            {/* Cute Eyes */}
            <ellipse cx="38" cy="48" rx="4.5" ry="6" fill="#0f172a" />
            <circle cx="39.5" cy="46" r="2" fill="#ffffff" />
            <ellipse cx="62" cy="48" rx="4.5" ry="6" fill="#0f172a" />
            <circle cx="63.5" cy="46" r="2" fill="#ffffff" />
            {/* Smile */}
            <path d="M 44 56 Q 50 66 56 56 Z" fill="#b91c1c" />
            {/* Sparkles */}
            <circle cx="20" cy="20" r="2" fill="#fde047" />
            <circle cx="80" cy="22" r="3" fill="#fde047" />
          </svg>
        </div>
      );

    case "awan":
      return (
        <div
          className={`relative flex items-center justify-center ${className}`}
          title={alt}
        >
          {/* Fluffy White Cloud */}
          <svg
            viewBox="0 0 120 70"
            className="w-full h-full drop-shadow-sm select-none"
          >
            <defs>
              <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="85%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#e0f2fe" />
              </linearGradient>
            </defs>
            <path
              d="M 25 55 C 12 55 5 45 8 34 C 11 23 23 20 28 22 C 32 10 48 5 62 10 C 72 4 90 8 95 20 C 105 18 115 28 112 40 C 110 52 98 55 88 55 Z"
              fill="url(#cloudGrad)"
              stroke="#bae6fd"
              strokeWidth="2"
            />
          </svg>
        </div>
      );

    case "matahari":
      return (
        <div
          className={`relative flex items-center justify-center ${className}`}
          title={alt}
        >
          {/* Cheerful Smiling Sun */}
          <svg
            viewBox="0 0 120 120"
            className="w-full h-full drop-shadow-md select-none"
          >
            <defs>
              <linearGradient id="sunGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            {/* Sun Rays */}
            <g className="animate-sun-spin origin-center">
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
                (deg) => (
                  <path
                    key={deg}
                    d="M 60 10 L 66 26 L 54 26 Z"
                    fill="#fbbf24"
                    transform={`rotate(${deg} 60 60)`}
                  />
                ),
              )}
            </g>
            {/* Sun Center */}
            <circle
              cx="60"
              cy="60"
              r="34"
              fill="url(#sunGrad)"
              stroke="#f59e0b"
              strokeWidth="2"
            />
            {/* Face */}
            <circle cx="48" cy="64" r="5" fill="#f87171" opacity="0.6" />
            <circle cx="72" cy="64" r="5" fill="#f87171" opacity="0.6" />
            <circle cx="50" cy="56" r="4.5" fill="#1e293b" />
            <circle cx="51.5" cy="54.5" r="1.5" fill="#ffffff" />
            <circle cx="70" cy="56" r="4.5" fill="#1e293b" />
            <circle cx="71.5" cy="54.5" r="1.5" fill="#ffffff" />
            {/* Big Smile */}
            <path d="M 52 64 Q 60 74 68 64 Z" fill="#b91c1c" />
          </svg>
        </div>
      );

    case "laki_laki":
      return (
        <img
          src="/image/laki_laki.png"
          alt={alt}
          className={`${className} object-cover select-none`}
        />
      );

    case "perempuan":
      return (
        <div
          className={`relative flex items-center justify-center ${className}`}
          title={alt}
        >
          {/* Cartoon Girl Avatar */}
          <svg viewBox="0 0 100 100" className="w-full h-full select-none">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="#f472b6"
              stroke="#ffffff"
              strokeWidth="4"
            />
            <ellipse cx="50" cy="56" rx="27" ry="25" fill="#fed7aa" />
            {/* Shirt */}
            <path
              d="M 25 88 C 25 72 38 68 50 68 C 62 68 75 72 75 88 Z"
              fill="#ec4899"
            />
            {/* Hair */}
            <path
              d="M 22 55 C 20 30 35 20 50 20 C 65 20 80 30 78 55 C 74 38 62 32 50 32 C 38 32 26 38 22 55 Z"
              fill="#381b0e"
            />
            {/* Pink Ribbon Headband */}
            <path
              d="M 26 38 Q 50 24 74 38"
              stroke="#f43f5e"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="68" cy="30" r="6" fill="#fb7185" />
            {/* Eyes */}
            <circle cx="41" cy="52" r="4" fill="#0f172a" />
            <circle cx="42" cy="50.5" r="1.5" fill="#ffffff" />
            <circle cx="59" cy="52" r="4" fill="#0f172a" />
            <circle cx="60" cy="50.5" r="1.5" fill="#ffffff" />
            {/* Blush */}
            <circle cx="35" cy="57" r="4" fill="#fb7185" opacity="0.6" />
            <circle cx="65" cy="57" r="4" fill="#fb7185" opacity="0.6" />
            {/* Smile */}
            <path d="M 45 60 Q 50 67 55 60 Z" fill="#e11d48" />
          </svg>
        </div>
      );

    case "bangun_tidur":
      return (
        <div
          className={`relative flex items-center justify-center ${className}`}
          title={alt}
        >
          {/* Bangun Pagi: Anak Bangun Tidur Merentangkan Tangan */}
          <svg viewBox="0 0 160 140" className="w-full h-full select-none">
            {/* Window background with Morning Sun */}
            <rect
              x="25"
              y="15"
              width="110"
              height="70"
              rx="12"
              fill="#bae6fd"
              stroke="#7dd3fc"
              strokeWidth="2"
            />
            <circle cx="105" cy="35" r="18" fill="#facc15" />
            {/* Bed Headboard */}
            <rect x="15" y="65" width="130" height="65" rx="8" fill="#ca8a04" />
            <rect x="20" y="70" width="120" height="55" rx="6" fill="#fef08a" />
            {/* Blue Bed Cover with Stars */}
            <path
              d="M 20 85 Q 80 80 140 85 L 140 130 L 20 130 Z"
              fill="#38bdf8"
            />
            {/* Pillow */}
            <rect
              x="35"
              y="55"
              width="90"
              height="25"
              rx="10"
              fill="#f1f5f9"
              stroke="#cbd5e1"
              strokeWidth="1"
            />
            {/* Stretching Boy */}
            <ellipse cx="80" cy="55" rx="18" ry="17" fill="#fed7aa" />
            <path
              d="M 64 50 C 64 36 74 34 80 34 C 88 34 96 38 96 50 Z"
              fill="#451a03"
            />
            {/* Raised stretching arms */}
            <path
              d="M 65 72 L 45 42"
              stroke="#fed7aa"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M 95 72 L 115 42"
              stroke="#fed7aa"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Pajamas */}
            <path d="M 65 68 L 95 68 L 95 95 L 65 95 Z" fill="#0284c7" />
            {/* Happy Closed/Smiling Eyes */}
            <path
              d="M 72 53 Q 76 50 80 53"
              stroke="#1e293b"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 80 53 Q 84 50 88 53"
              stroke="#1e293b"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <path d="M 76 60 Q 80 65 84 60 Z" fill="#e11d48" />
          </svg>
        </div>
      );

    case "berdoa":
      return (
        <div
          className={`relative flex items-center justify-center ${className}`}
          title={alt}
        >
          {/* Beribadah: Anak Berdoa */}
          <svg viewBox="0 0 160 140" className="w-full h-full select-none">
            {/* Soft Glow */}
            <circle cx="80" cy="70" r="55" fill="#fef3c7" opacity="0.6" />
            {/* Boy (Left with Songkok/Peci) */}
            <g transform="translate(15, 10)">
              <ellipse cx="40" cy="55" rx="18" ry="17" fill="#fed7aa" />
              {/* White Songkok */}
              <rect
                x="25"
                y="32"
                width="30"
                height="12"
                rx="4"
                fill="#f8fafc"
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              {/* White Baju Koko */}
              <path
                d="M 24 70 L 56 70 L 60 115 L 20 115 Z"
                fill="#ffffff"
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              {/* Hands raised in dua prayer */}
              <path
                d="M 32 75 Q 40 65 48 75"
                stroke="#fed7aa"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
              />
              {/* Peaceful Eyes */}
              <path
                d="M 32 55 Q 36 58 40 55"
                stroke="#334155"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M 40 55 Q 44 58 48 55"
                stroke="#334155"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M 38 64 Q 40 67 42 64"
                stroke="#e11d48"
                strokeWidth="1.5"
                fill="none"
              />
            </g>
            {/* Girl (Right with Pink Hijab) */}
            <g transform="translate(75, 10)">
              {/* Pink Hijab Frame */}
              <path
                d="M 20 50 C 20 28 35 25 50 25 C 65 25 80 28 80 50 C 80 90 75 115 50 115 C 25 115 20 90 20 50 Z"
                fill="#f472b6"
              />
              <ellipse cx="50" cy="55" rx="16" ry="15" fill="#fed7aa" />
              {/* Hands in prayer */}
              <path
                d="M 42 75 Q 50 65 58 75"
                stroke="#fed7aa"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
              />
              {/* Eyes */}
              <path
                d="M 43 55 Q 47 58 51 55"
                stroke="#334155"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M 51 55 Q 55 58 59 55"
                stroke="#334155"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M 48 64 Q 50 67 52 64"
                stroke="#e11d48"
                strokeWidth="1.5"
                fill="none"
              />
            </g>
          </svg>
        </div>
      );

    case "baca_buku":
      return (
        <div
          className={`relative flex items-center justify-center ${className}`}
          title={alt}
        >
          {/* Gemar Belajar: Anak Membaca Buku Terbuka */}
          <svg viewBox="0 0 160 140" className="w-full h-full select-none">
            {/* Bookshelf Background */}
            <rect
              x="20"
              y="20"
              width="120"
              height="50"
              rx="6"
              fill="#fef3c7"
              stroke="#fde047"
              strokeWidth="1.5"
            />
            <rect x="25" y="30" width="10" height="35" fill="#38bdf8" />
            <rect x="38" y="25" width="12" height="40" fill="#f43f5e" />
            <rect x="115" y="28" width="14" height="38" fill="#10b981" />
            {/* Girl Reading */}
            <ellipse cx="80" cy="65" rx="20" ry="19" fill="#fed7aa" />
            <path
              d="M 60 60 C 60 40 70 38 80 38 C 90 38 100 40 100 60 Z"
              fill="#451a03"
            />
            <circle cx="95" cy="42" r="5" fill="#ec4899" />
            {/* Curious Eyes focused down */}
            <circle cx="73" cy="65" r="3.5" fill="#0f172a" />
            <circle cx="87" cy="65" r="3.5" fill="#0f172a" />
            <path
              d="M 76 73 Q 80 77 84 73"
              stroke="#e11d48"
              strokeWidth="2"
              fill="none"
            />
            {/* Big Open Book on Wooden Table */}
            <rect
              x="15"
              y="105"
              width="130"
              height="30"
              rx="6"
              fill="#d97706"
            />
            {/* Open Book Pages */}
            <path
              d="M 35 105 Q 80 95 80 118 Q 80 95 125 105 L 120 125 Q 80 115 80 128 Q 80 115 40 125 Z"
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />
            <line
              x1="45"
              y1="112"
              x2="70"
              y2="110"
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
            <line
              x1="45"
              y1="116"
              x2="68"
              y2="114"
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
            <line
              x1="90"
              y1="110"
              x2="115"
              y2="112"
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
            <line
              x1="90"
              y1="114"
              x2="112"
              y2="116"
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      );

    case "makan":
      return (
        <div
          className={`relative flex items-center justify-center ${className}`}
          title={alt}
        >
          {/* Makan Sehat: Anak Sedang Makan Bergizi */}
          <svg viewBox="0 0 160 140" className="w-full h-full select-none">
            {/* Happy Eating Boy */}
            <ellipse cx="80" cy="50" rx="20" ry="19" fill="#fed7aa" />
            <path
              d="M 60 45 C 60 30 70 26 80 26 C 90 26 100 30 100 45 Z"
              fill="#451a03"
            />
            <circle cx="73" cy="48" r="3.5" fill="#0f172a" />
            <circle cx="87" cy="48" r="3.5" fill="#0f172a" />
            <path d="M 76 56 Q 80 64 84 56 Z" fill="#e11d48" />
            {/* Blue Shirt */}
            <path d="M 55 68 L 105 68 L 115 100 L 45 100 Z" fill="#0284c7" />
            {/* Spoon Hand */}
            <path
              d="M 95 75 L 115 65"
              stroke="#fed7aa"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <circle cx="118" cy="62" r="5" fill="#cbd5e1" />
            {/* Big Healthy Plate on Table */}
            <rect x="15" y="95" width="130" height="40" rx="6" fill="#b45309" />
            <ellipse
              cx="80"
              cy="112"
              rx="42"
              ry="18"
              fill="#ffffff"
              stroke="#e2e8f0"
              strokeWidth="2"
            />
            {/* Rice */}
            <ellipse
              cx="65"
              cy="112"
              rx="16"
              ry="10"
              fill="#f8fafc"
              stroke="#cbd5e1"
              strokeWidth="1"
            />
            {/* Chicken Drumstick */}
            <ellipse cx="95" cy="108" rx="14" ry="8" fill="#d97706" />
            {/* Broccoli Greens */}
            <circle cx="80" cy="118" r="6" fill="#16a34a" />
            <circle cx="88" cy="118" r="5" fill="#22c55e" />
          </svg>
        </div>
      );

    case "bermain_bola":
      return (
        <div
          className={`relative flex items-center justify-center ${className}`}
          title={alt}
        >
          {/* Gemar Olahraga: Anak Bermain Bola */}
          <svg viewBox="0 0 160 140" className="w-full h-full select-none">
            {/* Grass & Speed Lines */}
            <path
              d="M 10 120 Q 80 115 150 120"
              stroke="#22c55e"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M 75 105 L 95 105"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="3,3"
            />
            {/* Running Boy */}
            <g transform="translate(45, 15)">
              <ellipse cx="40" cy="35" rx="18" ry="17" fill="#fed7aa" />
              <path
                d="M 24 30 C 24 15 34 12 40 12 C 50 12 58 18 58 30 Z"
                fill="#451a03"
              />
              {/* Happy Face */}
              <circle cx="34" cy="33" r="3" fill="#0f172a" />
              <circle cx="46" cy="33" r="3" fill="#0f172a" />
              <path d="M 37 40 Q 40 46 45 40 Z" fill="#e11d48" />
              {/* Sports Jersey */}
              <path
                d="M 28 50 L 52 50 L 58 75 L 22 75 Z"
                fill="#ffffff"
                stroke="#2563eb"
                strokeWidth="2"
              />
              {/* Blue Shorts */}
              <path d="M 24 75 L 56 75 L 60 90 L 20 90 Z" fill="#1d4ed8" />
              {/* Running Legs */}
              <path
                d="M 28 90 L 15 108"
                stroke="#fed7aa"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 50 90 L 70 100"
                stroke="#fed7aa"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Blue Shoes */}
              <ellipse cx="12" cy="110" rx="8" ry="5" fill="#0284c7" />
              <ellipse cx="74" cy="102" rx="8" ry="5" fill="#0284c7" />
            </g>
            {/* Soccer Ball */}
            <g transform="translate(110, 85)">
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="#ffffff"
                stroke="#0f172a"
                strokeWidth="2"
              />
              {/* Ball Pentagons */}
              <polygon points="20,12 26,16 24,22 16,22 14,16" fill="#0f172a" />
              <polygon points="20,28 26,24 28,30 20,34 12,30" fill="#0f172a" />
            </g>
          </svg>
        </div>
      );

    case "menyapu":
      return (
        <div
          className={`relative flex items-center justify-center ${className}`}
          title={alt}
        >
          {/* Bermasyarakat: Anak Memegang Sapu */}
          <svg viewBox="0 0 160 140" className="w-full h-full select-none">
            {/* Clean Floor & Bed corner */}
            <line
              x1="10"
              y1="120"
              x2="150"
              y2="120"
              stroke="#cbd5e1"
              strokeWidth="3"
            />
            <rect x="15" y="70" width="35" height="50" rx="4" fill="#38bdf8" />
            {/* Diligent Boy */}
            <g transform="translate(55, 15)">
              <ellipse cx="40" cy="35" rx="18" ry="17" fill="#fed7aa" />
              <path
                d="M 24 30 C 24 15 34 12 40 12 C 50 12 58 18 58 30 Z"
                fill="#451a03"
              />
              <circle cx="34" cy="34" r="3" fill="#0f172a" />
              <circle cx="46" cy="34" r="3" fill="#0f172a" />
              <path
                d="M 38 42 Q 40 46 44 42"
                stroke="#e11d48"
                strokeWidth="2"
                fill="none"
              />
              {/* Blue T-Shirt */}
              <path d="M 26 50 L 54 50 L 56 80 L 24 80 Z" fill="#0284c7" />
              {/* Shorts */}
              <path d="M 26 80 L 54 80 L 56 95 L 24 95 Z" fill="#1e3a8a" />
              {/* Legs */}
              <path
                d="M 32 95 L 30 115"
                stroke="#fed7aa"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M 48 95 L 50 115"
                stroke="#fed7aa"
                strokeWidth="7"
                strokeLinecap="round"
              />
              {/* Broom Stick and Bristles */}
              <line
                x1="20"
                y1="55"
                x2="65"
                y2="115"
                stroke="#78350f"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <polygon
                points="60,110 75,115 70,125 55,120"
                fill="#facc15"
                stroke="#ca8a04"
                strokeWidth="1"
              />
            </g>
          </svg>
        </div>
      );

    case "tidur":
      return (
        <div
          className={`relative flex items-center justify-center ${className}`}
          title={alt}
        >
          {/* Tidur Cepat: Anak Terlelap di Kasur dengan Bulan Sabit & Bintang */}
          <svg viewBox="0 0 160 140" className="w-full h-full select-none">
            {/* Night Sky Background */}
            <rect
              x="15"
              y="15"
              width="130"
              height="110"
              rx="14"
              fill="#1e1b4b"
            />
            {/* Glowing Crescent Moon */}
            <path
              d="M 120 28 C 112 28 105 34 105 44 C 105 54 114 62 125 60 C 118 64 108 60 102 52 C 98 44 100 32 108 26 C 112 24 116 26 120 28 Z"
              fill="#fde047"
              filter="drop-shadow(0 0 4px #facc15)"
            />
            {/* Tiny Stars */}
            <circle cx="35" cy="30" r="2" fill="#ffffff" />
            <circle cx="50" cy="40" r="2.5" fill="#fef08a" />
            <circle cx="85" cy="28" r="1.5" fill="#ffffff" />
            <circle cx="95" cy="45" r="2" fill="#fef08a" />
            {/* Bed with Cozy Blue Star Blanket */}
            <rect
              x="25"
              y="65"
              width="110"
              height="55"
              rx="10"
              fill="#312e81"
            />
            <rect x="35" y="55" width="45" height="20" rx="6" fill="#f8fafc" />
            {/* Sleeping Boy Face */}
            <ellipse cx="55" cy="62" rx="14" ry="13" fill="#fed7aa" />
            <path
              d="M 45 58 C 45 48 52 46 58 46 C 64 46 68 50 68 58 Z"
              fill="#451a03"
            />
            {/* Peaceful Sleeping Eyes & Smile */}
            <path
              d="M 50 63 Q 53 66 56 63"
              stroke="#334155"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M 53 68 Q 55 70 57 68"
              stroke="#e11d48"
              strokeWidth="1"
              fill="none"
            />
            {/* Star Blanket */}
            <path
              d="M 30 75 Q 85 68 130 75 L 130 115 L 30 115 Z"
              fill="#2563eb"
            />
            <polygon
              points="60,88 62,93 67,93 63,96 65,101 60,98 55,101 57,96 53,93 58,93"
              fill="#fef08a"
            />
            <polygon
              points="105,85 107,90 112,90 108,93 110,98 105,95 100,98 102,93 98,90 103,90"
              fill="#fef08a"
            />
          </svg>
        </div>
      );

    case "mengacungkan_jempol":
      return (
        <div
          className={`relative flex items-center justify-center ${className}`}
          title={alt}
        >
          {/* Maskot Tips: Anak Mengacungkan Jempol Ceria */}
          <svg
            viewBox="0 0 140 140"
            className="w-full h-full drop-shadow-sm select-none"
          >
            {/* Glow circle */}
            <circle
              cx="70"
              cy="70"
              r="58"
              fill="#e0f2fe"
              stroke="#bae6fd"
              strokeWidth="3"
            />
            {/* Cheerful Boy with Thumbs Up */}
            <ellipse cx="65" cy="55" rx="26" ry="24" fill="#fed7aa" />
            {/* Brown Hair */}
            <path
              d="M 38 48 C 38 22 55 16 68 16 C 84 16 95 24 95 48 C 90 38 78 32 66 34 C 52 32 44 38 38 48 Z"
              fill="#451a03"
            />
            {/* Rosy Cheeks */}
            <circle cx="48" cy="62" r="5" fill="#fb7185" opacity="0.6" />
            <circle cx="82" cy="62" r="5" fill="#fb7185" opacity="0.6" />
            {/* Sparkling Big Eyes */}
            <ellipse cx="54" cy="54" rx="4.5" ry="6" fill="#0f172a" />
            <circle cx="55.5" cy="52" r="2" fill="#ffffff" />
            <ellipse cx="76" cy="54" rx="4.5" ry="6" fill="#0f172a" />
            <circle cx="77.5" cy="52" r="2" fill="#ffffff" />
            {/* Wide Happy Smile */}
            <path d="M 58 64 Q 65 76 72 64 Z" fill="#e11d48" />
            {/* Blue Shirt */}
            <path
              d="M 38 82 C 38 75 52 72 65 72 C 78 72 92 75 92 82 L 95 125 L 35 125 Z"
              fill="#0284c7"
            />
            <rect x="35" y="94" width="60" height="10" fill="#ffffff" rx="3" />
            {/* Big Thumbs Up Hand on Left */}
            <g transform="translate(20, 65)">
              <circle
                cx="12"
                cy="18"
                r="10"
                fill="#fed7aa"
                stroke="#ea580c"
                strokeWidth="1.5"
              />
              {/* Raised Thumb */}
              <rect
                x="6"
                y="-2"
                width="12"
                height="18"
                rx="6"
                fill="#fed7aa"
                stroke="#ea580c"
                strokeWidth="1.5"
              />
            </g>
          </svg>
        </div>
      );
  }
};
