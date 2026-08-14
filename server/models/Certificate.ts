import { certificates } from "../../drizzle/schema";
import { getDb, getJsonDb } from "./db";

export async function getCertificates() {
  const db = await getDb();
  if (db) {
    return await db.select().from(certificates).orderBy(certificates.orderIndex);
  }
  const json = getJsonDb();
  return json.select("certificates").sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0));
}
