'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, MapPin, Phone, MessageSquare, ChevronDown } from 'lucide-react';

interface EmergencyFormProps {
  mediaFile: { type: 'photo' | 'video'; data: Blob; thumbnail?: string } | null;
  onSubmit: (data: EmergencyData) => Promise<void>;
  isLoading: boolean;
}

export interface EmergencyData {
  type: string;
  description: string;
  location: string;
  phone: string;
  media: { type: 'photo' | 'video'; data: Blob; thumbnail?: string };
}

const EMERGENCY_TYPES = [
  { id: 'accident', label: 'Vehicle Accident', icon: '🚗' },
  { id: 'fire', label: 'Fire', icon: '🔥' },
  { id: 'medical', label: 'Medical Emergency', icon: '🏥' },
  { id: 'injury', label: 'Injury', icon: '⚠️' },
  { id: 'other', label: 'Other Emergency', icon: '🚨' },
];

export function EmergencyForm({ mediaFile, onSubmit, isLoading }: EmergencyFormProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedType) newErrors.type = 'Please select emergency type';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!location.trim()) newErrors.location = 'Location is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (!/^\d{10,}$/.test(phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !mediaFile) return;

    try {
      await onSubmit({
        type: selectedType,
        description,
        location,
        phone,
        media: mediaFile,
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Media Preview */}
      {mediaFile && (
        <Card className="border-accent/30 overflow-hidden">
          {mediaFile.type === 'photo' ? (
            <img
              src={URL.createObjectURL(mediaFile.data)}
              alt="Emergency report"
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-primary flex items-center justify-center">
              {mediaFile.thumbnail ? (
                <img
                  src={mediaFile.thumbnail}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-accent-foreground text-center">
                  <div className="text-4xl mb-2">🎥</div>
                  <p>Video captured</p>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Emergency Type Selection */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3">
          Emergency Type
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
            className={`w-full px-4 py-3 rounded-lg border-2 flex items-center justify-between transition-colors ${
              selectedType
                ? 'border-accent bg-primary/20 text-foreground'
                : 'border-input bg-secondary text-muted-foreground'
            } ${errors.type ? 'border-destructive' : ''}`}
          >
            <span>
              {selectedType
                ? EMERGENCY_TYPES.find((t) => t.id === selectedType)?.label
                : 'Select emergency type'}
            </span>
            <ChevronDown className="w-5 h-5" />
          </button>

          {showTypeDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-secondary border-2 border-input rounded-lg shadow-lg z-10">
              {EMERGENCY_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    setSelectedType(type.id);
                    setShowTypeDropdown(false);
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.type;
                      return next;
                    });
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-primary/20 flex items-center gap-3 first:rounded-t-lg last:rounded-b-lg transition-colors"
                >
                  <span className="text-lg">{type.icon}</span>
                  <span className="text-foreground">{type.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {errors.type && (
          <p className="text-destructive text-sm mt-1">{errors.type}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          <MessageSquare className="w-4 h-4 inline mr-2" />
          What happened?
        </label>
        <textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setErrors((prev) => {
              const next = { ...prev };
              delete next.description;
              return next;
            });
          }}
          placeholder="Describe the situation in detail..."
          className={`w-full px-4 py-3 rounded-lg border-2 bg-secondary text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent transition-colors resize-none ${
            errors.description ? 'border-destructive' : 'border-input'
          }`}
          rows={4}
        />
        {errors.description && (
          <p className="text-destructive text-sm mt-1">{errors.description}</p>
        )}
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          <MapPin className="w-4 h-4 inline mr-2" />
          Location
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            setErrors((prev) => {
              const next = { ...prev };
              delete next.location;
              return next;
            });
          }}
          placeholder="Enter location or address"
          className={`w-full px-4 py-3 rounded-lg border-2 bg-secondary text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent transition-colors ${
            errors.location ? 'border-destructive' : 'border-input'
          }`}
        />
        {errors.location && (
          <p className="text-destructive text-sm mt-1">{errors.location}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          <Phone className="w-4 h-4 inline mr-2" />
          Contact Phone
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setErrors((prev) => {
              const next = { ...prev };
              delete next.phone;
              return next;
            });
          }}
          placeholder="+1 (555) 000-0000"
          className={`w-full px-4 py-3 rounded-lg border-2 bg-secondary text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent transition-colors ${
            errors.phone ? 'border-destructive' : 'border-input'
          }`}
        />
        {errors.phone && (
          <p className="text-destructive text-sm mt-1">{errors.phone}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-lg font-semibold rounded-lg flex items-center justify-center gap-2 transition-all"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <AlertCircle className="w-5 h-5" />
            Submit Emergency Report
          </>
        )}
      </Button>
    </form>
  );
}
