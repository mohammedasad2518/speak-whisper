import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";

export interface Project {
  id: string;
  title: string;
  text: string;
  audioUrl: string;
  duration: string;
  date: string;
}

interface ProjectsCtx {
  projects: Project[];
  addProject: (p: { title: string; text: string; audioUrl: string }) => void;
  playProject: (id: string) => void;
  currentlyPlaying: string | null;
}

const Ctx = createContext<ProjectsCtx>({
  projects: [],
  addProject: () => {},
  playProject: () => {},
  currentlyPlaying: null,
});

export const useProjects = () => useContext(Ctx);

export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const addProject = useCallback(({ title, text, audioUrl }: { title: string; text: string; audioUrl: string }) => {
    // Determine duration from audio
    const audio = new Audio(audioUrl);
    audio.addEventListener("loadedmetadata", () => {
      const m = Math.floor(audio.duration / 60);
      const s = Math.floor(audio.duration % 60);
      const duration = `${m}:${s.toString().padStart(2, "0")}`;
      const now = new Date();
      const date = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      setProjects((prev) => [
        { id: crypto.randomUUID(), title, text, audioUrl, duration, date },
        ...prev,
      ]);
    });
  }, []);

  const playProject = useCallback((id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    if (audioRef.current) { audioRef.current.pause(); }
    if (currentlyPlaying === id) {
      setCurrentlyPlaying(null);
      return;
    }
    const audio = new Audio(project.audioUrl);
    audioRef.current = audio;
    audio.play();
    audio.addEventListener("ended", () => setCurrentlyPlaying(null));
    setCurrentlyPlaying(id);
  }, [projects, currentlyPlaying]);

  return (
    <Ctx.Provider value={{ projects, addProject, playProject, currentlyPlaying }}>
      {children}
    </Ctx.Provider>
  );
};
