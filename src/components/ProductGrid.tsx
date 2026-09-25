"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { categories } from "@/lib/content";
import { productImage } from "@/lib/images";

function Plane({ className }: { className?: string }) {
  return (
    <img src="/images/flight-side.png" alt="" className={className} />
  );
}

export function ProductGrid() {
  const shown = categories.slice(0, 5);
  const router = useRouter();
  const [flying, setFlying] = useState(false);

  function explore() {
    if (flying) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      router.push("/portfolio");
      return;
    }
    setFlying(true);
    sessionStorage.setItem("skip-flight", "1");
    window.setTimeout(() => router.push("/portfolio"), 1750);
  }

  return (
    <>
    <ol className="grid grid-cols-2 items-start gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
      {shown.map((item, index) => (
        <li key={item.slug}>
          <Link href={`/${item.slug}`} className="group block" aria-label={item.shortTitle}>
            <div
              className="overflow-hidden"
              style={{ aspectRatio: "4 / 3", borderRadius: "var(--radius)" }}
            >
              <img
                src={productImage(item.slug)}
                alt=""
                width={800}
                height={600}
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              />
            </div>
            <div className="mt-3 flex items-baseline gap-3">
              <p className="eyebrow mb-0">{String(index + 1).padStart(2, "0")}</p>
              <h3
                className="font-semibold text-ink leading-snug group-hover:text-red transition-colors"
                style={{ fontSize: "0.92rem", letterSpacing: "-0.02em" }}
              >
                {item.shortTitle}
              </h3>
            </div>
          </Link>
        </li>
      ))}
      <li className="col-span-2 flex items-center justify-center sm:col-span-1 lg:pt-[18%]">
        <button
          type="button"
          onClick={explore}
          className="group flex flex-col items-center gap-3"
        >
          <span className="grid h-12 w-12 place-items-center rounded-full border border-ink/20 text-ink transition-all duration-300 group-hover:border-[#2c2928] group-hover:bg-[#2c2928] group-hover:text-[#f4efe6] group-hover:translate-x-1">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M3.5 9h11M10 4.5 14.5 9 10 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-xs tracking-[0.14em] uppercase text-steel transition-colors duration-300 group-hover:text-ink">
            View all products
          </span>
        </button>
      </li>
    </ol>
    {flying && (
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-7" aria-hidden="true">
        <div className="flight-line" />
        <div className="flight-cross">
          <Plane className="h-[26px] w-auto" />
        </div>
      </div>
    )}
    </>
  );
}
