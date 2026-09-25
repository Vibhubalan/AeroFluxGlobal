"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { categories, site } from "@/lib/content";
import { productImage } from "@/lib/images";
import { useQuote } from "@/context/quote";

export function Header() {
  const path = usePathname();
  const { items } = useQuote();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const onProducts =
    path === "/portfolio" || categories.some((c) => path === `/${c.slug}`);

  return (
    <div className="sticky top-0 z-50 glass-bar">
      <header className="flex items-center justify-between page-x h-16 md:h-28">
        <Link href="/" aria-label={site.name} className="shrink-0">
          <img src="/images/logo.png" alt={site.name} className="h-9 w-auto brightness-110 md:h-16" />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-base" aria-label="Main navigation">
          <NavLink href="/" active={path === "/"}>Home</NavLink>
          <NavLink href="/about" active={path === "/about"}>About</NavLink>

          <div className="relative group">
            <Link
              href="/portfolio"
              className={onProducts ? "text-white" : "text-white/70 hover:text-white"}
            >
              Products
            </Link>
            <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute right-0 top-full pt-3 w-[min(48rem,calc(100vw-2rem))] transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
              <div className="rounded-(--radius) overflow-hidden glass">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                  <span className="eyebrow">Catalog</span>
                  <Link href="/portfolio" className="text-xs text-steel hover:text-red">
                    All products
                  </Link>
                </div>
                <div className="grid grid-cols-5">
                  {categories.map((item) => (
                    <Link key={item.slug} href={`/${item.slug}`} className="group/item p-3 hover:bg-sand">
                      <img
                        src={productImage(item.slug)}
                        alt=""
                        width={240}
                        height={135}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[4/3] w-full object-cover rounded-md mb-2"
                      />
                      <span className="block text-[12px] leading-snug text-ink group-hover/item:text-red">
                        {item.shortTitle}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <NavLink href="/contact" active={path === "/contact"}>Contact</NavLink>
          <Link href="/contact" className="btn-primary">
            Request a Quote
            {items.length > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white/15 text-[11px] text-white">
                {items.length}
              </span>
            )}
          </Link>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-[13px] text-white/80"
        >
          {open ? "Close" : "Menu"}
        </button>
      </header>

      {open && (
        <nav className="md:hidden page-x pb-5 flex flex-col gap-3 text-[15px] text-white/80">
          <Link href="/" onClick={close}>Home</Link>
          <Link href="/about" onClick={close}>About</Link>
          <Link href="/portfolio" onClick={close}>Products</Link>
          <div className="grid grid-cols-2 gap-2 text-[13px] text-white/50">
            {categories.map((item) => (
              <Link key={item.slug} href={`/${item.slug}`} onClick={close}>
                {item.shortTitle}
              </Link>
            ))}
          </div>
          <Link href="/contact" onClick={close}>Contact</Link>
          <Link href="/contact" onClick={close} className="btn-primary justify-center mt-1">
            Request a Quote
          </Link>
        </nav>
      )}
    </div>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={active ? "text-white" : "text-white/70 hover:text-white"}>
      {children}
    </Link>
  );
}
