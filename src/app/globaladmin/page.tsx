import type { Metadata } from "next";
import { DeskGate } from "./desk-gate";

export const metadata: Metadata = {
  title: "Desk",
  robots: { index: false, follow: false },
};

export default function GlobalAdminPage() {
  return <DeskGate />;
}
