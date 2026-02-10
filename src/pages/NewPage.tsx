import { useNavigate } from "react-router-dom";
import { Mic } from "lucide-react";

const NewPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 px-5 pt-14 pb-6">
      <div className="max-w-lg mx-auto space-y-8">
        <h1 className="text-2xl font-semibold tracking-tight">New</h1>

        <button
          onClick={() => navigate("/editor")}
          className="w-full flex items-center gap-3 rounded-full bg-card border border-border px-6 py-4 hover:bg-accent transition-colors"
        >
          <Mic className="h-5 w-5 text-foreground" />
          <span className="text-base font-medium">Text To Speech</span>
        </button>

        <div className="flex-1 flex items-center justify-center pt-20">
          <p className="text-xs text-muted-foreground/40">Choose a creation method above</p>
        </div>
      </div>
    </div>
  );
};

export default NewPage;
