"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { PromoBanner } from "@/components/promo/PromoBanner";
import { PromoPopup } from "@/components/promo/PromoPopup";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <PromoBanner />
      <Header />
      <main>{children}</main>
      <Footer />
      <PromoPopup />
    </>
  );
}
