import { useAuth } from "@/hooks/useAuth";

const SettingsPage = () => {
  const { user } = useAuth();

  return (
    <div className="flex-1 p-6 md:p-10 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight mb-6 text-foreground animate-glass-in">Settings</h1>

      <div className="glass-card-strong p-6 space-y-4 animate-glass-in" style={{ animationDelay: "0.05s" }}>
        <h2 className="text-sm font-medium text-muted-foreground">Account</h2>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full glass flex items-center justify-center text-lg font-semibold text-foreground">
            {user?.avatar ?? "?"}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{user?.name ?? "Guest"}</p>
            <p className="text-xs text-muted-foreground">{user?.email ?? ""}</p>
          </div>
        </div>
      </div>

      <div className="glass-card-strong p-6 mt-4 space-y-2 animate-glass-in" style={{ animationDelay: "0.1s" }}>
        <h2 className="text-sm font-medium text-muted-foreground">About</h2>
        <p className="text-sm text-foreground">NeuroVoice — Pre-trained open-source neural Text-to-Speech model</p>
        <p className="text-xs text-muted-foreground">Academic ML project with professional UX</p>
      </div>
    </div>
  );
};

export default SettingsPage;
