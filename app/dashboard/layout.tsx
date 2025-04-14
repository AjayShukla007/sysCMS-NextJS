import React from "react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - SysCMS",
  description: "Manage your routes and environment variables in SysCMS.",
  openGraph: {
    title: "Dashboard - SysCMS",
    description: "Manage your routes and environment variables in SysCMS.",
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000/dashboard',
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard - SysCMS",
    description: "Manage your routes and environment variables in SysCMS.",
  },
};
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black/95">
      <header className="bg-white dark:bg-black border-b border-black/10 dark:border-white/10 py-4 shadow-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="font-bold text-2xl font-serif">
            SysCMS
          </Link>
          <nav className="flex gap-4">
            <Link 
              href="/dashboard" 
              className="px-3 py-2 text-black/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/dashboard/add-route" 
              className="px-3 py-2 text-black/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors"
            >
              Add Route
            </Link>
            <Link 
              href="/dashboard/env" 
              className="px-3 py-2 text-black/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors"
            >
              Environment
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="bg-white dark:bg-black border-t border-black/10 dark:border-white/10 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-black/60 dark:text-white/60 font-serif">
          SysCMS - All data is stored locally on your device
        </div>
      </footer>
    </div>
  );
}