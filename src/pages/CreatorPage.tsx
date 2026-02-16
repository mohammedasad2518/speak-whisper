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
        <h1 className="text-2xl font-semibold tracking-tight text-foreground animate-glass-in">Creator</h1>

        {/* Search */}
        <div className="relative max-w-md animate-glass-in" style={{ animationDelay: "0.05s" }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 rounded-xl glass-input pl-10 pr-4"
          />
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="glass-card p-12 text-center border-dashed animate-glass-in">
            <p className="text-sm text-muted-foreground">
              {projects.length === 0 ? "No generated audios yet" : "No results found"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((p, i) => (
              <CreatorItem
                key={p.id}
                project={p}
                isPlaying={currentlyPlaying === p.id}
                onPlay={() => playProject(p.id)}
                delay={i * 0.05}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function CreatorItem({ project, isPlaying, onPlay, delay }: { project: Project; isPlaying: boolean; onPlay: () => void; delay: number }) {
  return (
    <div
      className="glass-card glass-hover flex items-center gap-3 p-4 animate-glass-in"
      style={{ animationDelay: `${delay + 0.1}s` }}
    >
      <button
        onClick={onPlay}
        className="flex-shrink-0 h-10 w-10 rounded-full glass flex items-center justify-center hover:bg-white/30 transition-colors"
      >
        {isPlaying ? <Pause className="h-4 w-4 text-foreground" /> : <Play className="h-4 w-4 ml-0.5 text-foreground" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-foreground">{project.title}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <div className="flex items-end gap-[2px] h-3">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className={`w-[2px] rounded-full transition-colors ${
                  isPlaying ? "bg-foreground" : "bg-foreground/30"
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
