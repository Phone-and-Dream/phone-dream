import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type MediaType = 'front' | 'back' | 'screen' | 'serial' | 'video';

interface UploadProgress {
  [key: string]: number;
}

interface UseDeviceMediaUploadReturn {
  uploadImage: (donationId: string, mediaType: MediaType, file: File) => Promise<string | null>;
  uploadVideo: (donationId: string, file: File) => Promise<string | null>;
  deleteMedia: (donationId: string, mediaType: MediaType) => Promise<boolean>;
  isUploading: boolean;
  progress: UploadProgress;
  error: string | null;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

export function useDeviceMediaUpload(): UseDeviceMediaUploadReturn {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({});
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File, isVideo: boolean): string | null => {
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    const allowedTypes = isVideo ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;

    if (file.size > maxSize) {
      return `File too large. Maximum size is ${isVideo ? '50MB' : '5MB'}`;
    }

    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed: ${allowedTypes.join(', ')}`;
    }

    return null;
  };

  const getFilePath = (donationId: string, mediaType: MediaType, fileName: string): string => {
    if (!user?.id) throw new Error('Not authenticated');
    const ext = fileName.split('.').pop();
    const timestamp = Date.now();
    return `${user.id}/${donationId}/${mediaType}-${timestamp}.${ext}`;
  };

  const uploadImage = async (
    donationId: string, 
    mediaType: MediaType, 
    file: File
  ): Promise<string | null> => {
    if (!user?.id) {
      setError('Not authenticated');
      return null;
    }

    const validationError = validateFile(file, false);
    if (validationError) {
      setError(validationError);
      toast({
        title: 'Upload failed',
        description: validationError,
        variant: 'destructive',
      });
      return null;
    }

    setIsUploading(true);
    setError(null);
    setProgress(prev => ({ ...prev, [mediaType]: 0 }));

    try {
      const filePath = getFilePath(donationId, mediaType, file.name);

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('device-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('device-media')
        .getPublicUrl(filePath);

      setProgress(prev => ({ ...prev, [mediaType]: 100 }));

      // Update donation record with media URL
      const columnName = `media_${mediaType}_url` as const;
      const { error: updateError } = await supabase
        .from('donations')
        .update({ [columnName]: publicUrl })
        .eq('id', donationId)
        .eq('donor_id', user.id);

      if (updateError) throw updateError;

      toast({
        title: 'Photo uploaded',
        description: `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} photo uploaded successfully`,
      });

      return publicUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      toast({
        title: 'Upload failed',
        description: message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadVideo = async (donationId: string, file: File): Promise<string | null> => {
    if (!user?.id) {
      setError('Not authenticated');
      return null;
    }

    const validationError = validateFile(file, true);
    if (validationError) {
      setError(validationError);
      toast({
        title: 'Upload failed',
        description: validationError,
        variant: 'destructive',
      });
      return null;
    }

    setIsUploading(true);
    setError(null);
    setProgress(prev => ({ ...prev, video: 0 }));

    try {
      const filePath = getFilePath(donationId, 'video', file.name);

      const { error: uploadError } = await supabase.storage
        .from('device-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('device-media')
        .getPublicUrl(filePath);

      setProgress(prev => ({ ...prev, video: 100 }));

      const { error: updateError } = await supabase
        .from('donations')
        .update({ media_video_url: publicUrl })
        .eq('id', donationId)
        .eq('donor_id', user.id);

      if (updateError) throw updateError;

      toast({
        title: 'Video uploaded',
        description: 'Device video uploaded successfully',
      });

      return publicUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      toast({
        title: 'Upload failed',
        description: message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteMedia = async (donationId: string, mediaType: MediaType): Promise<boolean> => {
    if (!user?.id) {
      setError('Not authenticated');
      return false;
    }

    try {
      // Clear the URL from the donation record
      const columnName = mediaType === 'video' ? 'media_video_url' : `media_${mediaType}_url`;
      const { error: updateError } = await supabase
        .from('donations')
        .update({ [columnName]: null })
        .eq('id', donationId)
        .eq('donor_id', user.id);

      if (updateError) throw updateError;

      toast({
        title: 'Media removed',
        description: `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} removed successfully`,
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      setError(message);
      toast({
        title: 'Delete failed',
        description: message,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    uploadImage,
    uploadVideo,
    deleteMedia,
    isUploading,
    progress,
    error,
  };
}
