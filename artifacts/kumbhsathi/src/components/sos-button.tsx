import { TriangleAlert } from "lucide-react";
import { useLocation } from "wouter";

export function SOSButton() {
  const [, setLocation] = useLocation();

  return (
    <button
      onClick={() => setLocation("/emergency")}
      className="fixed bottom-20 right-4 w-14 h-14 bg-destructive text-destructive-foreground rounded-full shadow-lg shadow-destructive/40 flex items-center justify-center z-40 transition-transform active:scale-95 animate-pulse"
    >
      <TriangleAlert className="w-6 h-6" />
    </button>
  );
}
