import { eq } from "drizzle-orm";
import { InsertUser, users } from "../../drizzle/schema";
import { getDb, getJsonDb } from "./db";
import { ENV } from "../middleware/env";

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (db) {
    try {
      const values: InsertUser = {
        openId: user.openId,
      };
      const updateSet: Record<string, unknown> = {};

      const textFields = ["name", "email", "loginMethod"] as const;
      type TextField = (typeof textFields)[number];

      const assignNullable = (field: TextField) => {
        const value = user[field];
        if (value === undefined) return;
        const normalized = value ?? null;
        values[field] = normalized;
        updateSet[field] = normalized;
      };

      textFields.forEach(assignNullable);

      if (user.lastSignedIn !== undefined) {
        values.lastSignedIn = user.lastSignedIn;
        updateSet.lastSignedIn = user.lastSignedIn;
      }
      if (user.role !== undefined) {
        values.role = user.role;
        updateSet.role = user.role;
      } else if (user.openId === ENV.ownerOpenId) {
        values.role = 'admin';
        updateSet.role = 'admin';
      }

      if (!values.lastSignedIn) {
        values.lastSignedIn = new Date();
      }

      if (Object.keys(updateSet).length === 0) {
        updateSet.lastSignedIn = new Date();
      }

      await db.insert(users).values(values).onDuplicateKeyUpdate({
        set: updateSet,
      });
    } catch (error) {
      console.error("[Database] Failed to upsert user:", error);
      throw error;
    }
    return;
  }

  // JSON fallback
  const json = getJsonDb();
  const existing = json.selectOne("users", (r: any) => r.openId === user.openId);
  const role = user.role || (user.openId === ENV.ownerOpenId ? "admin" : "user");

  if (existing) {
    json.update("users", (existing as any).id, {
      ...user,
      role,
      lastSignedIn: user.lastSignedIn || new Date().toISOString(),
    });
  } else {
    json.insert("users", {
      openId: user.openId,
      name: user.name || null,
      email: user.email || null,
      loginMethod: user.loginMethod || null,
      role,
      lastSignedIn: user.lastSignedIn || new Date().toISOString(),
    });
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (db) {
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }
  // JSON fallback
  const json = getJsonDb();
  return json.selectOne("users", (r: any) => r.openId === openId) as any;
}
