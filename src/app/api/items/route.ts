import { NextResponse } from "next/server";
import { dbConfigured, dbQuery, publicItem, type CatalogRow } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!dbConfigured()) {
    return NextResponse.json({ items: [] });
  }
  const url = new URL(request.url);
  const category = url.searchParams.get("c") || "";
  const featured = url.searchParams.has("featured");
  const where: string[] = [];
  const values: string[] = [];
  if (category) {
    values.push(category);
    where.push(`category_slug = $${values.length}`);
  }
  if (featured) where.push("featured = TRUE");
  const sql = `SELECT * FROM catalog_items${where.length ? ` WHERE ${where.join(" AND ")}` : ""} ORDER BY name ASC`;
  try {
    const result = await dbQuery<CatalogRow>(sql, values);
    return NextResponse.json({ items: result.rows.map(publicItem) });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
