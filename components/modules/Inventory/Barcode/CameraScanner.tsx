"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { X, Camera, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export const CameraScanner = ({ onScan, onClose }: CameraScannerProps) => {
  const [scannerActive, setScannerActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const regionId = "camera-scanner-region";

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode(regionId);
      scannerRef.current = html5QrCode;
      
      const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.0
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          onScan(decodedText);
          // Play a small beep or visual feedback could be added here
        },
        (errorMessage) => {
          // ignore repetitive parse errors
        }
      );
      setScannerActive(true);
      setError(null);
    } catch (err: any) {
      console.error("Scanner startup error:", err);
      setError("Failed to access camera. Please check permissions.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        setScannerActive(false);
      } catch (err) {
        console.error("Scanner stop error:", err);
      }
    }
  };

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-4">
      <div className="relative w-full max-w-sm aspect-square overflow-hidden rounded-2xl bg-black ring-4 ring-primary/20 shadow-2xl">
        <div id={regionId} className="w-full h-full" />
        
        {!scannerActive && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/50 backdrop-blur-sm">
             <RefreshCw className="size-8 animate-spin mb-2" />
             <span className="text-xs font-black uppercase tracking-widest">Warming Lens...</span>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-rose-950/80 backdrop-blur-sm">
             <Camera className="size-12 text-rose-400 mb-4" />
             <p className="text-sm font-bold mb-4">{error}</p>
             <Button 
               variant="outline" 
               size="sm" 
               className="border-white text-white hover:bg-white/20"
               onClick={startScanner}
             >
               Retry Access
             </Button>
          </div>
        )}

        {/* Scan Frame Overlay */}
        {scannerActive && (
          <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40">
            <div className="w-full h-full border-2 border-primary animate-pulse rounded-sm relative">
                {/* Corner Accents */}
                <div className="absolute -top-1 -left-1 size-4 border-t-4 border-l-4 border-primary rounded-tl-sm" />
                <div className="absolute -top-1 -right-1 size-4 border-t-4 border-r-4 border-primary rounded-tr-sm" />
                <div className="absolute -bottom-1 -left-1 size-4 border-b-4 border-l-4 border-primary rounded-bl-sm" />
                <div className="absolute -bottom-1 -right-1 size-4 border-b-4 border-r-4 border-primary rounded-br-sm" />
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Scan SKU Barcode</h3>
        <p className="text-[10px] text-muted-foreground uppercase font-bold mt-1">Point your camera at the product label</p>
      </div>

      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onClose}
        className="rounded-xl text-muted-foreground hover:text-foreground"
      >
        <X className="mr-2 size-4" /> Cancel Scanning
      </Button>
    </div>
  );
};
