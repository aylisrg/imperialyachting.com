import type { MetadataRoute } from "next";
import { fetchAllYachts } from "@/lib/yachts-db";
import { fetchAllDestinations } from "@/lib/destinations-db";

const BASE_URL = "https://imperialyachting.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages = [
    { url: BASE_URL, changeFrequency: "weekly" as const, priority: 1.0, lastModified: now },
    { url: `${BASE_URL}/fleet`, changeFrequency: "weekly" as const, priority: 0.9, lastModified: now },
    { url: `${BASE_URL}/services`, changeFrequency: "monthly" as const, priority: 0.85, lastModified: now },
    { url: `${BASE_URL}/services/charter`, changeFrequency: "monthly" as const, priority: 0.9, lastModified: now },
    { url: `${BASE_URL}/services/yacht-management`, changeFrequency: "monthly" as const, priority: 0.85, lastModified: now },
    { url: `${BASE_URL}/services/cinematography`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${BASE_URL}/services/brandwave`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${BASE_URL}/destinations`, changeFrequency: "weekly" as const, priority: 0.8, lastModified: now },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly" as const, priority: 0.6, lastModified: now },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly" as const, priority: 0.75, lastModified: now },
    { url: `${BASE_URL}/documents`, changeFrequency: "monthly" as const, priority: 0.5, lastModified: now },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  const yachts = await fetchAllYachts();
  const yachtPages = yachts.map((yacht) => ({
    url: `${BASE_URL}/fleet/${yacht.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.9,
    lastModified: new Date(),
  }));

  const destinations = await fetchAllDestinations();
  const destinationPages = destinations.map((dest) => ({
    url: `${BASE_URL}/destinations/${dest.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    lastModified: new Date(),
  }));

  return [...staticPages, ...yachtPages, ...destinationPages];
}
