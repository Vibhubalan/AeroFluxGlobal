import Link from "next/link";
import { pages } from "@/lib/content";

export function HomeClose() {
  const home = pages.home;

  return (
    <section className="page-x pt-12 pb-24 lg:pt-14 lg:pb-32">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow mb-4 flex items-center gap-4">
            {home.ctaEyebrow}
            <span className="h-px w-12 bg-red" aria-hidden="true" />
          </p>
          <h2
            className="font-display uppercase text-ink"
            style={{
              fontSize: "clamp(2rem, 4vw, 3.1rem)",
              letterSpacing: "-0.03em",
              lineHeight: 0.98,
            }}
          >
            Let&apos;s keep <span className="text-logo">aviation</span>
            <br />
            <span className="text-silver">moving forward</span>
          </h2>
        </div>
        <div className="lg:max-w-xs lg:pb-1">
          <p className="text-sm text-steel">{home.ctaBody}</p>
          <Link href="/contact" className="btn-primary mt-5">
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
