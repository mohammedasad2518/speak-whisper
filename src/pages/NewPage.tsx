import { useNavigate } from "react-router-dom";
import { Mic, AudioLines } from "lucide-react";

const NewPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 p-6 md:p-10">
      <div className="max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New</h1>
          <p className="text-sm text-muted-foreground mt-1">Start from scratch</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 max-w-lg">
          {/* TTS */}
          <button
            onClick={() => navigate("/editor")}
            className="flex flex-col items-start gap-3 rounded-2xl bg-card border border-border p-6 hover:bg-accent/40 transition-colors text-left"
          >
            <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold">Text to Speech</p>
              <p className="text-xs text-muted-foreground mt-0.5">Generate natural speech from text</p>
            </div>
          </button>

          {/* STT */}
          <button
            onClick={() => navigate("/stt")}
            className="flex flex-col items-start gap-3 rounded-2xl bg-card border border-border p-6 hover:bg-accent/40 transition-colors text-left"
          >
            <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
              <AudioLines className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold">Speech to Text</p>
              <p className="text-xs text-muted-foreground mt-0.5">Transcribe audio with neural recognition</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPage;
