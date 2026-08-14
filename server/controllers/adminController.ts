import { protectedProcedure, router } from "../middleware/auth";
import { z } from "zod";
import { getDb, getJsonDb } from "../models/db";
import { projects, certificates, blogPosts, contactMessages, skills } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { upsertProfileSettings } from "../models/ProfileSetting";

// Admin check middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const adminRouter = router({
  getContactMessages: adminProcedure.query(async () => {
    const db = await getDb();
    if (db) {
      return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
    }
    const json = getJsonDb();
    return json.select("contactMessages").sort((a: any, b: any) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }),

  upsertSkill: adminProcedure
    .input(z.object({
      id: z.number().optional(),
      name: z.string(),
      level: z.string(),
      description: z.string(),
      category: z.enum(["DevOps", "IoT", "Full Stack"]),
      orderIndex: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (db) {
        if (input.id) {
          await db.update(skills).set({
            name: input.name,
            level: input.level,
            description: input.description,
            category: input.category,
            orderIndex: input.orderIndex,
          }).where(eq(skills.id, input.id));
          return { success: true, id: input.id };
        } else {
          const res = await db.insert(skills).values({
            name: input.name,
            level: input.level,
            description: input.description,
            category: input.category,
            orderIndex: input.orderIndex,
          });
          return { success: true, id: Number(res[0].insertId) };
        }
      }
      // JSON fallback
      const json = getJsonDb();
      if (input.id) {
        json.update("skills", input.id, {
          name: input.name,
          level: input.level,
          description: input.description,
          category: input.category,
          orderIndex: input.orderIndex,
        });
        return { success: true, id: input.id };
      } else {
        const row = json.insert("skills", {
          name: input.name,
          level: input.level,
          description: input.description,
          category: input.category,
          orderIndex: input.orderIndex,
        });
        return { success: true, id: (row as any).id };
      }
    }),

  deleteSkill: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (db) {
        await db.delete(skills).where(eq(skills.id, input.id));
        return { success: true };
      }
      getJsonDb().delete("skills", input.id);
      return { success: true };
    }),

  upsertProject: adminProcedure
    .input(z.object({
      id: z.number().optional(),
      title: z.string(),
      slug: z.string(),
      summary: z.string().optional().nullable(),
      category: z.enum(["DevOps", "IoT", "Full Stack"]),
      imageUrl: z.string(),
      githubUrl: z.string().optional().nullable(),
      liveUrl: z.string().optional().nullable(),
      technologies: z.string().optional().nullable(),
      problem: z.string().optional().nullable(),
      architecture: z.string().optional().nullable(),
      impact: z.string().optional().nullable(),
      featured: z.boolean().default(false),
      orderIndex: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const values = {
        title: input.title,
        slug: input.slug,
        summary: input.summary || "",
        category: input.category,
        imageUrl: input.imageUrl,
        githubUrl: input.githubUrl || null,
        liveUrl: input.liveUrl || null,
        technologies: input.technologies || null,
        problem: input.problem || null,
        architecture: input.architecture || null,
        impact: input.impact || null,
        featured: input.featured,
        orderIndex: input.orderIndex,
      };

      const db = await getDb();
      if (db) {
        if (input.id) {
          await db.update(projects).set(values).where(eq(projects.id, input.id));
          return { success: true, id: input.id };
        } else {
          const res = await db.insert(projects).values(values);
          return { success: true, id: Number(res[0].insertId) };
        }
      }
      // JSON fallback
      const json = getJsonDb();
      if (input.id) {
        json.update("projects", input.id, values);
        return { success: true, id: input.id };
      } else {
        const row = json.insert("projects", values);
        return { success: true, id: (row as any).id };
      }
    }),

  deleteProject: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (db) {
        await db.delete(projects).where(eq(projects.id, input.id));
        return { success: true };
      }
      getJsonDb().delete("projects", input.id);
      return { success: true };
    }),

  upsertCertificate: adminProcedure
    .input(z.object({
      id: z.number().optional(),
      title: z.string(),
      issuer: z.string(),
      credentialId: z.string().optional().nullable(),
      issueDate: z.string(),
      expiryDate: z.string().optional().nullable(),
      verificationUrl: z.string().optional().nullable(),
      badgeUrl: z.string().optional().nullable(),
      category: z.enum(["DevOps", "IoT", "Full Stack", "General"]).default("General"),
      orderIndex: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      const values = {
        title: input.title,
        issuer: input.issuer,
        credentialId: input.credentialId || null,
        issueDate: input.issueDate,
        expiryDate: input.expiryDate || null,
        verificationUrl: input.verificationUrl || null,
        badgeUrl: input.badgeUrl || null,
        category: input.category,
        orderIndex: input.orderIndex,
      };

      const db = await getDb();
      if (db) {
        if (input.id) {
          await db.update(certificates).set(values).where(eq(certificates.id, input.id));
          return { success: true, id: input.id };
        } else {
          const res = await db.insert(certificates).values(values);
          return { success: true, id: Number(res[0].insertId) };
        }
      }
      const json = getJsonDb();
      if (input.id) {
        json.update("certificates", input.id, values);
        return { success: true, id: input.id };
      } else {
        const row = json.insert("certificates", values);
        return { success: true, id: (row as any).id };
      }
    }),

  deleteCertificate: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (db) {
        await db.delete(certificates).where(eq(certificates.id, input.id));
        return { success: true };
      }
      getJsonDb().delete("certificates", input.id);
      return { success: true };
    }),

  upsertBlogPost: adminProcedure
    .input(z.object({
      id: z.number().optional(),
      title: z.string(),
      slug: z.string(),
      summary: z.string().optional().nullable(),
      content: z.string(),
      category: z.enum(["DevOps", "IoT", "Full Stack", "Architecture"]),
      tags: z.string().optional().nullable(),
      coverImage: z.string().optional().nullable(),
      published: z.boolean().default(true),
      readTime: z.string().default("5 min read"),
    }))
    .mutation(async ({ input }) => {
      const values = {
        title: input.title,
        slug: input.slug,
        summary: input.summary || "",
        content: input.content,
        category: input.category,
        tags: input.tags || null,
        coverImage: input.coverImage || null,
        published: input.published,
        readTime: input.readTime,
      };

      const db = await getDb();
      if (db) {
        if (input.id) {
          await db.update(blogPosts).set(values).where(eq(blogPosts.id, input.id));
          return { success: true, id: input.id };
        } else {
          const res = await db.insert(blogPosts).values(values);
          return { success: true, id: Number(res[0].insertId) };
        }
      }
      const json = getJsonDb();
      if (input.id) {
        json.update("blogPosts", input.id, values);
        return { success: true, id: input.id };
      } else {
        const row = json.insert("blogPosts", values);
        return { success: true, id: (row as any).id };
      }
    }),

  deleteBlogPost: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (db) {
        await db.delete(blogPosts).where(eq(blogPosts.id, input.id));
        return { success: true };
      }
      getJsonDb().delete("blogPosts", input.id);
      return { success: true };
    }),

  updateProfile: adminProcedure
    .input(z.object({
      name: z.string().min(2),
      title: z.string().min(2),
      bio: z.string().min(5),
      avatarUrl: z.string(),
      githubUrl: z.string().optional().nullable(),
      linkedinUrl: z.string().optional().nullable(),
      twitterUrl: z.string().optional().nullable(),
      email: z.string().email().optional().nullable(),
      activeTheme: z.enum(["devops", "iot", "fullstack"]),
    }))
    .mutation(async ({ input }) => {
      await upsertProfileSettings(input);
      return { success: true };
    }),
});
