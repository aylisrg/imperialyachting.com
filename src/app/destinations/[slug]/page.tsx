export const revalidate = 3600;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  fetchAllDestinations,
  fetchDestinationBySlug,
} from "@/lib/destinations-db";
import { SITE_CONFIG, DEPARTURE_POINT_SLUG } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import { destinationSchema } from "@/components/seo/schemas";
import { DestinationDetailClient } from "./DestinationDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const destination = await fetchDestinationBySlug(slug);

  if (!destination) {
    return { title: "Destination Not Found" };
  }

  const description =
    destination.shortDescription || destination.description.slice(0, 160);
  const pageUrl = `${SITE_CONFIG.url}/destinations/${destination.slug}`;

  return {
    title: `${destination.name} — Dubai Yacht Experience`,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${destination.name} — Yacht Cruise Destination | ${SITE_CONFIG.name}`,
      description,
      url: pageUrl,
      type: "website",
      siteName: SITE_CONFIG.name,
      images: destination.coverImage
        ? [
            {
              url: destination.coverImage,
              width: 1200,
              height: 630,
              alt: `${destination.name} — Yacht Cruise from Dubai Harbour`,
            },
          ]
        : [{ url: "/og-image.jpg", width: 1200, height: 630, alt: SITE_CONFIG.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${destination.name} — Dubai Yacht Experience`,
      description,
      images: destination.coverImage
        ? [{ url: destination.coverImage, alt: destination.name }]
        : ["/og-image.jpg"],
    },
  };
}

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = await fetchDestinationBySlug(slug);

  if (!destination) {
    notFound();
  }

  // Fetch related destinations (excluding self and departure point)
  const all = await fetchAllDestinations();
  const related = all
    .filter((d) => d.slug !== slug && d.slug !== DEPARTURE_POINT_SLUG)
    .slice(0, 3);

  return (
    <>
      <JsonLd data={destinationSchema(destination)} />
      <DestinationDetailClient
        destination={destination}
        related={related}
      />
    </>
  );
}
