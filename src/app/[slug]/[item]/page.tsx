import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories } from "@/lib/content";
import { categoryProducts, findProduct, productDetail, type ProductRecord } from "@/lib/catalog";
import { ItemPurchase } from "@/components/ItemPurchase";
import { dbConfigured, dbQuery, publicItem, type CatalogRow } from "@/lib/server/db";

export const dynamic = "force-dynamic";

async function liveProduct(category: string, id: string): Promise<ProductRecord | null> {
  if (!dbConfigured()) return null;
  try {
    const result = await dbQuery<CatalogRow>(
      "SELECT * FROM catalog_items WHERE category_slug = $1 AND item_id = $2 LIMIT 1",
      [category, id],
    );
    const row = result.rows[0];
    if (!row) return null;
    const item = publicItem(row);
    return { ...item, category: item.category };
  } catch {
    return null;
  }
}

export function generateStaticParams() {
  return categories.flatMap((category) =>
    categoryProducts(category.slug).map((item) => ({
      slug: category.slug,
      item: item.id,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; item: string }>;
}): Promise<Metadata> {
  const { slug, item } = await params;
  const product = (await liveProduct(slug, item)) ?? findProduct(slug, item);
  if (!product) return {};
  return { title: `${product.name} · AeroFlux Global` };
}

export default async function ItemPage({
  params,
}: {
  params: Promise<{ slug: string; item: string }>;
}) {
  const { slug, item } = await params;
  const category = categories.find((entry) => entry.slug === slug);
  const product = (await liveProduct(slug, item)) ?? findProduct(slug, item);
  if (!category || !product) notFound();
  const detail = productDetail(product);

  return (
    <div className="mesh min-h-screen">
      <section className="page-x py-12 lg:py-16">
        <p className="mb-8 font-mono text-[11px] uppercase tracking-wider text-steel">
          <Link href="/portfolio" className="hover:text-red">Products</Link>
          <span className="mx-2">/</span>
          <Link href={`/${category.slug}`} className="hover:text-red">{category.title}</Link>
        </p>
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div className="flex min-h-80 items-center justify-center rounded-2xl border border-ink/12 p-8">
            <img
              src={product.image || `/images/products/${product.id}.webp`}
              alt=""
              width={420}
              height={520}
              className="max-h-[28rem] w-auto object-contain"
            />
          </div>
          <div>
            <h1
              className="font-display text-ink"
              style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", letterSpacing: "-0.03em", lineHeight: 1.05 }}
            >
              {product.name}
            </h1>
            <ItemPurchase packs={detail.packs} />
            <p className="mt-6 text-sm leading-relaxed text-steel">{detail.description}</p>
            <h2 className="mt-6 text-sm font-semibold text-ink">Applications</h2>
            <p className="mt-2 text-sm leading-relaxed text-steel">{detail.applications}</p>
            <h2 className="mt-6 text-sm font-semibold text-ink">Specifications</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-steel">
              {detail.specifications.map((spec) => (
                <li key={spec}>{spec}</li>
              ))}
            </ul>
            <Link href="/contact" className="btn-primary mt-8">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
