"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Header } from "./Header";

const Footer = dynamic(() => import("./Footer").then((m) => m.Footer));

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  // The redesigned home page (issue #46) renders its own nav and facts footer.
  const isHome = pathname === "/";

  if (isAdmin || isHome) {
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
