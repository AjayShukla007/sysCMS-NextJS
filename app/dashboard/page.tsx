"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Route = {
  name: string;
  url: string;
  method: string;
  createdAt: string;
};

export default function Dashboard() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [envVarsCount, setEnvVarsCount] = useState(0);

  useEffect(() => {
    // Load routes from localStorage
    const savedRoutes = localStorage.getItem("syscms_routes");
    if (savedRoutes) {
      const parsedRoutes = JSON.parse(savedRoutes);
      setRoutes(parsedRoutes);
    }
    
    // Load env vars count
    const savedEnvVars = localStorage.getItem("syscms_env");
    if (savedEnvVars) {
      try {
        const parsedEnv = JSON.parse(savedEnvVars);
        setEnvVarsCount(Object.keys(parsedEnv).length);
      } catch (err) {
        console.error("Failed to parse env vars:", err);
      }
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center py-12 font-serif italic">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 bg-gradient-to-r from-white to-gray-50 dark:from-black/40 dark:to-black/20 p-6 rounded-lg border border-black/10 dark:border-white/10 shadow-md">
        <h1 className="text-2xl font-bold font-serif mb-2 sm:mb-0">Dashboard</h1>
        <div className="flex gap-2">
          <Link 
            href="/dashboard/add-route" 
            className="px-4 py-2 bg-gradient-to-b from-foreground to-foreground/90 text-background rounded-md hover:from-foreground/90 hover:to-foreground/80 transition-all font-medium shadow-sm"
          >
            Add New Route
          </Link>
          <Link 
            href="/dashboard/env" 
            className="px-4 py-2 border border-black/20 dark:border-white/20 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            Edit Environment
          </Link>
        </div>
      </div>

      {/* Stats section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-black/20 rounded-lg border border-black/10 dark:border-white/10 p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-2 font-serif">Total Routes</h2>
          <p className="text-3xl font-bold">{routes.length}</p>
        </div>
        <div className="bg-white dark:bg-black/20 rounded-lg border border-black/10 dark:border-white/10 p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-2 font-serif">Environment Variables</h2>
          <p className="text-3xl font-bold">{envVarsCount}</p>
        </div>
        <div className="bg-white dark:bg-black/20 rounded-lg border border-black/10 dark:border-white/10 p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-2 font-serif">Storage</h2>
          <p className="text-sm text-black/60 dark:text-white/60">
          All data is stored in your browser&apos;s localStorage
          </p>
        </div>
      </div>

      {/* Routes table */}
      <div className="bg-white dark:bg-black/20 rounded-lg border border-black/10 dark:border-white/10 p-6 shadow-sm">
        <h2 className="text-xl font-serif font-semibold mb-6 pb-2 border-b border-black/10 dark:border-white/10">API Routes</h2>
        
        {routes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-left text-black/70 dark:text-white/70">
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className="py-3 px-4 font-medium">Name</th>
                  <th className="py-3 px-4 font-medium">Method</th>
                  <th className="py-3 px-4 font-medium">URL</th>
                  <th className="py-3 px-4 font-medium">Created</th>
                  <th className="py-3 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => (
                  <tr 
                    key={route.name} 
                    className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium">{route.name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-mono ${
                        route.method === "GET" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300" :
                        route.method === "POST" ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" :
                        route.method === "PUT" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300" :
                        "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                      }`}>
                        {route.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-black/70 dark:text-white/70 truncate max-w-xs">
                      {route.url}
                    </td>
                    <td className="py-3 px-4 text-black/60 dark:text-white/60 text-sm">
                      {new Date(route.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link 
                        href={`/dashboard/routes/${route.name}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-black/5 dark:bg-white/5 rounded-md border border-black/5 dark:border-white/5">
            <p className="text-black/70 dark:text-white/70 mb-4 font-serif italic">No routes found</p>
            <Link 
              href="/dashboard/add-route" 
              className="px-4 py-2 bg-gradient-to-b from-foreground to-foreground/90 text-background rounded-md hover:from-foreground/90 hover:to-foreground/80 transition-all font-medium shadow-sm inline-block"
            >
              Add your first route
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}