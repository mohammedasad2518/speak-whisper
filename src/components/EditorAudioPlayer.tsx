import { Play, Pause } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

interface Props {
  audioUrl: string;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const EditorAudioPlayer = ({ audioUrl }: Props) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const animRef = useRef<number>();

  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("ended", () => { setIsPlaying(false); setProgress(0); setCurrentTime(0); });
    return () => { audio.pause(); URL.revokeObjectURL(audioUrl); };
  }, [audioUrl]);

  const tick = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      setCurrentTime(audio.currentTime);
      setProgress(duration > 0 ? (audio.currentTime / duration) * 100 : 0);
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

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * duration;
    setProgress(pct * 100);
    setCurrentTime(pct * duration);
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-4">
      <button
        onClick={togglePlay}
        className="flex-shrink-0 h-10 w-10 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
      </button>
      <div className="flex-1 space-y-1">
        {/* Waveform-style progress */}
        <div className="relative h-8 flex items-end gap-[2px] cursor-pointer" onClick={handleSeek}>
          {Array.from({ length: 40 }).map((_, i) => {
            const barPct = (i / 40) * 100;
            const height = 30 + Math.sin(i * 0.5) * 40 + Math.sin(i * 1.3) * 20;
            return (
              <div
                key={i}
                className={`flex-1 rounded-full transition-colors ${
                  barPct <= progress ? "bg-foreground" : "bg-muted-foreground/20"
                }`}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default EditorAudioPlayer;
