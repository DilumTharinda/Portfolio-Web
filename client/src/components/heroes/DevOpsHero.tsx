import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal, Cpu, Cloud, CheckCircle2 } from "lucide-react";

interface DevOpsHeroProps {
  profile: any;
}

export function DevOpsHero({ profile }: DevOpsHeroProps) {
  const [commandIndex, setCommandIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [renderedHistory, setRenderedHistory] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const commands = [
      { 
        cmd: "whoami", 
        output: () => <p className="pl-4 text-foreground font-semibold">{profile?.name || "System Administrator"}</p> 
      },
      { 
        cmd: "echo $ROLE", 
        output: () => <p className="pl-4 text-muted-foreground">{profile?.title || "Principal Engineer"}</p> 
      },
      { 
        cmd: "cat ~/.profile", 
        output: () => (
          <div className="pl-4 text-muted-foreground space-y-1">
            <p><span className="text-foreground">NAME:</span> {profile?.name}</p>
            {profile?.email && <p><span className="text-foreground">EMAIL:</span> {profile?.email}</p>}
            {profile?.githubUrl && <p><span className="text-foreground">GITHUB:</span> <a href={profile?.githubUrl} className="hover:text-primary transition-colors">[{profile?.githubUrl.split("/").pop()}]</a></p>}
            {profile?.linkedinUrl && <p><span className="text-foreground">LINKEDIN:</span> <a href={profile?.linkedinUrl} className="hover:text-primary transition-colors">[{profile?.linkedinUrl.split("/").pop()}]</a></p>}
          </div>
        )
      },
      { 
        cmd: "systemctl status portfolio", 
        output: () => (
          <p className="pl-4 text-muted-foreground">
            ● active (running) since Mon 2026-01-01 00:00:00 UTC<br/>
            &nbsp;&nbsp;Memory: 42.8 MB / 512 MB<br/>
            &nbsp;&nbsp;CPU: 0.12% (16 vCPUs assigned)<br/>
            &nbsp;&nbsp;Uptime: 99.999% SLA verified.
          </p>
        )
      },
      { 
        cmd: "clear", 
        output: () => null 
      }
    ];

    if (commandIndex >= commands.length) {
      const timeout = setTimeout(() => {
        setRenderedHistory([]);
        setCommandIndex(0);
        setDisplayedText("");
      }, 1500);
      return () => clearTimeout(timeout);
    }

    const currentCommand = commands[commandIndex];
    if (currentCommand.cmd === "clear") {
       const timeout = setTimeout(() => {
          setRenderedHistory([]);
          setCommandIndex(commandIndex + 1);
       }, 2000); // Hold the full terminal for 2 seconds before clearing
       return () => clearTimeout(timeout);
    }

    let charIndex = 0;
    const typingSpeed = 80; // ms per character
    
    const typingInterval = setInterval(() => {
      if (charIndex <= currentCommand.cmd.length) {
        setDisplayedText(currentCommand.cmd.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => {
          setRenderedHistory(prev => [
            ...prev, 
            <div key={`${commandIndex}-${Date.now()}`} className="space-y-2 mb-4 animate-in fade-in duration-300">
              <p className="flex items-center gap-2">
                <span className="text-emerald-500">➜</span> <span className="text-primary font-bold">{currentCommand.cmd}</span>
              </p>
              {currentCommand.output()}
            </div>
          ]);
          setDisplayedText("");
          setCommandIndex(prev => prev + 1);
        }, 500); // Wait half a second after typing before executing
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, [commandIndex, profile]);

  return (
    <section className="pt-32 pb-20 md:pt-44 md:pb-32 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6 md:space-y-8">
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
            {profile?.avatarUrl && (
              <img 
                src={profile.avatarUrl} 
                alt={profile.name} 
                className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-[6px] border-primary shadow-2xl"
              />
            )}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-sm font-mono shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              {profile?.name || "System Architect"}
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight leading-[1.1] capitalize animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
            {profile?.title || "DevOps Engineer"}
          </h1>

          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
            {profile?.bio}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700 fill-mode-both">
            <Button size="lg" asChild className="font-medium gap-2 font-mono text-sm h-12 px-6">
              <a href="#projects">
                $ ./explore-projects.sh <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="font-medium font-mono text-sm h-12 px-6">
              <a href="#contact">contact --secure</a>
            </Button>
          </div>
        </div>

        {/* DevOps Interactive Terminal Hero */}
        <div className="lg:col-span-6">
          <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden font-mono text-xs">
            {/* Terminal Header */}
            <div className="bg-muted/80 px-4 py-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2 w-20">
                <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors" />
              </div>
              <span className="text-muted-foreground flex-1 text-center font-medium">alex@devops-cluster ~ zsh</span>
              <div className="w-20" /> {/* Spacer for centering */}
            </div>

            {/* Terminal Body */}
            <div className="p-6 min-h-[380px] text-foreground/90 flex flex-col justify-between">
              <div>
                <p className="text-muted-foreground mb-4"># Terminal session initialized. Executing identity sequence...</p>
                
                {/* Render History */}
                {renderedHistory}
                
                {/* Active Typing Line */}
                {commandIndex < 5 && commandIndex !== 4 && (
                   <p className="flex items-center gap-2">
                     <span className="text-emerald-500">➜</span> 
                     <span className="text-primary font-bold">
                       {displayedText}<span className="animate-pulse bg-primary w-2 h-4 inline-block ml-1 align-middle" />
                     </span>
                   </p>
                )}
              </div>
              
              <div className="pt-4 mt-8 border-t border-border/60 flex items-center justify-between text-muted-foreground text-[11px] shrink-0">
                <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-emerald-500" /> Zsh Terminal Mode</span>
                <span className="font-mono text-emerald-500 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> LIVE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
