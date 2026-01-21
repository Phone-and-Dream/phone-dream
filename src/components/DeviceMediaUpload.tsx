import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useDeviceMediaUpload, MediaType } from '@/hooks/useDeviceMediaUpload';
import { Camera, Video, X, Check, Upload, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MediaSlot {
  type: MediaType;
  label: string;
  description: string;
  required: boolean;
  icon: typeof Camera;
}

const MEDIA_SLOTS: MediaSlot[] = [
  { type: 'front', label: 'Front', description: 'Front view of device', required: true, icon: Camera },
  { type: 'back', label: 'Back', description: 'Back view of device', required: true, icon: Camera },
  { type: 'screen', label: 'Screen', description: 'Screen powered on', required: true, icon: Camera },
  { type: 'serial', label: 'Serial/IMEI', description: 'Serial number visible', required: true, icon: Camera },
];

interface DeviceMediaUploadProps {
  donationId: string;
  mediaUrls: {
    front?: string | null;
    back?: string | null;
    screen?: string | null;
    serial?: string | null;
    video?: string | null;
  };
  onMediaChange?: (mediaType: MediaType, url: string | null) => void;
  disabled?: boolean;
  className?: string;
}

export function DeviceMediaUpload({
  donationId,
  mediaUrls,
  onMediaChange,
  disabled = false,
  className,
}: DeviceMediaUploadProps) {
  const { uploadImage, uploadVideo, deleteMedia, isUploading, progress } = useDeviceMediaUpload();
  const [localUrls, setLocalUrls] = useState(mediaUrls);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileSelect = async (mediaType: MediaType, file: File) => {
    if (!file) return;

    let url: string | null;
    if (mediaType === 'video') {
      url = await uploadVideo(donationId, file);
    } else {
      url = await uploadImage(donationId, mediaType, file);
    }

    if (url) {
      setLocalUrls(prev => ({ ...prev, [mediaType]: url }));
      onMediaChange?.(mediaType, url);
    }
  };

  const handleRemove = async (mediaType: MediaType) => {
    const success = await deleteMedia(donationId, mediaType);
    if (success) {
      setLocalUrls(prev => ({ ...prev, [mediaType]: null }));
      onMediaChange?.(mediaType, null);
    }
  };

  const triggerFileInput = (mediaType: string) => {
    fileInputRefs.current[mediaType]?.click();
  };

  const requiredComplete = MEDIA_SLOTS.filter(s => s.required)
    .every(slot => localUrls[slot.type]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Required photos header */}
      <div className="flex items-center gap-2">
        <Camera className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Device Photos</h3>
        <span className="text-xs text-muted-foreground">(All 4 required)</span>
        {requiredComplete && (
          <span className="ml-auto flex items-center gap-1 text-sm text-green-600">
            <Check className="h-4 w-4" />
            Complete
          </span>
        )}
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {MEDIA_SLOTS.map((slot) => {
          const url = localUrls[slot.type];
          const isSlotUploading = isUploading && progress[slot.type] !== undefined && progress[slot.type] < 100;

          return (
            <div key={slot.type} className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                {slot.label}
                {slot.required && <span className="text-destructive">*</span>}
                {url && <Check className="h-3 w-3 text-green-600 ml-1" />}
              </label>

              <div
                className={cn(
                  "relative aspect-square rounded-lg border-2 border-dashed transition-all overflow-hidden",
                  url ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                  disabled && "opacity-50 pointer-events-none"
                )}
              >
                {url ? (
                  <>
                    <img
                      src={url}
                      alt={slot.label}
                      className="w-full h-full object-cover"
                    />
                    {!disabled && (
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => handleRemove(slot.type)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => triggerFileInput(slot.type)}
                    disabled={disabled || isSlotUploading}
                    className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isSlotUploading ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      <>
                        <slot.icon className="h-8 w-8" />
                        <span className="text-xs">{slot.description}</span>
                      </>
                    )}
                  </button>
                )}

                <input
                  ref={el => fileInputRefs.current[slot.type] = el}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(slot.type, file);
                    e.target.value = '';
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Video upload section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Device Video</h3>
          <span className="text-xs text-muted-foreground">(Optional)</span>
        </div>

        <div
          className={cn(
            "relative rounded-lg border-2 border-dashed transition-all overflow-hidden",
            localUrls.video ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
            disabled && "opacity-50 pointer-events-none"
          )}
        >
          {localUrls.video ? (
            <div className="relative">
              <video
                src={localUrls.video}
                controls
                className="w-full max-h-48 object-contain"
              />
              {!disabled && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => handleRemove('video')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => triggerFileInput('video')}
              disabled={disabled || (isUploading && progress.video !== undefined)}
              className="w-full py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {isUploading && progress.video !== undefined ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <>
                  <Upload className="h-8 w-8" />
                  <span className="text-sm">Upload a short video showing device working</span>
                  <span className="text-xs text-muted-foreground">MP4, MOV, or WebM • Max 50MB</span>
                </>
              )}
            </button>
          )}

          <input
            ref={el => fileInputRefs.current['video'] = el}
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect('video', file);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      {/* Validation warning */}
      {!requiredComplete && (
        <Alert variant="destructive" className="bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please upload all 4 required photos before submitting for verification.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Helper to check if all required media is uploaded
export function hasAllRequiredMedia(mediaUrls: {
  front?: string | null;
  back?: string | null;
  screen?: string | null;
  serial?: string | null;
}): boolean {
  return Boolean(mediaUrls.front && mediaUrls.back && mediaUrls.screen && mediaUrls.serial);
}
