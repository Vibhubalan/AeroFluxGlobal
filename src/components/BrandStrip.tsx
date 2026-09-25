import { brands } from "@/lib/content";

type BrandItem = (typeof brands)[number];

function BrandMark({ brand }: { brand: BrandItem }) {
  return (
    <span className="brand-logo-label whitespace-nowrap font-mono text-[0.68rem] uppercase tracking-[0.14em]">
      {brand.name}
    </span>
  );
}

export function BrandStrip({ names }: { names?: string[] }) {
  const items = names?.length ? brands.filter((brand) => names.includes(brand.name)) : brands;
  if (!items.length) return null;

  const track = (
    <ul className="brand-logo-row flex shrink-0 items-center">
      {items.map((brand) => (
        <li key={brand.name} className="brand-logo-slot flex shrink-0 items-center justify-center">
          <BrandMark brand={brand} />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="brand-rail py-7 overflow-hidden">
      <div className="brand-track flex w-max will-change-transform">
        {track}
        <ul className="brand-logo-row flex shrink-0 items-center" aria-hidden="true">
          {items.map((brand) => (
            <li key={`${brand.name}-dup`} className="brand-logo-slot flex shrink-0 items-center justify-center">
              <BrandMark brand={brand} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
