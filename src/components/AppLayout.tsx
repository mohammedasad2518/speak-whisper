import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

const AppLayout = () => (
  <div className="min-h-screen bg-background flex flex-col pb-16">
    <Outlet />
    <BottomNav />
  </div>
);

export default AppLayout;
