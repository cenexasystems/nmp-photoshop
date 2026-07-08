import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Golden Billing POS",
    short_name: "Billing POS",
    description: "Premium Client billing and invoicing platform",
    start_url: "/",
    display: "standalone",
    background_color: "#1e1b15", // Dark goldish background
    theme_color: "#d4af37", // Gold
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
