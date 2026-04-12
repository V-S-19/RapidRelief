'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Camera, Video, X } from 'lucide-react';

interface EmergencyCaptureProps {
  onCapture: (media: { type: 'photo' | 'video'; data: Blob; thumbnail?: string }) => void;
  onClose: () => void;
}

export function EmergencyCapture({ onCapture, onClose }: EmergencyCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: isRecording,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err) {
        setError('Unable to access camera. Please check permissions.');
        console.error('Camera error:', err);
      }
    };

    initCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [isRecording]);

  const handlePhotoCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        onCapture({ type: 'photo', data: blob });
      }
    }, 'image/jpeg', 0.95);
  };

  const startRecording = async () => {
    if (!videoRef.current?.srcObject) return;

    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(videoRef.current.srcObject as MediaStream, {
      mimeType: 'video/webm;codecs=vp9',
    });

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      // Create thumbnail
      if (canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        if (context && videoRef.current) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          context.drawImage(videoRef.current, 0, 0);
          const thumbnail = canvasRef.current.toDataURL('image/jpeg');
          onCapture({ type: 'video', data: blob, thumbnail });
        }
      }
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col justify-between z-50">
      {/* Header */}
      <div className="bg-gradient-to-b from-background via-background to-transparent p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold">Capture Emergency</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-secondary"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden bg-primary">
        {cameraActive && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-destructive/20 flex-col gap-4 p-4 text-center">
            <AlertCircle className="w-12 h-12 text-destructive" />
            <p className="text-foreground font-medium">{error}</p>
            <Button onClick={onClose} variant="outline">
              Go Back
            </Button>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
          <div className="w-2 h-2 bg-destructive-foreground rounded-full animate-pulse" />
          Recording...
        </div>
      )}

      {/* Controls */}
      <div className="bg-gradient-to-t from-background via-background to-transparent p-6 flex gap-4 justify-center items-center">
        {!isRecording ? (
          <>
            <Button
              onClick={handlePhotoCapture}
              size="lg"
              className="rounded-full w-16 h-16 flex items-center justify-center bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Camera className="w-6 h-6" />
            </Button>
            <Button
              onClick={startRecording}
              size="lg"
              className="rounded-full w-16 h-16 flex items-center justify-center bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Video className="w-6 h-6" />
            </Button>
          </>
        ) : (
          <Button
            onClick={stopRecording}
            size="lg"
            className="rounded-full w-16 h-16 flex items-center justify-center bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            <AlertCircle className="w-6 h-6" />
          </Button>
        )}
      </div>
    </div>
  );
}
