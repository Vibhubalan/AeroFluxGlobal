"use client";

import Link from "next/link";
import { useQuote } from "@/context/quote";
import { Trash2, ArrowUpRight, PackageCheck, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuoteList() {
  const { items, remove } = useQuote();

  if (!items.length) {
    return (
      <div className="py-8 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 text-steel">
          <Inbox className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-ink">Your quote list is currently empty</p>
        <p className="text-xs text-steel mt-1 max-w-xs">
          Explore our aviation fluids catalog and click &ldquo;Add to quote&rdquo; to attach items here.
        </p>
        <Button variant="outline" size="sm" asChild className="mt-4">
          <Link href="/portfolio">Browse Catalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-steel pb-1 border-b border-white/8 font-mono uppercase tracking-wider">
        <span>Selected ({items.length})</span>
        <span>Action</span>
      </div>
      <ul className="divide-y divide-white/8">
        {items.map((item) => (
          <li key={item.slug} className="flex items-center justify-between gap-3 py-3 group">
            <Link
              href={`/${item.slug}`}
              className="flex items-center gap-2.5 text-sm font-medium text-ink group-hover:text-red transition-colors"
            >
              <PackageCheck className="w-4 h-4 text-red shrink-0" />
              <span>{item.title}</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-red" />
            </Link>
            <button
              type="button"
              onClick={() => remove(item.slug)}
              className="p-1.5 rounded-md text-steel hover:text-red hover:bg-red/10 transition-colors"
              title={`Remove ${item.title}`}
              aria-label={`Remove ${item.title}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
