import Link from "next/link";

const briefs = {
  "aircraft-spares": {
    title: "Aircraft Spares",
    summary: "Sourcing OEM-approved and traceable spares across the aircraft — from powerplant to avionics.",
    logos: [],
    paragraph: "",
    sections: [
      ["Engine Power Plant", "Engine spares, modules and powerplant components sourced with full traceability."],
      ["Landing Gear & Brakes", "Landing-gear parts, wheels and brake-assembly components for scheduled and AOG needs."],
      ["Avionics", "Line-replaceable units, instruments and avionics systems from approved sources."],
      ["Electrical & Electronic", "Electrical and electronic components, connectors and assemblies for the whole airframe."],
    ],
    quote: true,
  },
  "aerospace-tapes-and-protection-films": {
    title: "Aerospace Tapes & Protection Films",
    summary: "Nitto and 3M tapes, films and surface-protection systems for structures, interiors, cargo and MRO.",
    logos: [
      { name: "Nitto", src: "/brands/nitto.png", mark: "h-12 max-w-[15rem] sm:h-14 md:h-16 md:max-w-[18rem]" },
      { name: "3M", src: "/brands/3m.png", mark: "h-20 max-w-[8.5rem] sm:h-24 md:h-28 md:max-w-[10.5rem]" },
    ],
    paragraph:
      "From structural adhesives, specialized tapes, and surface protection films to thermal insulation and interior finishing materials, we source **3M and Nitto** aerospace products from established manufacturers and authorized distributors, subject to specification and availability.",
    sections: [],
    quote: false,
  },
  "aviation-tyres": {
    title: "Aviation Tyres",
    summary: "Strong, dependable tyres and supply chain — whatever the mission.",
    logos: [
      { name: "Goodyear", src: "/brands/goodyear.png", mark: "h-9 max-w-[14rem] sm:h-11 md:h-12 md:max-w-[17rem]" },
      { name: "Dunlop", src: "/brands/dunlop.png", mark: "h-11 max-w-[13rem] sm:h-14 md:h-16 md:max-w-[16rem]" },
      { name: "Michelin", src: "/brands/michelin.png", mark: "h-14 max-w-[14rem] sm:h-16 md:h-20 md:max-w-[18rem]" },
    ],
    paragraph:
      "From general aviation and business jets to commercial and specialized aircraft applications, we source aviation tyres from established manufacturers including **Goodyear, Dunlop and Michelin**, subject to specification and availability.",
    sections: [],
    quote: true,
  },
} as const;

export function isCategoryBrief(slug: string): slug is keyof typeof briefs {
  return slug in briefs;
}

export function CategoryBrief({ slug }: { slug: keyof typeof briefs }) {
  const page = briefs[slug];
  return (
    <section className="page-x flex min-h-[calc(100dvh-12rem)] items-center py-16 md:min-h-[calc(100dvh-19rem)]">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <h1
          className="font-display text-ink"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.03em", lineHeight: 1.1 }}
        >
          {page.title}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-steel">{page.summary}</p>
        {page.logos.length > 0 ? (
          <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 sm:mt-14 sm:gap-x-16">
            {page.logos.map((logo) => (
              <li key={logo.name}>
                <img src={logo.src} alt={logo.name} className={`w-auto object-contain ${logo.mark}`} />
              </li>
            ))}
          </ul>
        ) : null}
        {page.paragraph ? (
          <p className="mx-auto mt-12 max-w-2xl text-base leading-relaxed text-steel sm:mt-14">
            {page.paragraph.split(/(\*\*[^*]+\*\*)/g).map((part) =>
              part.startsWith("**") ? (
                <strong key={part} className="font-semibold text-ink">
                  {part.slice(2, -2)}
                </strong>
              ) : (
                part
              ),
            )}
          </p>
        ) : null}
        {page.sections.length > 0 ? (
          <div className="mx-auto mt-10 max-w-2xl space-y-5 text-left text-base leading-relaxed sm:mt-12">
            {page.sections.map(([label, body]) => (
              <p key={label}>
                <span className="font-semibold text-red">{label}: </span>
                <span className="text-steel">{body}</span>
              </p>
            ))}
          </div>
        ) : null}
        {page.quote ? (
          <Link href="/contact" className="btn-primary mt-12">
            Request an RFQ
          </Link>
        ) : null}
      </div>
    </section>
  );
}
