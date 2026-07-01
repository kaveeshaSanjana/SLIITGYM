import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Loader2 } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: any) => void;
}

export const QRScanner = ({ onScanSuccess, onScanFailure }: QRScannerProps) => {
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);
  
  // We use a unique ID to avoid conflicts in React Strict Mode or HMR
  const qrRegionId = useRef(`qr-reader-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    let isMounted = true;
    let scanner: Html5Qrcode | null = null;
    
    // Delay to let React render the div and avoid strict-mode double-mount race conditions
    const timer = setTimeout(async () => {
      if (!isMounted) return;
      
      try {
        scanner = new Html5Qrcode(qrRegionId.current);
        
        // Find cameras
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) {
          throw new Error("No cameras found on this device.");
        }
        
        // Prefer back camera if available, otherwise use the first one
        const backCamera = cameras.find(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('environment'));
        const cameraId = backCamera ? backCamera.id : cameras[0].id;
        
        await scanner.start(
          cameraId,
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
          },
          (decodedText) => {
            if (isMounted) onScanSuccess(decodedText);
          },
          (errorMessage) => {
            if (isMounted && onScanFailure) onScanFailure(errorMessage);
          }
        );
        
        if (isMounted) setStarting(false);
      } catch (err: any) {
        if (isMounted) {
          console.error("Failed to start scanner", err);
          setError(err?.message || "Failed to access camera. Please ensure you have granted camera permissions.");
          setStarting(false);
        }
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scanner) {
        try {
          if (scanner.isScanning) {
            scanner.stop().then(() => scanner?.clear()).catch(console.error);
          } else {
            scanner.clear();
          }
        } catch (e) {
          console.error("Cleanup error", e);
        }
      }
    };
  }, [onScanSuccess, onScanFailure]);

  return (
    <div className="w-full bg-black/40 rounded-3xl overflow-hidden border border-white/10 relative min-h-[250px] flex items-center justify-center">
      {starting && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-2" />
          <p className="text-sm text-white/70">Starting camera...</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 p-6 text-center">
          <p className="text-red-400 text-sm font-bold">{error}</p>
        </div>
      )}
      <div id={qrRegionId.current} className="w-full h-full text-white overflow-hidden [&>video]:object-cover" />
    </div>
  );
};
