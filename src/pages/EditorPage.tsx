import { useState, useRef, useCallback, useEffect } from "react";
import { ArrowLeft, Settings2, Loader2, Download, Play, Pause } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import VoiceSettingsPanel, { type VoiceSettingsState } from "@/components/VoiceSettingsPanel";
import { useToast } from "@/hooks/use-toast";
import { useProjects } from "@/hooks/useProjects";

const MAX_CHARS = 5000;

// Map preset → desired gender + locale preferences for picking a system voice.
// Pitch is layered on top to enforce identity.
type Preset = {
  gender: "male" | "female";
  langPrefs: string[];
  namePrefs: string[];
  pitch: number; // base pitch, 0.1–2.0 (1 = default)
  rate: number;  // base rate, 0.1–10 (1 = default)
};

const PRESETS: Record<string, Preset> = {
  oliver: {
    gender: "male",
    langPrefs: ["en-GB", "en-IE", "en-AU", "en"],
    namePrefs: ["Daniel", "Oliver", "George", "Arthur", "UK English Male", "Google UK English Male"],
    pitch: 0.7,
    rate: 0.95,
  },
  james: {
    gender: "male",
    langPrefs: ["en-US", "en"],
    namePrefs: ["Alex", "James", "Aaron", "Fred", "US English Male", "Google US English"],
    pitch: 0.85,
    rate: 1.0,
  },
  william: {
    gender: "male",
    langPrefs: ["en-AU", "en-GB", "en-ZA", "en"],
    namePrefs: ["William", "Lee", "Rishi", "Australian Male"],
    pitch: 0.75,
    rate: 0.92,
  },
  amelia: {
    gender: "female",
    langPrefs: ["en-AU", "en-GB", "en"],
    namePrefs: ["Karen", "Amelia", "Catherine", "Australian Female", "Google UK English Female"],
    pitch: 1.15,
    rate: 1.0,
  },
  charlotte: {
    gender: "female",
    langPrefs: ["en-IN", "en-GB", "en"],
    namePrefs: ["Veena", "Rishi", "Charlotte", "Tessa", "Indian Female"],
    pitch: 1.25,
    rate: 1.05,
  },
};

const FEMALE_HINTS = ["female", "woman", "samantha", "victoria", "karen", "tessa", "veena", "fiona", "moira", "zira", "susan", "amelia", "charlotte", "catherine", "google uk english female", "google us english"];
const MALE_HINTS = ["male", "man", "daniel", "alex", "fred", "aaron", "oliver", "george", "arthur", "james", "william", "lee", "rishi", "david", "mark", "uk english male"];

function pickVoice(voices: SpeechSynthesisVoice[], preset: Preset): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;

  // 1) Try exact name preference
  for (const name of preset.namePrefs) {
    const v = voices.find((x) => x.name.toLowerCase().includes(name.toLowerCase()));
    if (v) return v;
  }

  // 2) Try locale + gender hint
  const hints = preset.gender === "male" ? MALE_HINTS : FEMALE_HINTS;
  const otherHints = preset.gender === "male" ? FEMALE_HINTS : MALE_HINTS;

  for (const lang of preset.langPrefs) {
    const matches = voices.filter((v) => v.lang.toLowerCase().startsWith(lang.toLowerCase()));
    // a) prefer voices whose name suggests target gender
    const target = matches.find((v) => hints.some((h) => v.name.toLowerCase().includes(h)));
    if (target) return target;
    // b) avoid voices whose name suggests opposite gender
    const neutral = matches.find((v) => !otherHints.some((h) => v.name.toLowerCase().includes(h)));
    if (neutral) return neutral;
  }

  // 3) Any English voice matching gender hint
  const en = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const target = en.find((v) => hints.some((h) => v.name.toLowerCase().includes(h)));
  if (target) return target;

  // 4) Fallback: any English, else first available
  return en[0] ?? voices[0];
}

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) {
      resolve(existing);
      return;
    }
    const handler = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        window.speechSynthesis.onvoiceschanged = null;
        resolve(v);
      }
    };
    window.speechSynthesis.onvoiceschanged = handler;
    // Fallback timeout
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1500);
  });
}

