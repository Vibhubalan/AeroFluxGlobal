"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { categories, pages } from "@/lib/content";
import { productImage } from "@/lib/images";

const pillars = [
  ["AOG", "Support"],
  ["Global Supply", "Network"],
  ["Trusted by", "Industry"],
];

const slides = ["brand", "supply", "products"] as const;

export function HomeHero() {
  const home = pages.home;
  const [index, setIndex] = useState(0);
  const count = slides.length;

  const go = useCallback(
    (delta: number) => setIndex((current) => (current + delta + count) % count),
    [count],
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => go(1), 6000);
    return () => window.clearTimeout(id);
  }, [go, index]);

  const slide = slides[index];

  return (
    <section className="hero-stage hero-enter relative h-auto min-h-[calc(100dvh-4rem)] overflow-hidden md:h-[calc(100dvh-7rem)]">
      <svg className="hero-routes" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path d="M-40 620 C 280 420, 520 760, 860 540 S 1280 300, 1500 460" />
        <path d="M-20 240 C 340 120, 680 380, 980 220 S 1320 80, 1520 210" />
        <path d="M120 860 C 420 640, 760 700, 1040 480 S 1360 360, 1560 420" />
      </svg>
      <div key={slide} className="hero-slide relative h-full">
        {slide === "brand" && (
          <div className="flex h-full min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-5 py-16 text-center md:min-h-0 md:px-16 md:py-0">
            <h1 className="brand-lockup">
              <img src="/images/logo-word.png" alt="AeroFlux" className="brand-word" />
              <span className="brand-run" aria-hidden="true">
                <span className="brand-rule" />
                <img src="/images/logo-plane.png" alt="" className="brand-plane" />
              </span>
              <img src="/images/logo-global.png" alt="Global" className="brand-global" />
            </h1>
          </div>
        )}

        {slide === "supply" && (
          <div className="flex h-full min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-5 py-16 text-center md:min-h-0 md:px-16 md:py-0">
            <p className="eyebrow mb-4 flex items-center gap-4">
              {home.eyebrow}
              <span className="h-px w-12 bg-red" aria-hidden="true" />
            </p>
            <h1
              className="font-display uppercase"
              style={{ fontSize: "clamp(2.4rem, 5.2vw, 4.6rem)", lineHeight: 0.96, letterSpacing: "-0.035em" }}
            >
              <span className="block text-silver">OEM-compliant</span>
              <span className="block text-logo">aviation</span>
              <span className="block">procurement.</span>
            </h1>
            <p className="mt-5 max-w-xl text-steel" style={{ fontSize: "clamp(0.95rem, 1.4vw, 1.15rem)" }}>
              {home.lede}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="btn-primary">Request a Quote</Link>
              <Link href="/portfolio" className="btn-ghost">Explore Products</Link>
            </div>
            <ul className="mt-10 flex flex-wrap items-center justify-center">
              {pillars.map(([line, rest], index) => (
                <li
                  key={line}
                  className={`px-6 text-sm leading-snug text-ink lg:px-8 lg:text-base ${index > 0 ? "border-l border-white/30" : ""}`}
                >
                  {line}
                  <br />
                  {rest}
                </li>
              ))}
            </ul>
          </div>
        )}

        {slide === "products" && (
          <div className="flex h-full min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-5 py-16 text-center md:min-h-0 md:px-16 md:py-0">
            <p className="eyebrow mb-4">Catalog</p>
            <h2 className="font-display" style={{ fontSize: "clamp(2rem, 4vw, 3.4rem)", letterSpacing: "-0.03em", lineHeight: 1 }}>
              A preview of <span className="text-logo">products</span>
            </h2>
            <ul className="mt-6 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 md:mt-8 md:gap-4">
              {categories.slice(0, 4).map((item) => (
                <li key={item.slug}>
                  <Link href={`/${item.slug}`} className="group block">
                    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white/30" style={{ aspectRatio: "4 / 3" }}>
                      <img src={productImage(item.slug)} alt="" className="h-full w-full object-cover" />
                    </div>
                    <p className="mt-2 text-xs leading-snug text-ink group-hover:text-logo sm:text-sm">{item.shortTitle}</p>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/portfolio" className="btn-primary mt-8">Show more products</Link>
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-4 z-20 flex items-center justify-center gap-2 md:bottom-6">
        {slides.map((id, dot) => (
          <button
            key={id}
            type="button"
            aria-label={`Slide ${dot + 1}`}
            onClick={() => setIndex(dot)}
            className={`h-1.5 rounded-full transition-all ${dot === index ? "w-8 bg-white" : "w-3 bg-white/25"}`}
          />
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-px"
        style={{ background: "linear-gradient(90deg, transparent, var(--color-amber) 18%, var(--color-amber) 82%, transparent)" }}
        aria-hidden="true"
      />
      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => go(-1)}
        className="absolute top-1/2 left-1 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-ink/45 transition-colors hover:text-ink md:left-6 md:h-11 md:w-11"
      >
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => go(1)}
        className="absolute top-1/2 right-1 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-ink/45 transition-colors hover:text-ink md:right-6 md:h-11 md:w-11"
      >
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
}
