import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mesh min-h-[70vh] flex items-center">
      <section className="page-x py-20 w-full max-w-2xl">
        <div className="rounded-3xl border border-white/10 glass-panel backdrop-blur-md p-8 sm:p-12 shadow-none">
          <div className="w-14 h-14 rounded-2xl bg-white/5 text-steel flex items-center justify-center mb-6 border border-white/10">
            <Compass className="w-8 h-8 text-red" />
          </div>

          <p className="eyebrow mb-2">404 · Navigation Offset</p>
          <h1
            className="font-display text-ink"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.03em", lineHeight: 1.1 }}
          >
            Requested route not located.
          </h1>

          <p className="mt-4 text-steel text-base sm:text-lg leading-relaxed">
            The flight path or product category you are looking for has been moved or does not exist. Please refer to our catalog or contact the operations desk.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link href="/portfolio">
                Aviation Catalog
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/contact">Request a Quote</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
