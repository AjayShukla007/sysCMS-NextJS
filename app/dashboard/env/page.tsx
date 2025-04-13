"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";

type EnvVar = {
  key: string;
  value: string;
};

export default function EnvironmentVariables() {
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  // const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Load env vars from localStorage
  useEffect(() => {
    const savedEnvVars = localStorage.getItem("syscms_env");
    if (savedEnvVars) {
      try {
        const parsedEnv = JSON.parse(savedEnvVars);
        const formattedEnv: EnvVar[] = Object.keys(parsedEnv).map(key => ({
          key,
          value: parsedEnv[key]
        }));
        setEnvVars(formattedEnv);
      } catch (err) {
        console.error("Failed to parse env vars:", err);
        setError("Failed to load environment variables");
      }
    }
  }, []);

  const addEnvVar = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    
    if (!newKey.trim() || !newValue.trim()) {
      setError("Both key and value are required");
      return;
    }
    
    // Check for duplicate keys
    if (envVars.some(env => env.key === newKey)) {
      setError("A variable with this key already exists");
      return;
    }
    
    const updatedEnvVars = [...envVars, { key: newKey, value: newValue }];
    setEnvVars(updatedEnvVars);
    
    // Save to localStorage
    saveToLocalStorage(updatedEnvVars);
    
    // Reset form
    setNewKey("");
    setNewValue("");
    setMessage("Environment variable added");
  };

  const removeEnvVar = (key: string) => {
    const updatedEnvVars = envVars.filter(env => env.key !== key);
    setEnvVars(updatedEnvVars);
    saveToLocalStorage(updatedEnvVars);
    setMessage("Environment variable removed");
  };

  const saveToLocalStorage = (vars: EnvVar[]) => {
    try {
      const envObject: Record<string, string> = {};
      vars.forEach(env => {
        envObject[env.key] = env.value;
      });
      localStorage.setItem("syscms_env", JSON.stringify(envObject));
    } catch (err) {
      console.error("Failed to save env vars:", err);
      setError("Failed to save environment variables");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <Link href="/dashboard" className="text-sm text-black/60 dark:text-white/60 hover:underline mr-2">
          ← Back to Dashboard
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Environment Variables</h1>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded mb-6">
          {error}
        </div>
      )}
      
      {message && (
        <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded mb-6">
          {message}
        </div>
      )}
      
      <div className="bg-white dark:bg-black/20 rounded-lg border border-black/10 dark:border-white/10 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Environment Variable</h2>
        
        <form onSubmit={addEnvVar} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="envKey" className="block text-sm font-medium mb-1">
                Key
              </label>
              <input
                id="envKey"
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="w-full p-2 border border-black/10 dark:border-white/20 rounded bg-transparent"
                placeholder="e.g., API_KEY"
              />
            </div>
            
            <div>
              <label htmlFor="envValue" className="block text-sm font-medium mb-1">
                Value
              </label>
              <input
                id="envValue"
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-full p-2 border border-black/10 dark:border-white/20 rounded bg-transparent"
                placeholder="e.g., your-api-key"
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="px-4 py-2 bg-foreground text-background rounded hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
          >
            Add Variable
          </button>
        </form>
      </div>
      
      <div className="bg-white dark:bg-black/20 rounded-lg border border-black/10 dark:border-white/10 p-6">
        <h2 className="text-xl font-semibold mb-4">Current Environment Variables</h2>
        
        {envVars.length === 0 ? (
          <div className="text-center py-8 text-black/60 dark:text-white/60">
            <p>No environment variables added yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-black/10 dark:border-white/10">
                <tr>
                  <th className="py-2 px-4 text-left">Key</th>
                  <th className="py-2 px-4 text-left">Value</th>
                  <th className="py-2 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {envVars.map((env, index) => (
                  <tr key={index} className="border-b border-black/5 dark:border-white/5">
                    <td className="py-3 px-4 font-mono text-sm">{env.key}</td>
                    <td className="py-3 px-4 font-mono text-sm">
                      {/* Mask sensitive values */}
                      {env.key.includes("KEY") || env.key.includes("SECRET") || env.key.includes("PASSWORD") 
                        ? "••••••••" 
                        : env.value}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => removeEnvVar(env.key)}
                        className="text-red-600 dark:text-red-400 hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-4 text-sm text-black/60 dark:text-white/60">
          <p>
            To use these variables in your API routes, use the format 
            <code className="mx-1 px-1 py-0.5 bg-black/5 dark:bg-white/10 rounded">{"{"}{"{"}key{"}"}{"}"}</code>
            in your route URL.
          </p>
        </div>
      </div>
    </div>
  );
}