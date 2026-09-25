import type { Metadata } from "next";
import { LocationMap } from "@/components/LocationMap";
import { RfqForm } from "@/components/RfqForm";
import { pages, site } from "@/lib/content";
import { Clock, Mail, MapPin, Phone, ShieldCheck, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: pages.contact.title,
  description: pages.contact.description,
};

const reasonIcons = [ShieldCheck, Truck, ShieldCheck];

export default function ContactPage() {
  return (
    <div className="mesh min-h-screen">
      <section className="page-x py-10 lg:py-12">
        <div className="mx-auto w-full max-w-[60rem]">
          <p className="eyebrow mb-3">{pages.contact.formTitle}</p>
          <p className="max-w-xl text-steel">{pages.contact.formBody}</p>

          <div className="mt-8 grid items-stretch gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <RfqForm />

            <aside className="flex h-full min-h-0 flex-col">
              <LocationMap />
              <div className="flex flex-1 flex-col pt-6">
                <h2
                  className="font-display text-ink"
                  style={{ fontSize: "clamp(1.6rem, 2.2vw, 2rem)", letterSpacing: "-0.03em", lineHeight: 1.15 }}
                >
                  {pages.contact.moreTitle}
                </h2>
                <ul className="mt-6 flex flex-col gap-5 text-lg">
                  <li className="flex items-center gap-3 text-steel">
                    <Clock className="h-5 w-5 shrink-0 text-red" />
                    <span className="text-ink">{site.hours}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail className="h-5 w-5 shrink-0 text-red" />
                    <a href={`mailto:${site.email}`} className="text-ink hover:text-red">{site.email}</a>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="h-5 w-5 shrink-0 text-red" />
                    <a href={`tel:${site.phoneTel}`} className="text-ink hover:text-red">{site.phone}</a>
                  </li>
                  <li className="flex items-center gap-3 text-steel">
                    <MapPin className="h-5 w-5 shrink-0 text-red" />
                    <span className="text-ink">{site.address}</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>

          <ul className="mt-12 grid items-start gap-8 border-t border-ink/12 pt-8 sm:grid-cols-3">
            {pages.contact.reasons.map((reason, index) => {
              const Icon = reasonIcons[index] ?? ShieldCheck;
              return (
                <li key={reason.title} className="flex items-start gap-4">
                  <Icon className="mt-0.5 h-10 w-10 shrink-0 text-red" strokeWidth={1.4} />
                  <div>
                    <h2 className="text-lg font-semibold text-ink">{reason.title}</h2>
                    <p className="mt-1.5 text-base leading-relaxed text-ink/80">{reason.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
