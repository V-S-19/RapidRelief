'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, X, Camera } from 'lucide-react';

interface EmergencyCaptureProps {
  onCapture: (media: { type: 'photo' | 'video'; data: Blob; thumbnail?: string }) => void;
  onClose: () => void;
}

export function EmergencyCapture({ onCapture, onClose }: EmergencyCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  // Start Camera
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error);
          setIsLoading(false);
        };
      }
    } catch (err: any) {
      console.error(err);
      setError('Cannot access camera. Please allow permission in your browser.');
      setIsLoading(false);
    }
  }, []);

  // Capture Photo
  const handlePhotoCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        onCapture({
          type: 'photo',
          data: blob,
          thumbnail: canvas.toDataURL('image/jpeg', 0.85)
        });
      }
    }, 'image/jpeg', 0.95);
  };

  // Start Video Recording
  const startRecording = () => {
    if (!streamRef.current) return;

    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm'
    });

    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      onCapture({ type: 'video', data: blob });
      setIsRecording(false);
    };

    recorder.start(1000); // Collect data every second
    setMediaRecorder(recorder);
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
  };

  // Cleanup
  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (mediaRecorder) mediaRecorder.stop();
    onClose();
  };

  // Initialize camera
  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      {/* Header */}
      <div className="p-4 flex justify-between items-center bg-black/80">
        <h2 className="text-white text-xl font-semibold">Capture Emergency</h2>
        <Button variant="ghost" size="icon" onClick={handleClose} className="text-white">
          <X size={28} />
        </Button>
      </div>

      {/* Video Preview */}
      <div className="flex-1 relative bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-white z-10">
            Opening Camera...
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-black/95 z-10">
            <AlertCircle className="w-20 h-20 text-red-500 mb-6" />
            <p className="text-white text-lg mb-6">{error}</p>
            <Button onClick={startCamera} size="lg">Try Again</Button>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        <canvas ref={canvasRef} className="hidden" />

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full flex items-center gap-3 font-medium shadow-lg">
            <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
            RECORDING
          </div>
        )}
      </div>

      {/* Capture Buttons */}
      <div className="bg-gradient-to-t from-black via-black/80 to-transparent px-10 py-6 flex justify-center gap-16 items-center min-h-32">
        {!isRecording ? (
          <>
            <button
              onClick={handlePhotoCapture}
              disabled={isLoading || error !== null}
              className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-2xl active:scale-95 transition-all border-8 border-white/30 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Take Photo"
            >
              <Camera className="w-12 h-12 text-black" />
            </button>
          </>
        ) : (
          <button
            onClick={stopRecording}
            className="w-28 h-28 rounded-full bg-red-600 flex items-center justify-center shadow-2xl active:scale-95 hover:bg-red-700 transition-all"
            title="Stop Recording"
          >
            <div className="w-14 h-14 bg-white rounded" />
          </button>
        )}
      </div>
    </div>
  );
}