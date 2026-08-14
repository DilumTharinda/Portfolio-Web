import { publicProcedure, router } from "../middleware/auth";
import { z } from "zod";
import { getDb, getJsonDb } from "../models/db";
import { projects, certificates, blogPosts, contactMessages, skills, blogComments } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getProfileSettings } from "../models/ProfileSetting";

export const portfolioRouter = router({
  // Public getters
  getProjects: publicProcedure.query(async () => {
    const db = await getDb();
    if (db) {
      return await db.select().from(projects).orderBy(projects.orderIndex);
    }
    // JSON fallback
    const json = getJsonDb();
    return json.select("projects").sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }),

  getProjectBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (db) {
      const res = await db.select().from(projects).where(eq(projects.slug, input.slug)).limit(1);
      return res[0] || null;
    }
    const json = getJsonDb();
    return json.selectOne("projects", (r: any) => r.slug === input.slug) || null;
  }),

  getCertificates: publicProcedure.query(async () => {
    const db = await getDb();
    if (db) {
      return await db.select().from(certificates).orderBy(certificates.orderIndex);
    }
    const json = getJsonDb();
    return json.select("certificates").sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }),

  getBlogPosts: publicProcedure.query(async () => {
    const db = await getDb();
    if (db) {
      return await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
    }
    const json = getJsonDb();
    return json.select("blogPosts").sort((a: any, b: any) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }),

  getBlogPostBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (db) {
      const res = await db.select().from(blogPosts).where(eq(blogPosts.slug, input.slug)).limit(1);
      return res[0] || null;
    }
    const json = getJsonDb();
    return json.selectOne("blogPosts", (r: any) => r.slug === input.slug) || null;
  }),

  likeBlogPost: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (db) {
      const post = await db.select().from(blogPosts).where(eq(blogPosts.id, input.id)).limit(1);
      if (!post[0]) throw new TRPCError({ code: 'NOT_FOUND' });
      await db.update(blogPosts)
        .set({ likes: post[0].likes + 1 })
        .where(eq(blogPosts.id, input.id));
      return { success: true, likes: post[0].likes + 1 };
    }
    // JSON fallback
    const json = getJsonDb();
    const post = json.selectOne("blogPosts", (r: any) => r.id === input.id) as any;
    if (!post) throw new TRPCError({ code: 'NOT_FOUND' });
    const newLikes = (post.likes || 0) + 1;
    json.update("blogPosts", input.id, { likes: newLikes });
    return { success: true, likes: newLikes };
  }),

  getBlogComments: publicProcedure.input(z.object({ blogId: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (db) {
      return await db.select().from(blogComments).where(eq(blogComments.blogId, input.blogId)).orderBy(desc(blogComments.createdAt));
    }
    const json = getJsonDb();
    return json.selectWhere("blogComments", (r: any) => r.blogId === input.blogId)
      .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }),

  addBlogComment: publicProcedure
    .input(z.object({
      blogId: z.number(),
      name: z.string().min(2, "Name is required").max(100),
      content: z.string().min(2, "Comment is required").max(1000),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (db) {
        await db.insert(blogComments).values({
          blogId: input.blogId,
          name: input.name,
          content: input.content,
        });
        return { success: true };
      }
      const json = getJsonDb();
      json.insert("blogComments", {
        blogId: input.blogId,
        name: input.name,
        content: input.content,
      });
      return { success: true };
    }),

  getSkills: publicProcedure.query(async () => {
    const db = await getDb();
    if (db) {
      return await db.select().from(skills).orderBy(skills.orderIndex);
    }
    const json = getJsonDb();
    return json.select("skills").sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }),

  getProfile: publicProcedure.query(async () => {
    return await getProfileSettings();
  }),

  // Contact form submission
  submitContact: publicProcedure
    .input(z.object({
      name: z.string().min(2, "Name is required"),
      email: z.string().email("Valid email is required"),
      subject: z.string().min(3, "Subject is required"),
      message: z.string().min(10, "Message must be at least 10 characters"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (db) {
        await db.insert(contactMessages).values({
          name: input.name,
          email: input.email,
          subject: input.subject,
          message: input.message,
        });
        return { success: true };
      }
      const json = getJsonDb();
      json.insert("contactMessages", {
        name: input.name,
        email: input.email,
        subject: input.subject,
        message: input.message,
        read: false,
      });
      return { success: true };
    }),
});
