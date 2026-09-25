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
          className="font-display text-red"
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
        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
          {shown.map((item) => (
            <li key={item.id} className="text-center">
              <Link href={`/${category}/${item.id}`} className="block hover:text-red">
              <div className="mx-auto flex h-40 items-center justify-center">
                <img
                  src={item.image || image}
                  alt=""
                  width={160}
                  height={200}
                  className="max-h-40 w-auto object-contain"
                />
              </div>
              <p className="mt-3 text-sm text-ink leading-snug">{item.name}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
