"use client";

import Link from "next/link";
import { site } from "@/lib/content";
import { useQuote } from "@/context/quote";
import { MessageSquare, Send } from "lucide-react";

export function QuoteDock() {
  const { items } = useQuote();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 md:hidden glass-bar border-t border-white/10 px-4 py-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.25)]">
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        <a
          href={`https://wa.me/${site.whatsapp}?text=Hello%20AeroFlux,%20I%20have%20an%20inquiry`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 h-11 rounded-lg border border-white/15 bg-white/5 text-white text-xs font-semibold hover:bg-sand/10 transition-colors"
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>WhatsApp Desk</span>
        </a>

        <Link
          href="/contact"
          className="relative flex items-center justify-center gap-2 h-11 rounded-lg bg-[#f4efe6] text-[#2c2928] text-xs font-semibold shadow-sm hover:bg-white transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Request RFQ</span>
          {items.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white text-red text-[10px] font-bold px-1 shadow-sm border border-red/20">
              {items.length}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
