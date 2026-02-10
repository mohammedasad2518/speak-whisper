import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import VoiceSettings, { type VoiceSettingsState } from "@/components/VoiceSettings";
import AudioPlayer from "@/components/AudioPlayer";
import { useToast } from "@/hooks/use-toast";

const MAX_CHARS = 5000;

const Index = () => {
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const settingsRef = useRef<VoiceSettingsState>({
    voicePreset: "neutral-studio",
    speed: 50,
    stability: 70,
    expressiveness: 40,
  });

  const handleSettingsChange = useCallback((s: VoiceSettingsState) => {
    settingsRef.current = s;
  }, []);

  const handleGenerate = async () => {
    if (!text.trim() || isGenerating) return;

    setIsGenerating(true);
    setAudioUrl(null);

    try {
      const settings = settingsRef.current;
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/neurovoice-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text,
            voicePreset: settings.voicePreset,
            speed: settings.speed,
            stability: settings.stability,
            expressiveness: settings.expressiveness,
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errData.error || `Request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (error: unknown) {
      console.error("TTS generation error:", error);
      const message = error instanceof Error ? error.message : "Failed to generate audio";
      toast({ title: "Generation failed", description: message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 pt-10 pb-2">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-semibold tracking-tight">NeuroVoice</h1>
          <p className="text-xs text-muted-foreground mt-1">Text-to-speech synthesis</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Text Input */}
          <div className="space-y-3">
            <Textarea
              placeholder="Enter text to synthesize…"
              className="min-h-[180px] bg-card border-border resize-none text-[15px] leading-relaxed focus-visible:ring-1 focus-visible:ring-ring rounded-lg"
              value={text}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) setText(e.target.value);
              }}
              disabled={isGenerating}
            />
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-mono ${text.length >= MAX_CHARS ? "text-destructive" : "text-muted-foreground"}`}>
                {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
              </span>
              <Button
                size="sm"
                disabled={!text.trim() || isGenerating}
                onClick={handleGenerate}
                className="h-8 px-4 text-xs font-medium"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Generating
                  </>
                ) : (
                  "Generate"
                )}
              </Button>
            </div>
          </div>

          {/* Voice Settings */}
          <VoiceSettings onChange={handleSettingsChange} />

          {/* Audio Output */}
          <AudioPlayer audioUrl={audioUrl} />
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4">
        <p className="text-center text-[11px] text-muted-foreground/60">
          Neural speech synthesis — academic research project
        </p>
      </footer>
    </div>
  );
};

export default Index;
