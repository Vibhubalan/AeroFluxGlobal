"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type CatalogItem = { id: string; name: string; image?: string };

export function CategoryItems({
  title,
  summary,
  image,
  items,
  category,
}: {
  title: string;
  summary: string;
  image: string;
  items: CatalogItem[];
  category: string;
}) {
  const [live, setLive] = useState<CatalogItem[] | null>(null);
  const catalog = live ?? items;
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/items.php?c=${encodeURIComponent(category)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && Array.isArray(data?.items) && data.items.length > 0) {
          setLive(data.items);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [category]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter((item) => item.name.toLowerCase().includes(q));
  }, [catalog, query]);

  return (
    <section className="page-x py-14 lg:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2
          className="font-display"
          style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", letterSpacing: "-0.03em" }}
        >
          {title}
        </h2>
        <p className="mt-3 text-sm text-steel leading-relaxed">{summary}</p>
        <label className="mx-auto mt-8 block max-w-md">
          <span className="sr-only">Search products</span>
          <span className="flex items-center gap-2 border-b border-ink/20 px-1 py-2 transition-colors focus-within:border-red">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 text-steel">
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
      </div>

      {shown.length === 0 ? (
        <p className="mt-10 text-center text-sm text-steel">No products match.</p>
      ) : (
        <ul className="mx-auto mt-12 grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((item) => (
            <li key={item.id}>
              <Link
                href={`/${category}/${item.id}`}
                className="group block overflow-hidden border border-ink/10 bg-white/45 transition-colors hover:border-ink/25"
                style={{ borderRadius: "var(--radius)" }}
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#e7dcc8]">
                  <img
                    src={item.image || `/images/products/${item.id}.webp`}
                    alt=""
                    width={640}
                    height={480}
                    onError={(event) => {
                      event.currentTarget.src = image;
                    }}
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                </div>
                <p className="px-3.5 py-3.5 text-sm font-semibold leading-snug text-ink group-hover:text-logo">
                  {item.name}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
