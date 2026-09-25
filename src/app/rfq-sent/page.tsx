import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "RFQ Sent · AeroFlux Global",
  description: "Your request for quote has been received by AeroFlux Global Trading LLC.",
};

export default function RfqSentPage() {
  return (
    <div className="mesh min-h-[70vh] flex items-center">
      <section className="page-x py-20 w-full max-w-3xl">
        <div className="rounded-3xl border border-emerald-600/20 glass-panel backdrop-blur-md p-8 sm:p-12 shadow-none">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <p className="eyebrow text-emerald-700 mb-2">Transmission Confirmed</p>
          <h1
            className="font-display text-ink"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.03em", lineHeight: 1.1 }}
          >
            Your RFQ has reached the desk.
          </h1>

          <p className="mt-4 text-steel text-base sm:text-lg leading-relaxed">
            Thank you for reaching out to AeroFlux Global Trading LLC. Our procurement specialists are reviewing your requisition and checking current batch inventory and certificate availability.
          </p>

          <div className="mt-8 p-4 rounded-xl glass-panel border border-white/8 space-y-2 text-sm text-steel">
            <p className="font-semibold text-ink">What happens next?</p>
            <ul className="space-y-1.5 text-xs text-steel">
              <li>• A formal quote with batch lot numbers and lead time will be sent to your email.</li>
              <li>• For urgent AOG requests, desk dispatch triggers within 60 minutes.</li>
              <li>• Primary correspondence will originate from <span className="font-medium text-ink">{site.email}</span>.</li>
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link href="/portfolio">
                Explore Full Catalog
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href={`tel:${site.phoneTel}`}>
                <Phone className="w-4 h-4 mr-2 text-red" />
                Call AOG Line
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
