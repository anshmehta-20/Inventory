import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ui/theme-toggle";
import { Package, LogOut, ArrowLeft } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({
  title = "Shreeji Foods",
  subtitle,
}: HeaderProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card/70 backdrop-blur-lg dark:backdrop-blur-xl supports-[backdrop-filter]:bg-card/45 dark:bg-black/80">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <Package className="w-5 h-5 text-primary-foreground dark:text-background" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
            {profile && !subtitle && (
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {profile ? (
            <>
              {profile.isAdmin && (
                location.pathname === "/admin" ? (
                  <Button onClick={() => navigate("/")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                ) : (
                  <Button onClick={() => navigate("/admin")}>
                    Admin Dashboard
                  </Button>
                )
              )}
              <Button variant="destructive" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <Button onClick={() => navigate("/login")}>Login</Button>
          )}
        </div>
      </div>
    </header>
  );
}
