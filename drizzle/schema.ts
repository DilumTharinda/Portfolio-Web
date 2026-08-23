import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Projects table for showcasing DevOps, IoT, and Full Stack work.
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  summary: text("summary").notNull(),
  category: mysqlEnum("category", ["DevOps", "IoT", "Full Stack"]).notNull(),
  imageUrl: text("imageUrl").notNull(),
  githubUrl: text("githubUrl"),
  liveUrl: text("liveUrl"),
  technologies: text("technologies"), // JSON array string or comma-separated
  problem: text("problem"),
  architecture: text("architecture"),
  impact: text("impact"),
  featured: boolean("featured").default(false).notNull(),
  orderIndex: int("orderIndex").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Certificates table for verified credentials.
 */
export const certificates = mysqlTable("certificates", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  issuer: varchar("issuer", { length: 255 }).notNull(),
  credentialId: varchar("credentialId", { length: 255 }),
  issueDate: varchar("issueDate", { length: 64 }).notNull(),
  expiryDate: varchar("expiryDate", { length: 64 }),
  verificationUrl: text("verificationUrl"),
  badgeUrl: text("badgeUrl"),
  category: mysqlEnum("category", ["DevOps", "IoT", "Full Stack", "General"]).default("General").notNull(),
  orderIndex: int("orderIndex").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;

/**
 * Blog posts table for articles and insights.
 */
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  category: mysqlEnum("category", ["DevOps", "IoT", "Full Stack", "Architecture"]).notNull(),
  tags: text("tags"), // comma-separated tags
  coverImage: text("coverImage"),
  published: boolean("published").default(true).notNull(),
  readTime: varchar("readTime", { length: 32 }).default("5 min read").notNull(),
  likes: int("likes").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

/**
 * Blog comments table.
 */
export const blogComments = mysqlTable("blog_comments", {
  id: int("id").autoincrement().primaryKey(),
  blogId: int("blogId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BlogComment = typeof blogComments.$inferSelect;
export type InsertBlogComment = typeof blogComments.$inferInsert;

/**
 * Contact messages table.
 */
export const contactMessages = mysqlTable("contact_messages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

/**
 * Profile settings table for personal details, social links, avatar, and active theme.
 */
export const profileSettings = mysqlTable("profile_settings", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().default("Alex Chen"),
  title: varchar("title", { length: 255 }).notNull().default("DevOps, IoT & Full Stack Principal Engineer"),
  bio: text("bio").notNull(),
  avatarUrl: text("avatarUrl").notNull(),
  githubUrl: varchar("githubUrl", { length: 255 }),
  linkedinUrl: varchar("linkedinUrl", { length: 255 }),
  twitterUrl: varchar("twitterUrl", { length: 255 }),
  email: varchar("email", { length: 320 }),
  cvUrl: text("cvUrl"),
  activeTheme: mysqlEnum("activeTheme", ["devops", "iot", "fullstack"]).default("devops").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProfileSetting = typeof profileSettings.$inferSelect;
export type InsertProfileSetting = typeof profileSettings.$inferInsert;

/**
 * Skills table for the Interactive Skill Matrix.
 */
export const skills = mysqlTable("skills", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  level: varchar("level", { length: 64 }).notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", ["DevOps", "IoT", "Full Stack"]).notNull(),
  orderIndex: int("orderIndex").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = typeof skills.$inferInsert;
