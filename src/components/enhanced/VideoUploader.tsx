
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VideoUploaderProps {
  onUploadComplete: (url: string) => void;
  onUploadStart?: () => void;
}

const VideoUploader = ({ onUploadComplete, onUploadStart }: VideoUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a video file.",
        variant: "destructive"
      });
      return;
    }

    // Check file size (100MB limit)
    if (file.size > 104857600) {
      toast({
        title: "File too large",
        description: "Please select a video file smaller than 100MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setFileName(file.name);
    setProgress(0);
    onUploadStart?.();

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${Date.now()}-${Math.random()}.${fileExt}`;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const { data, error } = await supabase.storage
        .from('lesson-videos')
        .upload(filePath, file);

      clearInterval(progressInterval);

      if (error) throw error;

      setProgress(100);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('lesson-videos')
        .getPublicUrl(data.path);

      onUploadComplete(publicUrl);

      toast({
        title: "Upload successful",
        description: "Video has been uploaded successfully.",
      });
    } catch (error: any) {
      console.error('Error uploading video:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setProgress(0);
      setFileName('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => document.getElementById('video-upload')?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Video'}
        </Button>
        <input
          id="video-upload"
          type="file"
          accept="video/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading: {fileName}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
