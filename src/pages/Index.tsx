import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic } from "lucide-react";
import PipelineVisualization from "@/components/PipelineVisualization";
import VoiceSettings from "@/components/VoiceSettings";
import AudioPlayer from "@/components/AudioPlayer";

const MAX_CHARS = 2000;

const Index = () => {
  const [text, setText] = useState("");

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
          <PipelineVisualization />

          {/* Text Input Card */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <Textarea
              placeholder="Type or paste text you want to convert to speech"
              className="min-h-[160px] bg-muted/40 border-border resize-none text-sm leading-relaxed focus-visible:ring-primary/40"
              value={text}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) setText(e.target.value);
              }}
            />
            <div className="flex items-center justify-between">
              <span className={`text-xs font-mono ${text.length >= MAX_CHARS ? "text-destructive" : "text-muted-foreground"}`}>
                {text.length} / {MAX_CHARS}
              </span>
              <Button className="neural-glow" disabled={!text.trim()}>
                Generate Voice
              </Button>
            </div>
          </div>

          {/* Voice Settings */}
          <div className="rounded-xl border border-border bg-card p-5">
            <VoiceSettings />
          </div>

          {/* Audio Output */}
          <AudioPlayer />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-3">
        <p className="text-center text-[11px] text-muted-foreground">
          Academic demonstration — Neural TTS pipeline visualization
        </p>
      </footer>
    </div>
  );
};

export default Index;
