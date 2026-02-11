import { Search, Play, Pause } from "lucide-react";
import { useState } from "react";
import { useProjects, type Project } from "@/hooks/useProjects";

const CreatorPage = () => {
  const { projects, playProject, currentlyPlaying } = useProjects();
  const [search, setSearch] = useState("");

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 md:p-10">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Creator</h1>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 rounded-xl bg-card border border-border pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {projects.length === 0 ? "No generated audios yet" : "No results found"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => (
              <CreatorItem key={p.id} project={p} isPlaying={currentlyPlaying === p.id} onPlay={() => playProject(p.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function CreatorItem({ project, isPlaying, onPlay }: { project: Project; isPlaying: boolean; onPlay: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card border border-border p-4 hover:bg-accent/30 transition-colors">
      <button
        onClick={onPlay}
        className="flex-shrink-0 h-10 w-10 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{project.title}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <div className="flex items-end gap-[2px] h-3">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className={`w-[2px] rounded-full transition-colors ${
                  isPlaying ? "bg-foreground" : "bg-muted-foreground/30"
                }`}
                style={{ height: `${20 + Math.sin(i * 0.7) * 60 + Math.random() * 20}%` }}
              />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">{project.duration}</span>
          <span className="text-[10px] text-muted-foreground">{project.date}</span>
        </div>
      </div>
    </div>
  );
}

export default CreatorPage;
