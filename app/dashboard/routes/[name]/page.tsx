"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Field = {
  name: string;
  type: string;
  required: boolean;
};

type Route = {
  name: string;
  url: string;
  method: string;
  fields: Field[];
};

export default function RouteDetail() {
  const params = useParams();
  const router = useRouter();
  const routeName = params.name as string;
  
  const [route, setRoute] = useState<Route | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [responseData, setResponseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  
  // Load route from localStorage
  useEffect(() => {
    const savedRoutes = localStorage.getItem("syscms_routes");
    if (savedRoutes) {
      const routes = JSON.parse(savedRoutes);
      const foundRoute = routes.find((r: Route) => r.name === routeName);
      
      if (foundRoute) {
        setRoute(foundRoute);
        // Initialize form data
        const initialData: Record<string, any> = {};
        // Add a safety check to handle undefined fields
        if (foundRoute.fields && Array.isArray(foundRoute.fields)) {
          foundRoute.fields.forEach((field) => {
            initialData[field.name] = field.type === "checkbox" ? false : "";
          });
        }
        setFormData(initialData);
      } else {
        setError("Route not found");
      }
    } else {
      setError("No routes found");
    }
  }, [routeName]);

  // Handle form input changes
  const handleInputChange = (fieldName: string, value: any) => {
    setFormData({ ...formData, [fieldName]: value });
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");
    
    try {
      if (!route) throw new Error("Route not found");
      
      // Get environment variables
      const envVars = localStorage.getItem("syscms_env");
      const env = envVars ? JSON.parse(envVars) : {};
      
      // Process URL with environment variables
      let processedUrl = route.url;
      Object.keys(env).forEach(key => {
        processedUrl = processedUrl.replace(`{${key}}`, env[key]);
      });
      
      let response;
      
      if (route.method === "GET") {
        // For GET requests, add query parameters
        const queryParams = new URLSearchParams();
        Object.keys(formData).forEach(key => {
          if (formData[key]) {
            queryParams.append(key, formData[key]);
          }
        });
        
        const url = queryParams.toString() 
          ? `${processedUrl}?${queryParams.toString()}` 
          : processedUrl;
          
        response = await fetch(url);
      } else {
        // For other methods, send data in request body
        response = await fetch(processedUrl, {
          method: route.method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      }
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      setResponseData(data);
      
      // For GET requests, send to AI for analysis
      if (route.method === "GET") {
        try {
          const aiResponse = await fetch("http://localhost:6000/analyze", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ data }),
          });
          
          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            // Store the AI generated component/analysis
            setResponseData({
              raw: data,
              analyzed: aiData
            });
          }
        } catch (err) {
          console.error("Failed to analyze with AI:", err);
          // Continue with raw data if AI analysis fails
        }
      } else {
        setMessage("Request successful!");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to process request");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete route
  const deleteRoute = () => {
    if (window.confirm("Are you sure you want to delete this route?")) {
      try {
        const savedRoutes = localStorage.getItem("syscms_routes");
        if (savedRoutes) {
          const routes = JSON.parse(savedRoutes);
          const updatedRoutes = routes.filter((r: Route) => r.name !== routeName);
          localStorage.setItem("syscms_routes", JSON.stringify(updatedRoutes));
          router.push("/dashboard");
        }
      } catch (err) {
        setError("Failed to delete route");
        console.error(err);
      }
    }
  };

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/dashboard" className="text-sm text-black/60 dark:text-white/60 hover:underline mr-2">
            ← Back to Dashboard
          </Link>
        </div>
        
        <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/dashboard" className="text-sm text-black/60 dark:text-white/60 hover:underline mr-2">
            ← Back to Dashboard
          </Link>
        </div>
        
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard" className="text-sm text-black/60 dark:text-white/60 hover:underline">
          ← Back to Dashboard
        </Link>
        
        <button
          onClick={deleteRoute}
          className="text-red-600 dark:text-red-400 hover:underline text-sm"
        >
          Delete Route
        </button>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{route.name}</h1>
        <span className={`inline-block px-2 py-0.5 rounded text-xs ${
          route.method === "GET" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
          route.method === "POST" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
          route.method === "PUT" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" :
          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
        }`}>
          {route.method}
        </span>
      </div>
      
      <div className="mb-6">
        <p className="text-sm text-black/60 dark:text-white/60">
          URL: {route.url}
        </p>
      </div>
      
      {message && (
        <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded mb-6">
          {message}
        </div>
      )}
      
      <div className="bg-white dark:bg-black/20 rounded-lg border border-black/10 dark:border-white/10 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Request</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {route.fields.map((field) => (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-sm font-medium mb-1">
                  {field.name} {field.required && <span className="text-red-500">*</span>}
                </label>
                
                {field.type === "textarea" ? (
                  <textarea
                    id={field.name}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="w-full p-2 border border-black/10 dark:border-white/20 rounded bg-transparent"
                    required={field.required}
                  />
                ) : field.type === "select" ? (
                  <select
                    id={field.name}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="w-full p-2 border border-black/10 dark:border-white/20 rounded bg-transparent"
                    required={field.required}
                  >
                    <option value="">Select...</option>
                    {/* Add options dynamically if available */}
                  </select>
                ) : field.type === "checkbox" ? (
                  <input
                    id={field.name}
                    type="checkbox"
                    checked={!!formData[field.name]}
                    onChange={(e) => handleInputChange(field.name, e.target.checked)}
                    required={field.required}
                  />
                ) : (
                  <input
                    id={field.name}
                    type={field.type}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="w-full p-2 border border-black/10 dark:border-white/20 rounded bg-transparent"
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-foreground text-background rounded hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
      
      {responseData && (
        <div className="bg-white dark:bg-black/20 rounded-lg border border-black/10 dark:border-white/10 p-6">
          <h2 className="text-xl font-semibold mb-4">Response</h2>
          
          {route.method === "GET" && responseData.analyzed ? (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Analyzed Data</h3>
                <div dangerouslySetInnerHTML={{ __html: responseData.analyzed.html || "" }} />
              </div>
              
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-black/60 dark:text-white/60">
                  Raw JSON Response
                </summary>
                <pre className="mt-2 p-4 bg-black/5 dark:bg-white/5 rounded overflow-x-auto text-xs">
                  {JSON.stringify(responseData.raw, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <pre className="p-4 bg-black/5 dark:bg-white/5 rounded overflow-x-auto text-xs">
              {JSON.stringify(responseData, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}