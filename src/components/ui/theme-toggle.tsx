import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className="border-border"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};

export default ThemeToggle;
