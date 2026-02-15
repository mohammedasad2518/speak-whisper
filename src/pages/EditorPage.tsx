import { useState, useRef, useCallback } from "react";
import { ArrowLeft, Settings2, Loader2, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import VoiceSettingsPanel, { type VoiceSettingsState } from "@/components/VoiceSettingsPanel";
import EditorAudioPlayer from "@/components/EditorAudioPlayer";
import { useToast } from "@/hooks/use-toast";
import { useProjects } from "@/hooks/useProjects";

const MAX_CHARS = 5000;

async function applyPitchShift(blob: Blob, semitones: number): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioCtx = new AudioContext();
  const decoded = await audioCtx.decodeAudioData(arrayBuffer);

  const rate = Math.pow(2, semitones / 12);
  const offlineCtx = new OfflineAudioContext(
    decoded.numberOfChannels,
    Math.ceil(decoded.length / rate),
    decoded.sampleRate
  );

  const source = offlineCtx.createBufferSource();
  source.buffer = decoded;
  source.playbackRate.value = rate;
  source.connect(offlineCtx.destination);
  source.start(0);

  const rendered = await offlineCtx.startRendering();

  const wavBuffer = audioBufferToWav(rendered);
  await audioCtx.close();
  return new Blob([wavBuffer], { type: "audio/wav" });
}

function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numChannels * 2 + 44;
  const out = new ArrayBuffer(length);
  const view = new DataView(out);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, length - 8, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, length - 44, true);

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }
  return out;
}

const EditorPage = () => {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { toast } = useToast();
  const { addProject } = useProjects();

  const settingsRef = useRef<VoiceSettingsState>({
    voicePreset: "william",
    speed: 50,
    pitch: 0,
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

      const pitchBaseline = parseInt(response.headers.get("X-Pitch-Baseline") || "0", 10);
      const audioBlob = await response.blob();
      const totalPitch = pitchBaseline + settings.pitch;

      let finalUrl: string;
      if (totalPitch !== 0) {
        const shifted = await applyPitchShift(audioBlob, totalPitch);
        finalUrl = URL.createObjectURL(shifted);
      } else {
        finalUrl = URL.createObjectURL(audioBlob);
      }
      setAudioUrl(finalUrl);

      const title = text.slice(0, 40).trim() + (text.length > 40 ? "…" : "");
      addProject({ title, text, audioUrl: finalUrl });
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-accent rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold">Text to Speech</h1>
        <button onClick={() => setSettingsOpen(true)} className="p-2 -mr-2 hover:bg-accent rounded-lg transition-colors">
          <Settings2 className="h-5 w-5" />
        </button>
      </div>

      {/* Editor body */}
      <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto p-6 md:p-10">
        <div className="flex-1 flex flex-col">
          <textarea
            placeholder="Start typing your text here..."
            className="flex-1 min-h-[250px] w-full bg-transparent text-[16px] leading-relaxed resize-none focus:outline-none placeholder:text-muted-foreground/40"
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
          <div className="mt-6 space-y-3">
            <EditorAudioPlayer audioUrl={audioUrl} />
            <button onClick={handleDownload} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>
          </div>
        )}

        {/* Generate button */}
        <div className="flex justify-center mt-8 mb-4">
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

      <VoiceSettingsPanel
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onChange={handleSettingsChange}
      />
    </div>
  );
};

export default EditorPage;
