export const dynamic = "force-dynamic";

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

  return {
    title: `${destination.name} — Dubai Yacht Experience`,
    description,
    openGraph: {
      title: `${destination.name} | ${SITE_CONFIG.name}`,
      description,
      url: `${SITE_CONFIG.url}/destinations/${destination.slug}`,
      images: destination.coverImage
        ? [{ url: destination.coverImage, alt: destination.name }]
        : [],
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
