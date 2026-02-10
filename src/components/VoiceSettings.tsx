import { Settings2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { useState, useCallback } from "react";
import { Info } from "lucide-react";

export interface VoiceSettingsState {
  voicePreset: string;
  speed: number;
  stability: number;
  expressiveness: number;
}

interface VoiceSettingsProps {
  onChange?: (settings: VoiceSettingsState) => void;
}

const VoiceSettings = ({ onChange }: VoiceSettingsProps) => {
  const [open, setOpen] = useState(false);
  const [voicePreset, setVoicePreset] = useState("default");
  const [speed, setSpeed] = useState([50]);
  const [stability, setStability] = useState([65]);
  const [expressiveness, setExpressiveness] = useState([50]);

  const notify = useCallback(
    (patch: Partial<{ voicePreset: string; speed: number[]; stability: number[]; expressiveness: number[] }>) => {
      const s = {
        voicePreset: patch.voicePreset ?? voicePreset,
        speed: (patch.speed ?? speed)[0],
        stability: (patch.stability ?? stability)[0],
        expressiveness: (patch.expressiveness ?? expressiveness)[0],
      };
      onChange?.(s);
    },
    [voicePreset, speed, stability, expressiveness, onChange]
  );

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full">
      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-between py-2">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          <span>Voice Settings</span>
        </div>
        <span className="text-xs">{open ? "Hide" : "Show"}</span>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-5 pt-4 pb-2">
        {/* Voice Preset */}
        <div className="space-y-2">
          <Label>Voice Preset</Label>
          <Select value={voicePreset} onValueChange={(v) => { setVoicePreset(v); notify({ voicePreset: v }); }}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="calm-male">Calm Male</SelectItem>
              <SelectItem value="conversational-female">Conversational Female</SelectItem>
              <SelectItem value="narration">Narration</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Speech Speed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Label>Speech Speed</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-[200px] text-xs">Controls the pace of speech generation. Lower values produce slower, more deliberate speech.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-xs text-muted-foreground font-mono">{speed[0]}%</span>
          </div>
          <Slider value={speed} onValueChange={(v) => { setSpeed(v); notify({ speed: v }); }} max={100} step={1} />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>

        {/* Voice Stability */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Label>Voice Stability</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-[200px] text-xs">Higher stability makes the voice more consistent. Lower values introduce natural variation.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-xs text-muted-foreground font-mono">{stability[0]}%</span>
          </div>
          <Slider value={stability} onValueChange={(v) => { setStability(v); notify({ stability: v }); }} max={100} step={1} />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>More variable</span>
            <span>More stable</span>
          </div>
        </div>

        {/* Expressiveness */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Label>Expressiveness</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-[200px] text-xs">Controls emotional range. Higher values produce more expressive, dynamic speech.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-xs text-muted-foreground font-mono">{expressiveness[0]}%</span>
          </div>
          <Slider value={expressiveness} onValueChange={(v) => { setExpressiveness(v); notify({ expressiveness: v }); }} max={100} step={1} />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default VoiceSettings;
