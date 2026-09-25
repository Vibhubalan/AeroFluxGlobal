import { NextResponse } from "next/server";
import { dbQuery, publicItem, type CatalogRow } from "@/lib/server/db";
import { deskSignedIn } from "@/lib/server/desk-session";
import { storeProductImage } from "@/lib/server/r2";
import { readUpload } from "@/lib/server/storage";

export const dynamic = "force-dynamic";

function slug(value: string): string {
  const next = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return next || "item";
}

function lines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function GET() {
  if (!(await deskSignedIn())) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  try {
    const result = await dbQuery<CatalogRow>("SELECT * FROM catalog_items ORDER BY category_slug, name");
    return NextResponse.json({ items: result.rows.map(publicItem) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not read products.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await deskSignedIn())) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const form = await request.formData();
  const category = String(form.get("category") ?? "");
  const name = String(form.get("name") ?? "").trim();
  const itemId = slug(String(form.get("item_id") ?? "").trim() || name);
  const packs = lines(form.get("packs"));
  if (!category || !name || packs.length === 0) {
    return NextResponse.json({ error: "Category, name, and one pack size are required." }, { status: 400 });
  }
  const specs = lines(form.get("specifications"));
  const description = String(form.get("description") ?? "").trim();
  const applications = String(form.get("applications") ?? "").trim();
  const summary = String(form.get("summary") ?? "").trim();
  const featured = form.get("featured") === "1";
  let image = String(form.get("image") ?? "").trim();
  const file = readUpload(form.get("file"));
  try {
    if (file) {
      image = await storeProductImage(itemId, file);
    }
    await dbQuery(
      `INSERT INTO catalog_items (category_slug, item_id, name, image, packs, description, applications, specifications, summary, featured)
       VALUES ($1, $2, $3, $4, CAST($5 AS jsonb), $6, $7, CAST($8 AS jsonb), $9, $10)
       ON CONFLICT (category_slug, item_id) DO UPDATE SET
         name = EXCLUDED.name,
         image = CASE WHEN EXCLUDED.image = '' THEN catalog_items.image ELSE EXCLUDED.image END,
         packs = EXCLUDED.packs,
         description = EXCLUDED.description,
         applications = EXCLUDED.applications,
         specifications = EXCLUDED.specifications,
         summary = EXCLUDED.summary,
         featured = EXCLUDED.featured`,
      [category, itemId, name, image, JSON.stringify(packs), description, applications, JSON.stringify(specs), summary, featured],
    );
    return NextResponse.json({ ok: true, id: itemId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save that item.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await deskSignedIn())) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as { category?: string; id?: string } | null;
  const category = String(body?.category ?? "");
  const id = String(body?.id ?? "");
  if (!category) {
    return NextResponse.json({ error: "Nothing to delete." }, { status: 400 });
  }
  if (id) {
    await dbQuery("DELETE FROM catalog_items WHERE category_slug = $1 AND item_id = $2", [category, id]);
  } else {
    await dbQuery("DELETE FROM catalog_items WHERE category_slug = $1", [category]);
    await dbQuery("DELETE FROM catalog_categories WHERE slug = $1", [category]).catch(() => undefined);
  }
  return NextResponse.json({ ok: true });
}
