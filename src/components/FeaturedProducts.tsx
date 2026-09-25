"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { featuredProducts, productDetail } from "@/lib/catalog";
import { productImage } from "@/lib/images";

type Featured = {
  id: string;
  category: string;
  name: string;
  image?: string;
  summary?: string;
};

const initial: Featured[] = featuredProducts().map((item) => ({
  id: item.id,
  category: item.category,
  name: item.name,
  image: productImage(item.category),
  summary: productDetail(item).summary,
}));

export function FeaturedProducts() {
  const [items, setItems] = useState(initial);

  useEffect(() => {
    fetch("/api/items.php?featured=1")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (Array.isArray(data?.items) && data.items.length > 0) {
          setItems(data.items);
        }
      })
      .catch(() => undefined);
  }, []);

  if (!items.length) return null;

  return (
    <div>
      <p className="eyebrow mb-4">Featured products</p>
      <div className="grid gap-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-2xl border border-ink/12 p-5"
          >
            <div>
              <h3 className="font-semibold text-ink">{item.name}</h3>
              <p className="mt-2 text-sm text-steel">{item.summary}</p>
              <Link href={`/${item.category}/${item.id}`} className="mt-3 inline-block text-sm text-red">
                View details
              </Link>
            </div>
            <img
              src={item.image || productImage(item.category)}
              alt=""
              width={120}
              height={140}
              className="h-28 w-auto object-contain"
            />
          </article>
        ))}
      </div>
    </div>
  );
}
