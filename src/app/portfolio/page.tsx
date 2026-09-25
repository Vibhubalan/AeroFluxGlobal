import { FeaturedProducts } from "@/components/FeaturedProducts";
import { ProductCatalog } from "@/components/ProductCatalog";
import { pages } from "@/lib/content";

export default function PortfolioPage() {

  return (
    <div className="mesh min-h-screen">
      {/* Header */}
      <section className="page-x grid items-center gap-10 pt-14 pb-10 lg:grid-cols-[1.1fr_0.9fr] lg:pt-16 lg:pb-14">
        <div>
          <p className="eyebrow mb-4 flex items-center gap-4">
            Our portfolio
            <span className="h-px w-12 bg-red" aria-hidden="true" />
          </p>

          <h1
            className="font-display text-ink uppercase"
            style={{
              fontSize: "clamp(2.4rem, 5vw, 4.2rem)",
              letterSpacing: "-0.03em",
              lineHeight: 0.98,
            }}
          >
            The <span className="text-logo">right</span> parts
            <br />
            <span className="text-silver">get you a better</span>
            <br />
            tomorrow.
          </h1>

          <p className="mt-4 text-steel text-base sm:text-lg max-w-2xl leading-relaxed">
            {pages.portfolio.intro}
          </p>
        </div>
        <FeaturedProducts />
      </section>

      <section className="page-x pb-20">
        <ProductCatalog />
      </section>
    </div>
  );
}
