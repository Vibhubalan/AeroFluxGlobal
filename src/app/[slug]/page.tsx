import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryItems } from "@/components/CategoryItems";
import { categories, products } from "@/lib/content";
import { productImage } from "@/lib/images";
import { dbQuery, publicItem, type CatalogRow } from "@/lib/server/db";

export const dynamic = "force-dynamic";

async function categoryBySlug(slug: string) {
  const known = categories.find((item) => item.slug === slug);
  if (known) return known;
  try {
    const result = await dbQuery<{ title: string }>("SELECT title FROM catalog_categories WHERE slug = $1", [slug]);
    const title = result.rows[0]?.title;
    if (!title) return null;
    return { slug, title, shortTitle: title, summary: "", tagline: "", paragraphs: [], brands: [], groups: [] };
  } catch {
    return null;
  }
}

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await categoryBySlug(slug);
  if (!category) return {};
  return { title: `${category.title} · AeroFlux Global`, description: category.summary };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await categoryBySlug(slug);
  if (!category) notFound();
  let items = products[category.slug as keyof typeof products] ?? [];
  try {
    const result = await dbQuery<CatalogRow>("SELECT * FROM catalog_items WHERE category_slug = $1 ORDER BY name", [slug]);
    if (result.rows.length > 0) items = result.rows.map(publicItem);
  } catch {
    items = products[category.slug as keyof typeof products] ?? [];
  }

  return (
    <div className="mesh min-h-screen">
      <CategoryItems
        title={category.title}
        summary={category.summary}
        image={productImage(category.slug)}
        category={category.slug}
        items={items}
      />
    </div>
  );
}
