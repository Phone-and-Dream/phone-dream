import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface UploadResult {
  url: string;
  fileName: string;
}

export function useReferenceLetterUpload() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (file: File): Promise<UploadResult> => {
      if (!user) throw new Error('Not authenticated');

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a PDF, DOC, or DOCX file.');
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File too large. Maximum size is 5MB.');
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      const timestamp = Date.now();
      const filePath = `${user.id}/reference-letter-${timestamp}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('application-documents')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('application-documents')
        .getPublicUrl(filePath);

      return {
        url: publicUrl,
        fileName: file.name,
      };
    },
  });
}
