import { HomeClose } from "@/components/HomeClose";
import { HomeHero } from "@/components/HomeHero";
import { Partners } from "@/components/Partners";
import { ProductGrid } from "@/components/ProductGrid";
import { Reveal } from "@/components/Reveal";
import { StatsRow } from "@/components/StatsRow";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <Reveal>
        <StatsRow />
      </Reveal>
      <Reveal>
        <Partners />
      </Reveal>

      <Reveal>
      <section className="section">
        <p className="eyebrow mb-3">Catalog</p>
        <h2
          className="font-display text-ink mb-10"
          style={{ fontSize: "clamp(1.8rem, 3.4vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.05 }}
        >
          Products
        </h2>
        <ProductGrid />
      </section>
      </Reveal>

      <Reveal>
        <HomeClose />
      </Reveal>
    </>
  );
}
