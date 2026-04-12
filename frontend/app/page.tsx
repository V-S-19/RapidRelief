'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmergencyCapture } from '@/components/emergency-capture';
import { EmergencyForm, type EmergencyData } from '@/components/emergency-form';
import { EmergencyConfirmation } from '@/components/emergency-confirmation';
import { AlertCircle, Phone, MoreVertical } from 'lucide-react';

type PageState = 'home' | 'capture' | 'form' | 'confirmation';

export default function Home() {
  const [pageState, setPageState] = useState<PageState>('home');
  const [mediaFile, setMediaFile] = useState<{
    type: 'photo' | 'video';
    data: Blob;
    thumbnail?: string;
  } | null>(null);
  const [confirmationData, setConfirmationData] = useState<{
    status: 'success' | 'processing' | 'error';
    emergencyId?: string;
    emergencyType?: string;
    location?: string;
    phone?: string;
    error?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCapture = (media: { type: 'photo' | 'video'; data: Blob; thumbnail?: string }) => {
    setMediaFile(media);
    setPageState('form');
  };

  const handleFormSubmit = async (data: EmergencyData) => {
    setIsSubmitting(true);
    setConfirmationData({ status: 'processing' });
    setPageState('confirmation');

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('type', data.type);
      formData.append('description', data.description);
      formData.append('location', data.location);
      formData.append('phone', data.phone);
      formData.append('media', data.media.data, `emergency.${data.media.type === 'photo' ? 'jpg' : 'webm'}`);

      // Call your backend API
      const response = await fetch('/api/emergency-report', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit emergency report');
      }

      const result = await response.json();

      // Set success confirmation
      setConfirmationData({
        status: 'success',
        emergencyId: result.id || 'ER-' + Date.now(),
        emergencyType: data.type,
        location: data.location,
        phone: data.phone,
      });
    } catch (error) {
      console.error('Submission error:', error);
      setConfirmationData({
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to submit report. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetToHome = () => {
    setPageState('home');
    setMediaFile(null);
    setConfirmationData(null);
  };

  // HOME PAGE
  if (pageState === 'home') {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        {/* Header */}
        <header className="bg-gradient-to-b from-background via-background to-transparent p-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-accent-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">RapidRelief</h1>
            </div>
            <p className="text-sm text-muted-foreground">Emergency Response Platform</p>
          </div>
          <button className="p-2 hover:bg-secondary rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </button>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
          {/* Hero Section */}
          <div className="max-w-sm text-center mb-12">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mx-auto mb-8">
              <AlertCircle className="w-12 h-12 text-accent" />
            </div>

            <h2 className="text-4xl font-bold text-foreground mb-3 leading-tight">
              Emergency Response in Seconds
            </h2>

            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Report accidents, fires, injuries, and medical emergencies instantly. Our AI analyzes
              your report and alerts emergency services.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mb-12">
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-accent mb-1">24/7</div>
                <p className="text-xs text-muted-foreground">Always Active</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-accent mb-1">AI</div>
                <p className="text-xs text-muted-foreground">Smart Analysis</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-accent mb-1">Live</div>
                <p className="text-xs text-muted-foreground">Real-time Reports</p>
              </div>
            </div>

            {/* How It Works */}
            <div className="text-left space-y-4 mb-12 bg-secondary/30 rounded-xl p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-4">How It Works:</h3>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <p className="font-medium text-foreground">Capture</p>
                  <p className="text-sm text-muted-foreground">Take a photo or video live</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <p className="font-medium text-foreground">Submit Details</p>
                  <p className="text-sm text-muted-foreground">Fill in emergency type and location</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <p className="font-medium text-foreground">Alert Services</p>
                  <p className="text-sm text-muted-foreground">Police, fire, ambulance notified instantly</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-6 pb-8 space-y-3">
          <Button
            onClick={() => setPageState('capture')}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-lg font-semibold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <AlertCircle className="w-5 h-5" />
            Report Emergency Now
          </Button>
          <Button
            variant="outline"
            className="w-full py-3 rounded-lg border-2 border-primary hover:bg-primary/10"
          >
            <Phone className="w-5 h-5 mr-2" />
            Call Emergency Services
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            For life-threatening emergencies, always call 911 first
          </p>
        </div>
      </div>
    );
  }

  // CAPTURE PAGE
  if (pageState === 'capture') {
    return (
      <EmergencyCapture
        onCapture={handleCapture}
        onClose={() => setPageState('home')}
      />
    );
  }

  // FORM PAGE
  if (pageState === 'form') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="bg-gradient-to-b from-background via-background to-transparent p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">Report Details</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Complete the information below
          </p>
        </header>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-2xl mx-auto">
            <EmergencyForm
              mediaFile={mediaFile}
              onSubmit={handleFormSubmit}
              isLoading={isSubmitting}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-6 bg-gradient-to-t from-background via-background to-transparent">
          <Button
            variant="outline"
            onClick={() => setPageState('home')}
            className="w-full py-3 rounded-lg border-2 border-primary hover:bg-primary/10"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // CONFIRMATION PAGE
  if (pageState === 'confirmation' && confirmationData) {
    return (
      <EmergencyConfirmation
        status={confirmationData.status}
        emergencyId={confirmationData.emergencyId}
        emergencyType={confirmationData.emergencyType}
        location={confirmationData.location}
        phone={confirmationData.phone}
        error={confirmationData.error}
        onNewReport={resetToHome}
      />
    );
  }

  return null;
}
