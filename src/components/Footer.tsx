import { site } from "@/lib/content";

export function Footer() {
  return (
    <footer className="glass-dark pb-[4.75rem] text-[#f3eee6]/85 md:pb-0">
        <div
          className="page-x flex flex-col gap-5 md:flex-row md:items-start md:justify-between pt-5 pb-4 md:gap-8 md:pt-10 md:pb-7"
        >
          {/* Brand */}
          <div>
            <img src="/images/logo.png" alt={site.name} className="mb-2 h-10 w-auto max-w-[200px] object-contain object-left brightness-110 md:mb-3 md:h-16 md:max-w-[280px]" />
            <p className="text-sm leading-relaxed">{site.legalName}</p>
            <p className="text-sm mt-1">{site.address}</p>
          </div>

          {/* Contact */}
          <div className="md:text-right">
            <p
              className="font-mono uppercase mb-2.5"
              style={{ fontSize: "0.62rem", letterSpacing: "0.22em", color: "var(--color-amber)" }}
            >
              Desk
            </p>
            <ul className="space-y-2 text-sm">
              <li>{site.hours}</li>
              <li>
                <a href={`mailto:${site.email}`} className="hover:text-white transition-colors">
                  {site.email}
                </a>
              </li>
              <li>
                <a href={`tel:${site.phoneTel}`} className="hover:text-white transition-colors">
                  {site.phone}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${site.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="page-x flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-3 text-xs text-[#f3eee6]/60"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <p>{site.copyright}</p>
          <p className="font-mono tracking-widest" style={{ fontSize: "0.6rem" }}>
            Middle East • Africa • Asia • Europe
          </p>
        </div>
    </footer>
  );
}
