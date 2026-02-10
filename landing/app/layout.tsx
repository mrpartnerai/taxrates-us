import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "taxrates-us - Accurate US Sales Tax Rate API",
  description: "Open-source npm package and hosted API for US sales tax lookups. 7 states supported, 546 California jurisdictions, zero dependencies.",
  keywords: ["tax", "sales tax", "tax rates", "california", "API", "npm", "TypeScript"],
  authors: [{ name: "mrpartner", url: "https://github.com/mrpartnerai" }],
  openGraph: {
    title: "taxrates-us - Accurate US Sales Tax Rate API",
    description: "Self-hosted TypeScript package and API for sales tax lookups. Zero external dependencies.",
    url: "https://taxrates-us.vercel.app",
    siteName: "taxrates-us",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "taxrates-us - Accurate US Sales Tax Rate API",
    description: "Self-hosted TypeScript package and API for sales tax lookups. Zero external dependencies.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
