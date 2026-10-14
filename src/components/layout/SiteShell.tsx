"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Header } from "./Header";
import { isWakeRoute } from "@/components/wake/routes";

const Footer = dynamic(() => import("./Footer").then((m) => m.Footer));

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  // Redesigned pages (issue #46) render their own nav and facts footer.
  const isWake = isWakeRoute(pathname);

  if (isAdmin || isWake) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
