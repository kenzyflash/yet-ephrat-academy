
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
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
  const [videoDuration, setVideoDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [watchedTime, setWatchedTime] = useState(0);
  const [hasCompletedOnce, setHasCompletedOnce] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && videoRef.current) {
        const newWatchedTime = Math.floor(watchedTime + 1);
        setWatchedTime(newWatchedTime);
        onWatchTimeUpdate(Math.floor(newWatchedTime / 60));
        
        // Check if 80% of the video has been watched and hasn't been completed before
        const completionThreshold = (duration * 60) * 0.8;
        if (newWatchedTime >= completionThreshold && !hasCompletedOnce) {
          setHasCompletedOnce(true);
          onComplete();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, watchedTime, duration, onWatchTimeUpdate, onComplete, hasCompletedOnce]);

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

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current && videoDuration > 0) {
      const newTime = (value[0] / 100) * videoDuration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume === 0) {
        setIsMuted(true);
        videoRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Demo video for now - in production this would use the actual videoUrl
  const demoVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  const progressPercentage = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={videoUrl || demoVideoUrl}
        className="w-full aspect-video"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {/* Video Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[progressPercentage]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="w-full"
          />
        </div>
        
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
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              
              <div className="w-20">
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
            
            <span className="text-sm">
              {formatTime(currentTime)} / {formatTime(videoDuration || duration * 60)}
            </span>
          </div>
          
          <div className="text-sm">
            Watch time: {Math.floor(watchedTime / 60)} min
          </div>
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
