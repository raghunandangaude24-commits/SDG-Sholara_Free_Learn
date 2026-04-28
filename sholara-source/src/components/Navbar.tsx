import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Upload, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-soft group-hover:shadow-glow transition-smooth">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-xl font-bold tracking-tight">NotesHive</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Open Study</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <Link to="/browse" className="text-foreground/70 hover:text-foreground transition-smooth">Browse</Link>
          <Link to="/upload" className="text-foreground/70 hover:text-foreground transition-smooth">Contribute</Link>
          <a href="/#how" className="text-foreground/70 hover:text-foreground transition-smooth">How it works</a>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/upload"><Upload className="h-4 w-4" /> Upload</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard"><User className="h-4 w-4" /> My library</Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link to="/auth"><LogIn className="h-4 w-4" /> Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
