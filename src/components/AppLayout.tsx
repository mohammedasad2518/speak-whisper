import { Outlet, Navigate } from "react-router-dom";
import TopNavbar from "./TopNavbar";
import AppSidebar from "./AppSidebar";
import MobileNav from "./MobileNav";
import { useAuth } from "@/hooks/useAuth";

const AppLayout = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/signin" replace />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavbar />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
};

export default AppLayout;
