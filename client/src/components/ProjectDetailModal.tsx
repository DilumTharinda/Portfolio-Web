import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Layers, ShieldCheck, Zap } from "lucide-react";

export type ProjectItem = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  category: "DevOps" | "IoT" | "Full Stack";
  imageUrl: string;
  githubUrl?: string | null;
  liveUrl?: string | null;
  technologies: string;
  problem: string;
  architecture: string;
  impact: string;
  featured: boolean;
};

interface ProjectDetailModalProps {
  project: ProjectItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectDetailModal({ project, isOpen, onClose }: ProjectDetailModalProps) {
  if (!project) return null;

  const techList = project.technologies.split(",").map(t => t.trim()).filter(Boolean);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs font-mono uppercase tracking-wider">
              {project.category}
            </Badge>
            {project.featured && (
              <Badge className="bg-primary text-primary-foreground text-xs">Featured Case Study</Badge>
            )}
          </div>
          <DialogTitle className="text-2xl font-serif font-bold tracking-tight">
            {project.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base pt-1">
            {project.summary}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Cover image */}
          <div className="rounded-lg overflow-hidden border border-border shadow-md aspect-video relative">
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Tech stack */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-primary" /> Technologies & Infrastructure
            </h4>
            <div className="flex flex-wrap gap-2">
              {techList.map((tech, i) => (
                <Badge key={i} variant="secondary" className="font-mono text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          {/* Case Study Sections (Problem -> Architecture -> Impact) */}
          <div className="space-y-4 pt-2 border-t border-border">
            <div className="bg-card p-4 rounded-lg border border-border">
              <h4 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center text-xs font-mono">1</span>
                Problem Statement
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {project.problem}
              </p>
            </div>

            <div className="bg-card p-4 rounded-lg border border-border">
              <h4 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-xs font-mono">2</span>
                Architecture & Solution
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {project.architecture}
              </p>
            </div>

            <div className="bg-card p-4 rounded-lg border border-border">
              <h4 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xs font-mono">3</span>
                Business & Technical Impact
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {project.impact}
              </p>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-border">
            {project.githubUrl && (
              <Button variant="outline" asChild>
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <Github className="w-4 h-4" /> View Source
                </a>
              </Button>
            )}
            {project.liveUrl && (
              <Button asChild>
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" /> Live Deployment
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
