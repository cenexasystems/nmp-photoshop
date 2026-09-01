import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NMG PHOTOPARK POS",
    short_name: "NMG PHOTOPARK",
    description: "Premium Client billing and invoicing platform",
    start_url: "/",
    display: "standalone",
    background_color: "#111827", // Dark neutral background
    theme_color: "#374151", // Charcoal grey
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
