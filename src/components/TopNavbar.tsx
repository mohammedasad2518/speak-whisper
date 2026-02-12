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
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">
      <span className="text-base font-bold tracking-tight">NeuroVoice</span>

      {user && (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-xs font-semibold">
            {user.avatar}
          </div>
          <button onClick={handleSignOut} className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}
    </header>
  );
};

export default TopNavbar;