const EditorPage = () => {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const { toast } = useToast();
  const { addProject } = useProjects();

  const settingsRef = useRef<VoiceSettingsState>({
    voicePreset: "william",
    speed: 50,
    pitch: 0,
    stability: 70,
    expressiveness: 40,
  });
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    loadVoices().then(setVoices);
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleSettingsChange = useCallback((s: VoiceSettingsState) => {
    settingsRef.current = s;
  }, []);

  const handleGenerate = useCallback(() => {
    if (!text.trim() || isGenerating) return;

    if (!("speechSynthesis" in window)) {
      toast({
        title: "Not supported",
        description: "Your browser doesn't support speech synthesis. Try Chrome, Edge, or Safari.",
        variant: "destructive",
      });
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const settings = settingsRef.current;
    const preset = PRESETS[settings.voicePreset] ?? PRESETS.william;

    const utterance = new SpeechSynthesisUtterance(text);
    const selected = pickVoice(voices, preset);
    if (selected) utterance.voice = selected;
    utterance.lang = selected?.lang ?? preset.langPrefs[0];

    // Layer user settings on top of preset baseline
    // pitch slider: -12..+12 semitones → roughly -0.5..+0.5 around baseline
    const pitchAdjust = (settings.pitch / 12) * 0.5;
    utterance.pitch = Math.max(0.1, Math.min(2, preset.pitch + pitchAdjust));

    // speed slider: 0..100 → 0.5..1.5x baseline
    const speedFactor = 0.5 + (settings.speed / 100);
    utterance.rate = Math.max(0.1, Math.min(10, preset.rate * speedFactor));

    utterance.volume = 1;

    utterance.onstart = () => {
      setIsGenerating(false);
      setIsPlaying(true);
    };
    utterance.onend = () => {
      setIsPlaying(false);
      utteranceRef.current = null;
    };
    utterance.onerror = (e) => {
      console.error("Speech error:", e);
      setIsGenerating(false);
      setIsPlaying(false);
      if (e.error !== "canceled" && e.error !== "interrupted") {
        toast({ title: "Playback failed", description: e.error, variant: "destructive" });
      }
    };

    utteranceRef.current = utterance;
    setIsGenerating(true);
    window.speechSynthesis.speak(utterance);

    // Save project (no audio URL — synthesis is live)
    const title = text.slice(0, 40).trim() + (text.length > 40 ? "…" : "");
    addProject({ title, text, audioUrl: "" });
  }, [text, isGenerating, voices, toast, addProject]);

  const handleStop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsGenerating(false);
  }, []);

  const handleDownload = () => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "neurovoice-script.txt";
    a.click();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-14 glass-strong border-b border-white/20 flex items-center justify-between px-6 shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/20 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-base font-semibold text-foreground">Text to Speech</h1>
        <button onClick={() => setSettingsOpen(true)} className="p-2 -mr-2 hover:bg-white/20 rounded-lg transition-colors">
          <Settings2 className="h-5 w-5 text-foreground" />
        </button>
      </div>

      <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto p-6 md:p-10">
        <div className="flex-1 flex flex-col">
          <textarea
            placeholder="Start typing your text here..."
            className="flex-1 min-h-[250px] w-full glass-input text-[16px] leading-relaxed resize-none p-4"
            value={text}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) setText(e.target.value);
            }}
            disabled={isGenerating || isPlaying}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-muted-foreground">
              {voices.length > 0
                ? `${voices.length} system voices available`
                : "Loading voices…"}
            </span>
            <span className={`text-[11px] font-mono ${text.length >= MAX_CHARS ? "text-destructive" : "text-muted-foreground"}`}>
              {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </span>
          </div>
        </div>

        {(isPlaying || text) && (
          <div className="mt-6 flex items-center gap-3">
            {text && !isPlaying && !isGenerating && (
              <button onClick={handleDownload} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Download className="h-3.5 w-3.5" />
                <span>Download script</span>
              </button>
            )}
          </div>
        )}

        <div className="flex justify-center mt-8 mb-4">
          {isPlaying ? (
            <Button
              size="lg"
              variant="destructive"
              onClick={handleStop}
              className="h-14 w-14 rounded-full p-0 shadow-lg"
            >
              <Pause className="h-6 w-6" />
            </Button>
          ) : (
            <Button
              size="lg"
              disabled={!text.trim() || isGenerating || voices.length === 0}
              onClick={handleGenerate}
              className="h-14 w-14 rounded-full p-0 shadow-lg shadow-primary/20"
            >
              {isGenerating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Play className="h-6 w-6 ml-0.5" />}
            </Button>
          )}
        </div>
      </div>

      <VoiceSettingsPanel
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onChange={handleSettingsChange}
      />
    </div>
  );
};

export default EditorPage;
