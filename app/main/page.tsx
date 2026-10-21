"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

type Bundle = {
  id: number;
  network: string;
  name: string;
  price: number;
  dataGb: number;
  days: number;
  type: string;
  ussd_code: string; // NEW
};

export default function AdminPage() {
  const ADMIN_PASSWORD = "guardian2026"; // ⚠️ CHANGE THIS
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [network, setNetwork] = useState("MTN");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [dataGb, setDataGb] = useState("");
  const [days, setDays] = useState("");
  const [type, setType] = useState("Daily");
  const [ussdCode, setUssdCode] = useState("*138#"); // NEW STATE
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    async function fetchBundles() {
      const { data, error } = await supabase.from("bundles").select("*").order("network", { ascending: true });
      if (!error && data) setBundles(data);
    }
    fetchBundles();
  }, [isAuthenticated, refreshKey]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) setIsAuthenticated(true);
    else alert("Incorrect password");
  };

  const resetForm = () => {
    setEditingId(null);
    setNetwork("MTN");
    setName("");
    setPrice("");
    setDataGb("");
    setDays("");
    setType("Daily");
    setUssdCode("*138#"); // Reset USSD
    setStatus("idle");
    setMessage("");
  };

  const handleEditClick = (bundle: Bundle) => {
    setEditingId(bundle.id);
    setNetwork(bundle.network);
    setName(bundle.name);
    setPrice(bundle.price.toString());
    setDataGb(bundle.dataGb.toString());
    setDays(bundle.days.toString());
    setType(bundle.type);
    setUssdCode(bundle.ussd_code || "*138#"); // Load USSD
    setStatus("idle");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this bundle?")) return;
    const { error } = await supabase.from("bundles").delete().eq("id", id);
    if (error) alert(`Error deleting: ${error.message}`);
    else {
      setRefreshKey(prev => prev + 1);
      if (editingId === id) resetForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const payload = {
      network,
      name,
      price: parseFloat(price),
      dataGb: parseFloat(dataGb),
      days: parseInt(days),
      type,
      ussd_code: ussdCode, // Include in payload
    };

    let error;
    if (editingId) {
      const result = await supabase.from("bundles").update(payload).eq("id", editingId);
      error = result.error;
    } else {
      const result = await supabase.from("bundles").insert([payload]);
      error = result.error;
    }

    if (error) {
      setStatus("error");
      setMessage(`Error: ${error.message}`);
    } else {
      setStatus("success");
      setMessage(editingId ? "Bundle updated successfully!" : "Bundle added successfully!");
      setRefreshKey(prev => prev + 1);
      if (editingId) setTimeout(() => resetForm(), 1500);
      else {
        setName("");
        setPrice("");
        setDataGb("");
        setDays("");
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm rounded-lg bg-white p-6 shadow-md">
          <h1 className="mb-4 text-xl font-bold text-gray-800">Admin Login</h1>
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full rounded border border-gray-300 p-2 text-black"
          />
          <button type="submit" className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-black">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Data Bundle Manager</h1>
          <button onClick={() => setIsAuthenticated(false)} className="text-sm text-red-600 hover:underline">
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold">{editingId ? "Edit Bundle" : "Add New Bundle"}</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Network</label>
                  <select value={network} onChange={(e) => setNetwork(e.target.value)} className="w-full rounded border p-2">
                    <option value="MTN">MTN</option>
                    <option value="AirtelTigo">AirtelTigo</option>
                    <option value="Glo">Glo</option>
                    <option value="9mobile">9mobile</option>
                    <option value="Telecel">Telecel</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Bundle Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded border p-2" placeholder="e.g. 1GB Daily" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Price (GH₵)</label>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full rounded border p-2" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Size (GB)</label>
                    <input type="number" value={dataGb} onChange={(e) => setDataGb(e.target.value)} required className="w-full rounded border p-2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Validity (Days)</label>
                    <input type="number" value={days} onChange={(e) => setDays(e.target.value)} required className="w-full rounded border p-2" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded border p-2">
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">USSD Code</label>
                  <input type="text" value={ussdCode} onChange={(e) => setUssdCode(e.target.value)} required className="w-full rounded border p-2" placeholder="*138#" />
                </div>

                <button type="submit" disabled={status === "loading"} className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-50">
                  {status === "loading" ? "Saving..." : editingId ? "Update Bundle" : "Add Bundle"}
                </button>

                {editingId && (
                  <button type="button" onClick={resetForm} className="w-full rounded bg-gray-200 p-2 text-gray-800 hover:bg-gray-300">
                    Cancel Edit
                  </button>
                )}
                
                {message && (
                  <p className={`mt-2 text-sm ${status === "error" ? "text-red-600" : "text-green-600"}`}>{message}</p>
                )}
              </form>
            </div>
          </div>

          {/* List Section */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Network</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Details</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bundles.map((bundle) => (
                    <tr key={bundle.id}>
                      <td className="px-4 py-3 text-sm font-medium">{bundle.network}</td>
                      <td className="px-4 py-3 text-sm">{bundle.name}</td>
                      <td className="px-4 py-3 text-sm">GH₵{bundle.price}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {bundle.dataGb}GB • {bundle.days} Days • {bundle.type}
                        <br />
                        <span className="text-xs text-gray-400">{bundle.ussd_code}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        <button onClick={() => handleEditClick(bundle)} className="mr-2 text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => handleDelete(bundle.id)} className="text-red-600 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {bundles.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No bundles found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
