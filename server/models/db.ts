import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import { jsonDb } from "./jsonDb";

let _db: ReturnType<typeof drizzle> | null = null;
let _dbAttempted = false;
let _usingJsonFallback = false;

/**
 * Auto-create all tables if they don't exist.
 * Called once on first successful DB connection.
 */
async function autoCreateTables(db: ReturnType<typeof drizzle>) {
  try {
    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        openId VARCHAR(64) NOT NULL UNIQUE,
        name TEXT,
        email VARCHAR(320),
        loginMethod VARCHAR(64),
        role ENUM('user','admin') NOT NULL DEFAULT 'user',
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        lastSignedIn TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `));

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        summary TEXT NOT NULL,
        category ENUM('DevOps','IoT','Full Stack') NOT NULL,
        imageUrl TEXT NOT NULL,
        githubUrl TEXT,
        liveUrl TEXT,
        technologies TEXT,
        problem TEXT,
        architecture TEXT,
        impact TEXT,
        featured BOOLEAN NOT NULL DEFAULT FALSE,
        orderIndex INT NOT NULL DEFAULT 0,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `));

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS certificates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        issuer VARCHAR(255) NOT NULL,
        credentialId VARCHAR(255),
        issueDate VARCHAR(64) NOT NULL,
        expiryDate VARCHAR(64),
        verificationUrl TEXT,
        badgeUrl TEXT,
        category ENUM('DevOps','IoT','Full Stack','General') NOT NULL DEFAULT 'General',
        orderIndex INT NOT NULL DEFAULT 0,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `));

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        summary TEXT NOT NULL,
        content TEXT NOT NULL,
        category ENUM('DevOps','IoT','Full Stack','Architecture') NOT NULL,
        tags TEXT,
        coverImage TEXT,
        published BOOLEAN NOT NULL DEFAULT TRUE,
        readTime VARCHAR(32) NOT NULL DEFAULT '5 min read',
        likes INT NOT NULL DEFAULT 0,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `));

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS blog_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        blogId INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `));

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(320) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        \`read\` BOOLEAN NOT NULL DEFAULT FALSE,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `));

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS profile_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL DEFAULT 'Alex Chen',
        title VARCHAR(255) NOT NULL DEFAULT 'DevOps, IoT & Full Stack Principal Engineer',
        bio TEXT NOT NULL,
        avatarUrl TEXT NOT NULL,
        githubUrl VARCHAR(255),
        linkedinUrl VARCHAR(255),
        twitterUrl VARCHAR(255),
        email VARCHAR(320),
        activeTheme ENUM('devops','iot','fullstack') NOT NULL DEFAULT 'devops',
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `));

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        level VARCHAR(64) NOT NULL,
        description TEXT NOT NULL,
        category ENUM('DevOps','IoT','Full Stack') NOT NULL,
        orderIndex INT NOT NULL DEFAULT 0,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `));

    console.log("[Database] Auto-created tables (if not existing).");
  } catch (error) {
    console.error("[Database] Auto table creation failed:", error);
  }
}

export async function getDb() {
  if (_db) return _db;

  // Only attempt connection once to avoid repeated timeout delays
  if (_dbAttempted) return null;
  _dbAttempted = true;

  if (!process.env.DATABASE_URL) {
    console.warn("[Database] DATABASE_URL not set. Using JSON file storage fallback.");
    _usingJsonFallback = true;
    return null;
  }

  try {
    console.log("[Database] Attempting MySQL connection...");
    _db = drizzle(process.env.DATABASE_URL);
    // Test the connection with a simple query
    await _db.execute(sql`SELECT 1`);
    console.log("[Database] MySQL connected successfully.");
    // Auto-create tables
    await autoCreateTables(_db);
    return _db;
  } catch (error) {
    const err = error as Error;
    console.error("[Database] Failed to connect to MySQL:");
    console.error("[Database] Error:", err.message);
    console.warn("[Database] Falling back to JSON file storage.");
    _usingJsonFallback = true;
    _db = null;
    return null;
  }
}

/**
 * Check if we are using JSON file fallback instead of MySQL.
 */
export function isUsingJsonFallback(): boolean {
  return _usingJsonFallback;
}

/**
 * Get the JSON DB instance (always available).
 */
export function getJsonDb() {
  return jsonDb;
}
