import { Home, Plus, Library } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/new", icon: Plus, label: "New" },
  { to: "/creator", icon: Library, label: "Creator" },
];

const BottomNav = () => (
  <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur-md">
    <div className="max-w-lg mx-auto flex items-center justify-around h-16">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 text-[11px] font-medium transition-colors",
              isActive ? "text-foreground" : "text-muted-foreground"
            )
          }
        >
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </div>
  </nav>
);

export default BottomNav;
