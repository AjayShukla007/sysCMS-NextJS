import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Define metadataBase for absolute URLs (replace with your production domain)
// const siteUrl = process.env.NODE_ENV === 'production' 
//   ? 'https://your-production-domain.com' // Replace with your actual domain
//   : 'http://localhost:3000';

export const metadata: Metadata = {
  // Add metadataBase
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'), 
  // Update title and description
  title: {
    default: "SysCMS - API-driven Content Management",
    template: "%s | SysCMS", // Template for page-specific titles
  },
  description: "SysCMS allows you to create a content management system by connecting directly to your APIs. Manage your content easily.",
  // Add Open Graph and Twitter card defaults (optional but recommended)
  openGraph: {
    title: "SysCMS - API-driven Content Management",
    description: "Manage your content easily by connecting SysCMS directly to your APIs.",
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName: 'SysCMS',
    // Add images: ['/og-image.png'], // Add an image to your public folder
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "SysCMS - API-driven Content Management",
    description: "Manage your content easily by connecting SysCMS directly to your APIs.",
    // Add images: ['/twitter-image.png'], // Add an image to your public folder
    // Add creator: '@yourTwitterHandle', 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
