-- Create storage bucket for application documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('application-documents', 'application-documents', true);

-- RLS policy: Users can upload their own documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'application-documents' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS policy: Users can update their own documents
CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'application-documents' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS policy: Anyone can view application documents (for admin review)
CREATE POLICY "Anyone can view application documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'application-documents');