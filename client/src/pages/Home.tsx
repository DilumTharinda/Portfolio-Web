import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Navbar } from "@/components/Navbar";
import { ProjectDetailModal, ProjectItem } from "@/components/ProjectDetailModal";
import { BlogPostModal, BlogPostItem } from "@/components/BlogPostModal";
import { DevOpsHero } from "@/components/heroes/DevOpsHero";
import { IoTHero } from "@/components/heroes/IoTHero";
import { FullStackHero } from "@/components/heroes/FullStackHero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Terminal, Server, Cpu, Cloud, Database, Shield, Layers,
  ExternalLink, Github, ArrowRight, Award, Calendar, Clock,
  CheckCircle2, Mail, Send, Sparkles, FileText, Code2, Network,
  Radio, CpuIcon, Webhook
} from "lucide-react";
import { Profile } from "@/types/profile";

export default function Home() {
  // Data queries
  const { data: profile, isLoading: profileLoading } = trpc.portfolio.getProfile.useQuery();
  const typedProfile = profile as Profile | undefined;
  const { data: skills = [] } = trpc.portfolio.getSkills.useQuery();
  const { data: projects = [] } = trpc.portfolio.getProjects.useQuery();
  const { data: certificates = [] } = trpc.portfolio.getCertificates.useQuery();
  const { data: blogPosts = [] } = trpc.portfolio.getBlogPosts.useQuery();

  // Update document title dynamically
  useEffect(() => {
    if (profile?.name) {
      document.title = `${profile.name} | ${profile.title || "DevOps, IoT & Full Stack Engineer Portfolio"}`;
    }
  }, [profile]);

  // Project filtering and modal state
  const [projectCategoryFilter, setProjectCategoryFilter] = useState<"All" | "DevOps" | "IoT" | "Full Stack">("All");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  // Blog modal state
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPostItem | null>(null);
  const [blogModalOpen, setBlogModalOpen] = useState(false);

  // Skill matrix tab state
  const [skillTab, setSkillTab] = useState<"devops" | "iot" | "fullstack">("devops");

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  const submitContact = trpc.portfolio.submitContact.useMutation({
    onSuccess: () => {
      toast.success("Message sent successfully! I will get back to you shortly.");
      setContactName("");
      setContactEmail("");
      setContactSubject("");
      setContactMessage("");
    },
    onError: (err: any) => {
      toast.error(`Failed to send message: ${err.message}`);
    },
  });

  // Loading state handler
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-mono text-sm animate-pulse">Loading Portfolio Assets...</p>
        </div>
      </div>
    );
  }

  const filteredProjects = projectCategoryFilter === "All"
    ? projects 
    : projects.filter((p: any) => p.category === projectCategoryFilter);

  const activeTheme = profile?.activeTheme || "devops";

  const renderBlogPost = (b: any, uniqueKey: string) => (
    <div 
      key={uniqueKey}
      onClick={() => {
        setSelectedBlogPost(b);
        setBlogModalOpen(true);
      }}
      className="group rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
    >
      {b.coverImage && (
        <div className="aspect-[16/9] relative overflow-hidden bg-muted">
          <img 
            src={b.coverImage} 
            alt={b.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            <Badge className="bg-background/90 text-foreground backdrop-blur-md font-mono text-xs border border-border">
              {b.category}
            </Badge>
          </div>
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(b.createdAt).toLocaleDateString()}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {b.readTime}</span>
          </div>

          <h3 className="text-xl font-serif font-bold group-hover:text-primary transition-colors line-clamp-2">
            {b.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
            {b.summary}
          </p>
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-bold text-primary">
          <span>Read Article</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground bg-gradient-mesh selection:bg-primary selection:text-primary-foreground">
      {/* Navbar */}
      <Navbar />

      {/* --- HERO SECTION BASED ON ACTIVE THEME --- */}
      {activeTheme === "devops" && <DevOpsHero profile={profile} />}
      {activeTheme === "iot" && <IoTHero profile={profile} />}
      {activeTheme === "fullstack" && <FullStackHero profile={profile} />}

      {/* --- 2. ABOUT & BIO SECTION WITH VECTOR SHAPES --- */}
      <motion.section 
        id="about" 
        className="py-20 border-t border-border bg-card/40 relative overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
      >
        {/* Domain Vector Watermarks */}
        <div className="absolute right-[-5%] top-[10%] opacity-5 pointer-events-none">
          {activeTheme === "devops" && <Terminal className="w-96 h-96" />}
          {activeTheme === "iot" && <Radio className="w-96 h-96" />}
          {activeTheme === "fullstack" && <Layers className="w-96 h-96" />}
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Professional Profile</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold">Engineering at Scale</h2>
            <p className="text-muted-foreground">
              {typedProfile?.bio || "Bridging low-level hardware telemetry with cloud-native reliability and polished user experiences."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Cloud className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold">Cloud & DevOps</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Automating multi-cloud infrastructure with Terraform, Kubernetes (EKS/GKE), Istio service mesh, ArgoCD GitOps, and robust observability (Prometheus/Grafana).
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold">IoT & Edge Systems</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Building resilient telemetry ingestion engines using MQTT, Apache Kafka, Edge TPUs, and TimescaleDB for real-time industrial anomaly detection.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold">Full Stack Architecture</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Crafting world-class web applications with React 19, TypeScript, tRPC, Node.js, and high-performance SQL databases designed for sub-50ms p99 response times.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* --- 3. INTERACTIVE SKILL MATRIX --- */}
      <motion.section 
        id="skills" 
        className="py-20 border-t border-border"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Technical Competencies</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold">Interactive Skill Matrix</h2>
            <p className="text-muted-foreground">
              Explore my technical depth across DevOps, IoT, and Full Stack domains.
            </p>
          </div>

          {/* Skill Matrix Tabs */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1 rounded-lg border border-border bg-card">
              <button 
                onClick={() => setSkillTab("devops")}
                className={`px-6 py-2.5 rounded-md font-medium text-sm transition-all ${
                  skillTab === "devops" 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Cloud & DevOps
              </button>
              <button 
                onClick={() => setSkillTab("iot")}
                className={`px-6 py-2.5 rounded-md font-medium text-sm transition-all ${
                  skillTab === "iot" 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                IoT & Embedded
              </button>
              <button 
                onClick={() => setSkillTab("fullstack")}
                className={`px-6 py-2.5 rounded-md font-medium text-sm transition-all ${
                  skillTab === "fullstack" 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Full Stack & Backend
              </button>
            </div>
          </div>

          {/* Skill Tab Content */}
          <div className="max-w-4xl mx-auto">
            {skillTab === "devops" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in duration-300">
                {skills.filter((s: any) => s.category === "DevOps").map((skill: any, i: number) => (
                  <div key={i} className="p-5 rounded-xl border border-border bg-card space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-base">{skill.name}</h4>
                      <Badge variant="outline" className="font-mono text-xs">{skill.level}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{skill.description}</p>
                  </div>
                ))}
              </div>
            )}

            {skillTab === "iot" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in duration-300">
                {skills.filter((s: any) => s.category === "IoT").map((skill: any, i: number) => (
                  <div key={i} className="p-5 rounded-xl border border-border bg-card space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-base">{skill.name}</h4>
                      <Badge variant="outline" className="font-mono text-xs">{skill.level}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{skill.description}</p>
                  </div>
                ))}
              </div>
            )}

            {skillTab === "fullstack" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in duration-300">
                {skills.filter((s: any) => s.category === "Full Stack").map((skill: any, i: number) => (
                  <div key={i} className="p-5 rounded-xl border border-border bg-card space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-base">{skill.name}</h4>
                      <Badge variant="outline" className="font-mono text-xs">{skill.level}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{skill.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* --- 4. PROJECTS SHOWCASE --- */}
      <motion.section 
        id="projects" 
        className="py-20 border-t border-border bg-card/30"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Portfolio Case Studies</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold">Featured Projects & Architecture</h2>
              <p className="text-muted-foreground max-w-xl">
                Explore comprehensive case studies detailing the problem, architecture, and impact for DevOps, IoT, and Full Stack systems.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {(["All", "DevOps", "IoT", "Full Stack"] as const).map(cat => (
                <Button
                  key={cat}
                  variant={projectCategoryFilter === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setProjectCategoryFilter(cat)}
                  className="font-mono text-xs"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((p: any) => (
              <div 
                key={p.id}
                onClick={() => {
                  setSelectedProject(p);
                  setProjectModalOpen(true);
                }}
                className="group rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
              >
                <div className="aspect-video relative overflow-hidden bg-muted">
                  <img 
                    src={p.imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800"} 
                    alt={p.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800"; }}
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-background/90 text-foreground backdrop-blur-md font-mono text-xs border border-border">
                      {p.category}
                    </Badge>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-serif font-bold group-hover:text-primary transition-colors line-clamp-2">
                      {p.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                      {p.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                    <span className="font-mono text-muted-foreground truncate max-w-[200px]">
                      {p.technologies}
                    </span>
                    <span className="font-bold flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform">
                      Case Study <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* --- 5. CERTIFICATES & AWARDS GRID --- */}
      <motion.section 
        id="certificates" 
        className="py-20 border-t border-border"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Credentials & Verification</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold">Certificates & Awards</h2>
            <p className="text-muted-foreground">
              Professionally certified in advanced cloud architecture, Kubernetes, and IoT systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certificates.map((c: any) => (
              <div key={c.id} className="p-6 rounded-xl border border-border bg-card shadow-sm flex flex-col justify-between space-y-4 hover:border-primary/50 transition-colors">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <Badge variant="outline" className="text-xs font-mono mb-2">{c.category}</Badge>
                    <h3 className="font-serif font-bold text-lg leading-snug">{c.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{c.issuer}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-2 text-xs font-mono text-muted-foreground">
                  {c.credentialId && <div>ID: {c.credentialId}</div>}
                  <div className="flex items-center justify-between">
                    <span>Issued: {c.issueDate}</span>
                    {c.expiryDate && <span>Exp: {c.expiryDate}</span>}
                  </div>
                  {c.verificationUrl && (
                    <a 
                      href={c.verificationUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline font-sans font-medium pt-1"
                    >
                      Verify Credential <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* --- 6. BLOG SYSTEM --- */}
      <motion.section 
        id="blog" 
        className="py-20 border-t border-border bg-card/30"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Technical Insights & Articles</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold">Engineering Insights</h2>
            <p className="text-muted-foreground">
              Deep dives into distributed systems, Kubernetes resilience, edge AI, and full stack performance.
            </p>
          </div>

          <div className="relative h-[650px] w-full overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_5%,black_95%,transparent)] rounded-xl px-2 -mx-2">
            <motion.div
              animate={{ y: ["0%", "-50%"] }}
              transition={{ ease: "linear", duration: 30, repeat: Infinity }}
              className="flex flex-col gap-8 w-full pb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {blogPosts.map((b: any, i: number) => renderBlogPost(b, `orig-${b.id}-${i}`))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8" aria-hidden="true">
                {blogPosts.map((b: any, i: number) => renderBlogPost(b, `dup-${b.id}-${i}`))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* --- 7. CONTACT SECTION --- */}
      <motion.section 
        id="contact" 
        className="py-20 border-t border-border"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Get In Touch</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold">Let's Build Something Exceptional</h2>
              <p className="text-muted-foreground leading-relaxed">
                Whether you are looking to architect high-availability cloud infrastructure, deploy IoT edge telemetry pipelines, or scale an enterprise web platform, I am ready to collaborate.
              </p>

              <div className="space-y-4 pt-4 font-mono text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-5 h-5 text-primary" />
                  <span>{typedProfile?.email || "alex.chen@executive-tech.io"}</span>
                </div>
                {typedProfile?.githubUrl && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Github className="w-5 h-5 text-primary" />
                    <a href={typedProfile.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub Profile</a>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-7">
              <Card className="p-6 md:p-8 shadow-md">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  submitContact.mutate({
                    name: contactName,
                    email: contactEmail,
                    subject: contactSubject,
                    message: contactMessage,
                  });
                }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Your Name</Label>
                      <Input 
                        value={contactName} 
                        onChange={e => setContactName(e.target.value)} 
                        required 
                        placeholder="Jane Doe" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input 
                        type="email" 
                        value={contactEmail} 
                        onChange={e => setContactEmail(e.target.value)} 
                        required 
                        placeholder="jane@company.com" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input 
                      value={contactSubject} 
                      onChange={e => setContactSubject(e.target.value)} 
                      required 
                      placeholder="Cloud Architecture Consultation" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea 
                      className="min-h-[150px]" 
                      value={contactMessage} 
                      onChange={e => setContactMessage(e.target.value)} 
                      required 
                      placeholder="Describe your project, timeline, or engineering goals..." 
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full gap-2 font-medium" disabled={submitContact.isPending}>
                    {submitContact.isPending ? "Sending..." : <>Send Message <Send className="w-4 h-4" /></>}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-foreground font-mono">
          <div>
            © {new Date().getFullYear()} {typedProfile?.name || "Alex Chen"}. All rights reserved. Built with Executive Tech Architecture.
          </div>
          <div className="flex items-center gap-6">
            <a href="#about" className="hover:text-foreground">About</a>
            <a href="#projects" className="hover:text-foreground">Projects</a>
            <a href="#blog" className="hover:text-foreground">Insights</a>
            <a href="#contact" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProjectDetailModal 
        project={selectedProject} 
        isOpen={projectModalOpen} 
        onClose={() => setProjectModalOpen(false)} 
      />

      <BlogPostModal 
        post={selectedBlogPost} 
        isOpen={blogModalOpen} 
        onClose={() => setBlogModalOpen(false)} 
      />
    </div>
  );
}
