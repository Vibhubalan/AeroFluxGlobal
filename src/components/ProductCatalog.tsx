"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { categories, products } from "@/lib/content";
import { productImage } from "@/lib/images";
import { ArrowUpRight } from "lucide-react";

export function ProductCatalog() {
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState(categories);
  const [itemNames, setItemNames] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(Object.entries(products).map(([slug, items]) => [slug, items.map((item) => item.name)])),
  );
  useEffect(() => {
    fetch("/api/categories")
      .then((response) => response.json())
      .then((data) => {
        if (!Array.isArray(data?.groups)) return;
        const known = new Set(categories.map((item) => item.slug));
        const added = data.groups
          .filter((item: { slug: string }) => !known.has(item.slug))
          .map((item: { slug: string; title: string }) => ({
            slug: item.slug,
            title: item.title,
            shortTitle: item.title,
            tagline: "",
            summary: "",
            paragraphs: [],
            brands: [] as string[],
            groups: [],
          }));
        setCatalog([...categories, ...added]);
      })
      .catch(() => undefined);
    fetch("/api/items")
      .then((response) => response.json())
      .then((data) => {
        if (!Array.isArray(data?.items)) return;
        const names: Record<string, string[]> = {};
        for (const item of data.items as { category?: string; name?: string }[]) {
          if (!item.category || !item.name) continue;
          names[item.category] = [...(names[item.category] ?? []), item.name];
        }
        setItemNames((current) => {
          const next = { ...current };
          for (const [slug, list] of Object.entries(names)) next[slug] = list;
          return next;
        });
      })
      .catch(() => undefined);
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter((item) =>
      [item.title, item.shortTitle, item.tagline, ...item.brands, ...(itemNames[item.slug] ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [query, catalog, itemNames]);

  return (
    <>
      <label className="mb-8 block max-w-xl">
        <span className="sr-only">Search products</span>
        <span className="flex items-center gap-3 border-b border-ink/20 px-1 py-2.5 transition-colors focus-within:border-red">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 text-steel">
            <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.25" />
            <path d="M10.5 10.5 13.5 13.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-mist"
          />
        </span>
      </label>

      {shown.length === 0 ? (
        <p className="text-sm text-steel">No products match.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {shown.map((item, index) => (
            <Link
              key={item.slug}
              href={`/${item.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-ink/12 transition-colors hover:border-red/40"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={productImage(item.slug)}
                  alt=""
                  width={800}
                  height={600}
                  loading={index < 4 ? "eager" : "lazy"}
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                />
                <div
                  className="absolute inset-0 hidden sm:block"
                  style={{
                    background:
                      "linear-gradient(to top, #2a261f 0%, rgba(42,38,31,0.92) 28%, rgba(42,38,31,0.4) 58%, transparent 78%)",
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 hidden items-end gap-2.5 p-3.5 sm:flex">
                  <span className="font-mono text-[11px] tracking-wider text-white/80">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold leading-snug text-white transition-colors group-hover:text-red">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-sm leading-snug text-white/90">
                      {item.tagline}
                    </span>
                  </span>
                  <ArrowUpRight className="mb-0.5 h-4 w-4 shrink-0 text-white/70 transition-colors group-hover:text-red" />
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 sm:hidden">
                <span className="font-mono text-[11px] tracking-wider text-steel">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-snug text-ink">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-steel">
                    {item.tagline}
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
