import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

declare global {
  interface Window {
    BarcodeDetector?: any;
  }
}

export const Camera = {
  requestCameraPermissionsAsync: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      stream.getTracks().forEach(t => t.stop());
      return { status: 'granted' as const };
    } catch {
      return { status: 'denied' as const };
    }
  },
};

type CameraViewProps = {
  style?: any;
  facing?: string;
  barcodeScannerSettings?: { barcodeTypes?: string[] };
  onBarcodeScanned?: (result: { data: string }) => void;
};

export function CameraView({ style, onBarcodeScanned }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [useFileInput, setUseFileInput] = useState(false);

  const hasBarcodeDetector =
    typeof window !== 'undefined' && !!window.BarcodeDetector;

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!hasBarcodeDetector) {
        setUseFileInput(true);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        });
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setReady(true);
        }
      } catch (e) {
        if (!cancelled)
          setError('Brak dostepu do kamery. Sprawdz uprawnienia przegladarki.');
      }
    }

    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (!ready || !hasBarcodeDetector || !onBarcodeScanned) return;
    const detector = new window.BarcodeDetector({
      formats: [
        'ean_13',
        'ean_8',
        'qr_code',
        'code_128',
        'code_39',
        'upc_a',
        'upc_e',
      ],
    });
    let active = true;

    async function scan() {
      if (!active || !videoRef.current) return;
      try {
        const results = await detector.detect(videoRef.current);
        if (results.length > 0) {
          onBarcodeScanned?.({ data: results[0].rawValue });
          return;
        }
      } catch {}
      rafRef.current = requestAnimationFrame(scan);
    }

    rafRef.current = requestAnimationFrame(scan);
    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [ready, onBarcodeScanned]);

  if (useFileInput) {
    return React.createElement(
      View,
      {
        style: [
          style,
          {
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0F1920',
            borderRadius: 16,
            minHeight: 180,
            padding: 20,
          },
        ],
      },
      React.createElement(
        Text,
        {
          style: {
            color: '#9FB0B5',
            fontSize: 13,
            textAlign: 'center',
            marginBottom: 14,
          },
        },
        'Twoja przegladarka nie obsluguje skanowania na zywo.\nUzyj aparatu, aby sfotografowac kod kreskowy.',
      ),
      React.createElement('input' as any, {
        type: 'file',
        accept: 'image/*',
        capture: 'environment',
        style: { color: '#7FD1AE', fontSize: 14 },
        onChange: async (e: any) => {
          const file = e.target.files?.[0];
          if (!file || !onBarcodeScanned) return;
          if (!window.BarcodeDetector) return;
          const img = new Image();
          img.src = URL.createObjectURL(file);
          img.onload = async () => {
            try {
              const detector = new window.BarcodeDetector!();
              const results = await detector.detect(img);
              if (results.length > 0)
                onBarcodeScanned({ data: results[0].rawValue });
            } catch {}
          };
        },
      }),
    );
  }

  if (error) {
    return React.createElement(
      View,
      {
        style: [
          style,
          {
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#3B1F1F',
            borderRadius: 16,
            padding: 20,
          },
        ],
      },
      React.createElement(
        Text,
        { style: { color: '#D95C4E', fontWeight: '700', marginBottom: 6 } },
        'Brak dostepu do kamery',
      ),
      React.createElement(
        Text,
        { style: { color: '#9FB0B5', fontSize: 13, textAlign: 'center' } },
        error,
      ),
    );
  }

  return React.createElement(
    View,
    {
      style: [
        style,
        {
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 16,
          backgroundColor: '#000',
        },
      ],
    },
    !ready &&
      React.createElement(
        View,
        {
          style: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          },
        },
        React.createElement(ActivityIndicator, { color: '#7FD1AE' }),
        React.createElement(
          Text,
          { style: { color: '#9FB0B5', marginTop: 8, fontSize: 13 } },
          'Uruchamianie kamery...',
        ),
      ),
    React.createElement('video' as any, {
      ref: videoRef,
      autoPlay: true,
      playsInline: true,
      muted: true,
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
      },
    }),
  );
}

export default { Camera, CameraView };
