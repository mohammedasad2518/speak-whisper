import { useAuth } from "@/hooks/useAuth";

const SettingsPage = () => {
  const { user } = useAuth();

  return (
    <div className="flex-1 p-6 md:p-10 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Settings</h1>

      <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">Account</h2>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center text-lg font-semibold">
            {user?.avatar ?? "?"}
          </div>
          <div>
            <p className="text-sm font-medium">{user?.name ?? "Guest"}</p>
            <p className="text-xs text-muted-foreground">{user?.email ?? ""}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border p-6 mt-4 space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">About</h2>
        <p className="text-sm">NeuroVoice — Pre-trained open-source neural Text-to-Speech model</p>
        <p className="text-xs text-muted-foreground">Academic ML project with professional UX</p>
      </div>
    </div>
  );
};

export default SettingsPage;
