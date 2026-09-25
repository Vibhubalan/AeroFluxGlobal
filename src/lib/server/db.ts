import { Pool, type QueryResultRow } from "pg";
import { readFileSync } from "node:fs";
import path from "node:path";

const globalForPg = globalThis as unknown as { aeroPool?: Pool; aeroSchema?: Promise<void>; aeroPoolKey?: string };

export function dbConfigured(): boolean {
  return Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASS);
}

function pool(): Pool {
  const key = `${process.env.DB_HOST}|${process.env.DB_USER}|${process.env.DB_PASS}`;
  if (!globalForPg.aeroPool || globalForPg.aeroPoolKey !== key) {
    void globalForPg.aeroPool?.end();
    globalForPg.aeroSchema = undefined;
    globalForPg.aeroPoolKey = key;
    globalForPg.aeroPool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      ssl: { rejectUnauthorized: false },
      max: 3,
    });
  }
  return globalForPg.aeroPool;
}

export async function dbQuery<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) {
  if (!dbConfigured()) {
    throw new Error("Database is not configured. Set DB_HOST, DB_NAME, DB_USER, and DB_PASS in .env.");
  }
  if (!globalForPg.aeroSchema) {
    const schema = readFileSync(path.join(process.cwd(), "sql", "schema.sql"), "utf8");
    globalForPg.aeroSchema = pool()
      .query(schema)
      .then(() => undefined)
      .catch((error: unknown) => {
        globalForPg.aeroSchema = undefined;
        throw error;
      });
  }
  await globalForPg.aeroSchema;
  return pool().query<T>(text, values);
}

export type CatalogRow = {
  id: number;
  category_slug: string;
  item_id: string;
  name: string;
  image: string;
  packs: string[] | string;
  description: string;
  applications: string;
  specifications: string[] | string;
  summary: string;
  featured: boolean;
};

function asList(value: string[] | string | null): string[] {
  if (Array.isArray(value)) return value.filter((item) => item !== "");
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function publicItem(row: CatalogRow) {
  return {
    id: row.item_id,
    recordId: row.id,
    category: row.category_slug,
    name: row.name,
    image: row.image || `/images/products/${row.item_id}.webp`,
    featured: row.featured === true,
    packs: asList(row.packs),
    description: row.description,
    applications: row.applications,
    specifications: asList(row.specifications),
    summary: row.summary,
  };
}
