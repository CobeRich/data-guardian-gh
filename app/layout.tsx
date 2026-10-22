import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// ✅ Only ONE import for Analytics, using the /next path
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Data Guardian GH 🇬🇭 | Compare Data Bundles",
  description: "Compare MTN, Telecel, and AirtelTigo data bundle prices. Find the cheapest deals and check for hidden subscriptions.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* ✅ Only ONE <Analytics /> component */}
        <Analytics />
      </body>
    </html>
  );
}
