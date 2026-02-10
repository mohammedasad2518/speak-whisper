import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Loader2 } from "lucide-react";
import PipelineVisualization from "@/components/PipelineVisualization";
import VoiceSettings, { type VoiceSettingsState } from "@/components/VoiceSettings";
import AudioPlayer from "@/components/AudioPlayer";
import { useToast } from "@/hooks/use-toast";

const MAX_CHARS = 2000;

const Index = () => {
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const settingsRef = useRef<VoiceSettingsState>({
    voicePreset: "default",
    speed: 50,
    stability: 65,
    expressiveness: 50,
  });

  const handleSettingsChange = useCallback((s: VoiceSettingsState) => {
    settingsRef.current = s;
  }, []);

  const handleGenerate = async () => {
    if (!text.trim() || isGenerating) return;

    setIsGenerating(true);
    setAudioUrl(null);

    try {
      // Step 0: Input received
      setActiveStep(0);

      // Step 1: Preprocessing
      await new Promise((r) => setTimeout(r, 400));
      setActiveStep(1);

      // Step 2: Neural inference (actual API call)
      await new Promise((r) => setTimeout(r, 300));
      setActiveStep(2);

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

      // Step 3: Output ready
      setActiveStep(3);
      setAudioUrl(url);

      toast({ title: "Audio generated", description: "ML inference complete — audio is ready to play." });
    } catch (error: unknown) {
      console.error("TTS generation error:", error);
      setActiveStep(-1);
      const message = error instanceof Error ? error.message : "Failed to generate audio";
      toast({ title: "Generation failed", description: message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 neural-border flex items-center justify-center">
            <Mic className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">NeuroVoice</h1>
            <p className="text-xs text-muted-foreground">Neural Network Powered Text-to-Speech (Academic Project)</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Pipeline Visualization */}
          <PipelineVisualization activeStep={activeStep} />

          {/* Text Input Card */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <Textarea
              placeholder="Type or paste text you want to convert to speech"
              className="min-h-[160px] bg-muted/40 border-border resize-none text-sm leading-relaxed focus-visible:ring-primary/40"
              value={text}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) setText(e.target.value);
              }}
              disabled={isGenerating}
            />
            <div className="flex items-center justify-between">
              <span className={`text-xs font-mono ${text.length >= MAX_CHARS ? "text-destructive" : "text-muted-foreground"}`}>
                {text.length} / {MAX_CHARS}
              </span>
              <Button className="neural-glow" disabled={!text.trim() || isGenerating} onClick={handleGenerate}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  "Generate Voice"
                )}
              </Button>
            </div>
          </div>

          {/* Voice Settings */}
          <div className="rounded-xl border border-border bg-card p-5">
            <VoiceSettings onChange={handleSettingsChange} />
          </div>

          {/* Audio Output */}
          <AudioPlayer audioUrl={audioUrl} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-3">
        <p className="text-center text-[11px] text-muted-foreground">
          Academic demonstration — ML inference using a pre-trained deep learning TTS model with prosody modeling &amp; parameter tuning
        </p>
      </footer>
    </div>
  );
};

export default Index;
