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
  stability: number;
  expressiveness: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange?: (settings: VoiceSettingsState) => void;
}

const voices = [
  { value: "male-deep", label: "Male – Deep" },
  { value: "male-calm", label: "Male – Calm" },
  { value: "female-warm", label: "Female – Warm" },
  { value: "female-expressive", label: "Female – Expressive" },
  { value: "neutral-narration", label: "Neutral – Narration" },
];

const VoiceSettingsPanel = ({ open, onOpenChange, onChange }: Props) => {
  const [voicePreset, setVoicePreset] = useState("neutral-narration");
  const [speed, setSpeed] = useState([50]);
  const [stability, setStability] = useState([70]);
  const [expressiveness, setExpressiveness] = useState([40]);

  const notify = useCallback(() => {
    onChange?.({
      voicePreset,
      speed: speed[0],
      stability: stability[0],
      expressiveness: expressiveness[0],
    });
  }, [voicePreset, speed, stability, expressiveness, onChange]);

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

          <SliderRow label="Speed" value={speed} onChange={setSpeed} />
          <SliderRow label="Stability" value={stability} onChange={setStability} />
          <SliderRow label="Expressiveness" value={expressiveness} onChange={setExpressiveness} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

function SliderRow({ label, value, onChange }: {
  label: string;
  value: number[];
  onChange: (v: number[]) => void;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <Slider value={value} onValueChange={onChange} max={100} step={1} className="py-1" />
    </div>
  );
}

export default VoiceSettingsPanel;
