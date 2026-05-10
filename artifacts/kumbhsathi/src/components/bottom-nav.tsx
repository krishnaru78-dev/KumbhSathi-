import { Link, useLocation } from "wouter";
import { Home, Map as MapIcon, Calendar, User as ProfileIcon, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/map", icon: MapIcon, label: "Map" },
    { href: "/emergency", icon: TriangleAlert, label: "SOS", isSos: true },
    { href: "/events", icon: Calendar, label: "Events" },
    { href: "/profile", icon: ProfileIcon, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-background/80 backdrop-blur-md border-t z-50 px-2 pb-safe pt-2">
      <div className="flex justify-around items-center h-14">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;

          if (item.isSos) {
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center -mt-6">
                <div className="bg-destructive text-destructive-foreground p-3 rounded-full shadow-lg shadow-destructive/30 border-4 border-background animate-pulse">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-medium mt-1 text-destructive">SOS</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 gap-1 text-muted-foreground transition-colors",
                isActive && "text-primary"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
