import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TopNavbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  return (
    <header className="h-14 glass-strong flex items-center justify-between px-6 shrink-0 border-b border-white/20">
      <span className="text-base font-bold tracking-tight text-foreground">NeuroVoice</span>

      {user && (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full glass flex items-center justify-center text-xs font-semibold text-foreground">
            {user.avatar}
          </div>
          <button onClick={handleSignOut} className="p-1.5 rounded-lg glass-hover hover:bg-white/20 transition-colors text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}
    </header>
  );
};

export default TopNavbar;
