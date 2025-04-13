import React from "react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white dark:bg-black border-b border-black/10 dark:border-white/10 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="font-bold text-xl">
            SysCMS
          </Link>
          <nav className="flex gap-4">
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link href="/dashboard/routes" className="hover:underline">
              API Routes
            </Link>
            <Link href="/dashboard/env" className="hover:underline">
              Environment
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="bg-white dark:bg-black border-t border-black/10 dark:border-white/10 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-black/60 dark:text-white/60">
          SysCMS - All data is stored locally on your device
        </div>
      </footer>
    </div>
  );
}