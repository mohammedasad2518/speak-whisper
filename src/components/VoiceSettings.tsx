import { Settings2, ChevronDown } from "lucide-react";
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
  const [voicePreset, setVoicePreset] = useState("neutral-studio");
  const [speed, setSpeed] = useState([50]);
  const [stability, setStability] = useState([70]);
  const [expressiveness, setExpressiveness] = useState([40]);

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
      <CollapsibleTrigger className="flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-between py-2 group">
        <div className="flex items-center gap-1.5">
          <Settings2 className="h-3.5 w-3.5" />
          <span>Voice settings</span>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-4 pt-3 pb-1">
        {/* Voice Preset */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Voice</Label>
          <Select value={voicePreset} onValueChange={(v) => { setVoicePreset(v); notify({ voicePreset: v }); }}>
            <SelectTrigger className="bg-card h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="calm-male">Calm Male</SelectItem>
              <SelectItem value="conversational-male">Conversational Male</SelectItem>
              <SelectItem value="calm-female">Calm Female</SelectItem>
              <SelectItem value="conversational-female">Conversational Female</SelectItem>
              <SelectItem value="narration">Professional Narration</SelectItem>
              <SelectItem value="neutral-studio">Neutral Studio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sliders */}
        <SliderRow
          label="Speed"
          tooltip="Controls speech pace. The model adjusts phoneme duration for natural timing."
          value={speed}
          onChange={(v) => { setSpeed(v); notify({ speed: v }); }}
          left="Slower"
          right="Faster"
        />
        <SliderRow
          label="Stability"
          tooltip="Higher values produce consistent output. Lower values add natural vocal variation."
          value={stability}
          onChange={(v) => { setStability(v); notify({ stability: v }); }}
          left="Variable"
          right="Stable"
        />
        <SliderRow
          label="Expressiveness"
          tooltip="Controls prosodic variation — pitch modulation, emphasis, and emotional range."
          value={expressiveness}
          onChange={(v) => { setExpressiveness(v); notify({ expressiveness: v }); }}
          left="Neutral"
          right="Expressive"
        />
      </CollapsibleContent>
    </Collapsible>
  );
};

function SliderRow({ label, tooltip, value, onChange, left, right }: {
  label: string;
  tooltip: string;
  value: number[];
  onChange: (v: number[]) => void;
  left: string;
  right: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Label className="text-xs text-muted-foreground">{label}</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground/50 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="max-w-[220px] text-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <span className="text-[11px] text-muted-foreground font-mono">{value[0]}</span>
      </div>
      <Slider value={value} onValueChange={onChange} max={100} step={1} />
      <div className="flex justify-between text-[10px] text-muted-foreground/50">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}

export default VoiceSettings;
