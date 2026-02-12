import { Home, PlusCircle, Library, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const links = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/new", icon: PlusCircle, label: "New" },
  { to: "/creator", icon: Library, label: "Creator" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-56 border-r border-border bg-card/50 px-3 py-6 shrink-0">
      <nav className="space-y-1">
        {links.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || (to !== "/home" && location.pathname.startsWith(to));
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default AppSidebar;
