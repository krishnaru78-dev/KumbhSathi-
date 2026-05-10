import { useTheme } from "next-themes";
import { Moon, Sun, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

export function TopBar() {
  const { theme, setTheme } = useTheme();
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const l = localStorage.getItem("kumbh_lang") || "en";
    setLang(l);
  }, []);

  const handleLang = (newLang: string) => {
    localStorage.setItem("kumbh_lang", newLang);
    setLang(newLang);
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="fixed top-0 left-0 right-0 max-w-md mx-auto bg-background/80 backdrop-blur-md border-b z-50 h-14 flex items-center justify-between px-4">
      <div className="flex items-center gap-2 text-primary">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xl leading-none">K</span>
        </div>
        <span className="font-bold text-lg tracking-tight">KumbhSathi</span>
      </div>
      
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-9 h-9">
              <Languages className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleLang("en")}>English</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLang("hi")}>हिंदी</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLang("mr")}>मराठी</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </div>
  );
}
