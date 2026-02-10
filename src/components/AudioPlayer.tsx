import { Play, Pause, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState([0]);

  return (
    <div className="w-full rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Volume2 className="h-3.5 w-3.5 text-primary" />
        <span>Generated Audio</span>
      </div>

      <div className="flex items-center gap-3">
        <Button
          size="icon"
          variant="outline"
          className="h-9 w-9 rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 text-primary" />
          ) : (
            <Play className="h-4 w-4 text-primary ml-0.5" />
          )}
        </Button>

        <div className="flex-1 space-y-1">
          <Slider value={progress} onValueChange={setProgress} max={100} step={1} />
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
            <span>0:00</span>
            <span>0:00</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
