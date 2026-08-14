import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * JSON file-based storage - fallback when MySQL is not available.
 * Each "table" is stored as a separate JSON file in server/data/
 */

type TableName =
    | "users"
    | "projects"
    | "certificates"
    | "blogPosts"
    | "blogComments"
    | "contactMessages"
    | "profileSettings"
    | "skills";

function getFilePath(table: TableName): string {
    return path.join(DATA_DIR, `${table}.json`);
}

function readTable<T = Record<string, unknown>>(table: TableName): T[] {
    const filePath = getFilePath(table);
    if (!fs.existsSync(filePath)) {
        return [];
    }
    try {
        const raw = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(raw) as T[];
    } catch {
        return [];
    }
}

function writeTable<T>(table: TableName, data: T[]): void {
    const filePath = getFilePath(table);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function getNextId(table: TableName): number {
    const rows = readTable(table);
    if (rows.length === 0) return 1;
    const maxId = Math.max(...rows.map((r: any) => r.id || 0));
    return maxId + 1;
}

// ==================== Generic CRUD ====================

export const jsonDb = {
    // --- SELECT ---
    select<T = Record<string, unknown>>(table: TableName): T[] {
        return readTable<T>(table);
    },

    selectWhere<T = Record<string, unknown>>(
        table: TableName,
        predicate: (row: T) => boolean
    ): T[] {
        return readTable<T>(table).filter(predicate);
    },

    selectOne<T = Record<string, unknown>>(
        table: TableName,
        predicate: (row: T) => boolean
    ): T | undefined {
        return readTable<T>(table).find(predicate);
    },

    // --- INSERT ---
    insert<T extends Record<string, unknown>>(
        table: TableName,
        values: Omit<T, "id"> & { id?: number }
    ): T {
        const rows = readTable<T>(table);
        const newRow = {
            ...values,
            id: values.id || getNextId(table),
            createdAt: (values as any).createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        } as T;
        rows.push(newRow);
        writeTable(table, rows);
        return newRow;
    },

    insertMany<T extends Record<string, unknown>>(
        table: TableName,
        items: Array<Omit<T, "id"> & { id?: number }>
    ): T[] {
        const rows = readTable<T>(table);
        let nextId = getNextId(table);
        const newRows: T[] = items.map((item) => ({
            ...item,
            id: item.id || nextId++,
            createdAt: (item as any).createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })) as T[];
        rows.push(...newRows);
        writeTable(table, rows);
        return newRows;
    },

    // --- UPDATE ---
    update<T extends Record<string, unknown>>(
        table: TableName,
        id: number,
        values: Partial<T>
    ): boolean {
        const rows = readTable<T>(table);
        const index = rows.findIndex((r: any) => r.id === id);
        if (index === -1) return false;
        rows[index] = { ...rows[index], ...values, updatedAt: new Date().toISOString() } as T;
        writeTable(table, rows);
        return true;
    },

    // --- UPSERT (by field) ---
    upsert<T extends Record<string, unknown>>(
        table: TableName,
        field: keyof T,
        fieldValue: unknown,
        values: Partial<T>
    ): T {
        const rows = readTable<T>(table);
        const index = rows.findIndex((r: any) => r[field] === fieldValue);
        if (index >= 0) {
            rows[index] = { ...rows[index], ...values, updatedAt: new Date().toISOString() } as T;
            writeTable(table, rows);
            return rows[index];
        } else {
            return this.insert<T>(table, values as any);
        }
    },

    // --- DELETE ---
    delete(table: TableName, id: number): boolean {
        const rows = readTable(table);
        const filtered = rows.filter((r: any) => r.id !== id);
        if (filtered.length === rows.length) return false;
        writeTable(table, filtered);
        return true;
    },

    // --- UTILITY ---
    count(table: TableName): number {
        return readTable(table).length;
    },

    isEmpty(table: TableName): boolean {
        return readTable(table).length === 0;
    },
};

export type JsonDb = typeof jsonDb;
