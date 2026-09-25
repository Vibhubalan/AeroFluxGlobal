"use client";

import { useState } from "react";
import { site } from "@/lib/content";

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`;

export function LocationMap() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-h-52 flex-1 overflow-hidden rounded-xl border border-white/10">
      <iframe
        title="AeroFlux Global location"
        src="https://www.openstreetmap.org/export/embed.html?bbox=55.296%2C25.262%2C55.322%2C25.278&layer=mapnik"
        className="pointer-events-none absolute inset-x-0 top-0 h-[calc(100%+2.25rem)] w-full"
        loading="lazy"
        tabIndex={-1}
      />

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full"
        aria-expanded={open}
        aria-label="Show location details"
      >
        <svg width="36" height="46" viewBox="0 0 36 46" aria-hidden="true">
          <path
            d="M18 0C8.06 0 0 8.06 0 18c0 12.6 18 28 18 28s18-15.4 18-28C36 8.06 27.94 0 18 0z"
            fill="#3cb44b"
          />
          <circle cx="18" cy="17" r="7" fill="#fff" />
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-3 left-3 right-3 z-10 rounded-lg border border-white/10 bg-[#2a2a2c]/95 px-4 py-3 text-sm text-[#f3eee6] shadow-none">
          <p className="font-semibold">{site.address}</p>
          <p className="mt-1 text-[#f3eee6]/75">{site.hours}</p>
          <a
            href={mapsHref}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-red hover:underline"
          >
            Open in maps
          </a>
        </div>
      )}
    </div>
  );
}
