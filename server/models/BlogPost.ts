import { eq, desc } from "drizzle-orm";
import { blogPosts } from "../../drizzle/schema";
import { getDb, getJsonDb } from "./db";

export async function getBlogPosts() {
  const db = await getDb();
  if (db) {
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }
  const json = getJsonDb();
  return json.select("blogPosts").sort((a: any, b: any) =>
    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (db) {
    const res = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
    return res[0];
  }
  const json = getJsonDb();
  return json.selectOne("blogPosts", (r: any) => r.slug === slug);
}
