import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { site } from "@/lib/content";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aerofluxglobal.com"),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description:
    "Global sourcing and rapid dispatch of certified lubricants, fluids, MRO products with full trace documentation.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" as="image" href="/images/dummy/hero.webp" />
      </head>
      <body className={`${outfit.className} antialiased`}>
        <Providers>
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
