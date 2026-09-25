import type { Metadata } from "next";
import Link from "next/link";
import { BrandStrip } from "@/components/BrandStrip";
import { CtaBand } from "@/components/CtaBand";
import { Reveal } from "@/components/Reveal";
import { pages, site, stats } from "@/lib/content";
import { Globe2, Plane } from "lucide-react";

export const metadata: Metadata = {
  title: pages.about.title,
  description: pages.about.description,
};

export default function AboutPage() {
  return (
    <div className="mesh min-h-screen">
      <section className="hero-enter relative min-h-[22rem] overflow-hidden lg:h-[42vh]">
        <div
          className="absolute inset-y-0 right-0 w-full lg:w-[58%]"
          style={{ clipPath: "polygon(16% 0, 100% 0, 100% 100%, 0 100%)" }}
        >
          <img
            src="/images/dummy/about-hero.webp"
            alt="Technician servicing a commercial aircraft engine"
            width={1280}
            height={720}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover object-center"
          />
        </div>
        <div className="relative z-10 flex h-full flex-col justify-center page-x py-8 lg:w-[48%]">
          <p className="eyebrow mb-3 flex items-center gap-4">
            Aviation leader
            <span className="h-px w-12 bg-red" aria-hidden="true" />
          </p>
          <h1
            className="font-display text-ink uppercase"
            style={{
              fontSize: "clamp(1.7rem, 2.8vw, 2.6rem)",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            Precision.
            <br />
            <span className="text-silver">Procurement.</span>
            <br />
            Reliable supply.
          </h1>
          <p className="mt-3 max-w-md text-sm text-steel">{pages.about.supplyBody}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/portfolio" className="btn-primary">
              Explore Products
            </Link>
            <a
              href={`https://wa.me/${site.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
            >
              Contact us on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Reveal>
      {/* Stats strip */}
      <section className="page-x py-10 lg:py-14 border-b border-ink/10 glass-panel">
        <div className="grid grid-cols-3 gap-6">
          {stats.about.map((item, i) => (
            <div
              key={item.label}
              className={i === 0 ? "text-left" : i === 1 ? "text-center" : "text-right"}
            >
              <p
                className="font-display text-ink font-semibold"
                style={{
                  fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {item.value}
              </p>
              <p className="font-mono uppercase text-steel mt-2 text-xs tracking-wider">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>
      </Reveal>

      <Reveal>
      {/* Story section */}
      <section className="page-x py-16 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6 relative overflow-hidden rounded-3xl border border-ink/12 shadow-md aspect-[16/9]">
            <img
              src="/images/dummy/about-story.webp"
              alt="Aircraft engine and wing on a wet apron at dusk"
              width={1024}
              height={586}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="lg:col-span-6">
            <p className="eyebrow mb-4 flex items-center gap-4">
              Our story
              <span className="h-px w-12 bg-red" aria-hidden="true" />
            </p>
            <h2
              className="font-display text-ink uppercase mb-6"
              style={{
                fontSize: "clamp(1.8rem, 3.2vw, 2.6rem)",
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
              }}
            >
              Built on <span className="text-logo">trust.</span>
              <br />
              <span className="text-silver">Driven by aviation.</span>
            </h2>

            <div className="space-y-4 text-steel text-sm sm:text-base leading-relaxed">
              {pages.about.driven.map((para) => (
                <p key={para}>
                  {para.split("AeroFlux Global").map((part, i) =>
                    i === 0 ? (
                      part
                    ) : (
                      <span key={i}>
                        <span className="text-red">AeroFlux Global</span>
                        {part}
                      </span>
                    ),
                  )}
                </p>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-ink/10 grid grid-cols-2 gap-4 text-xs font-mono text-steel">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-red" />
                <span>Global Sourcing Network</span>
              </div>
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-red" />
                <span>Expedited AOG Logistics</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      </Reveal>

      <Reveal>
      {/* Core Values */}
      <section className="page-x pb-20">
        <div className="mb-10 max-w-2xl">
          <p className="eyebrow mb-4 flex items-center gap-4">
            Our mission
            <span className="h-px w-12 bg-red" aria-hidden="true" />
          </p>
          <h2
            className="font-display text-ink uppercase"
            style={{
              fontSize: "clamp(1.9rem, 3.4vw, 2.8rem)",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            Making aviation <span className="text-silver">procurement</span> simpler.
          </h2>
          <p className="mt-5 text-base text-ink/80 leading-relaxed">
            {pages.about.values[0].extra}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pages.about.values.map((value) => (
            <div
              key={value.n}
              className="rounded-2xl border border-ink/12 glass-panel p-6"
            >
              <p className="font-mono text-sm text-red font-semibold tracking-widest">
                {value.n}
              </p>
              <h3 className="font-semibold text-ink text-lg mt-3 mb-3">
                {value.title}
              </h3>
              <p className="text-base text-ink/85 leading-relaxed">
                {value.body}
              </p>
            </div>
          ))}
        </div>
      </section>
      </Reveal>

      <Reveal>
      {/* Brands section */}
      <section className="page-x pb-20">
        <div className="py-10 sm:py-14">
          <div className="text-center max-w-xl mx-auto mb-8">
            <p className="font-mono uppercase text-xs tracking-widest text-amber mb-2">
              Authorized Supply Network
            </p>
            <h3 className="font-display text-2xl font-semibold text-ink">
              Trusted by operators & engineering departments
            </h3>
          </div>
          <div className="relative left-1/2 w-screen -translate-x-1/2">
            <BrandStrip />
          </div>
        </div>
      </section>
      </Reveal>

      <Reveal>
        <CtaBand title="Need a dedicated procurement partner?" />
      </Reveal>
    </div>
  );
}
