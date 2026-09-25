import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Transmission Error · AeroFlux Global",
  description: "The request could not be sent. Contact the AeroFlux sales team directly.",
};

export default function RfqErrorPage() {
  return (
    <div className="mesh min-h-[70vh] flex items-center">
      <section className="page-x py-20 w-full max-w-3xl">
        <div className="rounded-3xl border border-red-500/20 glass-panel backdrop-blur-md p-8 sm:p-12 shadow-none">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red flex items-center justify-center mb-6 border border-red-200">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <p className="eyebrow text-red mb-2">Transmission Incomplete</p>
          <h1
            className="font-display text-ink"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.03em", lineHeight: 1.1 }}
          >
            We couldn&apos;t process your submission.
          </h1>

          <p className="mt-4 text-steel text-base sm:text-lg leading-relaxed">
            A temporary server issue prevented your RFQ from completing. Please try submitting again, or forward your part numbers and documents directly to our procurement desk.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link href="/contact">
                Retry Submission
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href={`mailto:${site.email}?subject=Direct RFQ Inquiry`}>
                <Mail className="w-4 h-4 mr-2 text-red" />
                Email Direct: {site.email}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
