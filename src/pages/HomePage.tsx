import { useNavigate } from "react-router-dom";
import { Plus, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjects, type Project } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";

const HomePage = () => {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { user } = useAuth();

  return (
    <div className="flex-1 p-6 md:p-10">
      <div className="max-w-3xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user?.name ?? "there"}</h1>
          <p className="text-sm text-muted-foreground mt-1">Create natural-sounding speech from text</p>
        </div>

        <Button onClick={() => navigate("/new")} size="lg" className="rounded-xl gap-2 h-12 px-6 shadow-none">
          <Plus className="h-5 w-5" />
          Create new
        </Button>

        {/* Recent projects */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">Recent projects</h2>
          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <p className="text-sm text-muted-foreground">No projects yet. Create your first one!</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function ProjectCard({ project }: { project: Project }) {
  const { playProject, currentlyPlaying } = useProjects();
  const playing = currentlyPlaying === project.id;

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card border border-border p-4 hover:bg-accent/30 transition-colors">
      <button
        onClick={() => playProject(project.id)}
        className="flex-shrink-0 h-10 w-10 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors"
      >
        <Play className={`h-4 w-4 ml-0.5 ${playing ? "text-primary" : ""}`} />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{project.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex items-end gap-[2px] h-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="w-[2px] bg-muted-foreground/30 rounded-full"
                style={{ height: `${20 + Math.sin(i * 0.8) * 60 + Math.random() * 20}%` }}
              />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">{project.duration}</span>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
