
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoPlayerProps {
  videoUrl?: string;
  title: string;
  duration: number;
  onWatchTimeUpdate: (minutes: number) => void;
  onComplete: () => void;
}

const VideoPlayer = ({ videoUrl, title, duration, onWatchTimeUpdate, onComplete }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [watchedTime, setWatchedTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && videoRef.current) {
        const newWatchedTime = Math.floor(watchedTime + 1);
        setWatchedTime(newWatchedTime);
        onWatchTimeUpdate(Math.floor(newWatchedTime / 60));
        
        // Check if 80% of the video has been watched
        const completionThreshold = (duration * 60) * 0.8;
        if (newWatchedTime >= completionThreshold) {
          onComplete();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, watchedTime, duration, onWatchTimeUpdate, onComplete]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Demo video for now - in production this would use the actual videoUrl
  const demoVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={videoUrl || demoVideoUrl}
        className="w-full aspect-video"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
      
      {/* Video Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            
            <span className="text-sm">
              {formatTime(currentTime)} / {formatTime(duration * 60)}
            </span>
          </div>
          
          <div className="text-sm">
            Watch time: {Math.floor(watchedTime / 60)} min
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-2 w-full bg-white/30 rounded-full h-1">
          <div 
            className="bg-emerald-500 h-1 rounded-full transition-all duration-300"
            style={{ width: `${(currentTime / (duration * 60)) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Play Button Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <Button
            onClick={togglePlay}
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 rounded-full w-16 h-16"
          >
            <Play className="h-8 w-8 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
