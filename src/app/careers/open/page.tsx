import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { ApplyForm } from "../ApplyForm";

export const metadata: Metadata = {
  title: "Open Application — Careers",
  description: "Don't see your position at Imperial Yachting? If you are outrageously good at what you do, tell us who you are.",
  alternates: { canonical: `${SITE_CONFIG.url}/careers/open` },
};

export default function OpenApplicationPage() {
  return <ApplyForm vacancy={null} />;
}
