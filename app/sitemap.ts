import { MetadataRoute } from 'next';

// Replace with your production domain
const siteUrl = 'https://sys-cms-next-js.vercel.app'; 

export default function sitemap(): MetadataRoute.Sitemap {
  // Add static routes
  const staticRoutes = [
    '/',
    '/dashboard',
    '/dashboard/add-route',
    '/dashboard/env',
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const, // Or 'monthly', 'daily' etc.
    priority: route === '/' ? 1 : 0.8,
  }));

  // Add dynamic routes (e.g., from localStorage - Note: This runs server-side at build time)
  // This example assumes you might pre-render some routes or want them listed.
  // If routes are purely client-side managed via localStorage after load, 
  // they won't be included here unless you have a build step to extract them.
  // For a purely client-side app using localStorage, a dynamic sitemap might be less critical 
  // or require a different approach (e.g., generating it client-side isn't standard).
  
  // Example: Fetching routes if they were stored server-side or during build
  // const dynamicRoutes = getRoutesFromDatabaseOrBuildStep().map(route => ({
  //   url: `${siteUrl}/dashboard/routes/${route.name}`,
  //   lastModified: new Date(route.createdAt).toISOString(),
  //   changeFrequency: 'monthly',
  //   priority: 0.5,
  // }));

  return [
    ...staticRoutes,
    // ...dynamicRoutes, // Uncomment if you have dynamic routes to include
  ];
}