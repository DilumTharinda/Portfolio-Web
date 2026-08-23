export interface Profile {
  name: string;
  title: string;
  bio: string;
  avatarUrl: string;
  cvUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  email?: string | null;
  activeTheme: string;
}
