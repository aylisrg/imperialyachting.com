"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { PromoPopup } from "@/components/promo/PromoPopup";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [bannerVisible, setBannerVisible] = useState(true);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header bannerVisible={bannerVisible} onBannerDismiss={() => setBannerVisible(false)} />
      <main>{children}</main>
      <Footer />
      <PromoPopup />
    </>
  );
}
