import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import LandingPage from "@/pages/LandingPage";
import HomePage from "@/pages/HomePage";
import NewPage from "@/pages/NewPage";
import EditorPage from "@/pages/EditorPage";
import SpeechToTextPage from "@/pages/SpeechToTextPage";
import CreatorPage from "@/pages/CreatorPage";
import SettingsPage from "@/pages/SettingsPage";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
import NotFound from "@/pages/NotFound";
import { ProjectsProvider } from "@/hooks/useProjects";
import { AuthProvider } from "@/hooks/useAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ProjectsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route element={<AppLayout />}>
                <Route path="/home" element={<HomePage />} />
                <Route path="/new" element={<NewPage />} />
                <Route path="/creator" element={<CreatorPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              <Route path="/editor" element={<div className="dark"><EditorPage /></div>} />
              <Route path="/stt" element={<div className="dark"><SpeechToTextPage /></div>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ProjectsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
