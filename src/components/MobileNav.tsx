import { Home, PlusCircle, Library, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/new", icon: PlusCircle, label: "New" },
  { to: "/creator", icon: Library, label: "Creator" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const MobileNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background md:hidden">
      <div className="flex items-center justify-around h-16">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || (to !== "/home" && location.pathname.startsWith(to));
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-1 text-[11px] font-medium transition-colors",
                active ? "text-foreground" : "text-muted-foreground/60"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
