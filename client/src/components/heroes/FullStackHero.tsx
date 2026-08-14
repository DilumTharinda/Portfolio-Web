import { Button } from "@/components/ui/button";
import { ArrowRight, Layers, Database, Globe, Code2, Cpu } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface FullStackHeroProps {
  profile: any;
}

export function FullStackHero({ profile }: FullStackHeroProps) {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="pt-32 pb-20 md:pt-44 md:pb-32 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6 md:space-y-8">
          <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
            {profile?.avatarUrl && (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-[6px] border-indigo-500 shadow-2xl"
              />
            )}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-sm font-mono shadow-sm">
              <Layers className="w-4 h-4 animate-pulse" />
              {profile?.name || "System Architect"}
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight leading-[1.1] capitalize animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
            {profile?.title || "Full Stack Engineer"}
          </h1>

          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
            {profile?.bio}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700 fill-mode-both">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium gap-2 font-sans h-12 px-6">
              <a href="#projects" className="flex items-center gap-2">
                View Architecture <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium h-12 px-6">
              <a href="#contact">Discuss Project</a>
            </Button>
          </div>
        </div>

        {/* Full Stack Code Editor UI */}
        <div className="lg:col-span-6">
          <div className="rounded-xl border border-border bg-white dark:bg-[#1e1e1e] shadow-2xl overflow-hidden font-mono text-sm flex flex-col h-[400px] text-gray-800 dark:text-[#d4d4d4]">
            {/* Editor Header */}
            <div className="bg-gray-100 dark:bg-[#2d2d2d] px-4 py-3 border-b border-gray-200 dark:border-[#1e1e1e] flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56]" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e]" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f]" />
              </div>
              <div className="flex gap-2">
                <div className="px-4 py-1.5 bg-white dark:bg-[#1e1e1e] text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-500 flex items-center gap-2 rounded-t-sm">
                  <Code2 className="w-4 h-4" /> profile.json
                </div>
                <div className="px-4 py-1.5 text-muted-foreground flex items-center gap-2 hover:bg-black/5 dark:hover:bg-[#1e1e1e]/50 cursor-pointer rounded-t-sm transition-colors">
                  <Globe className="w-4 h-4" /> api.ts
                </div>
              </div>
            </div>

            {/* Editor Body */}
            <div className="p-5 flex-1 overflow-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex">
                {/* Line numbers */}
                <div className="text-gray-400 dark:text-[#858585] text-right pr-4 select-none flex flex-col items-end">
                  {Array.from({ length: 12 }).map((_, i) => <span key={i}>{i + 1}</span>)}
                </div>

                {/* Code Content */}
                <motion.div
                  key={animationKey}
                  className="flex-1"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 1 },
                    show: { opacity: 1, transition: { staggerChildren: 0.6 } }
                  }}
                >
                  <motion.div variants={{ hidden: { clipPath: "inset(0 100% 0 0)" }, show: { clipPath: "inset(0 0 0 0)", transition: { duration: 0.5, ease: "linear" } } }} className="whitespace-nowrap w-fit">
                    <p>{"{"}</p>
                  </motion.div>
                  <motion.div variants={{ hidden: { clipPath: "inset(0 100% 0 0)" }, show: { clipPath: "inset(0 0 0 0)", transition: { duration: 0.5, ease: "linear" } } }} className="whitespace-nowrap w-fit">
                    <p className="pl-4">
                      <span className="text-blue-600 dark:text-[#9cdcfe]">"name"</span>: <span className="text-green-600 dark:text-[#ce9178]">"{profile?.name || "Full Stack Developer"}"</span>,
                    </p>
                  </motion.div>
                  <motion.div variants={{ hidden: { clipPath: "inset(0 100% 0 0)" }, show: { clipPath: "inset(0 0 0 0)", transition: { duration: 0.5, ease: "linear" } } }} className="whitespace-nowrap w-fit">
                    <p className="pl-4">
                      <span className="text-blue-600 dark:text-[#9cdcfe]">"title"</span>: <span className="text-green-600 dark:text-[#ce9178]">"{profile?.title || "Software Engineer"}"</span>,
                    </p>
                  </motion.div>
                  <motion.div variants={{ hidden: { clipPath: "inset(0 100% 0 0)" }, show: { clipPath: "inset(0 0 0 0)", transition: { duration: 0.5, ease: "linear" } } }} className="whitespace-nowrap w-fit">
                    <p className="pl-4">
                      <span className="text-blue-600 dark:text-[#9cdcfe]">"stack"</span>: [
                    </p>
                  </motion.div>
                  <motion.div variants={{ hidden: { clipPath: "inset(0 100% 0 0)" }, show: { clipPath: "inset(0 0 0 0)", transition: { duration: 0.5, ease: "linear" } } }} className="whitespace-nowrap w-fit">
                    <p className="pl-8 text-green-600 dark:text-[#ce9178]">"React 19", "TailwindCSS v4", "tRPC", "Node.js", "Drizzle ORM"</p>
                  </motion.div>
                  <motion.div variants={{ hidden: { clipPath: "inset(0 100% 0 0)" }, show: { clipPath: "inset(0 0 0 0)", transition: { duration: 0.5, ease: "linear" } } }} className="whitespace-nowrap w-fit">
                    <p className="pl-4">],</p>
                  </motion.div>
                  <motion.div variants={{ hidden: { clipPath: "inset(0 100% 0 0)" }, show: { clipPath: "inset(0 0 0 0)", transition: { duration: 0.5, ease: "linear" } } }} className="whitespace-nowrap w-fit">
                    <p className="pl-4">
                      <span className="text-blue-600 dark:text-[#9cdcfe]">"links"</span>: {"{"}
                    </p>
                  </motion.div>
                  <motion.div variants={{ hidden: { clipPath: "inset(0 100% 0 0)" }, show: { clipPath: "inset(0 0 0 0)", transition: { duration: 0.5, ease: "linear" } } }} className="whitespace-nowrap w-fit">
                    <p className="pl-8">
                      <span className="text-blue-600 dark:text-[#9cdcfe]">"github"</span>: <span className="text-green-600 dark:text-[#ce9178]">"{profile?.githubUrl || "https://github.com"}"</span>
                    </p>
                  </motion.div>
                  <motion.div variants={{ hidden: { clipPath: "inset(0 100% 0 0)" }, show: { clipPath: "inset(0 0 0 0)", transition: { duration: 0.5, ease: "linear" } } }} className="whitespace-nowrap w-fit">
                    <p className="pl-4">{"},"}</p>
                  </motion.div>
                  <motion.div variants={{ hidden: { clipPath: "inset(0 100% 0 0)" }, show: { clipPath: "inset(0 0 0 0)", transition: { duration: 0.5, ease: "linear" } } }} className="whitespace-nowrap w-fit">
                    <p className="pl-4">
                      <span className="text-blue-600 dark:text-[#9cdcfe]">"bio"</span>: <span className="text-green-600 dark:text-[#ce9178]">"{profile?.bio || "Building robust and scalable web applications."}"</span>
                    </p>
                  </motion.div>
                  <motion.div variants={{ hidden: { clipPath: "inset(0 100% 0 0)" }, show: { clipPath: "inset(0 0 0 0)", transition: { duration: 0.5, ease: "linear" } } }} className="whitespace-nowrap w-fit">
                    <p>{"}"}</p>
                  </motion.div>

                  {/* Blinking cursor */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-2.5 h-5 bg-gray-800 dark:bg-[#d4d4d4] mt-1 inline-block"
                  />
                </motion.div>
              </div>
            </div>

            {/* Editor Status Bar */}
            <div className="bg-blue-600 dark:bg-[#007acc] text-white px-4 py-2 flex flex-wrap items-center justify-between gap-y-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Database className="w-3 h-3" /> main</span>
                <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> Prettier</span>
              </div>
              <div className="flex items-center gap-3 whitespace-nowrap">
                <span>Ln 12, Col 2</span>
                <span className="hidden sm:inline">UTF-8</span>
                <span>JSON</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
