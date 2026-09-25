import { brands, pages } from "@/lib/content";

const shown = brands.slice(0, 11);

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

        <ul className="grid grid-cols-3 items-center gap-x-4 gap-y-6 sm:grid-cols-4">
          {shown.map((brand) => (
            <li key={brand.name} className="flex h-8 items-center justify-center">
              <img
                src={brand.src}
                alt={brand.name}
                width={120}
                height={32}
                loading="lazy"
                decoding="async"
                className="h-7 w-auto max-w-[108px] object-contain opacity-80 grayscale"
              />
            </li>
          ))}
          <li className="flex h-10 items-center justify-center font-mono text-[0.62rem] uppercase tracking-[0.18em] text-steel">
            And more
          </li>
        </ul>
      </div>
    </section>
  );
}
