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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteKey, setDeleteKey] = useState("");

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
    setIsLoading(true);
    setError("");
    setMessage("");
    
    if (!newKey.trim() || !newValue.trim()) {
      setError("Both key and value are required");
      setIsLoading(false);
      return;
    }
    
    // Check for duplicate keys
    if (envVars.some(env => env.key === newKey)) {
      setError("A variable with this key already exists");
      setIsLoading(false);
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
    setIsLoading(false);
  };

  const confirmDelete = (key: string) => {
    setDeleteKey(key);
    setShowDeleteModal(true);
  };

  const removeEnvVar = () => {
    const updatedEnvVars = envVars.filter(env => env.key !== deleteKey);
    setEnvVars(updatedEnvVars);
    saveToLocalStorage(updatedEnvVars);
    setMessage("Environment variable removed");
    setShowDeleteModal(false);
  };

  const saveToLocalStorage = (vars: EnvVar[]) => {
    try {
      const envObject = vars.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      
      localStorage.setItem("syscms_env", JSON.stringify(envObject));
    } catch (err) {
      console.error("Failed to save env vars:", err);
      setError("Failed to save environment variables");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center mb-8 pb-4 border-b border-black/10 dark:border-white/10">
        <Link href="/dashboard" className="text-sm text-black/70 dark:text-white/70 hover:underline inline-flex items-center transition-colors">
          <span className="mr-1">←</span> Back to Dashboard
        </Link>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 bg-gradient-to-r from-white to-gray-50 dark:from-black/40 dark:to-black/20 p-6 rounded-lg border border-black/10 dark:border-white/10 shadow-md">
        <h1 className="text-2xl font-bold font-serif mb-2 sm:mb-0">Environment Variables</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-md mb-8 border border-red-300 dark:border-red-800 shadow-sm">
          {error}
        </div>
      )}
      
      {message && (
        <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-md mb-8 border border-green-300 dark:border-green-800 shadow-sm">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form for adding new env var */}
        <div className="bg-white dark:bg-black/20 rounded-lg border border-black/10 dark:border-white/10 p-6 shadow-sm">
          <h2 className="text-xl font-serif font-semibold mb-6 pb-2 border-b border-black/10 dark:border-white/10">
            Add Environment Variable
          </h2>
          
          <form onSubmit={addEnvVar}>
            <div className="space-y-4">
              <div>
                <label htmlFor="envKey" className="block text-sm font-medium mb-2">
                  Key
                </label>
                <input
                  id="envKey"
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g., API_KEY"
                  className="w-full p-2 border border-black/20 dark:border-white/20 rounded bg-transparent focus:ring-1 focus:ring-black/30 dark:focus:ring-white/30 focus:outline-none transition-shadow"
                />
              </div>
              
              <div>
                <label htmlFor="envValue" className="block text-sm font-medium mb-2">
                  Value
                </label>
                <input
                  id="envValue"
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="e.g., your-api-key-here"
                  className="w-full p-2 border border-black/20 dark:border-white/20 rounded bg-transparent focus:ring-1 focus:ring-black/30 dark:focus:ring-white/30 focus:outline-none transition-shadow"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-gradient-to-b from-foreground to-foreground/90 text-background rounded-md hover:from-foreground/90 hover:to-foreground/80 transition-all disabled:opacity-50 font-medium shadow-sm flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  "Add Variable"
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* List of current env vars */}
        <div className="bg-white dark:bg-black/20 rounded-lg border border-black/10 dark:border-white/10 p-6 shadow-sm">
          <h2 className="text-xl font-serif font-semibold mb-6 pb-2 border-b border-black/10 dark:border-white/10">
            Current Variables
          </h2>
          
          {envVars.length > 0 ? (
            <div className="space-y-4">
              {envVars.map((env) => (
                <div 
                  key={env.key}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-black/10 rounded-md border border-black/5 dark:border-white/5 hover:shadow-sm transition-shadow"
                >
                  <div>
                    <p className="font-medium text-sm">{env.key}</p>
                    <p className="text-black/60 dark:text-white/60 text-xs font-mono truncate max-w-xs">
                      {env.value.substring(0, 3) + "•".repeat(Math.min(6, env.value.length - 6)) + env.value.substring(env.value.length - 3)}
                    </p>
                  </div>
                  <button
                    onClick={() => confirmDelete(env.key)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-black/5 dark:bg-white/5 rounded-md">
              <p className="text-black/60 dark:text-white/60 font-serif italic">No environment variables</p>
            </div>
          )}
        </div>
      </div>

      {/* Usage guide */}
      <div className="mt-8 bg-white dark:bg-black/20 rounded-lg border border-black/10 dark:border-white/10 p-6 shadow-sm">
        <h2 className="text-xl font-serif font-semibold mb-6 pb-2 border-b border-black/10 dark:border-white/10">
          Usage Guide
        </h2>
        
        <div className="space-y-4 text-black/80 dark:text-white/80">
          <p>
            Environment variables can be used in your API URLs by using the format <code className="font-mono bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">{"{VARIABLE_NAME}"}</code>.
          </p>
          <p>
            For example, if you have a variable <code className="font-mono bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">BASE_URL</code> with the value <code className="font-mono bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">https://api.example.com</code>,
            you can use it in your API URL as <code className="font-mono bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">{"{BASE_URL}/users"}</code>.
          </p>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-lg p-6 max-w-md w-full shadow-lg" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 font-serif">Delete Variable</h3>
            
            <p className="mb-6 text-black/70 dark:text-white/70">
              Are you sure you want to delete <span className="font-semibold text-foreground font-mono">{deleteKey}</span>? 
              This might affect routes using this variable.
            </p>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-black/10 dark:border-white/10 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={removeEnvVar}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Variable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}