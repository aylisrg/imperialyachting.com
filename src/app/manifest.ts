import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Imperial Yachting — Dubai's Premier Yacht Charter",
    short_name: "Imperial Yachting",
    description:
      "Luxury yacht charter, management, and crewed experiences in Dubai. Premium motor yachts departing from Dubai Harbour.",
    start_url: "/",
    display: "standalone",
    background_color: "#060E1A",
    theme_color: "#060E1A",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
