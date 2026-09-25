import { pages } from "@/lib/content";

/** Home partners grid — order matches legacy 4×3 layout (11 logos + “And more”). */
const partnerLogos = [
  { name: "Eastman", src: "/brands/brand-01.webp", width: 360, height: 96 },
  { name: "AeroShell", src: "/brands/brand-02.webp", width: 360, height: 96 },
  { name: "ExxonMobil", src: "/brands/brand-03.webp", width: 360, height: 96 },
  { name: "LPS", src: "/brands/brand-04.webp", width: 121, height: 96 },
  { name: "NYCO", src: "/brands/brand-05.webp", width: 295, height: 96 },
  { name: "ZOK", src: "/brands/brand-06.webp", width: 222, height: 96 },
  { name: "PPG", src: "/brands/brand-07.webp", width: 127, height: 96 },
  { name: "3M", src: "/brands/brand-08.webp", width: 170, height: 96 },
  { name: "Nitto", src: "/brands/brand-09.webp", width: 399, height: 96 },
  { name: "Molykote", src: "/brands/brand-10.webp", width: 309, height: 96 },
  { name: "Loctite", src: "/brands/brand-11.webp", width: 420, height: 91 },
] as const;

export function Partners() {
  return (
    <section className="page-x pt-14 pb-10 lg:pt-16 lg:pb-12">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-4 flex items-center gap-4">
            Our partners
            <span className="h-px w-12 bg-red" aria-hidden="true" />
          </p>
          <h2
            className="font-display text-ink uppercase"
            style={{
              fontSize: "clamp(1.8rem, 3.2vw, 2.8rem)",
              letterSpacing: "-0.03em",
              lineHeight: 1.02,
            }}
          >
            <span className="text-silver">Global</span> brands.
            <br />
            Lasting partnerships.
          </h2>
          <p className="mt-5 max-w-sm text-steel">{pages.about.brandsBody}</p>
        </div>

        <ul className="grid grid-cols-4 items-center gap-x-3 gap-y-6 sm:gap-x-4">
          {partnerLogos.map((brand) => (
            <li key={brand.name} className="flex h-8 items-center justify-center px-1">
              <img
                src={brand.src}
                alt={brand.name}
                width={120}
                height={32}
                loading="lazy"
                decoding="async"
                className="h-7 w-auto max-w-full object-contain opacity-80 grayscale"
              />
            </li>
          ))}
          <li className="flex h-8 items-center justify-center font-mono text-[0.62rem] uppercase tracking-[0.18em] text-steel">
            And more
          </li>
        </ul>
      </div>
    </section>
  );
}
