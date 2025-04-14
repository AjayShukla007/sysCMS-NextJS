/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
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

type EnvVar = {
  key: string;
  value: string;
};

// Add a type for the new field state
type NewField = {
  name: string;
  type: string;
  required: boolean;
};

export default function RouteDetail() {
  const params = useParams();
  const router = useRouter();
  const routeName = params.name as string;

  const [route, setRoute] = useState<Route | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [responseData, setResponseData] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Environment variables suggestion system
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionField, setActiveSuggestionField] = useState("");
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });
  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});

  // State for adding a new field
  const [showAddFieldForm, setShowAddFieldForm] = useState(false);
  const [newField, setNewField] = useState<NewField>({ name: "", type: "bodyField", required: false });
  const [addFieldMessage, setAddFieldMessage] = useState(""); // Optional: message for add field success/error

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
          foundRoute.fields.forEach((field: Field) => {
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

    // Load environment variables
    loadEnvironmentVariables();
  }, [routeName]);

  // Load environment variables from localStorage
  const loadEnvironmentVariables = () => {
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
      }
    }
  };

  // Handle form input changes with environment variable suggestion
  const handleInputChange = (fieldName: string, value: any) => {
    setFormData({ ...formData, [fieldName]: value });

    // Check for @ symbol to show environment variable suggestions
    if (typeof value === 'string') {
      const lastAtSymbolIndex = value.lastIndexOf('@');
      if (lastAtSymbolIndex !== -1 && lastAtSymbolIndex === value.length - 1) {
        // User just typed @, show suggestions
        setActiveSuggestionField(fieldName);
        setShowSuggestions(true);

        // Get position for the suggestions dropdown
        const inputElement = inputRefs.current[fieldName];
        if (inputElement) {
          const rect = inputElement.getBoundingClientRect();
          console.log(suggestionPosition);
          
          setSuggestionPosition({
            top: rect.bottom,
            left: rect.left
          });
        }
      } else {
        // Hide suggestions if no @ is at the end
        if (activeSuggestionField === fieldName) {
          setShowSuggestions(false);
        }
      }
    }
  };

  // Insert environment variable reference
  const insertEnvVariable = (envKey: string) => {
    if (!activeSuggestionField) return;

    const currentValue = formData[activeSuggestionField] || '';
    if (typeof currentValue === 'string') {
      // Replace the @ with the environment variable reference
      const newValue = currentValue.substring(0, currentValue.lastIndexOf('@')) +
        `{${envKey}}`;

      setFormData({
        ...formData,
        [activeSuggestionField]: newValue
      });
    }

    setShowSuggestions(false);
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");
    setResponseData(null); // Clear previous response
    setResponseStatus(null); // Clear previous status

    try {
      if (!route) throw new Error("Route not found");

      // Get environment variables
      const envVars = localStorage.getItem("syscms_env");
      const env = envVars ? JSON.parse(envVars) : {};

      // *** DEBUG: Log loaded route fields and form data ***
      console.log("Route Fields:", route.fields);
      console.log("Form Data:", formData);
      console.log("Environment Variables:", env);

      // Process URL, headers, path params, query params, bodyData (as before)
      let processedUrl = route.url;
      Object.keys(env).forEach(key => {
        processedUrl = processedUrl.replace(`{${key}}`, env[key]);
      });

      const hasFormFields = route.fields.some(field => field.type === "formField");
      const headers: Record<string, string> = {};
      if (!hasFormFields) {
        headers["Content-Type"] = "application/json";
      }

      route.fields.forEach(field => {
        if (field.type === "pathParam" && formData[field.name]) {
          let paramValue = formData[field.name];
          Object.keys(env).forEach(key => {
            paramValue = paramValue.replace(`{${key}}`, env[key]);
          });
          processedUrl = processedUrl.replace(`{${field.name}}`, paramValue);
        }
      });

      // *** DEBUG: Log header processing ***
      console.log("Processing Headers...");
      route.fields.forEach(field => {
        if (field.type === "header") {
          console.log(`Found header field: ${field.name}`);
          const rawValue = formData[field.name];
          console.log(`  Raw value from formData:`, rawValue);
          if (rawValue) {
            let headerValue = rawValue;
            Object.keys(env).forEach(key => {
              headerValue = headerValue.replace(`{${key}}`, env[key]);
            });
            console.log(`  Value after env substitution:`, headerValue);
            headers[field.name] = headerValue;
          } else {
            console.log(`  Skipping header ${field.name} because value is missing in formData.`);
          }
        }
      });
      console.log("Final Headers Object:", headers); // *** DEBUG: Log final headers ***

      const bodyData: Record<string, any> = {};
      const queryParams = new URLSearchParams();

      route.fields.forEach(field => {
        if (!formData[field.name] && !field.required) return;
        if (field.type === "header" || field.type === "pathParam") return;

        let fieldValue = formData[field.name];
        if (typeof fieldValue === 'string') {
          Object.keys(env).forEach(key => {
            fieldValue = fieldValue.replace(`{${key}}`, env[key]);
          });
        }

        if (field.type === "queryParam" || (route.method === "GET")) {
          if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
            queryParams.append(field.name, fieldValue);
          }
        } else if (field.type === "bodyField" || field.type === "formField" || route.method !== "GET") {
          bodyData[field.name] = fieldValue;
        }
      });

      // *** DEBUG: Log final URL and body ***
      const url = queryParams.toString()
        ? `${processedUrl}?${queryParams.toString()}`
        : processedUrl;
      console.log("Final URL:", url);
      console.log("Final Body Data:", bodyData);

      let response: Response;

      // Perform the fetch request
      if (route.method === "GET") {
        response = await fetch(url, { headers });
      } else {
        if (hasFormFields) {
          const formDataObj = new FormData();
          Object.entries(bodyData).forEach(([key, value]) => {
            formDataObj.append(key, value);
          });
          response = await fetch(url, {
            method: route.method,
            headers,
            body: formDataObj
          });
        } else {
          response = await fetch(url, {
            method: route.method,
            headers,
            body: Object.keys(bodyData).length ? JSON.stringify(bodyData) : undefined
          });
        }
      }

      // Store the status code regardless of success or failure
      setResponseStatus(response.status);

      // Try to parse the response body
      let data;
      try {
        // Check content type to decide how to parse
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          // Handle as text if not JSON
          data = { responseText: await response.text() };
        }
      } catch (parseError) {
        // If parsing fails (e.g., empty body for 204), store a generic message
        console.warn("Could not parse response body:", parseError);
        data = { responseText: `(Could not parse response body - Status: ${response.status})` };
      }

      // Set the response data (could be success or error data)
      setResponseData(data);

      // Set success/error message based on status
      if (response.ok) {
        if (route.method !== "GET") {
          setMessage(`Request successful (${response.status})`);
        } else {
          setMessage(`Data received (${response.status})`); // Optional message for GET
        }
      } else {
        // Set an error message, but don't throw, let the data be displayed
        setError(`API returned an error (${response.status})`);
      }

    } catch (err) {
      // Catch network errors or other unexpected errors during request setup/execution
      console.error("Fetch error:", err);
      const errorMessage = err instanceof Error ? `Network/Request Error: ${err.message}` : "An unexpected error occurred";
      
      // Set state to display the error within the response area
      setError(errorMessage); // Keep error state for potential top-level handling if needed elsewhere, but primary display is below
      setResponseData({ error: errorMessage }); // Put the error message into the response data structure
      setResponseStatus(0); // Use 0 or another indicator for client-side/network errors
      setMessage(""); // Clear any success message
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle adding a new field
  const handleAddNewField = (e: FormEvent) => {
    e.preventDefault();
    setAddFieldMessage(""); // Clear previous message

    if (!route || !newField.name || !newField.type) {
      setAddFieldMessage("Field name and type are required.");
      return;
    }

    // Check if field name already exists
    if (route.fields.some(field => field.name === newField.name)) {
      setAddFieldMessage(`Field name "${newField.name}" already exists.`);
      return;
    }

    try {
      const updatedFields = [...route.fields, { ...newField }];
      const updatedRoute = { ...route, fields: updatedFields };

      // Update state
      setRoute(updatedRoute);
      setFormData({
        ...formData,
        [newField.name]: newField.type === "checkbox" ? false : "" // Initialize new field in formData
      });

      // Persist to localStorage
      const savedRoutes = localStorage.getItem("syscms_routes");
      if (savedRoutes) {
        const routes = JSON.parse(savedRoutes);
        const routeIndex = routes.findIndex((r: Route) => r.name === routeName);
        if (routeIndex !== -1) {
          routes[routeIndex] = updatedRoute;
          localStorage.setItem("syscms_routes", JSON.stringify(routes));
          setAddFieldMessage(`Field "${newField.name}" added successfully.`);
        } else {
           throw new Error("Route not found in localStorage during update.");
        }
      } else {
         throw new Error("No routes found in localStorage.");
      }

      // Reset and hide form
      setNewField({ name: "", type: "bodyField", required: false });
      setShowAddFieldForm(false);

    } catch (err) {
      console.error("Failed to add field:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      setAddFieldMessage(`Error adding field: ${message}`);
    }
  };

  // Delete route
  const deleteRoute = async () => {
    setIsDeleting(true);
    try {
      const savedRoutes = localStorage.getItem("syscms_routes");
      if (savedRoutes) {
        const routes = JSON.parse(savedRoutes);
        const updatedRoutes = routes.filter((r: Route) => r.name !== routeName);
        localStorage.setItem("syscms_routes", JSON.stringify(updatedRoutes));

        // Optional: Add small delay to show the loading state
        await new Promise(resolve => setTimeout(resolve, 300));

        // Close modal and navigate back
        setShowDeleteModal(false);
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Failed to delete route");
      console.error(err);
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Keep the loading state check
  if (!route) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/dashboard" className="text-sm text-black/60 dark:text-white/60 hover:underline mr-2 inline-flex items-center">
            <span className="mr-1">←</span> Back to Dashboard
          </Link>
        </div>
        {/* Display loading or route not found error */}
        <div className="text-center py-12 font-serif italic">
          {error ? error : "Loading..."} 
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header with navigation and delete button */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/10 dark:border-white/10">
        <Link href="/dashboard" className="text-sm text-black/70 dark:text-white/70 hover:underline inline-flex items-center transition-colors">
          <span className="mr-1">←</span> Back to Dashboard
        </Link>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="text-red-600 dark:text-red-400 hover:bg-red-100/50 dark:hover:bg-red-900/20 px-3 py-1 rounded text-sm transition-colors font-medium border border-transparent hover:border-red-200 dark:hover:border-red-800"
        >
          Delete Route
        </button>
      </div>

      {/* Title section with method badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 bg-gradient-to-r from-white to-gray-50 dark:from-black/40 dark:to-black/20 p-6 rounded-lg border border-black/10 dark:border-white/10 shadow-md">
        <h1 className="text-2xl font-bold font-serif mb-2 sm:mb-0">{route.name}</h1>
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider ${
          route.method === "GET" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-300 dark:border-blue-800" :
          route.method === "POST" ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border border-green-300 dark:border-green-800" :
          route.method === "PUT" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-800" :
          "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border border-red-300 dark:border-red-800"
        }`}>
          {route.method}
        </span>
      </div>

      {/* URL display */}
      <div className="mb-8">
        <div className="flex items-center">
          <span className="text-sm text-black/60 dark:text-white/60 mr-2 font-medium">URL:</span>
          <code className="font-mono text-sm bg-black/5 dark:bg-white/10 px-2 py-1 rounded break-all">
            {route.url}
          </code>
        </div>
      </div>

      {/* Success message */}
      {message && (
        <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-md mb-8 border border-green-300 dark:border-green-800 shadow-sm">
          {message}
        </div>
      )}

      {/* Request form */}
      <div className="bg-white dark:bg-black/20 rounded-lg border border-black/10 dark:border-white/10 p-6 mb-8 shadow-sm">
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-black/10 dark:border-white/10">
           <h2 className="text-xl font-serif font-semibold">Request</h2>
           {!showAddFieldForm && (
             <button
               onClick={() => { setShowAddFieldForm(true); setAddFieldMessage(''); }}
               className="text-sm px-3 py-1 border border-black/10 dark:border-white/10 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
             >
               + Add Field
             </button>
           )}
        </div>

        {/* Add Field Form */}
        {showAddFieldForm && (
          <form onSubmit={handleAddNewField} className="mb-8 p-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-md space-y-4">
             <h3 className="text-lg font-medium font-serif">Add New Field</h3>
             {addFieldMessage && (
               <p className={`text-sm ${addFieldMessage.startsWith('Error') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                 {addFieldMessage}
               </p>
             )}
             <div>
               <label htmlFor="newFieldName" className="block text-sm font-medium mb-1">Field Name</label>
               <input
                 type="text"
                 id="newFieldName"
                 value={newField.name}
                 onChange={(e) => setNewField({ ...newField, name: e.target.value.trim() })}
                 className="w-full p-2 border border-black/20 dark:border-white/20 rounded bg-transparent focus:ring-1 focus:ring-black/30 dark:focus:ring-white/30 focus:outline-none transition-shadow"
                 required
               />
             </div>
             <div>
               <label htmlFor="newFieldType" className="block text-sm font-medium mb-1">Field Type</label>
               <select
                 id="newFieldType"
                 value={newField.type}
                 onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                 className="w-full p-2 border border-black/20 dark:border-white/20 rounded bg-transparent appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20011.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20fill%3D%22%23000%22%20opacity%3D%22.2%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.5rem_center] bg-[length:1.5em_1.5em] bg-no-repeat pr-10 focus:ring-1 focus:ring-black/30 dark:focus:ring-white/30 focus:outline-none transition-shadow"
                 required
               >
                 <option value="bodyField">Body Field</option>
                 <option value="header">Header</option>
                 <option value="queryParam">Query Parameter</option>
                 <option value="pathParam">Path Parameter</option>
                 <option value="formField">Form Field</option>
                 <option value="text">Text Input</option>
                 <option value="textarea">Text Area</option>
                 <option value="number">Number Input</option>
                 <option value="checkbox">Checkbox</option>
                 <option value="select">Select Dropdown</option>
               </select>
             </div>
             <div className="flex items-center">
               <input
                 id="newFieldRequired"
                 type="checkbox"
                 checked={newField.required}
                 onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                 className="w-4 h-4 rounded border-black/20 dark:border-white/20 text-foreground focus:ring-1 focus:ring-black/30 dark:focus:ring-white/30"
               />
               <label htmlFor="newFieldRequired" className="ml-2 text-sm font-medium">Required</label>
             </div>
             <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddFieldForm(false)}
                  className="px-3 py-1 border border-black/10 dark:border-white/10 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  Save Field
                </button>
             </div>
          </form>
        )}

        {/* Existing Request Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {route.fields.map((field) => (
              <div key={field.name} className="p-4 bg-gray-50 dark:bg-black/10 rounded-md hover:shadow-sm transition-shadow duration-200 relative">
                <label htmlFor={field.name} className="block text-sm font-medium mb-2">
                  {field.name} {field.required && <span className="text-red-500">*</span>}
                  <span className="text-xs ml-2 py-0.5 px-1.5 bg-black/5 dark:bg-white/10 rounded-full text-black/60 dark:text-white/60 font-mono">
                    {field.type === "header" ? "Header" : 
                     field.type === "pathParam" ? "Path Parameter" :
                     field.type === "queryParam" ? "Query Parameter" :
                     field.type === "bodyField" ? "Body Field" :
                     field.type === "formField" ? "Form Field" : field.type}
                  </span>
                </label>

                {field.type === "textarea" ? (
                  <textarea
                    id={field.name}
                    // ref={el => inputRefs.current[field.name] = el}
                    ref={(el) => { inputRefs.current[field.name] = el; }}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="w-full p-2 border border-black/20 dark:border-white/20 rounded bg-transparent focus:ring-1 focus:ring-black/30 dark:focus:ring-white/30 focus:outline-none transition-shadow"
                    required={field.required}
                    placeholder="Type @ to reference an environment variable"
                  />
                ) : field.type === "select" ? (
                  <select
                    id={field.name}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="w-full p-2 border border-black/20 dark:border-white/20 rounded bg-transparent appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20011.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20fill%3D%22%23000%22%20opacity%3D%22.2%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.5rem_center] bg-[length:1.5em_1.5em] bg-no-repeat pr-10 focus:ring-1 focus:ring-black/30 dark:focus:ring-white/30 focus:outline-none transition-shadow"
                    required={field.required}
                  >
                    <option value="">Select...</option>
                  </select>
                ) : field.type === "checkbox" ? (
                  <div className="flex items-center">
                    <input
                      id={field.name}
                      type="checkbox"
                      checked={!!formData[field.name]}
                      onChange={(e) => handleInputChange(field.name, e.target.checked)}
                      required={field.required}
                      className="w-4 h-4 rounded border-black/20 dark:border-white/20 text-foreground focus:ring-1 focus:ring-black/30 dark:focus:ring-white/30"
                    />
                    <span className="ml-2 text-sm text-black/70 dark:text-white/70">Enabled</span>
                  </div>
                ) : (
                  <input
                    id={field.name}
                    // ref={el => inputRefs.current[field.name] = el}
                    ref={(el) => { inputRefs.current[field.name] = el; }}
                    type={field.type === "header" || field.type === "pathParam" || field.type === "queryParam" || field.type === "bodyField" || field.type === "formField" ? "text" : field.type}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="w-full p-2 border border-black/20 dark:border-white/20 rounded bg-transparent focus:ring-1 focus:ring-black/30 dark:focus:ring-white/30 focus:outline-none transition-shadow"
                    required={field.required}
                    placeholder="Type @ to reference an environment variable"
                  />
                )}

                {/* Helper text for header fields */}
                {field.type === "header" && (
                  <p className="mt-1 text-xs text-black/50 dark:text-white/50">
                    Enter the full header value (e.g., <code className="font-mono bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">Bearer your-token</code> or <code className="font-mono bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">application/json</code>). Use @ to reference environment variables.
                  </p>
                )}

                {/* Env variable suggestions dropdown */}
                {showSuggestions && activeSuggestionField === field.name && (
                  <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-black/90 py-1 text-base shadow-lg ring-1 ring-black/10 dark:ring-white/10 focus:outline-none sm:text-sm border border-black/10 dark:border-white/10">
                    {envVars.length > 0 ? (
                      <>
                        <div className="px-3 py-2 text-xs font-medium text-black/60 dark:text-white/60 border-b border-black/10 dark:border-white/10">
                          Environment Variables
                        </div>
                        {envVars.map((env) => (
                          <div
                            key={env.key}
                            onClick={() => insertEnvVariable(env.key)}
                            className="px-4 py-2 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex justify-between"
                          >
                            <span className="font-medium">{env.key}</span>
                            <span className="text-black/60 dark:text-white/60 font-mono text-xs truncate ml-4">{env.value}</span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="p-4">
                        <p className="text-sm text-black/60 dark:text-white/60 mb-3">No environment variables found</p>
                        <Link
                          href="/dashboard/env"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                        >
                          <span className="mr-1">+</span> Add environment variables
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-b from-foreground to-foreground/90 text-background rounded-md hover:from-foreground/90 hover:to-foreground/80 active:from-foreground/80 active:to-foreground/70 transition-all disabled:opacity-50 font-medium shadow-sm flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                "Send Request"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Response section */}
      {(responseData || responseStatus !== null) && (
        <div className={`rounded-lg border p-6 mb-8 shadow-md ${
          (responseStatus !== null && (responseStatus === 0 || responseStatus >= 400))
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            : 'bg-white dark:bg-black/20 border-black/10 dark:border-white/10'
        }`}>
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-black/10 dark:border-white/10">
            <h2 className="text-xl font-serif font-semibold">Response</h2>
            {responseStatus !== null && (
              <span className={`font-mono text-sm font-bold px-2 py-0.5 rounded ${
                responseStatus === 0 ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200' :
                responseStatus >= 500 ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200' :
                responseStatus >= 400 ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' :
                responseStatus >= 300 ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200' :
                'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
              }`}>
                Status: {responseStatus === 0 ? 'Request Error' : responseStatus}
              </span>
            )}
          </div>

          {responseData ? (
            <pre className="p-4 bg-black/5 dark:bg-white/5 rounded-md border border-black/5 dark:border-white/5 overflow-x-auto text-xs font-mono shadow-inner">
              {JSON.stringify(responseData, null, 2)}
            </pre>
          ) : (
            <p className="text-black/60 dark:text-white/60 italic">No response body received.</p>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-lg p-6 max-w-md w-full shadow-lg" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 font-serif">Delete Route</h3>

            <p className="mb-6 text-black/70 dark:text-white/70">
              Are you sure you want to delete <span className="font-semibold text-foreground">{route.name}</span>? 
              This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-black/10 dark:border-white/10 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>

              <button
                onClick={deleteRoute}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete Route"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}