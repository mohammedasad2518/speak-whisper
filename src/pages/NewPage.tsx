import { useNavigate } from "react-router-dom";
import { Mic, ImageIcon, Video, Bell } from "lucide-react";

const NewPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 px-5 pt-14 pb-6">
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New</h1>
          <p className="text-sm text-muted-foreground mt-1">Start from scratch</p>
        </div>

        {/* Primary TTS button */}
        <button
          onClick={() => navigate("/editor")}
          className="w-full flex items-center justify-center gap-3 rounded-full bg-primary text-primary-foreground px-6 py-4 hover:bg-primary/90 transition-colors"
        >
          <Mic className="h-5 w-5" />
          <span className="text-base font-semibold">Text To Speech</span>
        </button>

        {/* Disabled creation cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-card border border-border p-5 opacity-40 pointer-events-none">
            <ImageIcon className="h-6 w-6 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">Image</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Coming soon</p>
          </div>
          <div className="rounded-2xl bg-card border border-border p-5 opacity-40 pointer-events-none">
            <Video className="h-6 w-6 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">Video</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Coming soon</p>
          </div>
        </div>

        {/* Coming soon blurred card */}
        <div className="relative rounded-2xl bg-card border border-border p-6 overflow-hidden">
          <div className="absolute inset-0 backdrop-blur-sm bg-background/60 z-10 flex flex-col items-center justify-center gap-3">
            <p className="text-base font-semibold">Coming soon</p>
            <p className="text-xs text-muted-foreground">Image &amp; Video generation</p>
            <button className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-medium hover:bg-accent/80 transition-colors">
              <Bell className="h-3.5 w-3.5" />
              Notify me
            </button>
          </div>
          {/* Placeholder content behind blur */}
          <div className="opacity-30 space-y-3">
            <div className="h-20 rounded-xl bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPage;
