import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/server/db";
import { deskSignedIn } from "@/lib/server/desk-session";

export const dynamic = "force-dynamic";

async function ensureTable() {
  await dbQuery(
    `CREATE TABLE IF NOT EXISTS catalog_categories (
      slug VARCHAR(80) PRIMARY KEY,
      title VARCHAR(200) NOT NULL
    )`,
  );
}

function slug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "group";
}

export async function GET() {
  try {
    await ensureTable();
    const result = await dbQuery<{ slug: string; title: string }>("SELECT slug, title FROM catalog_categories ORDER BY title");
    return NextResponse.json({ groups: result.rows });
  } catch {
    return NextResponse.json({ groups: [] });
  }
}

export async function POST(request: Request) {
  if (!(await deskSignedIn())) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as { title?: string } | null;
  const title = String(body?.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "A group name is required." }, { status: 400 });
  await ensureTable();
  const id = slug(title);
  await dbQuery(
    "INSERT INTO catalog_categories (slug, title) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title",
    [id, title],
  );
  return NextResponse.json({ slug: id, title });
}
