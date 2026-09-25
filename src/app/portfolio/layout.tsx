import type { Metadata } from "next";
import { pages } from "@/lib/content";

export const metadata: Metadata = {
  title: "Products",
  description: pages.portfolio.description,
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
