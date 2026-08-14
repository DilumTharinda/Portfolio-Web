import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Cpu, Wifi, Activity, ShieldAlert, Bot } from "lucide-react";

interface IoTHeroProps {
  profile: any;
}

export function IoTHero({ profile }: IoTHeroProps) {
  const [telemetryStream, setTelemetryStream] = useState([
    { id: "NODE_ALPHA", stat: "Online", val: "99.9%" },
    { id: "EDGE_TPU_1", stat: "Inference", val: "14ms" },
    { id: "MEM_BUFFER", stat: "Allocated", val: "2.4GB" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryStream(prev => prev.map(item => ({
        ...item,
        val: (parseFloat(item.val) + (Math.random() * 2 - 1)).toFixed(1) + (item.id === "EDGE_TPU_1" ? "ms" : (item.id === "NODE_ALPHA" ? "%" : "GB")),
      })));
    }, 2000);
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
                className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-[6px] border-emerald-500 shadow-2xl"
              />
            )}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-mono shadow-sm">
              <Cpu className="w-4 h-4 animate-pulse" />
              {profile?.name || "System Architect"}
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight leading-[1.1] capitalize animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
            {profile?.title || "Lead Engineer"}
          </h1>

          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
            {profile?.bio || "Specializing in high-throughput MQTT broker architectures, Edge TPU machine learning inference, and real-time sensor stream anomaly detection."}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700 fill-mode-both">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-2 font-mono text-sm h-12 px-6">
              <a href="#projects">
                init_sequence() <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-emerald-500/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-medium font-mono text-sm h-12 px-6">
              <a href="#contact">connect_peer()</a>
            </Button>
          </div>
        </div>

        {/* IoT Custom Robot Animation (Pure Graphical) */}
        <div className="lg:col-span-6 relative flex items-center justify-center min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] w-full overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-emerald-500/10 blur-[120px] rounded-full animate-pulse pointer-events-none" />

          {/* Scale wrapper for responsiveness */}
          <div className="relative w-[500px] h-[400px] transform scale-[0.65] sm:scale-90 lg:scale-110 xl:scale-[1.35] origin-center mt-8">

            {/* 1. Microcontroller (Right Side) */}
            <div className="absolute right-0 top-[180px] flex flex-col items-center z-10">
              <div className="relative w-28 h-40 bg-card dark:bg-[#0a192f] border-2 border-emerald-500/30 dark:border-emerald-500/40 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.1)] dark:shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute left-0 top-4 bottom-4 w-2 flex flex-col justify-between">
                  {Array.from({ length: 8 }).map((_, i) => <div key={`l-${i}`} className="w-3 h-2 bg-emerald-500/40 dark:bg-emerald-500/50 rounded-r-sm -ml-1" />)}
                </div>
                <div className="absolute right-0 top-4 bottom-4 w-2 flex flex-col justify-between">
                  {Array.from({ length: 8 }).map((_, i) => <div key={`r-${i}`} className="w-3 h-2 bg-emerald-500/40 dark:bg-emerald-500/50 rounded-l-sm -mr-1" />)}
                </div>

                <div className="w-14 h-14 border-2 border-emerald-400/40 dark:border-emerald-400/50 bg-muted dark:bg-[#112240] flex items-center justify-center shadow-[inset_0_0_15px_rgba(16,185,129,0.1)] dark:shadow-[inset_0_0_15px_rgba(16,185,129,0.2)]">
                  <Cpu className="w-6 h-6 text-emerald-500 dark:text-emerald-400 animate-pulse" />
                </div>
                <div className="absolute bottom-4 flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500/50 dark:bg-red-400/50" />
                </div>
              </div>
              <div className="mt-3 text-center">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-mono tracking-widest block font-bold">STM32_MCU</span>
                <span className="text-[9px] text-emerald-500/70 dark:text-emerald-400/70 font-mono animate-pulse">RX: RECEIVING</span>
              </div>
            </div>

            {/* 2. Robot (Left Side) */}
            <div className="absolute left-0 bottom-[40px] flex flex-col items-center z-20">
              {/* Head */}
              <div className="w-16 h-14 bg-card dark:bg-[#112240] border-2 border-emerald-500/30 dark:border-emerald-500/40 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.1)] dark:shadow-[0_0_20px_rgba(16,185,129,0.2)] relative z-20 animate-[bounce_4s_infinite_ease-in-out]">
                <div className="w-12 h-4 bg-muted dark:bg-[#0a192f] rounded flex items-center overflow-hidden border border-emerald-500/20 shadow-[inset_0_0_10px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] relative">
                  <div className="absolute left-0 w-4 h-full bg-emerald-400 blur-[2px]" style={{ animation: 'scan 2s linear infinite' }} />
                  <style>{`
                     @keyframes scan {
                       0%, 100% { transform: translateX(-10px); }
                       50% { transform: translateX(40px); }
                     }
                   `}</style>
                </div>
                <div className="absolute -top-3 left-3 w-1 h-3 bg-emerald-500/30 dark:bg-emerald-500/50">
                  <div className="absolute -top-2 -left-1 w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
                </div>
                <div className="absolute -top-2 right-3 w-1 h-2 bg-emerald-500/30 dark:bg-emerald-500/50" />
              </div>

              {/* Neck */}
              <div className="w-6 h-3 bg-muted dark:bg-[#0a192f] border-l-2 border-r-2 border-emerald-500/30 dark:border-emerald-500/40 z-10" />

              {/* Torso */}
              <div className="w-24 h-28 bg-card dark:bg-[#112240] border-2 border-emerald-500/30 dark:border-emerald-500/40 rounded-xl flex flex-col items-center pt-3 pb-2 gap-2 shadow-xl z-20 relative">
                <div className="w-16 h-4 bg-muted dark:bg-[#0a192f] rounded flex items-center justify-around px-2 border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <div className="w-16 h-4 bg-muted dark:bg-[#0a192f] rounded border border-emerald-500/20 overflow-hidden relative">
                  <div className="absolute left-0 top-0 bottom-0 bg-emerald-500/30 dark:bg-emerald-500/40 w-[70%]" />
                </div>
                <div className="w-16 h-4 bg-muted dark:bg-[#0a192f] rounded border border-emerald-500/20 overflow-hidden relative">
                  <div className="absolute left-0 top-0 bottom-0 bg-emerald-500/30 dark:bg-emerald-500/40 w-[40%]" />
                </div>
              </div>

              {/* Wheel / Base */}
              <div className="w-28 h-6 bg-muted dark:bg-[#0a192f] border-2 border-emerald-500/30 dark:border-emerald-500/40 rounded-full -mt-3 shadow-lg z-10" />
            </div>

            {/* Robot Arm & Hand (Animated mechanical joint) */}
            <div className="absolute left-[70px] bottom-[110px] z-10 origin-left" style={{ animation: 'moveArm 3s ease-in-out infinite' }}>
              <style>{`
                 @keyframes moveArm {
                   0%, 100% { transform: rotate(0deg); }
                   50% { transform: rotate(6deg) translateY(-5px); }
                 }
               `}</style>

              {/* Solid Arm Vector */}
              <div className="w-[120px] h-6 bg-card dark:bg-[#112240] border-2 border-emerald-500/30 dark:border-emerald-500/40 rounded-r-xl flex items-center justify-start px-2 shadow-lg relative">
                <div className="w-full h-1 bg-muted dark:bg-[#0a192f] rounded-full opacity-50" />
                {/* Arm joint circle */}
                <div className="absolute -left-3 w-8 h-8 rounded-full bg-card dark:bg-[#112240] border-2 border-emerald-500/30 dark:border-emerald-500/40 z-20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-500/30" />
                </div>
              </div>

              {/* Robot Hand / Emitter attached to end of Arm */}
              <div className="absolute right-[-15px] top-[-10px] w-10 h-10 bg-muted dark:bg-[#0a192f] border-2 border-emerald-500 dark:border-emerald-400 rotate-45 z-20 shadow-[0_0_20px_rgba(16,185,129,0.2)] dark:shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-emerald-400 dark:bg-emerald-300 animate-pulse shadow-[0_0_10px_#6ee7b7]" />
              </div>
            </div>

            {/* 3. Holographic Data Pad (Positioned firmly at top center, away from Robot and MCU) */}
            <div className="absolute left-[110px] top-[40px] z-30 animate-[bounce_4s_infinite_ease-in-out_reverse]">
              <div className="relative flex flex-col items-center">

                {/* Data Pad Content */}
                <div className="bg-background/90 dark:bg-[#0a192f]/95 border border-emerald-500/50 dark:border-emerald-400 p-3 rounded-lg backdrop-blur-xl shadow-[0_0_25px_rgba(16,185,129,0.15)] dark:shadow-[0_0_25px_rgba(16,185,129,0.3)] w-[240px] z-10 relative">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 dark:border-emerald-500/30 pb-2 mb-2">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold tracking-widest flex items-center gap-1.5">
                      <Bot className="w-3 h-3" /> PAYLOAD_DATA
                    </span>
                    <Activity className="w-3 h-3 text-emerald-500 dark:text-emerald-400 animate-pulse" />
                  </div>

                  <div className="space-y-2 font-mono">
                    <div>
                      <span className="text-[8px] text-emerald-600/70 dark:text-emerald-500/70 block uppercase">identity.name</span>
                      <span className="text-[11px] text-emerald-950 dark:text-emerald-50 font-bold tracking-wide">{profile?.name || "System Architect"}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-emerald-600/70 dark:text-emerald-500/70 block uppercase">identity.role</span>
                      <span className="text-[11px] text-emerald-950 dark:text-emerald-50 font-bold tracking-wide">{profile?.title || "Lead Engineer"}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-emerald-600/70 dark:text-emerald-500/70 block uppercase">bio_stream</span>
                      <span className="text-[9px] text-emerald-800/80 dark:text-emerald-100/70 line-clamp-3 leading-relaxed mt-0.5">{profile?.bio}</span>
                    </div>
                  </div>
                </div>

                {/* Projection Beam (Straight down to hand) */}
                <div className="w-[80px] h-[60px] bg-gradient-to-t from-emerald-400/40 via-emerald-400/10 to-transparent blur-sm -mt-2 opacity-60 clip-path-beam pointer-events-none" style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)' }} />
              </div>
            </div>

            {/* 4. Animated Data Stream (Hand to Microcontroller) */}
            <svg className="absolute left-[190px] right-[100px] top-[300px] h-[80px] w-[180px] z-20 overflow-visible">
              {/* Base Line */}
              <path
                d="M 0 0 Q 90 -40, 180 0"
                fill="none"
                stroke="rgba(16,185,129,0.2)"
                strokeWidth="2"
              />
              {/* Dashed flowing line */}
              <path
                d="M 0 0 Q 90 -40, 180 0"
                fill="none"
                stroke="rgba(16,185,129,0.8)"
                strokeWidth="2.5"
                strokeDasharray="8 24"
                className="animate-[dataStream_1.5s_linear_infinite]"
              />
              <style>{`
                 @keyframes dataStream {
                   to { stroke-dashoffset: -32; }
                 }
               `}</style>

              {/* Data Packets */}
              <circle r="3" fill="#6ee7b7" className="shadow-[0_0_10px_#6ee7b7]">
                <animateMotion dur="1.5s" repeatCount="indefinite" path="M 0 0 Q 90 -40, 180 0" />
              </circle>
              <circle r="2" fill="#34d399">
                <animateMotion dur="2s" repeatCount="indefinite" path="M 0 0 Q 90 -40, 180 0" />
              </circle>
              <circle r="4" fill="#10b981" opacity="0.8">
                <animateMotion dur="1.2s" repeatCount="indefinite" path="M 0 0 Q 90 -40, 180 0" />
              </circle>
            </svg>

          </div>
        </div>
      </div>
    </section>
  );
}
