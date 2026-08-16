import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Moon, Sun, Menu, X, Github, Linkedin, Youtube } from "lucide-react";

interface Profile {
  name: string;
  title: string;
  bio: string;
  avatarUrl: string;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  email?: string | null;
  activeTheme: string;
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { data: profile } = trpc.portfolio.getProfile.useQuery();
  const typedProfile = profile as Profile | undefined;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-background/85 backdrop-blur-md border-b border-border shadow-sm py-3" 
        : "bg-transparent py-5"
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand / Profile Avatar & Name */}
        <a href="/" className="flex items-center gap-3 group">
          {typedProfile?.avatarUrl ? (
            <img
              src={typedProfile.avatarUrl}
              alt={typedProfile.name || "Alex Chen"}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary/50 group-hover:border-primary transition-colors shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-mono font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
              AC
            </div>
          )}
          <div>
            <span className="font-serif font-bold text-lg tracking-tight block leading-none">{typedProfile?.name || "Alex Chen"}</span>
            <span className="text-xs text-muted-foreground font-mono tracking-wider mt-0.5 block truncate max-w-[200px] sm:max-w-xs">{typedProfile?.title || "Software Engineer"}</span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-muted-foreground">
          <a href="#about" className="hover:text-foreground transition-colors">About</a>
          <a href="#skills" className="hover:text-foreground transition-colors">Expertise</a>
          <a href="#projects" className="hover:text-foreground transition-colors">Projects</a>
          <a href="#certificates" className="hover:text-foreground transition-colors">Certificates</a>
          <a href="#blog" className="hover:text-foreground transition-colors">Insights</a>
          <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Social Icons */}
          {typedProfile?.githubUrl && (
            <a href={typedProfile.githubUrl} target="_blank" rel="noopener noreferrer" className="hidden lg:flex p-2 rounded-lg hover:bg-muted transition-colors">
              <Github className="w-5 h-5 text-[#181717] dark:text-white" />
            </a>
          )}
          {typedProfile?.linkedinUrl && (
            <a href={typedProfile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hidden lg:flex p-2 rounded-lg hover:bg-muted transition-colors">
              <Linkedin className="w-5 h-5 text-[#0A66C2]" />
            </a>
          )}
          {typedProfile?.twitterUrl && (
            <a href={typedProfile.twitterUrl} target="_blank" rel="noopener noreferrer" className="hidden lg:flex p-2 rounded-lg hover:bg-muted transition-colors">
              <Youtube className="w-5 h-5 text-[#FF0000]" />
            </a>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-9 h-9 border border-border bg-card text-card-foreground hover:bg-accent"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </Button>

          {/* Mobile menu trigger */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border shadow-lg py-6 px-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
          <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-foreground font-medium py-2 border-b border-border/50">About</a>
          <a href="#skills" onClick={() => setMobileMenuOpen(false)} className="text-foreground font-medium py-2 border-b border-border/50">Expertise</a>
          <a href="#projects" onClick={() => setMobileMenuOpen(false)} className="text-foreground font-medium py-2 border-b border-border/50">Projects</a>
          <a href="#certificates" onClick={() => setMobileMenuOpen(false)} className="text-foreground font-medium py-2 border-b border-border/50">Certificates</a>
          <a href="#blog" onClick={() => setMobileMenuOpen(false)} className="text-foreground font-medium py-2 border-b border-border/50">Insights</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-foreground font-medium py-2 border-b border-border/50">Contact</a>
        </div>
      )}
    </header>
  );
}
