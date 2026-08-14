import { eq } from "drizzle-orm";
import { profileSettings } from "../../drizzle/schema";
import { getDb, getJsonDb } from "./db";

const DEFAULT_PROFILE = {
  name: "Alex Chen",
  title: "DevOps, IoT & Full Stack Principal Engineer",
  bio: "Senior systems and cloud architect specializing in resilient multi-cloud infrastructure, industrial IoT edge telemetry pipelines, and high-throughput web platforms.",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
  githubUrl: "https://github.com/executive-chen",
  linkedinUrl: "https://linkedin.com/in/alex-chen-devops",
  twitterUrl: "https://twitter.com/alexchen_eng",
  email: "alex.chen@executive-tech.io",
  activeTheme: "devops" as const,
};

export async function getProfileSettings() {
  const db = await getDb();
  if (db) {
    const res = await db.select().from(profileSettings).limit(1);
    if (res.length === 0) return DEFAULT_PROFILE;
    return res[0];
  }
  // JSON fallback
  const json = getJsonDb();
  const all = json.select("profileSettings");
  if (all.length === 0) return DEFAULT_PROFILE;
  return all[0];
}

export async function upsertProfileSettings(input: {
  name: string;
  title: string;
  bio: string;
  avatarUrl: string;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  email?: string | null;
  activeTheme: "devops" | "iot" | "fullstack";
}) {
  const db = await getDb();
  if (db) {
    const existing = await db.select().from(profileSettings).limit(1);
    if (existing.length === 0) {
      await db.insert(profileSettings).values(input);
    } else {
      await db.update(profileSettings).set(input).where(eq(profileSettings.id, existing[0].id));
    }
    return;
  }
  // JSON fallback
  const json = getJsonDb();
  const all = json.select("profileSettings");
  if (all.length === 0) {
    json.insert("profileSettings", input);
  } else {
    json.update("profileSettings", (all[0] as any).id, input);
  }
}
