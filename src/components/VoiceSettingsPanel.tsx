import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useState, useCallback, useEffect } from "react";

export interface VoiceSettingsState {
  voicePreset: string;
  speed: number;
  pitch: number;
  stability: number;
  expressiveness: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange?: (settings: VoiceSettingsState) => void;
}

const voices = [
  { value: "oliver", label: "Oliver" },
  { value: "james", label: "James" },
  { value: "amelia", label: "Amelia" },
  { value: "charlotte", label: "Charlotte" },
  { value: "william", label: "William" },
];

const VoiceSettingsPanel = ({ open, onOpenChange, onChange }: Props) => {
  const [voicePreset, setVoicePreset] = useState("william");
  const [speed, setSpeed] = useState([50]);
  const [pitch, setPitch] = useState([0]);
  const [stability, setStability] = useState([70]);
  const [expressiveness, setExpressiveness] = useState([40]);

  const notify = useCallback(() => {
    onChange?.({
      voicePreset,
      speed: speed[0],
      pitch: pitch[0],
      stability: stability[0],
      expressiveness: expressiveness[0],
    });
  }, [voicePreset, speed, pitch, stability, expressiveness, onChange]);

  useEffect(() => { notify(); }, [notify]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Voice Settings</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-8 space-y-6">
          {/* Voice */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Voice</Label>
            <Select value={voicePreset} onValueChange={(v) => setVoicePreset(v)}>
              <SelectTrigger className="bg-card h-12 rounded-xl text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {voices.map((v) => (
                  <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <SliderRow label="Speed" value={speed} onChange={setSpeed} min={0} max={100} />
          <SliderRow label="Pitch" value={pitch} onChange={setPitch} min={-12} max={12} />
          <SliderRow label="Stability" value={stability} onChange={setStability} min={0} max={100} />
          <SliderRow label="Expressiveness" value={expressiveness} onChange={setExpressiveness} min={0} max={100} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

function SliderRow({ label, value, onChange, min = 0, max = 100 }: {
  label: string;
  value: number[];
  onChange: (v: number[]) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <Label className="text-sm text-muted-foreground">{label}</Label>
        <span className="text-xs text-muted-foreground font-mono">{value[0]}</span>
      </div>
      <Slider value={value} onValueChange={onChange} min={min} max={max} step={1} className="py-1" />
    </div>
  );
}

export default VoiceSettingsPanel;
