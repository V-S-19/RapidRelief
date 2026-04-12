'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertCircle, MapPin, Clock, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';

interface EmergencyConfirmationProps {
  status: 'success' | 'processing' | 'error';
  emergencyId?: string;
  emergencyType?: string;
  location?: string;
  phone?: string;
  error?: string;
  onNewReport?: () => void;
}

export function EmergencyConfirmation({
  status,
  emergencyId,
  emergencyType,
  location,
  phone,
  error,
  onNewReport,
}: EmergencyConfirmationProps) {
  const [countdown, setCountdown] = useState(120); // 2 minutes

  useEffect(() => {
    if (status !== 'success') return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-primary/10 p-6">
        <div className="w-20 h-20 rounded-full border-4 border-accent border-t-transparent animate-spin mb-6" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Processing</h2>
        <p className="text-muted-foreground text-center">
          Analyzing your emergency report...
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-destructive/5 to-background p-6">
        <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Submission Failed</h2>
        <p className="text-muted-foreground text-center mb-6">{error}</p>
        <Button
          onClick={onNewReport}
          className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 rounded-lg"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/10 p-6 flex flex-col justify-between">
      {/* Header */}
      <div />

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center">
        {/* Success Animation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-accent/20 rounded-full animate-pulse" />
          <div className="relative w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-accent animate-bounce" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-foreground text-center mb-3">
          Report Submitted
        </h1>
        <p className="text-muted-foreground text-center mb-8 max-w-sm">
          Emergency services are being dispatched to your location. Please stay safe and
          follow instructions from emergency personnel.
        </p>

        {/* Emergency Details Card */}
        <Card className="w-full max-w-sm border-accent/30 mb-8 bg-secondary/50">
          <div className="p-6 space-y-4">
            {emergencyId && (
              <div className="border-b border-border pb-4">
                <p className="text-sm text-muted-foreground mb-1">Report ID</p>
                <p className="font-mono text-lg text-accent font-semibold">{emergencyId}</p>
              </div>
            )}

            {emergencyType && (
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Type</p>
                  <p className="text-foreground font-medium">{emergencyType}</p>
                </div>
              </div>
            )}

            {location && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Location</p>
                  <p className="text-foreground font-medium">{location}</p>
                </div>
              </div>
            )}

            {phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Contact</p>
                  <p className="text-foreground font-medium">{phone}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Response Time */}
        <div className="w-full max-w-sm bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/30 rounded-lg p-6 text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-accent" />
            <p className="text-sm font-semibold text-muted-foreground">Response Countdown</p>
          </div>
          <p className="text-4xl font-bold text-accent font-mono">{formatTime(countdown)}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Stay on the line and wait for emergency services
          </p>
        </div>

        {/* Info Box */}
        <div className="w-full max-w-sm bg-primary/20 border border-primary rounded-lg p-4 text-center">
          <p className="text-sm text-foreground">
            Keep your phone with you and be ready to provide additional information to
            emergency responders.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="space-y-3">
        <Button
          onClick={onNewReport}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-lg font-semibold rounded-lg"
        >
          Submit Another Report
        </Button>
        <Button
          variant="outline"
          className="w-full py-3 rounded-lg border-2 border-primary hover:bg-primary/10"
        >
          Need Help?
        </Button>
      </div>
    </div>
  );
}
