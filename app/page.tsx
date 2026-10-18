"use client";

import { useState } from "react";

// Hardcoded data for the MVP.
// Later, this can be fetched from a JSON file or an API.
const bundles = [
  { id: 1, network: 'MTN', name: 'Daily Starter', data: '500MB', price: 5.00, validity: '24 hours', type: 'Daily' },
  { id: 2, network: 'MTN', name: 'Weekly Heavy', data: '10GB', price: 25.00, validity: '7 days', type: 'Weekly' },
  { id: 3, network: 'MTN', name: 'Monthly Pro', data: '30GB', price: 60.00, validity: '30 days', type: 'Monthly' },
  { id: 4, network: 'Telecel', name: 'Night King', data: '6GB', price: 5.00, validity: 'Midnight - 5 AM', type: 'Night' },
  { id: 5, network: 'Telecel', name: 'WhatsApp Pass', data: '1GB', price: 4.50, validity: '7 days', type: 'Social' },
  { id: 6, network: 'Telecel', name: 'Mega Bundle', data: '20GB', price: 50.00, validity: '30 days', type: 'Monthly' },
  { id: 7, network: 'AirtelTigo', name: 'Weekly Standard', data: '5GB', price: 15.00, validity: '7 days', type: 'Weekly' },
  { id: 8, network: 'AirtelTigo', name: 'Monthly Max', data: '40GB', price: 80.00, validity: '30 days', type: 'Monthly' },
  { id: 9, network: 'AirtelTigo', name: 'Social Pack', data: '2GB', price: 8.00, validity: '7 days', type: 'Social' },
];

const networks = ['All', 'MTN', 'Telecel', 'AirtelTigo'];
const categories = ['All', 'Daily', 'Weekly', 'Monthly', 'Night', 'Social'];

export default function Home() {
  const [selectedNetwork, setSelectedNetwork] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter logic
  const filteredBundles = bundles.filter(b => {
    const matchNetwork = selectedNetwork === 'All' || b.network === selectedNetwork;
    const matchCategory = selectedCategory === 'All' || b.type === selectedCategory;
    return matchNetwork && matchCategory;
  });

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">Data Guardian GH 🇬🇭</h1>
          <p className="text-slate-400 mt-2 text-sm">Compare prices. Save money. No hidden fees.</p>
        </header>

        {/* USSD Helper */}
        <section className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-8 shadow-lg">
          <h2 className="text-lg font-semibold text-white mb-1">Check for Hidden Subscriptions</h2>
          <p className="text-xs text-slate-400 mb-4">Tap your network to dial the USSD code directly.</p>
          <div className="grid grid-cols-3 gap-2">
            <a href="tel:*175%23" className="bg-yellow-500 hover:bg-yellow-400 text-yellow-950 font-bold py-3 rounded-xl text-center text-sm transition-colors shadow-sm">
              MTN<br/><span className="text-xs font-normal">*175#</span>
            </a>
            <a href="tel:*463%23" className="bg-red-500 hover:bg-red-400 text-white font-bold py-3 rounded-xl text-center text-sm transition-colors shadow-sm">
              Telecel<br/><span className="text-xs font-normal">*463#</span>
            </a>
            <a href="tel:*100%23" className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 rounded-xl text-center text-sm transition-colors shadow-sm">
              AirtelTigo<br/><span className="text-xs font-normal">*100#</span>
            </a>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-8 space-y-4">
          {/* Network Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Network</label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {networks.map(net => (
                <button
                  key={net}
                  onClick={() => setSelectedNetwork(net)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedNetwork === net 
                      ? 'bg-indigo-500 text-white border-indigo-500' 
                      : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {net}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Usage Type</label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-slate-200 text-slate-900' 
                      : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Bundle List */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-semibold text-white">Available Bundles</h2>
            <span className="text-xs text-slate-500">{filteredBundles.length} results</span>
          </div>
          
          <div className="space-y-3">
            {filteredBundles.length === 0 ? (
              <div className="text-center py-10 bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed">
                <p className="text-slate-400">No bundles match your filters.</p>
              </div>
            ) : (
              filteredBundles.map((b) => (
                <div key={b.id} className="bg-slate-800 border border-slate-700 p-4 rounded-2xl flex justify-between items-center shadow-sm hover:border-slate-500 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">{b.network}</span>
                      {b.type === 'Night' && <span className="bg-purple-900/50 text-purple-300 text-[10px] px-2 py-0.5 rounded-full font-medium">🌙 Night</span>}
                      {b.type === 'Social' && <span className="bg-pink-900/50 text-pink-300 text-[10px] px-2 py-0.5 rounded-full font-medium">📱 Social</span>}
                    </div>
                    <h3 className="font-semibold text-slate-100">{b.name}</h3>
                    <p className="text-sm text-slate-400 mt-0.5">{b.data} · {b.validity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">GH₵ {b.price.toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-slate-600 space-y-1 pb-8">
          <p>Prices are based on current market rates and may change.</p>
          <p>We do not sell data. We just help you keep your money.</p>
        </footer>
      </div>
    </main>
  );
}
