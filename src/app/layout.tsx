import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://nmg-photoshop.vercel.app"),
  title: "NMG PHOTOPARK",
  description: "Premium Point of Sale System",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NMG PHOTOPARK",
  },
};

export const viewport: Viewport = {
  themeColor: "#d4af37",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${inter.className} bg-stone-50 text-stone-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
