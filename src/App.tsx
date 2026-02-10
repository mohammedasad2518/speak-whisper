import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import HomePage from "@/pages/HomePage";
import NewPage from "@/pages/NewPage";
import EditorPage from "@/pages/EditorPage";
import CreatorPage from "@/pages/CreatorPage";
import NotFound from "@/pages/NotFound";
import { ProjectsProvider } from "@/hooks/useProjects";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ProjectsProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/new" element={<NewPage />} />
              <Route path="/creator" element={<CreatorPage />} />
            </Route>
            <Route path="/editor" element={<EditorPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ProjectsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
