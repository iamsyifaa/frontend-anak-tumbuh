import React, { useEffect, useRef, useState } from "react";
import { QrCode } from "lucide-react";
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
              const size = Math.max(170, Math.min(280, Math.floor(shortestSide * 0.68)));
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
    <div className="fixed inset-0 z-50 flex min-h-[100svh] items-center justify-center overflow-y-auto bg-[#232852]/75 px-3 py-4 backdrop-blur-sm sm:px-5 sm:py-6">
      <div className="relative w-full max-w-lg rounded-[2rem] border border-white/80 bg-white p-4 shadow-[0_24px_80px_rgba(35,40,82,0.35)] sm:rounded-[2.5rem] sm:p-6">
        <div className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full bg-[#EEB541]/25 blur-2xl" />
        <div className="mb-4 text-center sm:mb-5">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#EEB541]/25 text-[#3A72E3]">
            <QrCode className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-black text-[#232852] sm:text-2xl">Scan QR Siswa</h2>
          <p className="mt-1 text-xs font-semibold text-[#232852]/55 sm:text-sm">
            Arahkan kamera ke QR siswa
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[1.5rem] border-4 border-[#A4C1FD]/60 bg-[#232852] p-1.5 shadow-inner sm:rounded-[1.75rem] sm:p-2">
          <div className="pointer-events-none absolute inset-5 z-10 rounded-2xl border-2 border-[#EEB541]/80 shadow-[0_0_0_9999px_rgba(35,40,82,0.08)] sm:inset-7" />
          <div
            id={containerIdRef.current}
            ref={containerRef}
            className="w-full overflow-hidden rounded-[1.1rem] [&_video]:!h-auto [&_video]:!w-full [&_video]:!rounded-[1rem]"
          />
        </div>

        {isProcessing && (
          <div className="mt-4 rounded-2xl bg-[#A4C1FD]/25 p-3 text-center">
            <p className="text-sm font-bold text-[#232852]">
              QR terbaca. Memverifikasi...
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl bg-red-50 p-3 text-center">
            <p className="text-sm font-bold text-red-600">{error}</p>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className="mt-4 w-full rounded-2xl border-2 border-[#A4C1FD] bg-white py-3 text-sm font-black text-[#232852] transition hover:bg-[#EEF5FF] disabled:opacity-50 sm:py-3.5"
        >
          Batal
        </button>
      </div>
    </div>
  );
};
