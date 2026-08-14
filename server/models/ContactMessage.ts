import { desc } from "drizzle-orm";
import { contactMessages } from "../../drizzle/schema";
import { getDb, getJsonDb } from "./db";

export async function getContactMessages() {
  const db = await getDb();
  if (db) {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }
  const json = getJsonDb();
  return json.select("contactMessages").sort((a: any, b: any) =>
    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}
