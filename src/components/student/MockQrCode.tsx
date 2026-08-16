import React, { useMemo } from "react";
import { QRCode } from "../../lib/qrcode-generator.js";

interface MockQrCodeProps {
  value: string;
  size?: number;
  label?: string;
}

/**
 * Real QR renderer for the mock environment.
 *
 * IMPORTANT: this is a real QR matrix, not a decorative QR-like pattern.
 * No credential is sent to a third-party QR service.
 */
export const MockQrCode: React.FC<MockQrCodeProps> = ({
  value,
  size = 180,
  label,
}) => {
  const matrix = useMemo(() => {
    const qr = new QRCode(-1, 1); // Error correction L for mock credentials.
    qr.addData(value);
    qr.make();
    return qr.modules as boolean[][];
  }, [value]);

  const moduleCount = matrix.length;
  const quietZone = 4;
  const totalModules = moduleCount + quietZone * 2;

  return (
    <div
      className="inline-flex flex-col items-center gap-2"
      aria-label={label ?? "QR credential"}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${totalModules} ${totalModules}`}
        role="img"
        shapeRendering="crispEdges"
        className="block bg-white"
      >
        <rect
          x="0"
          y="0"
          width={totalModules}
          height={totalModules}
          fill="white"
        />

        {matrix.flatMap((row, r) =>
          row.map((dark, c) =>
            dark ? (
              <rect
                key={`${r}-${c}`}
                x={c + quietZone}
                y={r + quietZone}
                width="1"
                height="1"
                fill="black"
              />
            ) : null,
          ),
        )}
      </svg>

      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
        QR credential
      </span>
    </div>
  );
};
