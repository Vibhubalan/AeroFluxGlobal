import { readFileSync } from "node:fs";
import pg from "pg";

const data = JSON.parse(readFileSync("src/data/products.json", "utf8"));
const client = new pg.Client({
  host: process.env.DB_HOST,
  port: 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  ssl: { rejectUnauthorized: false },
});

const sql = `INSERT INTO catalog_items (category_slug, item_id, name, image, packs, description, applications, specifications, summary, featured)
  VALUES ($1,$2,$3,$4,CAST($5 AS jsonb),$6,$7,CAST($8 AS jsonb),$9,$10)
  ON CONFLICT (category_slug, item_id) DO UPDATE SET
    name=EXCLUDED.name,
    image=CASE WHEN EXCLUDED.image='' THEN catalog_items.image ELSE EXCLUDED.image END,
    packs=EXCLUDED.packs,
    description=EXCLUDED.description,
    applications=EXCLUDED.applications,
    specifications=EXCLUDED.specifications,
    summary=EXCLUDED.summary,
    featured=EXCLUDED.featured`;

await client.connect();
let count = 0;
for (const [category, items] of Object.entries(data)) {
  for (const item of items) {
    const packs = item.packs?.length ? item.packs : ["6x1 USQ"];
    await client.query(sql, [
      category,
      item.id,
      item.name,
      item.image || "",
      JSON.stringify(packs),
      item.description || "",
      item.applications || "",
      JSON.stringify(item.specifications || []),
      item.summary || "",
      Boolean(item.featured),
    ]);
    count += 1;
  }
}
const grouped = await client.query(
  "SELECT category_slug, count(*)::int AS n FROM catalog_items GROUP BY category_slug ORDER BY category_slug",
);
console.log(`imported ${count}`);
for (const row of grouped.rows) console.log(`${row.category_slug} ${row.n}`);
await client.end();
