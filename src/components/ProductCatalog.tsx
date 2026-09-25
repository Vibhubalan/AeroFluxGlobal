"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { categories } from "@/lib/content";
import { productImage } from "@/lib/images";
import { ArrowUpRight } from "lucide-react";

export function ProductCatalog() {
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((item) =>
      [item.title, item.shortTitle, item.tagline, ...item.brands]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [query]);

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
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, #2a261f 0%, rgba(42,38,31,0.92) 28%, rgba(42,38,31,0.4) 58%, transparent 78%)",
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end gap-2.5 p-3.5">
                  <span className="font-mono text-[11px] text-white/80 tracking-wider">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold text-white leading-snug group-hover:text-red transition-colors">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-sm text-white/90 leading-snug">
                      {item.tagline}
                    </span>
                  </span>
                  <ArrowUpRight className="mb-0.5 w-4 h-4 shrink-0 text-white/70 transition-colors group-hover:text-red" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
