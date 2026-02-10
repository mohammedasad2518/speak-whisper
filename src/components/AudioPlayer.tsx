import { Play, Pause, Volume2 } from "lucide-react";
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

  // Reset when new audio arrives
  useEffect(() => {
    setIsPlaying(false);
    setProgress([0]);
    setCurrentTime(0);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.pause();
    }
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

  return (
    <div className={`w-full rounded-lg border border-border bg-card p-4 space-y-3 transition-opacity ${hasAudio ? "opacity-100" : "opacity-50"}`}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Volume2 className="h-3.5 w-3.5 text-primary" />
        <span>{hasAudio ? "Generated Audio" : "No audio generated yet"}</span>
      </div>

      <div className="flex items-center gap-3">
        <Button
          size="icon"
          variant="outline"
          className="h-9 w-9 rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50"
          onClick={togglePlay}
          disabled={!hasAudio}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 text-primary" />
          ) : (
            <Play className="h-4 w-4 text-primary ml-0.5" />
          )}
        </Button>

        <div className="flex-1 space-y-1">
          <Slider value={progress} onValueChange={handleSeek} max={100} step={0.1} disabled={!hasAudio} />
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
