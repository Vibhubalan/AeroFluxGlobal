import Link from "next/link";

export function CtaBand({
  title = "Need a quote?",
  body,
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="section flex flex-col items-center text-center">
      <h2
        className="font-display text-ink"
        style={{
          fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
          letterSpacing: "-0.035em",
          lineHeight: 1,
        }}
      >
        Need a <span className="text-silver">dedicated</span>
        <br />
        <span className="text-logo">procurement</span> partner?
      </h2>
      {body ? <p className="mt-4 text-steel max-w-md">{body}</p> : null}
      <Link href="/contact" className="btn-primary mt-12">
        Request a Quote
      </Link>
    </section>
  );
}
