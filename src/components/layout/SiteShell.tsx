"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Header } from "./Header";

const Footer = dynamic(() => import("./Footer").then((m) => m.Footer));

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
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
