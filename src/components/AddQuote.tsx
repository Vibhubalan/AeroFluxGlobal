"use client";

import { useQuote } from "@/context/quote";
import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";

export function AddQuote({ slug, title }: { slug: string; title: string }) {
  const { add, has, remove } = useQuote();
  const added = has(slug);

  return (
    <Button
      type="button"
      variant={added ? "secondary" : "default"}
      onClick={() => {
        if (added) {
          remove(slug);
        } else {
          add({ slug, title });
        }
      }}
      className={
        added
          ? "bg-navy text-white hover:bg-navy-2 border border-white/10"
          : "bg-red hover:bg-red/90"
      }
    >
      {added ? (
        <>
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Added to Quote</span>
        </>
      ) : (
        <>
          <Plus className="w-4 h-4 shrink-0" />
          <span>Add to Quote</span>
        </>
      )}
    </Button>
  );
}
