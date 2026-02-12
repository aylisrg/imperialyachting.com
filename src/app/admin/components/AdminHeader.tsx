"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Anchor, LogOut, Home, Ship, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const navItems = [
    { label: "Fleet", href: "/admin", icon: Ship },
    { label: "Destinations", href: "/admin/destinations", icon: MapPin },
  ];

  return (
    <header className="bg-navy-800 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Anchor className="w-6 h-6 text-gold-500" strokeWidth={1.5} />
              <span className="font-heading font-bold text-white text-lg">
                Admin Panel
              </span>
            </div>

            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin" || pathname.startsWith("/admin/yachts")
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "text-gold-400 bg-gold-500/10"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Home className="w-4 h-4" />
              View Site
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
