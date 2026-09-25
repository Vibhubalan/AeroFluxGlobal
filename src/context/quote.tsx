"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { categories } from "@/lib/content";

const KEY = "aeroflux-quote";

export type QuoteItem = { slug: string; title: string };

type QuoteContext = {
  items: QuoteItem[];
  add: (item: QuoteItem) => void;
  remove: (slug: string) => void;
  has: (slug: string) => boolean;
};

const Ctx = createContext<QuoteContext | null>(null);

function read(): QuoteItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter(
      (item): item is QuoteItem =>
        !!item && typeof item.slug === "string" && typeof item.title === "string",
    );
  } catch {
    return [];
  }
}

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>([]);

  useEffect(() => {
    const stored = read();
    const add = new URLSearchParams(window.location.search).get("add");
    if (add && !stored.some((item) => item.slug === add)) {
      const match = categories.find((item) => item.slug === add);
      const next = [...stored, { slug: add, title: match?.title || add }];
      localStorage.setItem(KEY, JSON.stringify(next));
      setItems(next);
      const url = new URL(window.location.href);
      url.searchParams.delete("add");
      window.history.replaceState({}, "", url.pathname + url.search);
      return;
    }
    setItems(stored);
  }, []);

  const value = useMemo<QuoteContext>(
    () => ({
      items,
      add: (item) => {
        setItems((current) => {
          if (current.some((entry) => entry.slug === item.slug)) return current;
          const next = [...current, item];
          localStorage.setItem(KEY, JSON.stringify(next));
          return next;
        });
      },
      remove: (slug) => {
        setItems((current) => {
          const next = current.filter((item) => item.slug !== slug);
          localStorage.setItem(KEY, JSON.stringify(next));
          return next;
        });
      },
      has: (slug) => items.some((item) => item.slug === slug),
    }),
    [items],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useQuote() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useQuote must be used inside QuoteProvider");
  return ctx;
}
