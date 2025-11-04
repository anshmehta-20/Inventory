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
import { Package, LogOut, Menu, Home, Info, LayoutDashboard, ShoppingBag } from "lucide-react";

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
  const isLandingPage = location.pathname === "/";
  const isProductsPage = location.pathname === "/products";
  const isAdminPage = location.pathname === "/admin";
  const isAboutPage = location.pathname === "/about";

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-gradient-to-r from-card/95 via-card/90 to-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/50 dark:from-black/90 dark:via-black/85 dark:to-black/90 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-xl" />
            <Package className="w-5 h-5 text-primary-foreground relative z-10" />
          </div>
          <div>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="group text-left text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent hover:from-primary hover:to-primary/80 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded"
            >
              {title}
            </button>
            {subtitle && (
              <p className="text-sm text-muted-foreground/80">{subtitle}</p>
            )}
            {profile && !subtitle && (
              <p className="text-sm text-muted-foreground/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                {profile.email}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-xl border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 hover:shadow-md hover:scale-105"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex h-full max-w-sm flex-col gap-0 border-l border-border/60 bg-gradient-to-b from-background via-background/98 to-background/95 p-0 backdrop-blur-xl [&>button]:right-6 [&>button]:top-6 [&>button]:rounded-md [&>button]:h-7 [&>button]:w-7 [&>button]:bg-muted/40 [&>button]:hover:bg-muted [&>button]:border [&>button]:border-border/60 [&>button]:z-20 [&>button]:flex [&>button]:items-center [&>button]:justify-center"
            >
              <div className="relative overflow-hidden pt-12">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
                <SheetPanelHeader className="relative p-6 pb-4 pt-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="relative w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-xl" />
                      <ShoppingBag className="w-6 h-6 text-primary-foreground relative z-10" />
                    </div>
                    <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      Shreeji Foods
                    </SheetTitle>
                  </div>
                  {profile ? (
                    <Badge className="w-fit bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 shadow-md shadow-primary/20">
                      <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full mr-2 animate-pulse" />
                      {profile.email}
                    </Badge>
                  ) : (
                    <p className="text-sm text-muted-foreground/80 flex items-center gap-2">
                      <span className="w-8 h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                      Serving Mahavir Nagar since 1999
                    </p>
                  )}
                </SheetPanelHeader>
              </div>

              <nav className="flex flex-col gap-1 px-4 py-4">
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className={`justify-start h-12 rounded-xl hover:bg-primary/10 transition-all duration-200 ${
                      isLandingPage ? 'bg-primary/5 text-primary shadow-sm' : ''
                    }`}
                    onClick={() => navigate("/")}
                  >
                    <Home className="w-5 h-5 mr-3" />
                    <span className="font-medium">Home</span>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className={`justify-start h-12 rounded-xl hover:bg-primary/10 transition-all duration-200 ${
                      isProductsPage ? 'bg-primary/5 text-primary shadow-sm' : ''
                    }`}
                    onClick={() => navigate("/products")}
                  >
                    <ShoppingBag className="w-5 h-5 mr-3" />
                    <span className="font-medium">Products</span>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className={`justify-start h-12 rounded-xl hover:bg-primary/10 transition-all duration-200 ${
                      isAboutPage ? 'bg-primary/5 text-primary shadow-sm' : ''
                    }`}
                    onClick={() => navigate("/about")}
                  >
                    <Info className="w-5 h-5 mr-3" />
                    <span className="font-medium">About Us</span>
                  </Button>
                </SheetClose>
                {profile?.isAdmin && (
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className={`justify-start h-12 rounded-xl hover:bg-primary/10 transition-all duration-200 ${
                        isAdminPage ? 'bg-primary/5 text-primary shadow-sm' : ''
                      }`}
                      onClick={() => navigate("/admin")}
                    >
                      <LayoutDashboard className="w-5 h-5 mr-3" />
                      <span className="font-medium">Admin Dashboard</span>
                    </Button>
                  </SheetClose>
                )}
              </nav>

              <div className="mt-auto border-t border-border/60 bg-gradient-to-b from-transparent to-muted/20 p-4">
                {profile ? (
                  <SheetClose asChild>
                    <Button
                      variant="destructive"
                      className="w-full justify-start h-12 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                      onClick={signOut}
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      <span className="font-medium">Sign Out</span>
                    </Button>
                  </SheetClose>
                ) : (
                  <SheetClose asChild>
                    <Button
                      className="w-full justify-start h-12 rounded-xl shadow-md hover:shadow-lg bg-gradient-to-r from-primary to-primary/90 transition-all duration-200"
                      onClick={() => navigate("/login")}
                    >
                      <LogOut className="w-5 h-5 mr-3 rotate-180" />
                      <span className="font-medium">Login</span>
                    </Button>
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>
          {profile?.isAdmin &&
            !isLandingPage &&
            !isProductsPage &&
            !isAboutPage &&
            !isAdminPage && (
              <Button onClick={() => navigate("/admin")}>
                Admin Dashboard
              </Button>
            )}
          {profile
            ? !isLandingPage && !isProductsPage && !isAboutPage && !isAdminPage && (
                <Button variant="destructive" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              )
            : !isLandingPage && !isProductsPage && (
                <Button onClick={() => navigate("/login")}>Login</Button>
              )}
        </div>
      </div>
    </header>
  );
}
