import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "@/components/ui/theme-toggle";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader as SheetPanelHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Package, LogOut, Menu } from "lucide-react";

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
  const isIndexPage = location.pathname === "/";
  const isAdminPage = location.pathname === "/admin";
  const isAboutPage = location.pathname === "/about";

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card/70 backdrop-blur-lg dark:backdrop-blur-xl supports-[backdrop-filter]:bg-card/45 dark:bg-black/80">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <Package className="w-5 h-5 text-primary-foreground dark:text-primary-foreground" />
          </div>
          <div>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-left text-xl font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
            >
              {title}
            </button>
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
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-lg border-border">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex h-full max-w-xs flex-col gap-6 border-border/60 bg-background/95 p-6 backdrop-blur"
            >
              <SheetPanelHeader>
                <SheetTitle>Shreeji Foods</SheetTitle>
                {profile ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground">Signed in as</p>
                    <Badge className="w-fit bg-primary text-primary-foreground hover:bg-primary">
                      {profile.email}
                    </Badge>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Serving Mahavir Nagar since 1999
                  </p>
                )}
              </SheetPanelHeader>

              <nav className="flex flex-col gap-2">
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => navigate("/")}
                  >
                    Inventory
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => navigate("/about")}
                  >
                    About Us
                  </Button>
                </SheetClose>
                {!profile && (
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => navigate("/login")}
                    >
                      Login
                    </Button>
                  </SheetClose>
                )}
                {profile?.isAdmin && (
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => navigate("/admin")}
                    >
                      Admin Dashboard
                    </Button>
                  </SheetClose>
                )}
              </nav>

              {profile && (
                <div className="mt-auto border-t border-border/60 pt-6">
                  <SheetClose asChild>
                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                      onClick={signOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </SheetClose>
                </div>
              )}
            </SheetContent>
          </Sheet>
          {profile?.isAdmin &&
            !isIndexPage &&
            !isAboutPage &&
            !isAdminPage && (
              <Button onClick={() => navigate("/admin")}>
                Admin Dashboard
              </Button>
            )}
          {profile
            ? !isIndexPage && !isAboutPage && !isAdminPage && (
                <Button variant="destructive" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              )
            : !isIndexPage && (
                <Button onClick={() => navigate("/login")}>Login</Button>
              )}
        </div>
      </div>
    </header>
  );
}
