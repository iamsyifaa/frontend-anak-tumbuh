import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QrScannerProps {
  onScan: (qrToken: string) => Promise<void> | void;
  onClose: () => void;
}

export const QrScanner: React.FC<QrScannerProps> = ({ onScan, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);
  const mountedRef = useRef(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    const startCamera = async () => {
      try {
        setError(null);

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: {
              width: 250,
              height: 250,
            },
          },
          async (decodedText) => {
            if (processingRef.current) {
              return;
            }

            processingRef.current = true;

            if (mountedRef.current) {
              setIsProcessing(true);
              setError(null);
            }

            try {
              await scanner.stop();

              await onScan(decodedText);
            } catch (err) {
              console.error("QR login error:", err);

              processingRef.current = false;

              if (!mountedRef.current) {
                return;
              }

              setIsProcessing(false);
              setError("QR tidak valid atau sudah tidak aktif.");

              // Beri sedikit waktu sebelum kamera dinyalakan lagi
              setTimeout(async () => {
                if (!mountedRef.current) {
                  return;
                }

                try {
                  await startCamera();
                } catch (restartError) {
                  console.error("Gagal restart kamera:", restartError);
                }
              }, 500);
            }
          },
          () => {
            // QR belum terbaca.
          },
        );
      } catch (err) {
        console.error("Camera error:", err);

        if (mountedRef.current) {
          setError(
            "Tidak dapat mengakses kamera. Silakan izinkan akses kamera pada browser.",
          );
        }
      }
    };

    startCamera();

    return () => {
      mountedRef.current = false;
      processingRef.current = true;

      const cleanup = async () => {
        try {
          await scanner.stop().catch(() => {});
          scanner.clear();
        } catch (err) {
          console.error("Scanner cleanup error:", err);
        }
      };

      cleanup();
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
          <div id="qr-reader" className="w-full" />
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
