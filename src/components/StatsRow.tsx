import { stats } from "@/lib/content";

export function StatsRow() {
  return (
    <section className="page-x text-center" style={{ paddingBlock: "var(--section-v)" }}>
      <p className="eyebrow mb-3">How supply runs</p>
      <h2
        className="font-display text-ink mx-auto mb-12 max-w-xl"
        style={{ fontSize: "clamp(1.5rem, 2.6vw, 2rem)", letterSpacing: "-0.03em", lineHeight: 1.1 }}
      >
        Accountable stock, an open desk, a set catalog.
      </h2>
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
        {stats.home.map((item) => (
          <div key={item.label} className="flex flex-col items-center">
            <p
              className="font-display"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.04em", lineHeight: 0.95 }}
            >
              {item.value}
            </p>
            <p
              className="font-mono uppercase text-ink mt-3"
              style={{ fontSize: "0.68rem", letterSpacing: "0.16em" }}
            >
              {item.label}
            </p>
            <p className="mt-2 max-w-[26ch] text-sm text-steel">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
