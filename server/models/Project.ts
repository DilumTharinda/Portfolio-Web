import { eq } from "drizzle-orm";
import { projects } from "../../drizzle/schema";
import { getDb, getJsonDb } from "./db";

export async function getProjects() {
  const db = await getDb();
  if (db) {
    return await db.select().from(projects).orderBy(projects.orderIndex);
  }
  const json = getJsonDb();
  return json.select("projects").sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0));
}

export async function getProjectBySlug(slug: string) {
  const db = await getDb();
  if (db) {
    const res = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
    return res[0];
  }
  const json = getJsonDb();
  return json.selectOne("projects", (r: any) => r.slug === slug);
}
