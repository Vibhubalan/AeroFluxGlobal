import { brands } from "@/lib/content";

export function BrandStrip({ names }: { names?: string[] }) {
  const items = names?.length ? brands.filter((brand) => names.includes(brand.name)) : brands;
  if (!items.length) return null;

  return (
    <div className="brand-rail py-7 overflow-hidden">
      <div className="brand-track flex w-max">
        {[items, items].map((row, i) => (
          <ul key={i} className="flex items-center gap-12 px-8" aria-hidden={i === 1}>
            {row.map((brand) => (
              <li key={`${brand.name}-${i}`}>
                <img
                  src={brand.src}
                  alt={i === 0 ? brand.name : ""}
                  width={120}
                  height={32}
                  loading="lazy"
                  decoding="async"
                  className="h-8 w-auto max-w-[120px] object-contain opacity-80 grayscale"
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
