import { Link } from "react-router-dom";
import { ArrowRight, AudioWaveform } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="h-16 flex items-center justify-between px-8 max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <AudioWaveform className="h-5 w-5 text-foreground" />
          <span className="text-lg font-bold tracking-tight text-foreground">NeuroVoice</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/signin">
            <button className="glass-btn text-sm text-foreground">Sign In</button>
          </Link>
          <Link to="/signin">
            <button className="glass-btn text-sm font-semibold text-foreground">
              Get Started
            </button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-3xl mx-auto -mt-16">
        <div className="glass-card-strong p-12 animate-glass-in">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-muted-foreground mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
            Pre-trained neural speech models
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] text-foreground">
            Bringing neural speech technology to life
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed mx-auto">
            Generate natural-sounding speech from text and transcribe audio with
            state-of-the-art neural network inference. No training required.
          </p>

          <div className="flex items-center justify-center gap-4 mt-10">
            <Link to="/signin">
              <button className="glass-btn font-semibold text-foreground inline-flex items-center gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link to="/signin">
              <button className="glass-btn text-muted-foreground">
                Sign In
              </button>
            </Link>
          </div>
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
