"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Field = {
  name: string;
  type: string;
  required: boolean;
};
type ExistingRoute = {
  name: string;
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
    
    // Check for duplicate field names
    if (fields.some(field => field.name === newField.name)) {
      setError("A field with this name already exists");
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
      if (routes.some((r: ExistingRoute) => r.name === name)) {
        setError("A route with this name already exists");
        setIsLoading(false);
        return;
      }
      
      routes.push(route);
      localStorage.setItem("syscms_routes", JSON.stringify(routes));

      // Add a small delay for UX
      await new Promise(resolve => setTimeout(resolve, 300));

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
      <div className="flex items-center mb-8 pb-4 border-b border-black/10 dark:border-white/10">
        <Link href="/dashboard" className="text-sm text-black/70 dark:text-white/70 hover:underline inline-flex items-center transition-colors">
          <span className="mr-1">←</span> Back to Dashboard
        </Link>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 bg-gradient-to-r from-white to-gray-50 dark:from-black/40 dark:to-black/20 p-6 rounded-lg border border-black/10 dark:border-white/10 shadow-md">
        <h1 className="text-2xl font-bold font-serif mb-2 sm:mb-0">Add API Route</h1>
      </div>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-md mb-8 border border-red-300 dark:border-red-800 shadow-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white dark:bg-black/20 rounded-lg border border-black/10 dark:border-white/10 p-6 shadow-sm">
          <h2 className="text-xl font-serif font-semibold mb-6 pb-2 border-b border-black/10 dark:border-white/10">Route Information</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Route Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-black/20 dark:border-white/20 rounded bg-transparent focus:ring-1 focus:ring-black/30 dark:focus:ring-white/30 focus:outline-none transition-shadow"
                placeholder="e.g., users-api"
              />
            </div>
            
            <div>
              <label htmlFor="url" className="block text-sm font-medium mb-2">
                API URL
              </label>
              <input
                id="url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2 border border-black/20 dark:border-white/20 rounded bg-transparent focus:ring-1 focus:ring-black/30 dark:focus:ring-white/30 focus:outline-none transition-shadow"
                placeholder="e.g., https://api.example.com/users"
              />
            </div>
            
            <div>
              <label htmlFor="method" className="block text-sm font-medium mb-2">
                HTTP Method
              </label>
              <select
                id="method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full p-2 border border-black/20 dark:border-white/20 rounded bg-transparent appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20011.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20fill%3D%22%23000%22%20opacity%3D%22.2%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.5rem_center] bg-[length:1.5em_1.5em] bg-no-repeat pr-10 focus:ring-1 focus:ring-black/30 dark:focus:ring-white/30 focus:outline-none transition-shadow"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-black/20 rounded-lg border border-black/10 dark:border-white/10 p-6 shadow-sm">
          <h2 className="text-xl font-serif font-semibold mb-6 pb-2 border-b border-black/10 dark:border-white/10">Fields</h2>
          
          {fields.length > 0 && (
            <div className="mb-6 overflow-x-auto">
              <table className="w-full">
                <thead className="text-left text-black/70 dark:text-white/70">
                  <tr className="border-b border-black/10 dark:border-white/10">
                    <th className="py-3 px-4 font-medium">Name</th>
                    <th className="py-3 px-4 font-medium">Type</th>
                    <th className="py-3 px-4 font-medium">Required</th>
                    <th className="py-3 px-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr key={index} className="border-b border-black/5 dark:border-white/5">
                      <td className="py-3 px-4 font-medium">{field.name}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs py-0.5 px-1.5 bg-black/5 dark:bg-white/10 rounded-full text-black/60 dark:text-white/60 font-mono">
                          {field.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">{field.required ? "Yes" : "No"}</td>
                      <td className="py-3 px-4 text-right">
                        <button 
                          type="button"
                          onClick={() => removeField(index)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
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
          
          <div className="bg-gray-50 dark:bg-black/10 rounded-md p-4 border border-black/5 dark:border-white/5">
            <h3 className="text-md font-medium mb-4">Add New Field</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="fieldName" className="block text-sm font-medium mb-2">
                  Field Name
                </label>
                <input
                  id="fieldName"
                  type="text"
                  value={newField.name}
                  onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                  className="w-full p-2 border border-black/20 dark:border-white/20 rounded bg-transparent focus:ring-1 focus:ring-black/30 dark:focus:ring-white/30 focus:outline-none transition-shadow"
                  placeholder="e.g., title"
                />
              </div>
              
              <div>
                <label htmlFor="fieldType" className="block text-sm font-medium mb-2">
                  Field Type
                </label>
                <select
                  id="fieldType"
                  value={newField.type}
                  onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                  className="w-full p-2 border border-black/20 dark:border-white/20 rounded bg-transparent appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20011.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20fill%3D%22%23000%22%20opacity%3D%22.2%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.5rem_center] bg-[length:1.5em_1.5em] bg-no-repeat pr-10 focus:ring-1 focus:ring-black/30 dark:focus:ring-white/30 focus:outline-none transition-shadow"
                >
                  <optgroup label="Input Types">
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="textarea">Text Area</option>
                    <option value="date">Date</option>
                    <option value="select">Select</option>
                    <option value="checkbox">Checkbox</option>
                  </optgroup>
                  <optgroup label="API Components">
                    <option value="header">Header</option>
                    <option value="pathParam">Path Parameter</option>
                    <option value="queryParam">Query Parameter</option>
                    <option value="bodyField">Body Field</option>
                    <option value="formField">Form Field</option>
                  </optgroup>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Required
                </label>
                <div className="flex items-center h-10">
                  <input
                    id="fieldRequired"
                    type="checkbox"
                    checked={newField.required}
                    onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                    className="w-4 h-4 rounded border-black/20 dark:border-white/20 text-foreground focus:ring-1 focus:ring-black/30 dark:focus:ring-white/30"
                  />
                  <label htmlFor="fieldRequired" className="ml-2 text-sm text-black/70 dark:text-white/70">
                    Required field
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <button
                type="button"
                onClick={addField}
                className="px-4 py-2 border border-black/20 dark:border-white/20 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                Add Field
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-gradient-to-b from-foreground to-foreground/90 text-background rounded-md hover:from-foreground/90 hover:to-foreground/80 transition-all disabled:opacity-50 font-medium shadow-sm flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              "Save Route"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}