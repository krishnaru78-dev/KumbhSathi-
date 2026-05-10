import { Link, useLocation } from "wouter";
import { Home, Map as MapIcon, Calendar, User as ProfileIcon, TriangleAlert, Hotel, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/map", icon: MapIcon, label: "Map" },
    { href: "/emergency", icon: TriangleAlert, label: "SOS", isSos: true },
    { href: "/hotels", icon: Hotel, label: "Stays" },
    { href: "/profile", icon: ProfileIcon, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-background/95 backdrop-blur-md border-t z-50 px-2 pb-safe pt-2">
      <div className="flex justify-around items-center h-14">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          const Icon = item.icon;

          if (item.isSos) {
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center -mt-6">
                <div className="bg-destructive text-destructive-foreground p-3.5 rounded-full shadow-xl shadow-destructive/40 border-4 border-background">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-semibold mt-1 text-destructive">SOS</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 gap-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                isActive && "bg-primary/10"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
