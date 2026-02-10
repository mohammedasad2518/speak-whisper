import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState, useRef, useEffect, useCallback } from "react";

interface AudioPlayerProps {
  audioUrl: string | null;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const AudioPlayer = ({ audioUrl }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState([0]);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const animRef = useRef<number>();

  useEffect(() => {
    setIsPlaying(false);
    setProgress([0]);
    setCurrentTime(0);
    setDuration(0);
    if (audioRef.current) audioRef.current.pause();
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
      audio.addEventListener("ended", () => { setIsPlaying(false); setProgress([0]); setCurrentTime(0); });
      return () => { audio.pause(); URL.revokeObjectURL(audioUrl); };
    }
  }, [audioUrl]);

  const tick = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      setCurrentTime(audio.currentTime);
      setProgress([duration > 0 ? (audio.currentTime / duration) * 100 : 0]);
      animRef.current = requestAnimationFrame(tick);
    }
  }, [duration]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      if (animRef.current) cancelAnimationFrame(animRef.current);
    } else {
      audio.play();
      animRef.current = requestAnimationFrame(tick);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const time = (value[0] / 100) * duration;
    audio.currentTime = time;
    setProgress(value);
    setCurrentTime(time);
  };

  const hasAudio = !!audioUrl;

  if (!hasAudio) return null;

  return (
    <div className="w-full space-y-2">
      <span className="text-[11px] text-muted-foreground">Output</span>
      <div className="flex items-center gap-3">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full hover:bg-accent"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" />
          )}
        </Button>

        <div className="flex-1 space-y-0.5">
          <Slider value={progress} onValueChange={handleSeek} max={100} step={0.1} />
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
