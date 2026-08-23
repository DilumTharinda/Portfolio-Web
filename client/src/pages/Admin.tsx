import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Shield, Plus, Trash2, ArrowLeft, FileText, FolderGit2, Award, Mail, User, Settings, Code2, Upload } from "lucide-react";
import { Link } from "wouter";

const ImageUploadInput = ({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setIsUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onChange(data.url);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error(`Error uploading image: ${error.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = ""; // Reset file input
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
      />
      <div className="relative">
        <Button type="button" variant="outline" disabled={isUploading} className="gap-2 shrink-0">
          <Upload className="w-4 h-4" />
          {isUploading ? "Uploading..." : "Upload File"}
        </Button>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
          disabled={isUploading}
          title="Upload image file"
        />
      </div>
    </div>
  );
};

const CVUploadInput = ({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    const formData = new FormData();
    formData.append("cv", file);

    setIsUploading(true);
    try {
      const res = await fetch("/api/upload-cv", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onChange(data.url);
      toast.success("CV uploaded successfully");
    } catch (error: any) {
      toast.error(`Error uploading CV: ${error.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = ""; // Reset file input
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
      />
      <div className="relative">
        <Button type="button" variant="outline" disabled={isUploading} className="gap-2 shrink-0">
          <Upload className="w-4 h-4" />
          {isUploading ? "Uploading..." : "Upload CV"}
        </Button>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
          disabled={isUploading}
          title="Upload CV PDF file"
        />
      </div>
    </div>
  );
};

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth({
    redirectOnUnauthenticated: true,
    redirectPath: "/login"
  });
  const utils = trpc.useUtils();

  // Queries
  const { data: profile, refetch: refetchProfile } = trpc.portfolio.getProfile.useQuery();
  const { data: projects = [], refetch: refetchProjects } = trpc.portfolio.getProjects.useQuery();
  const { data: certificates = [], refetch: refetchCertificates } = trpc.portfolio.getCertificates.useQuery();
  const { data: blogPosts = [], refetch: refetchBlog } = trpc.portfolio.getBlogPosts.useQuery();
  const { data: messages = [] } = trpc.portfolio.getContactMessages.useQuery();
  const { data: skills = [], refetch: refetchSkills } = trpc.portfolio.getSkills.useQuery();

  // Profile form state
  const [profileName, setProfileName] = useState("");
  const [profileTitle, setProfileTitle] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileAvatarUrl, setProfileAvatarUrl] = useState("");
  const [profileCvUrl, setProfileCvUrl] = useState("");
  const [profileGithubUrl, setProfileGithubUrl] = useState("");
  const [profileLinkedinUrl, setProfileLinkedinUrl] = useState("");
  const [profileTwitterUrl, setProfileTwitterUrl] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [activeTheme, setActiveTheme] = useState<"devops" | "iot" | "fullstack">("devops");

  useEffect(() => {
    if (profile) {
      setProfileName(profile.name || "");
      setProfileTitle(profile.title || "");
      setProfileBio(profile.bio || "");
      setProfileAvatarUrl(profile.avatarUrl || "");
      setProfileCvUrl((profile as any).cvUrl || "");
      setProfileGithubUrl(profile.githubUrl || "");
      setProfileLinkedinUrl(profile.linkedinUrl || "");
      setProfileTwitterUrl(profile.twitterUrl || "");
      setProfileEmail(profile.email || "");
      setActiveTheme(profile.activeTheme || "devops");
    }
  }, [profile]);

  const updateProfile = trpc.portfolio.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile and active theme updated successfully!");
      refetchProfile();
    },
    onError: (err: any) => toast.error(`Error: ${err.message}`),
  });

  // Project form state
  const [projectId, setProjectId] = useState<number | undefined>();
  const [projectTitle, setProjectTitle] = useState("");
  const [projectSlug, setProjectSlug] = useState("");
  const [projectSummary, setProjectSummary] = useState("");
  const [projectCategory, setProjectCategory] = useState<"DevOps" | "IoT" | "Full Stack">("DevOps");
  const [projectImageUrl, setProjectImageUrl] = useState("");
  const [projectTech, setProjectTech] = useState("");
  const [projectProblem, setProjectProblem] = useState("");
  const [projectArch, setProjectArch] = useState("");
  const [projectImpact, setProjectImpact] = useState("");

  const resetProjectForm = () => {
    setProjectId(undefined);
    setProjectTitle("");
    setProjectSlug("");
    setProjectSummary("");
    setProjectCategory("DevOps");
    setProjectImageUrl("");
    setProjectTech("");
    setProjectProblem("");
    setProjectArch("");
    setProjectImpact("");
  };

  const upsertProject = trpc.portfolio.upsertProject.useMutation({
    onSuccess: () => {
      toast.success("Project saved successfully");
      refetchProjects();
      resetProjectForm();
    },
    onError: (err: any) => toast.error(`Error: ${err.message}`),
  });

  const deleteProject = trpc.portfolio.deleteProject.useMutation({
    onSuccess: () => {
      toast.success("Project deleted");
      refetchProjects();
    },
  });

  // Certificate form state
  const [certId, setCertId] = useState<number | undefined>();
  const [certTitle, setCertTitle] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certIssueDate, setCertIssueDate] = useState("");
  const [certExpiryDate, setCertExpiryDate] = useState("");
  const [certCredentialId, setCertCredentialId] = useState("");
  const [certVerificationUrl, setCertVerificationUrl] = useState("");
  const [certBadgeUrl, setCertBadgeUrl] = useState("");
  const [certCategory, setCertCategory] = useState<"DevOps" | "IoT" | "Full Stack" | "General">("DevOps");

  const resetCertForm = () => {
    setCertId(undefined);
    setCertTitle("");
    setCertIssuer("");
    setCertIssueDate("");
    setCertExpiryDate("");
    setCertCredentialId("");
    setCertVerificationUrl("");
    setCertBadgeUrl("");
    setCertCategory("DevOps");
  };

  const upsertCertificate = trpc.portfolio.upsertCertificate.useMutation({
    onSuccess: () => {
      toast.success("Certificate saved successfully");
      refetchCertificates();
      resetCertForm();
    },
    onError: (err: any) => toast.error(`Error: ${err.message}`),
  });

  const deleteCertificate = trpc.portfolio.deleteCertificate.useMutation({
    onSuccess: () => {
      toast.success("Certificate deleted");
      refetchCertificates();
    },
  });

  // Blog form state
  const [blogId, setBlogId] = useState<number | undefined>();
  const [blogTitle, setBlogTitle] = useState("");
  const [blogSlug, setBlogSlug] = useState("");
  const [blogSummary, setBlogSummary] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogCategory, setBlogCategory] = useState<"DevOps" | "IoT" | "Full Stack">("DevOps");
  const [blogCoverImage, setBlogCoverImage] = useState("");
  const [blogReadTime, setBlogReadTime] = useState("5 min read");

  const resetBlogForm = () => {
    setBlogId(undefined);
    setBlogTitle("");
    setBlogSlug("");
    setBlogSummary("");
    setBlogContent("");
    setBlogCategory("DevOps");
    setBlogCoverImage("");
    setBlogReadTime("5 min read");
  };

  const upsertBlogPost = trpc.portfolio.upsertBlogPost.useMutation({
    onSuccess: () => {
      toast.success("Blog post saved successfully");
      refetchBlog();
      resetBlogForm();
    },
    onError: (err: any) => toast.error(`Error: ${err.message}`),
  });

  const deleteBlogPost = trpc.portfolio.deleteBlogPost.useMutation({
    onSuccess: () => {
      toast.success("Blog post deleted");
      refetchBlog();
    },
  });

  // Skills form state
  const [skillId, setSkillId] = useState<number | undefined>();
  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState("Expert");
  const [skillDescription, setSkillDescription] = useState("");
  const [skillCategory, setSkillCategory] = useState<"DevOps" | "IoT" | "Full Stack">("DevOps");

  const resetSkillForm = () => {
    setSkillId(undefined);
    setSkillName("");
    setSkillLevel("Expert");
    setSkillDescription("");
    setSkillCategory("DevOps");
  };

  const upsertSkill = trpc.portfolio.upsertSkill.useMutation({
    onSuccess: () => {
      toast.success("Skill saved successfully");
      refetchSkills();
      resetSkillForm();
    },
    onError: (err: any) => toast.error(`Error: ${err.message}`),
  });

  const deleteSkill = trpc.portfolio.deleteSkill.useMutation({
    onSuccess: () => {
      toast.success("Skill deleted");
      refetchSkills();
    },
  });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-mono text-sm text-muted-foreground">Verifying access...</div>;
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Admin Header */}
      <header className="border-b border-border bg-card/50 py-4 px-6 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="gap-1.5">
              <Link href="/">
                <ArrowLeft className="w-4 h-4" /> Back to Portfolio
              </Link>
            </Button>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 font-serif font-bold text-lg">
              <Shield className="w-5 h-5 text-primary" /> Admin Management Dashboard
            </div>
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            Authenticated Owner Mode
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8">
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full max-w-5xl mx-auto">
            <TabsTrigger value="profile" className="gap-2 font-mono text-xs"><User className="w-3.5 h-3.5" /> Profile & Theme</TabsTrigger>
            <TabsTrigger value="skills" className="gap-2 font-mono text-xs"><Code2 className="w-3.5 h-3.5" /> Skills</TabsTrigger>
            <TabsTrigger value="projects" className="gap-2 font-mono text-xs"><FolderGit2 className="w-3.5 h-3.5" /> Projects</TabsTrigger>
            <TabsTrigger value="certificates" className="gap-2 font-mono text-xs"><Award className="w-3.5 h-3.5" /> Certificates</TabsTrigger>
            <TabsTrigger value="blog" className="gap-2 font-mono text-xs"><FileText className="w-3.5 h-3.5" /> Blog Posts</TabsTrigger>
            <TabsTrigger value="messages" className="gap-2 font-mono text-xs"><Mail className="w-3.5 h-3.5" /> Messages ({messages.length})</TabsTrigger>
          </TabsList>

          {/* --- SKILLS TAB --- */}
          <TabsContent value="skills" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{skillId ? "Edit Skill" : "Add New Skill"}</CardTitle>
                    <CardDescription>Add technical competencies to your Interactive Skill Matrix.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      upsertSkill.mutate({
                        id: skillId,
                        name: skillName,
                        level: skillLevel,
                        description: skillDescription,
                        category: skillCategory as any,
                      });
                    }} className="space-y-4">
                      
                      <div className="space-y-2">
                        <Label>Skill Name</Label>
                        <Input value={skillName} onChange={e => setSkillName(e.target.value)} required placeholder="e.g. Kubernetes & EKS" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Proficiency Level</Label>
                          <Input value={skillLevel} onChange={e => setSkillLevel(e.target.value)} required placeholder="e.g. Expert" />
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={skillCategory} onValueChange={(val: any) => setSkillCategory(val)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DevOps">Cloud & DevOps</SelectItem>
                              <SelectItem value="IoT">IoT & Embedded</SelectItem>
                              <SelectItem value="Full Stack">Full Stack</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Short Description</Label>
                        <Textarea 
                          value={skillDescription} 
                          onChange={e => setSkillDescription(e.target.value)} 
                          required 
                          rows={2}
                          placeholder="e.g. Multi-cluster service mesh, custom controllers..."
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button type="submit" disabled={upsertSkill.isPending} className="flex-1">
                          {skillId ? "Update Skill" : "Create Skill"}
                        </Button>
                        {skillId && (
                          <Button type="button" variant="outline" onClick={resetSkillForm}>Cancel</Button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-serif font-bold text-xl mb-4">Existing Skills</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skills.map((s: any) => (
                    <div key={s.id} className="p-4 rounded-xl border border-border bg-card flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono px-2 py-1 bg-secondary rounded-full">{s.category}</span>
                          <span className="text-xs font-mono text-muted-foreground">{s.level}</span>
                        </div>
                        <h4 className="font-bold">{s.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{s.description}</p>
                      </div>
                      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                        <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => {
                          setSkillId(s.id);
                          setSkillName(s.name);
                          setSkillLevel(s.level);
                          setSkillDescription(s.description);
                          setSkillCategory(s.category as any);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}>Edit</Button>
                        <Button variant="destructive" size="sm" className="h-8" onClick={() => {
                          if (confirm("Delete this skill?")) deleteSkill.mutate({ id: s.id });
                        }}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {skills.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                      No skills found. Add your first skill using the form.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* --- PROFILE & THEME SETTINGS TAB --- */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle>Personal Details, Social Links & Homepage Theme Style</CardTitle>
                <CardDescription>
                  Configure your professional profile, avatar image, social links, and select the default homepage theme style (DevOps Terminal, IoT Telemetry Dashboard, or Full Stack Architecture).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  updateProfile.mutate({
                    name: profileName,
                    title: profileTitle,
                    bio: profileBio,
                    avatarUrl: profileAvatarUrl,
                    cvUrl: profileCvUrl,
                    githubUrl: profileGithubUrl,
                    linkedinUrl: profileLinkedinUrl,
                    twitterUrl: profileTwitterUrl,
                    email: profileEmail,
                    activeTheme,
                  });
                }} className="space-y-6">
                  
                  <div className="space-y-2">
                    <Label className="text-base font-bold">Default Homepage Theme Style</Label>
                    <Select value={activeTheme} onValueChange={(val: any) => setActiveTheme(val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select active theme style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="devops">DevOps Terminal Style ($ whoami, kubectl, zsh)</SelectItem>
                        <SelectItem value="iot">IoT Telemetry Dashboard Style (MQTT stream, edge nodes)</SelectItem>
                        <SelectItem value="fullstack">Full Stack Architecture Style (Client, Server, DB stack)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input value={profileName} onChange={e => setProfileName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Professional Title</Label>
                      <Input value={profileTitle} onChange={e => setProfileTitle(e.target.value)} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Profile Picture URL (Top-Left Avatar)</Label>
                    <ImageUploadInput value={profileAvatarUrl} onChange={setProfileAvatarUrl} placeholder="https://images.unsplash.com/..." />
                    <p className="text-xs text-muted-foreground">Provide an image URL for your profile picture. It will be displayed in the navbar and hero section.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Professional CV (PDF)</Label>
                    <CVUploadInput value={profileCvUrl} onChange={setProfileCvUrl} placeholder="https://..." />
                    <p className="text-xs text-muted-foreground">Upload your professional CV in PDF format. It will be available for download on the homepage.</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Professional Bio / Summary</Label>
                    <Textarea className="min-h-[100px]" value={profileBio} onChange={e => setProfileBio(e.target.value)} required />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>GitHub URL</Label>
                      <Input value={profileGithubUrl} onChange={e => setProfileGithubUrl(e.target.value)} placeholder="https://github.com/username" />
                    </div>
                    <div className="space-y-2">
                      <Label>LinkedIn URL</Label>
                      <Input value={profileLinkedinUrl} onChange={e => setProfileLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/username" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>YouTube URL</Label>
                      <Input value={profileTwitterUrl} onChange={e => setProfileTwitterUrl(e.target.value)} placeholder="https://youtube.com/..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Email</Label>
                      <Input type="email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} placeholder="name@domain.com" />
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full font-medium" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? "Saving Profile..." : "Save Profile & Apply Theme"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- PROJECTS TAB --- */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <Card className="lg:col-span-5">
                <CardHeader>
                  <CardTitle>{projectId ? "Edit Project" : "Add New Project"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    upsertProject.mutate({
                      id: projectId,
                      title: projectTitle,
                      slug: projectSlug || projectTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                      summary: projectSummary,
                      category: projectCategory,
                      imageUrl: projectImageUrl,
                      technologies: projectTech,
                      problem: projectProblem,
                      architecture: projectArch,
                      impact: projectImpact,
                    });
                  }} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input value={projectTitle} onChange={e => setProjectTitle(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Slug</Label>
                      <Input value={projectSlug} onChange={e => setProjectSlug(e.target.value)} placeholder="auto-generated-slug" />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={projectCategory} onValueChange={(val: any) => setProjectCategory(val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DevOps">DevOps</SelectItem>
                          <SelectItem value="IoT">IoT</SelectItem>
                          <SelectItem value="Full Stack">Full Stack</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Cover Image URL</Label>
                      <ImageUploadInput value={projectImageUrl} onChange={setProjectImageUrl} />
                    </div>
                    <div className="space-y-2">
                      <Label>Technologies (Comma separated)</Label>
                      <Input value={projectTech} onChange={e => setProjectTech(e.target.value)} placeholder="Kubernetes, Terraform, AWS" />
                    </div>
                    <div className="space-y-2">
                      <Label>Summary</Label>
                      <Textarea value={projectSummary} onChange={e => setProjectSummary(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Problem (Case Study)</Label>
                      <Textarea value={projectProblem} onChange={e => setProjectProblem(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Architecture (Case Study)</Label>
                      <Textarea value={projectArch} onChange={e => setProjectArch(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Impact (Case Study)</Label>
                      <Textarea value={projectImpact} onChange={e => setProjectImpact(e.target.value)} />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button type="submit" className="flex-1">{projectId ? "Update Project" : "Create Project"}</Button>
                      {projectId && <Button type="button" variant="outline" onClick={resetProjectForm}>Cancel</Button>}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-7">
                <CardHeader>
                  <CardTitle>Existing Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projects.map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{p.title}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-secondary font-mono">{p.category}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.summary}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => {
                            setProjectId(p.id);
                            setProjectTitle(p.title);
                            setProjectSlug(p.slug);
                            setProjectSummary(p.summary);
                            setProjectCategory(p.category);
                            setProjectImageUrl(p.imageUrl);
                            setProjectTech(p.technologies);
                            setProjectProblem(p.problem);
                            setProjectArch(p.architecture);
                            setProjectImpact(p.impact);
                          }}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteProject.mutate({ id: p.id })}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* --- CERTIFICATES TAB --- */}
          <TabsContent value="certificates" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <Card className="lg:col-span-5">
                <CardHeader>
                  <CardTitle>{certId ? "Edit Certificate" : "Add Certificate"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    upsertCertificate.mutate({
                      id: certId,
                      title: certTitle,
                      issuer: certIssuer,
                      issueDate: certIssueDate,
                      expiryDate: certExpiryDate || undefined,
                      credentialId: certCredentialId || undefined,
                      verificationUrl: certVerificationUrl || undefined,
                      badgeUrl: certBadgeUrl || undefined,
                      category: certCategory,
                    });
                  }} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Certificate Title</Label>
                      <Input value={certTitle} onChange={e => setCertTitle(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Issuer</Label>
                      <Input value={certIssuer} onChange={e => setCertIssuer(e.target.value)} placeholder="AWS, Linux Foundation, etc." required />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={certCategory} onValueChange={(val: any) => setCertCategory(val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DevOps">DevOps</SelectItem>
                          <SelectItem value="IoT">IoT</SelectItem>
                          <SelectItem value="Full Stack">Full Stack</SelectItem>
                          <SelectItem value="General">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label>Issue Date</Label>
                        <Input value={certIssueDate} onChange={e => setCertIssueDate(e.target.value)} placeholder="Jan 2025" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Expiry Date (Opt)</Label>
                        <Input value={certExpiryDate} onChange={e => setCertExpiryDate(e.target.value)} placeholder="No Expiry" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Credential ID</Label>
                      <Input value={certCredentialId} onChange={e => setCertCredentialId(e.target.value)} placeholder="AWS-123456" />
                    </div>
                    <div className="space-y-2">
                      <Label>Verification URL</Label>
                      <Input value={certVerificationUrl} onChange={e => setCertVerificationUrl(e.target.value)} placeholder="https://aws.amazon.com/verify..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Badge Image URL (Optional)</Label>
                      <ImageUploadInput value={certBadgeUrl} onChange={setCertBadgeUrl} placeholder="https://..." />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button type="submit" className="flex-1">{certId ? "Update" : "Add"}</Button>
                      {certId && <Button type="button" variant="outline" onClick={resetCertForm}>Cancel</Button>}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-7">
                <CardHeader>
                  <CardTitle>Existing Certificates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {certificates.map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
                        <div>
                          <span className="font-bold">{c.title}</span>
                          <p className="text-xs text-muted-foreground mt-0.5">{c.issuer} · Issued: {c.issueDate}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => {
                            setCertId(c.id);
                            setCertTitle(c.title);
                            setCertIssuer(c.issuer);
                            setCertIssueDate(c.issueDate);
                            setCertExpiryDate(c.expiryDate || "");
                            setCertCredentialId(c.credentialId || "");
                            setCertVerificationUrl(c.verificationUrl || "");
                            setCertBadgeUrl(c.badgeUrl || "");
                            setCertCategory((c.category === "Cloud" ? "DevOps" : c.category) as any);
                          }}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteCertificate.mutate({ id: c.id })}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* --- BLOG POSTS TAB --- */}
          <TabsContent value="blog" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <Card className="lg:col-span-5">
                <CardHeader>
                  <CardTitle>{blogId ? "Edit Blog Post" : "Create Blog Post"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    upsertBlogPost.mutate({
                      id: blogId,
                      title: blogTitle,
                      slug: blogSlug || blogTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                      summary: blogSummary,
                      content: blogContent,
                      category: blogCategory,
                      tags: blogCategory,
                      coverImage: blogCoverImage || undefined,
                      readTime: blogReadTime,
                    });
                  }} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input value={blogTitle} onChange={e => setBlogTitle(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Slug</Label>
                      <Input value={blogSlug} onChange={e => setBlogSlug(e.target.value)} placeholder="auto-generated-slug" />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={blogCategory} onValueChange={(val: any) => setBlogCategory(val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DevOps">DevOps</SelectItem>
                          <SelectItem value="IoT">IoT</SelectItem>
                          <SelectItem value="Full Stack">Full Stack</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Cover Image URL</Label>
                      <ImageUploadInput value={blogCoverImage} onChange={setBlogCoverImage} placeholder="https://images.unsplash.com/..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Read Time</Label>
                      <Input value={blogReadTime} onChange={e => setBlogReadTime(e.target.value)} placeholder="5 min read" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Summary</Label>
                      <Textarea value={blogSummary} onChange={e => setBlogSummary(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Content (Markdown supported)</Label>
                      <Textarea className="min-h-[150px]" value={blogContent} onChange={e => setBlogContent(e.target.value)} required />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button type="submit" className="flex-1">{blogId ? "Update" : "Publish"}</Button>
                      {blogId && <Button type="button" variant="outline" onClick={resetBlogForm}>Cancel</Button>}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-7">
                <CardHeader>
                  <CardTitle>Existing Blog Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {blogPosts.map((b: any) => (
                      <div key={b.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{b.title}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-secondary font-mono">{b.category}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{b.summary}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => {
                            setBlogId(b.id);
                            setBlogTitle(b.title);
                            setBlogSlug(b.slug);
                            setBlogSummary(b.summary);
                            setBlogContent(b.content);
                            setBlogCategory(b.category);
                            setBlogCoverImage(b.coverImage || "");
                            setBlogReadTime(b.readTime);
                          }}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteBlogPost.mutate({ id: b.id })}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* --- MESSAGES TAB --- */}
          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Form Messages</CardTitle>
                <CardDescription>Messages submitted by visitors through your contact form.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No messages received yet.</p>
                  ) : (
                    messages.map((m: any) => (
                      <div key={m.id} className="p-4 border border-border rounded-lg bg-card space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-base">{m.subject}</span>
                          <span className="text-xs font-mono text-muted-foreground">{new Date(m.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          From: <strong className="text-foreground">{m.name}</strong> (&lt;{m.email}&gt;)
                        </div>
                        <p className="text-sm mt-2 pt-2 border-t border-border/50 whitespace-pre-wrap">{m.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
