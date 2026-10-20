"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function AdminPage() {
  // Security State (In a real app, use Supabase Auth. For MVP, hardcode a password)
  const ADMIN_PASSWORD = "guardian2026"; // ⚠️ CHANGE THIS TO A SECRET PASSWORD
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Form State
  const [network, setNetwork] = useState("MTN");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [dataGb, setDataGb] = useState("");
  const [days, setDays] = useState("");
  const [type, setType] = useState("Daily");
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    // Insert the new bundle into Supabase
    const { error } = await supabase.from("bundles").insert([
      {
        network,
        name,
        price: parseFloat(price),
        dataGb: parseFloat(dataGb),
        days: parseInt(days),
        type,
      },
    ]);

    if (error) {
      setStatus("error");
      setMessage(`Error: ${error.message}`);
    } else {
      setStatus("success");
      setMessage("Bundle added successfully!");
      // Clear form
      setName("");
      setPrice("");
      setDataGb("");
      setDays("");
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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white mt-1 focus:outline-none focus:border-indigo-500"
                placeholder="Enter admin password"
              />
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
      <div className="w-full max-w-lg">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Add or update data bundles</p>
          </div>
          <button onClick={() => window.location.href = "/"} className="text-sm text-indigo-400 hover:text-indigo-300">
            ← Back to App
          </button>
        </header>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg">
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

            <button type="submit" disabled={status === "loading"} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition-colors mt-4">
              {status === "loading" ? "Saving to Database..." : "Add Bundle to Database"}
            </button>

            {message && (
              <div className={`p-3 rounded-lg text-sm font-medium mt-4 ${status === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
