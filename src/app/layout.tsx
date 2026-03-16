import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Great Koi - Send Your Wishes to the Pond",
  description:
    "A digital sanctuary where your wishes swim with beautiful koi. Release stress, set intentions, and find peace in the gentle movement of the pond.",
  keywords: ["koi", "wishes", "meditation", "zen", "stress relief", "mindfulness", "digital wellness"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Great Koi",
  },
  openGraph: {
    title: "Great Koi - Send Your Wishes to the Pond",
    description: "A digital sanctuary for your wishes and intentions. Make a wish and watch it swim with beautiful koi.",
    type: "website",
    siteName: "Great Koi",
  },
  twitter: {
    card: "summary_large_image",
    title: "Great Koi - Send Your Wishes to the Pond",
    description: "A digital sanctuary for your wishes and intentions.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a1628",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
