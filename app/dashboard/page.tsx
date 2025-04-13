"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [routes, setRoutes] = useState<{name: string, url: string, method: string}[]>([]);
  
  useEffect(() => {
    // Load routes from localStorage
    const savedRoutes = localStorage.getItem("syscms_routes");
    if (savedRoutes) {
      setRoutes(JSON.parse(savedRoutes));
    }
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/dashboard/add-route"
          className="rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium"
        >
          Add API Route
        </Link>
      </div>

      <div className="bg-white dark:bg-black/20 rounded-lg border border-black/10 dark:border-white/10 p-6">
        <h2 className="text-xl font-semibold mb-4">Your API Routes</h2>
        
        {routes.length === 0 ? (
          <div className="text-center py-8 text-black/60 dark:text-white/60">
            <p>No API routes added yet</p>
            <Link 
              href="/dashboard/add-route" 
              className="text-foreground underline mt-2 inline-block"
            >
              Add your first route
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-black/10 dark:border-white/10">
                <tr>
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">URL</th>
                  <th className="py-2 px-4 text-left">Method</th>
                  <th className="py-2 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route, index) => (
                  <tr key={index} className="border-b border-black/5 dark:border-white/5">
                    <td className="py-3 px-4">{route.name}</td>
                    <td className="py-3 px-4">{route.url}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                        route.method === "GET" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
                        route.method === "POST" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
                        route.method === "PUT" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" :
                        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }`}>
                        {route.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link 
                        href={`/dashboard/routes/${route.name}`}
                        className="text-foreground underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-black/20 rounded-lg border border-black/10 dark:border-white/10 p-6">
        <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
        <Link 
          href="/dashboard/env" 
          className="text-foreground underline"
        >
          Manage environment variables
        </Link>
      </div>
    </div>
  );
}