import React, { useEffect, useRef, useState } from "react";
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";

interface QrScannerProps {
  onScan: (qrToken: string) => Promise<void> | void;
  onClose: () => void;
}

export const QrScanner: React.FC<QrScannerProps> = ({ onScan, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);
  const mountedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerIdRef = useRef(
    `qr-reader-${Math.random().toString(36).slice(2, 10)}`,
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    processingRef.current = false;

    let cancelled = false;
    let scannerStarted = false;
    let restartTimer: ReturnType<typeof setTimeout> | null = null;

    const scanner = new Html5Qrcode(containerIdRef.current, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });
    scannerRef.current = scanner;

    const stopAndClear = async (clearWhenNotStarted = false) => {
      const wasStarted = scannerStarted || scanner.isScanning;

      try {
        if (wasStarted) {
          await scanner.stop();
        }
      } catch (err) {
        console.debug("QR scanner stop skipped:", err);
      } finally {
        if (wasStarted || clearWhenNotStarted) {
          try {
            scanner.clear();
          } catch (err) {
            console.debug("QR scanner clear skipped:", err);
          }
        }
      }
    };

    const startCamera = async () => {
      if (cancelled || !mountedRef.current || scanner.isScanning) return;

      try {
        setError(null);

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const shortestSide = Math.min(viewfinderWidth, viewfinderHeight);
              const size = Math.max(180, Math.min(280, Math.floor(shortestSide * 0.72)));
              return { width: size, height: size };
            },
            aspectRatio: 1,
            disableFlip: false,
          },
          async (decodedText) => {
            if (cancelled || processingRef.current) return;

            processingRef.current = true;
            if (mountedRef.current) {
              setIsProcessing(true);
              setError(null);
            }

            try {
              await scanner.stop();
              scannerStarted = false;
              await onScan(decodedText);
            } catch (err) {
              console.error("QR login error:", err);
              processingRef.current = false;

              if (!mountedRef.current || cancelled) return;

              setIsProcessing(false);
              setError("QR tidak valid atau sudah tidak aktif.");

              restartTimer = setTimeout(() => {
                if (!cancelled && mountedRef.current) {
                  void startCamera();
                }
              }, 500);
            }
          },
          () => {
            // QR belum terbaca. html5-qrcode memanggil callback ini berkala.
          },
        );

        scannerStarted = true;

        // React StrictMode dapat melakukan mount -> cleanup -> mount dengan cepat.
        // Jika cleanup terjadi ketika start() masih pending, hentikan scanner segera
        // setelah start selesai agar tidak pernah meninggalkan dua camera stream.
        if (cancelled || !mountedRef.current) {
          await stopAndClear(true);
        }
      } catch (err) {
        if (cancelled || !mountedRef.current) return;

        console.error("Camera error:", err);
        setError(
          "Tidak dapat mengakses kamera. Silakan izinkan akses kamera pada browser.",
        );
      }
    };

    void startCamera();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      processingRef.current = true;

      if (restartTimer) clearTimeout(restartTimer);

      // Jangan memanggil scanner.start() lagi setelah unmount. Jika start() masih
      // pending, startCamera() akan melihat cancelled=true dan langsung cleanup.
      void stopAndClear();

      if (scannerRef.current === scanner) {
        scannerRef.current = null;
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 text-center">
          <h2 className="text-xl font-black text-emerald-800">Scan QR Siswa</h2>
          <p className="mt-1 text-sm text-gray-500">
            Arahkan kamera ke QR siswa
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl bg-black">
          <div
            id={containerIdRef.current}
            ref={containerRef}
            className="w-full"
          />
        </div>

        {isProcessing && (
          <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-center">
            <p className="text-sm font-semibold text-emerald-700">
              QR terbaca. Memverifikasi...
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-center">
            <p className="text-sm font-semibold text-red-600">{error}</p>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className="mt-4 w-full rounded-xl border border-gray-300 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Batal
        </button>
      </div>
    </div>
  );
};
