"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Header } from "./Header";

const Footer = dynamic(() => import("./Footer").then((m) => m.Footer));
const PromoPopup = dynamic(
  () => import("@/components/promo/PromoPopup").then((m) => m.PromoPopup),
  { ssr: false },
);

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
