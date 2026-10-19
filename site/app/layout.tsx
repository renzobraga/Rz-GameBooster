import type { Metadata } from "next";
import { Geist, Geist_Mono, Oxanium } from "next/font/google";
import { brand } from "@/lib/brand";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const oxanium = Oxanium({ variable: "--font-oxanium", subsets: ["latin"], weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: `${brand.name} — ${brand.tagline}`,
  description: brand.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} ${oxanium.variable}`}>{children}</body>
    </html>
  );
}
