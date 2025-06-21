import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DutyDrive",
  description: "Calculate import duties, taxes, and total costs for importing vehicles to Sri Lanka. Includes CIF, PAL, VAT, and other charges with real-time exchange rates.",
  keywords: ["Sri Lanka vehicle import", "import duty calculator", "vehicle tax calculator", "Sri Lanka customs duty", "car import costs", "vehicle import tax", "CIF calculation", "PAL tax", "import VAT"],
  authors: [{ name: "Yasas Hansaka Thenuwara" }],
  creator: "Yasas Hansaka Thenuwara",
  publisher: "Yasas Hansaka Thenuwara",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://xthenuwara.github.io/DutyDrive",
    title: "DutyDrive - Sri Lanka Vehicle Import Cost Calculator",
    description: "Calculate import duties, taxes, and total costs for importing vehicles to Sri Lanka",
    siteName: "DutyDrive",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
