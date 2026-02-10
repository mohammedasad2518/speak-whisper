import { useNavigate } from "react-router-dom";
import { Plus, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjects, type Project } from "@/hooks/useProjects";

const HomePage = () => {
  const navigate = useNavigate();
  const { projects } = useProjects();

  return (
    <div className="flex-1 px-5 pt-14 pb-6">
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Home</h1>

        <Button
          onClick={() => navigate("/new")}
          className="w-full h-14 rounded-2xl text-base font-medium gap-2"
        >
          <Plus className="h-5 w-5" />
          Create new
        </Button>

        {/* Promo banner */}
        <div className="rounded-2xl bg-gradient-to-br from-accent to-secondary p-5">
          <p className="text-sm font-medium text-foreground">NeuroVoice Studio</p>
          <p className="text-xs text-muted-foreground mt-1">
            Generate expressive, natural-sounding speech from text.
          </p>
        </div>

        {/* Recent projects */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Recent projects</h2>
          {projects.length === 0 ? (
            <p className="text-xs text-muted-foreground/60 py-8 text-center">
              No projects yet. Create your first one!
            </p>
          ) : (
            <div className="space-y-2">
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
  const { playProject } = useProjects();

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-4">
      <button
        onClick={() => playProject(project.id)}
        className="flex-shrink-0 h-10 w-10 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors"
      >
        <Play className="h-4 w-4 ml-0.5" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{project.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {/* Mini waveform */}
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
