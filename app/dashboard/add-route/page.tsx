"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Field = {
  name: string;
  type: string;
  required: boolean;
};

export default function AddRoute() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [fields, setFields] = useState<Field[]>([]);
  const [newField, setNewField] = useState({ name: "", type: "text", required: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const addField = () => {
    if (newField.name.trim() === "") {
      setError("Field name cannot be empty");
      return;
    }
    
    setFields([...fields, { ...newField }]);
    setNewField({ name: "", type: "text", required: false });
    setError("");
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!name.trim() || !url.trim()) {
      setError("Name and URL are required");
      setIsLoading(false);
      return;
    }

    try {
      // Create route object with fields guaranteed to be an array
      const route = {
        name,
        url,
        method,
        fields: fields || [], // Ensure fields is always at least an empty array
        createdAt: new Date().toISOString()
      };

      // Save to localStorage
      const existingRoutes = localStorage.getItem("syscms_routes");
      const routes = existingRoutes ? JSON.parse(existingRoutes) : [];
      
      // Check for duplicate route names
      if (routes.some((r: any) => r.name === name)) {
        setError("A route with this name already exists");
        setIsLoading(false);
        return;
      }
      
      routes.push(route);
      localStorage.setItem("syscms_routes", JSON.stringify(routes));

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError("Failed to save route. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <Link href="/dashboard" className="text-sm text-black/60 dark:text-white/60 hover:underline mr-2">
          ← Back to Dashboard
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Add API Route</h1>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-black/20 rounded-lg border border-black/10 dark:border-white/10 p-6">
          <h2 className="text-xl font-semibold mb-4">Route Information</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Route Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-black/10 dark:border-white/20 rounded bg-transparent"
                placeholder="e.g., users-api"
              />
            </div>
            
            <div>
              <label htmlFor="url" className="block text-sm font-medium mb-1">
                API URL
              </label>
              <input
                id="url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2 border border-black/10 dark:border-white/20 rounded bg-transparent"
                placeholder="e.g., https://api.example.com/users"
              />
            </div>
            
            <div>
              <label htmlFor="method" className="block text-sm font-medium mb-1">
                HTTP Method
              </label>
              <select
                id="method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full p-2 border border-black/10 dark:border-white/20 rounded bg-transparent"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-black/20 rounded-lg border border-black/10 dark:border-white/10 p-6">
          <h2 className="text-xl font-semibold mb-4">Fields</h2>
          
          {fields.length > 0 && (
            <div className="mb-6 overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-black/10 dark:border-white/10">
                  <tr>
                    <th className="py-2 px-4 text-left">Name</th>
                    <th className="py-2 px-4 text-left">Type</th>
                    <th className="py-2 px-4 text-left">Required</th>
                    <th className="py-2 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr key={index} className="border-b border-black/5 dark:border-white/5">
                      <td className="py-3 px-4">{field.name}</td>
                      <td className="py-3 px-4">{field.type}</td>
                      <td className="py-3 px-4">{field.required ? "Yes" : "No"}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => removeField(index)}
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
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="fieldName" className="block text-sm font-medium mb-1">
                  Field Name
                </label>
                <input
                  id="fieldName"
                  type="text"
                  value={newField.name}
                  onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                  className="w-full p-2 border border-black/10 dark:border-white/20 rounded bg-transparent"
                  placeholder="e.g., title"
                />
              </div>
              
              <div>
                <label htmlFor="fieldType" className="block text-sm font-medium mb-1">
                  Field Type
                </label>
                <select
                  id="fieldType"
                  value={newField.type}
                  onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                  className="w-full p-2 border border-black/10 dark:border-white/20 rounded bg-transparent"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="textarea">Text Area</option>
                  <option value="date">Date</option>
                  <option value="select">Select</option>
                  <option value="checkbox">Checkbox</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newField.required}
                    onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">Required</span>
                </label>
              </div>
            </div>
            
            <button
              type="button"
              onClick={addField}
              className="px-4 py-2 bg-black/5 dark:bg-white/10 rounded hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
            >
              Add Field
            </button>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Link
            href="/dashboard"
            className="px-4 py-2 border border-black/10 dark:border-white/20 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-foreground text-background rounded hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save Route"}
          </button>
        </div>
      </form>
    </div>
  );
}