"use client";

import { QuoteProvider } from "@/context/quote";
import { Header } from "@/components/Header";
import { FlightLoader } from "@/components/FlightLoader";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QuoteProvider>
      <FlightLoader />
      <Header />
      {children}
    </QuoteProvider>
  );
}
