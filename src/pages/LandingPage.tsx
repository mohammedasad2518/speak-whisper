import { Link } from "react-router-dom";
import { ArrowRight, AudioWaveform } from "lucide-react";
import { Button } from "@/components/ui/button";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="h-16 flex items-center justify-between px-8 max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <AudioWaveform className="h-5 w-5" />
          <span className="text-lg font-bold tracking-tight">NeuroVoice</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/signin">
            <Button variant="ghost" className="rounded-full px-5 text-sm font-medium">
              Sign In
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="rounded-full px-5 text-sm font-medium">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-3xl mx-auto -mt-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
          Pre-trained neural speech models
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] text-foreground">
          Bringing neural speech technology to life
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
          Generate natural-sounding speech from text and transcribe audio with
          state-of-the-art neural network inference. No training required.
        </p>

        <div className="flex items-center gap-4 mt-10">
          <Link to="/signup">
            <Button size="lg" className="rounded-full px-8 h-12 text-sm font-medium gap-2">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/signin">
            <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-sm font-medium">
              Sign In
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-muted-foreground">
        NeuroVoice — Academic ML project with professional UX
      </footer>
    </div>
  );
};

export default LandingPage;
