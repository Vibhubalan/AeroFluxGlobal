import { products } from "@/lib/content";

export type CatalogProduct = {
  id: string;
  name: string;
  featured?: boolean;
  summary?: string;
  packs?: string[];
  description?: string;
  applications?: string;
  specifications?: string[];
  image?: string;
};

export type ProductRecord = CatalogProduct & { category: string };

const byCategory = products as Record<string, CatalogProduct[]>;

export function categoryProducts(slug: string): CatalogProduct[] {
  return byCategory[slug] ?? [];
}

export function findProduct(category: string, id: string): ProductRecord | undefined {
  const item = categoryProducts(category).find((entry) => entry.id === id);
  if (!item) return undefined;
  return { ...item, category };
}

export function allProducts(): ProductRecord[] {
  return Object.entries(byCategory).flatMap(([category, items]) =>
    items.map((item) => ({ ...item, category })),
  );
}

export function featuredProducts(): ProductRecord[] {
  return allProducts().filter((item) => item.featured);
}

export function productDetail(item: CatalogProduct) {
  return {
    packs: item.packs ?? ["6x1 USQ", "208.1 L"],
    description:
      item.description ??
      `${item.name} is supplied for aviation use with trace documentation. Pack size and availability are confirmed against the current specification at enquiry.`,
    applications:
      item.applications ??
      `Approved aviation applications where ${item.name} is the specified grade.`,
    specifications: item.specifications ?? ["OEM traceable", "Certificate of conformance on request"],
    summary: item.summary ?? "Supplied to the current aviation specification.",
  };
}
