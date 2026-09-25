import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryItems } from "@/components/CategoryItems";
import { categories, products } from "@/lib/content";
import { productImage } from "@/lib/images";

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((item) => item.slug === slug);
  if (!category) return {};
  return { title: `${category.title} · AeroFlux Global`, description: category.summary };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();

  return (
    <div className="mesh min-h-screen">
      <CategoryItems
        title={category.title}
        summary={category.summary}
        image={productImage(category.slug)}
        category={category.slug}
        items={products[category.slug as keyof typeof products] ?? []}
      />
    </div>
  );
}
