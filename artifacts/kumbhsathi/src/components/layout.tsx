import { ReactNode } from "react";
import { TopBar } from "./top-bar";
import { BottomNav } from "./bottom-nav";
import { SOSButton } from "./sos-button";
import { useLocation } from "wouter";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const hideSOS = location === "/emergency" || location === "/login" || location === "/register";
  const hideBottomNav = location === "/login" || location === "/register";

  return (
    <div className="flex flex-col min-h-[100dvh] max-w-md mx-auto bg-background shadow-2xl relative overflow-hidden sm:border-x">
      {!hideBottomNav && <TopBar />}
      <main className="flex-1 overflow-y-auto pb-20 pt-14">
        {children}
      </main>
      {!hideSOS && <SOSButton />}
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}
