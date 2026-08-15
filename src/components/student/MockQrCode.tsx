import React, { useMemo } from "react";

interface MockQrCodeProps {
  value: string;
  size?: number;
  label?: string;
}

// Dependency-free QR-like matrix for the mock API environment.
// The real Laravel QR renderer can replace this component without changing the account workflow.
const GRID = 29;

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function finder(x: number, y: number, row: number, col: number) {
  const dx = col - x;
  const dy = row - y;
  if (dx < 0 || dx > 6 || dy < 0 || dy > 6) return null;
  return dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
}

function buildMatrix(value: string) {
  const seed = hashSeed(value);
  const matrix = Array.from({ length: GRID }, () => Array(GRID).fill(false));
  for (let row = 0; row < GRID; row += 1) {
    for (let col = 0; col < GRID; col += 1) {
      const f1 = finder(0, 0, row, col);
      const f2 = finder(GRID - 7, 0, row, col);
      const f3 = finder(0, GRID - 7, row, col);
      if (f1 !== null) matrix[row][col] = f1;
      else if (f2 !== null) matrix[row][col] = f2;
      else if (f3 !== null) matrix[row][col] = f3;
      else {
        const n = Math.imul(seed ^ (row * 374761393) ^ (col * 668265263), 1274126177) >>> 0;
        matrix[row][col] = (n & 1) === 1;
      }
    }
  }
  return matrix;
}

export const MockQrCode: React.FC<MockQrCodeProps> = ({ value, size = 180, label }) => {
  const matrix = useMemo(() => buildMatrix(value), [value]);
  const module = size / GRID;

  return (
    <div className="inline-flex flex-col items-center gap-2" aria-label={label ?? "QR credential"}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" shapeRendering="crispEdges">
        <rect width={size} height={size} fill="white" />
        {matrix.flatMap((row, r) => row.map((dark, c) => dark ? (
          <rect key={`${r}-${c}`} x={c * module} y={r * module} width={module + 0.2} height={module + 0.2} fill="black" />
        ) : null))}
      </svg>
      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">QR credential</span>
    </div>
  );
};
