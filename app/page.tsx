// import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 gap-8 font-[family-name:var(--font-geist-sans)]">
      <header className="w-full max-w-5xl flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-2">SysCMS</h1>
        <p className="text-lg text-center mb-6">
          The API-driven Content Management System
        </p>
      </header>
      
      <main className="flex flex-col gap-8 w-full max-w-5xl">
        <div className="bg-white dark:bg-black/20 p-8 rounded-lg border border-black/10 dark:border-white/10 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Welcome to SysCMS</h2>
          <p className="mb-6">
            SysCMS allows you to create a content management system by connecting directly to your APIs.
            No need to build a separate admin interface - just specify your routes and start managing content.
          </p>
          
          <div className="flex gap-4 items-center flex-col sm:flex-row">
            <Link
              href="/dashboard"
              className="rounded-md border border-solid border-transparent bg-foreground text-background px-4 py-2 transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium"
            >
              Go to Dashboard
            </Link>
            
            <Link
              href="/dashboard/add-route"
              className="rounded-md border border-solid border-black/[.08] dark:border-white/[.145] px-4 py-2 transition-colors hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium"
            >
              Add API Route
            </Link>
          </div>
        </div>
        
        <div className="bg-white dark:bg-black/20 p-8 rounded-lg border border-black/10 dark:border-white/10 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">How it Works</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Add your API routes</li>
            <li>Specify environment variables</li>
            <li>SysCMS analyzes your endpoints</li>
            <li>Automatically generates input forms and displays</li>
            <li>Manage your content directly through the interface</li>
          </ol>
        </div>
      </main>
      
      <footer className="w-full max-w-5xl text-center text-sm text-black/60 dark:text-white/60 mt-8">
        <p>SysCMS - Open Source API-driven Content Management System</p>
      </footer>
    </div>
  );
}
