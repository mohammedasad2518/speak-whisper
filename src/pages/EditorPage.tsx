import { useState, useRef, useCallback } from "react";
import { ArrowLeft, Settings2, Loader2, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import VoiceSettingsPanel, { type VoiceSettingsState } from "@/components/VoiceSettingsPanel";
import EditorAudioPlayer from "@/components/EditorAudioPlayer";
import { useToast } from "@/hooks/use-toast";
import { useProjects } from "@/hooks/useProjects";

const MAX_CHARS = 5000;

const EditorPage = () => {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { toast } = useToast();
  const { addProject } = useProjects();

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

      // Save to projects
      const title = text.slice(0, 40).trim() + (text.length > 40 ? "…" : "");
      addProject({ title, text, audioUrl: url });
    } catch (error: unknown) {
      console.error("TTS generation error:", error);
      const message = error instanceof Error ? error.message : "Failed to generate audio";
      toast({ title: "Generation failed", description: message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = "neurovoice-output.mp3";
    a.click();
  };

  return (
    <div className="flex-1 flex flex-col px-5 pt-6 pb-6 relative">
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-accent rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold">Text to Speech</h1>
          <button onClick={() => setSettingsOpen(true)} className="p-2 -mr-2 hover:bg-accent rounded-full transition-colors">
            <Settings2 className="h-5 w-5" />
          </button>
        </div>

        {/* Text input */}
        <div className="flex-1 flex flex-col">
          <textarea
            placeholder="Start typing here…"
            className="flex-1 min-h-[200px] w-full bg-transparent text-[16px] leading-relaxed resize-none focus:outline-none placeholder:text-muted-foreground/40"
            value={text}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) setText(e.target.value);
            }}
            disabled={isGenerating}
          />
          <span className={`text-[11px] font-mono self-end mt-2 ${text.length >= MAX_CHARS ? "text-destructive" : "text-muted-foreground/40"}`}>
            {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </span>
        </div>

        {/* Audio output */}
        {audioUrl && (
          <div className="mt-4 space-y-2">
            <EditorAudioPlayer audioUrl={audioUrl} />
            <button onClick={handleDownload} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>
          </div>
        )}

        {/* Floating generate button */}
        <div className="flex justify-center mt-6 mb-2">
          <Button
            size="lg"
            disabled={!text.trim() || isGenerating}
            onClick={handleGenerate}
            className="h-14 w-14 rounded-full p-0 shadow-lg shadow-primary/20"
          >
            {isGenerating ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </Button>
        </div>
      </div>

      {/* Voice settings slide-up panel */}
      <VoiceSettingsPanel
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onChange={handleSettingsChange}
      />
    </div>
  );
};

export default EditorPage;
