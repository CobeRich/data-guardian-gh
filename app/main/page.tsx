"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Define the Bundle type
type Bundle = {
  id: number;
  network: string;
  name: string;
  price: number;
  dataGb: number;
  days: number;
  type: string;
};

export default function AdminPage() {
  const ADMIN_PASSWORD = "guardian2026"; // ⚠️ CHANGE THIS
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger re-fetching

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null); // If null, we are creating. If number, we are editing.
  const [network, setNetwork] = useState("MTN");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [dataGb, setDataGb] = useState("");
  const [days, setDays] = useState("");
  const [type, setType] = useState("Daily");
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  // Fetch bundles when authenticated or when refreshKey changes
  useEffect(() => {
    if (!isAuthenticated) return;

    async function fetchBundles() {
      const { data, error } = await supabase
        .from("bundles")
        .select("*")
        .order("network", { ascending: true });
      
      if (!error && data) {
        setBundles(data);
      }
    }
    fetchBundles();
  }, [isAuthenticated, refreshKey]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password");
    }
  };

  // Reset form to default state
  const resetForm = () => {
    setEditingId(null);
    setNetwork("MTN");
    setName("");
    setPrice("");
    setDataGb("");
    setDays("");
    setType("Daily");
    setStatus("idle");
    setMessage("");
  };

  // Populate form when "Edit" is clicked
  const handleEditClick = (bundle: Bundle) => {
    setEditingId(bundle.id);
    setNetwork(bundle.network);
    setName(bundle.name);
    setPrice(bundle.price.toString());
    setDataGb(bundle.dataGb.toString());
    setDays(bundle.days.toString());
    setType(bundle.type);
    setStatus("idle");
    setMessage("");
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this bundle?")) return;

    const { error } = await supabase.from("bundles").delete().eq("id", id);

    if (error) {
      alert(`Error deleting: ${error.message}`);
    } else {
      setRefreshKey(prev => prev + 1); // Trigger re-fetch
      if (editingId === id) resetForm(); // Clear form if we deleted the one we were editing
    }
  };

  // Handle Create OR Update
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
    };

    let error;
    
    if (editingId) {
      // UPDATE existing
      const result = await supabase.from("bundles").update(payload).eq("id", editingId);
      error = result.error;
    } else {
      // INSERT new
      const result = await supabase.from("bundles").insert([payload]);
      error = result.error;
    }

    if (error) {
      setStatus("error");
      setMessage(`Error: ${error.message}`);
    } else {
      setStatus("success");
      setMessage(editingId ? "Bundle updated successfully!" : "Bundle added successfully!");
      setRefreshKey(prev => prev + 1); // Trigger re-fetch for the list below
      
      // If we were editing, reset the form back to "Create" mode after a short delay
      if (editingId) {
        setTimeout(() => resetForm(), 1500);
      } else {
        // If creating, just clear the text fields
        setName("");
        setPrice("");
        setDataGb("");
        setDays("");
      }
    }
  };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl w-full max-w-sm">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white mt-1 focus:outline-none focus:border-indigo-500" placeholder="Enter admin password" />
            </div>
            <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 rounded-lg transition-colors">
              Unlock
            </button>
          </form>
        </div>
      </main>
    );
  }

  // --- ADMIN DASHBOARD ---
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans flex justify-center items-start pt-12">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: FORM */}
        <div>
          <header className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Admin Dashboard</h1>
              <p className="text-slate-400 text-sm mt-1">{editingId ? "Edit existing bundle" : "Add a new bundle"}</p>
            </div>
            <button onClick={() => window.location.href = "/"} className="text-sm text-indigo-400 hover:text-indigo-300">
              ← App
            </button>
          </header>

          <div className={`bg-slate-800 border rounded-2xl p-6 shadow-lg transition-colors ${editingId ? 'border-yellow-500/50' : 'border-slate-700'}`}>
            {editingId && (
              <div className="mb-4 bg-yellow-900/30 text-yellow-400 text-xs p-2 rounded border border-yellow-500/30 flex justify-between items-center">
                <span>You are editing an existing bundle.</span>
                <button onClick={resetForm} className="underline font-bold hover:text-white">Cancel Edit</button>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Network</label>
                  <select value={network} onChange={(e) => setNetwork(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white mt-1 focus:outline-none focus:border-indigo-500">
                    <option value="MTN">MTN</option>
                    <option value="Telecel">Telecel</option>
                    <option value="AirtelTigo">AirtelTigo</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Usage Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white mt-1 focus:outline-none focus:border-indigo-500">
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Night">Night</option>
                    <option value="Social">Social</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Bundle Name</label>
                <input required type="text" placeholder="e.g. Mega Bundle" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white mt-1 focus:outline-none focus:border-indigo-500" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Price (GH₵)</label>
                  <input required type="number" step="0.01" placeholder="25.00" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white mt-1 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Data (GB)</label>
                  <input required type="number" step="0.1" placeholder="10" value={dataGb} onChange={(e) => setDataGb(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white mt-1 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Days</label>
                  <input required type="number" placeholder="7" value={days} onChange={(e) => setDays(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white mt-1 focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              <button type="submit" disabled={status === "loading"} className={`w-full text-white font-bold py-3 rounded-lg transition-colors mt-2 ${editingId ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-600 hover:bg-green-500'}`}>
                {status === "loading" ? "Saving..." : editingId ? "Update Bundle" : "Add Bundle to Database"}
              </button>

              {message && (
                <div className={`p-3 rounded-lg text-sm font-medium mt-4 ${status === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                  {message}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: BUNDLE LIST */}
        <div>
          <header className="mb-6 mt-12 md:mt-0">
            <h2 className="text-xl font-bold text-white">Existing Bundles</h2>
            <p className="text-slate-400 text-sm">Total: {bundles.length}</p>
          </header>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
            {bundles.map((b) => (
              <div key={b.id} className={`bg-slate-800 border p-3 rounded-xl flex justify-between items-center shadow-sm ${editingId === b.id ? 'border-yellow-500 ring-1 ring-yellow-500/50' : 'border-slate-700'}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase">{b.network}</span>
                    <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 rounded">{b.type}</span>
                  </div>
                  <h4 className="font-medium text-sm text-slate-200">{b.name}</h4>
                  <p className="text-xs text-slate-500">{b.dataGb}GB · {b.days} days</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <p className="font-bold text-white">GH₵ {b.price}</p>
                  <div className="flex gap-1">
                    <button onClick={() => handleEditClick(b)} className="bg-slate-700 hover:bg-slate-600 text-white p-1.5 rounded" title="Edit">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button onClick={() => handleDelete(b.id)} className="bg-red-900/50 hover:bg-red-600 text-red-200 hover:text-white p-1.5 rounded transition-colors" title="Delete">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
