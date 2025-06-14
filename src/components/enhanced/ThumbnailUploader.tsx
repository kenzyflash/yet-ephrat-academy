
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ThumbnailUploaderProps {
  onUploadComplete: (url: string) => void;
  currentUrl?: string;
}

const ThumbnailUploader = ({ onUploadComplete, currentUrl }: ThumbnailUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Current user:', user);
      
      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      if (!user) {
        throw new Error('User not authenticated. Please log in and try again.');
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${Date.now()}-${Math.random()}.${fileExt}`;
      console.log('Uploading to path:', filePath);

      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 15;
        });
      }, 100);

      const { data, error } = await supabase.storage
        .from('course-thumbnails')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (error) {
        console.error('Upload error details:', error);
        throw error;
      }

      console.log('Upload successful:', data);
      setProgress(100);

      const { data: { publicUrl } } = supabase.storage
        .from('course-thumbnails')
        .getPublicUrl(data.path);

      console.log('Public URL:', publicUrl);
      onUploadComplete(publicUrl);

      toast({
        title: "Upload successful",
        description: "Thumbnail has been uploaded successfully.",
      });
    } catch (error: any) {
      console.error('Error uploading thumbnail:', error);
      console.error('Error details:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error
      });
      
      let errorMessage = "Failed to upload thumbnail. Please try again.";
      
      if (error.message?.includes('not authenticated')) {
        errorMessage = "Please log in to upload images.";
      } else if (error.message?.includes('Bucket not found')) {
        errorMessage = "Storage bucket not found. Please contact support.";
      } else if (error.statusCode === '404') {
        errorMessage = "Storage service unavailable. Please try again later.";
      }
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {currentUrl && (
          <img 
            src={currentUrl} 
            alt="Course thumbnail" 
            className="w-20 h-20 object-cover rounded border"
          />
        )}
        <div className="flex-1">
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => document.getElementById('thumbnail-upload')?.click()}
          >
            <Image className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Thumbnail'}
          </Button>
          <input
            id="thumbnail-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading thumbnail...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
};

export default ThumbnailUploader;
