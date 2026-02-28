import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Syne, Inter, Playfair_Display } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SITE_CONFIG } from "@/lib/constants";
import { SiteShell } from "@/components/layout/SiteShell";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "optional",
  weight: ["400"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#060E1A",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description:
    "Charter luxury yachts in Dubai from AED 2,500/hr. Imperial Yachting owns & operates a premium fleet at Dubai Harbour — all-inclusive crew, fuel & amenities. Book today.",
  keywords: [
    "yacht charter Dubai",
    "luxury yacht rental Dubai",
    "yacht rental Dubai price",
    "Dubai yacht hire",
    "private yacht Dubai",
    "yacht management Dubai",
    "Dubai Harbour yacht",
    "crewed yacht charter UAE",
    "Monte Carlo yacht Dubai",
    "Van Dutch Dubai",
    "Evo Yachts Dubai",
    "corporate yacht event Dubai",
    "birthday party yacht Dubai",
    "day cruise Dubai",
    "boat rental Dubai",
    "yacht cruise Dubai Marina",
    "Dubai yacht tour",
    "luxury boat charter UAE",
  ],
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  formatDetection: {
    telephone: true,
    email: true,
  },
  alternates: {
    canonical: SITE_CONFIG.url,
    languages: {
      en: SITE_CONFIG.url,
      "x-default": SITE_CONFIG.url,
    },
  },
  other: {
    "geo.region": "AE-DU",
    "geo.placename": "Dubai",
    "geo.position": "25.0805;55.1403",
    ICBM: "25.0805, 55.1403",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} — Luxury Yacht Charter in Dubai`,
    description:
      "Charter luxury yachts in Dubai from AED 2,500/hr. We own & operate a premium fleet at Dubai Harbour — all-inclusive crew, fuel & amenities.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Imperial Yachting — Luxury Yacht Charter in Dubai",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} — Luxury Yacht Charter in Dubai`,
    description:
      "Charter luxury yachts in Dubai from AED 2,500/hr. Premium fleet at Dubai Harbour — all-inclusive crew, fuel & amenities.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Imperial Yachting — Luxury Yacht Charter in Dubai",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "travel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="anonymous" />
        )}
        <link rel="dns-prefetch" href="https://wa.me" />
        <link rel="preload" as="image" href="/media/hero/hero-poster.jpg" type="image/jpeg" />
      </head>
      <body
        className={`${syne.variable} ${inter.variable} ${playfair.variable} antialiased`}
      >
        <SiteShell>{children}</SiteShell>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${SITE_CONFIG.googleAnalyticsId}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${SITE_CONFIG.googleAnalyticsId}');`}
        </Script>
        <SpeedInsights />
      </body>
    </html>
  );
}
