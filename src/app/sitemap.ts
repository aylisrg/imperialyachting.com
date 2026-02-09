import type { MetadataRoute } from "next";
import { yachts } from "@/data/yachts";

const BASE_URL = "https://imperialyachting.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: BASE_URL, changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${BASE_URL}/fleet`, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${BASE_URL}/services`, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE_URL}/services/charter`, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE_URL}/services/yacht-management`, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE_URL}/services/cinematography`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${BASE_URL}/services/brandwave`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${BASE_URL}/destinations`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${BASE_URL}/documents`, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  const yachtPages = yachts.map((yacht) => ({
    url: `${BASE_URL}/fleet/${yacht.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.9,
    lastModified: new Date(),
  }));

  return [...staticPages, ...yachtPages];
}
