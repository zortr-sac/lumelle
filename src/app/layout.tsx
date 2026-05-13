import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Providers } from "@/components/providers";
import { BRAND } from "@/lib/brand";
import "@/styles/globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? BRAND.appUrl),
  title: {
    default: `${BRAND.name} - Agenda, caja e inventario para tu salón`,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.tagline,
  keywords: [
    "agenda salón",
    "manicurista",
    "salón de belleza",
    "agenda online",
    "reservas online",
    "caja diaria",
    "Yape Plin",
    "Perú",
  ],
  openGraph: {
    type: "website",
    locale: "es_PE",
    title: BRAND.name,
    description: BRAND.tagline,
    siteName: BRAND.name,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF9F5" },
    { media: "(prefers-color-scheme: dark)", color: "#2A1E2D" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-PE" className={geist.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
