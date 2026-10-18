"use client";

import { useState } from "react";

// Hardcoded data for the MVP.
const bundles = [
  { id: 1, network: 'MTN', name: 'Daily Starter', data: '500MB', price: 5.00, validity: '24 hours', type: 'Daily', dataGb: 0.5, days: 1 },
  { id: 2, network: 'MTN', name: 'Weekly Heavy', data: '10GB', price: 25.00, validity: '7 days', type: 'Weekly', dataGb: 10, days: 7 },
  { id: 3, network: 'MTN', name: 'Monthly Pro', data: '30GB', price: 60.00, validity: '30 days', type: 'Monthly', dataGb: 30, days: 30 },
  { id: 4, network: 'Telecel', name: 'Night King', data: '6GB', price: 5.00, validity: 'Midnight - 5 AM', type: 'Night', dataGb: 6, days: 1 },
  { id: 5, network: 'Telecel', name: 'WhatsApp Pass', data: '1GB', price: 4.50, validity: '7 days', type: 'Social', dataGb: 1, days: 7 },
  { id: 6, network: 'Telecel', name: 'Mega Bundle', data: '20GB', price: 50.00, validity: '30 days', type: 'Monthly', dataGb: 20, days: 30 },
  { id: 7, network: 'AirtelTigo', name: 'Weekly Standard', data: '5GB', price: 15.00, validity: '7 days', type: 'Weekly', dataGb: 5, days: 7 },
  { id: 8, network: 'AirtelTigo', name: 'Monthly Max', data: '40GB', price: 80.00, validity: '30 days', type: 'Monthly', dataGb: 40, days: 30 },
  { id: 9, network: 'AirtelTigo', name: 'Social Pack', data: '2GB', price: 8.00, validity: '7 days', type: 'Social', dataGb: 2, days: 7 },
];

const networks = ['All', 'MTN', 'Telecel', 'AirtelTigo'];
const categories = ['All', 'Daily', 'Weekly', 'Monthly', 'Night', 'Social'];

export default function Home() {
  const [myNetworks, setMyNetworks] = useState<string[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // --- DATA DIET CALCULATOR STATE ---
  const [calcGb, setCalcGb] = useState('');
  const [calcDays, setCalcDays] = useState('');
  const [recommendation, setRecommendation] = useState<typeof bundles[0] | null | undefined>(undefined);

  const toggleNetwork = (network: string) => {
    const isAdding = !myNetworks.includes(network);
    const newNetworks = isAdding 
      ? [...myNetworks, network] 
      : myNetworks.filter(n => n !== network);
    setMyNetworks(newNetworks);

    if (newNetworks.length === 0) setSelectedNetwork('All');
    else if (newNetworks.length === 1) setSelectedNetwork(newNetworks[0]);
    else setSelectedNetwork('All');
  };

  const handleCalculate = () => {
    const reqGb = parseFloat(calcGb);
    const reqDays = parseInt(calcDays);

    if (isNaN(reqGb) || isNaN(reqDays)) {
      alert("Please enter valid numbers for data and days.");
      return;
    }

    // Logic: Find bundles that meet or exceed the requirement, 
    // sorted by cheapest price.
    const validOptions = bundles.filter(b => 
      b.dataGb >= reqGb && 
      b.days >= reqDays &&
      (myNetworks.length === 0 || myNetworks.includes(b.network)) // Only from their networks
    );

    validOptions.sort((a, b) => a.price - b.price);

    if (validOptions.length > 0) {
      setRecommendation(validOptions[0]); // The cheapest valid option
    } else {
      setRecommendation(null); // No exact match, maybe suggest buying two?
    }
  };

  const filteredBundles = bundles.filter(b => {
    const matchSelectedNetwork = selectedNetwork === 'All' || b.network === selectedNetwork;
    const matchCategory = selectedCategory === 'All' || b.type === selectedCategory;
    return matchSelectedNetwork && matchCategory;
  });

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-md mx-auto">
        
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">Data Guardian GH 🇬🇭</h1>
          <p className="text-slate-400 mt-2 text-sm">Compare prices. Save money. No hidden fees.</p>
        </header>

        {/* STEP 1: Primary Network Selector */}
        <section className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-6 shadow-lg">
          <label className="text-sm font-medium text-white mb-1 block">1. Which networks do you use?</label>
          <p className="text-xs text-slate-400 mb-3">Select all that apply (Dual-SIM supported).</p>
          <div className="flex gap-2">
            {['MTN', 'Telecel', 'AirtelTigo'].map(net => (
              <button
                key={net}
                onClick={() => toggleNetwork(net)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  myNetworks.includes(net) ? 'bg-indigo-500 text-white shadow-md' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {myNetworks.includes(net) ? '✓ ' : ''}{net}
              </button>
            ))}
          </div>
        </section>

        {/* STEP 2: USSD Helper */}
        <section className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-6 shadow-lg">
          <h2 className="text-lg font-semibold text-white mb-1">2. Check for Hidden Subscriptions</h2>
          <p className="text-xs text-slate-400 mb-4">
            Tap your network to dial the code. 
            <span className="block mt-1 text-indigo-400 font-medium">Found an unwanted subscription? Reply "STOP" to the SMS to cancel it.</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            <a href="tel:*175%23" className={`py-3 rounded-xl text-center text-sm transition-all shadow-sm ${
                myNetworks.includes('MTN') ? 'bg-yellow-500 hover:bg-yellow-400 text-yellow-950 font-bold' : 'bg-slate-700/50 text-slate-500 font-medium cursor-not-allowed opacity-50'
              }`}>MTN<br/><span className="text-xs font-normal">*175#</span></a>
            <a href="tel:*463%23" className={`py-3 rounded-xl text-center text-sm transition-all shadow-sm ${
                myNetworks.includes('Telecel') ? 'bg-red-500 hover:bg-red-400 text-white font-bold' : 'bg-slate-700/50 text-slate-500 font-medium cursor-not-allowed opacity-50'
              }`}>Telecel<br/><span className="text-xs font-normal">*463#</span></a>
            <a href="tel:*100%23" className={`py-3 rounded-xl text-center text-sm transition-all shadow-sm ${
                myNetworks.includes('AirtelTigo') ? 'bg-blue-500 hover:bg-blue-400 text-white font-bold' : 'bg-slate-700/50 text-slate-500 font-medium cursor-not-allowed opacity-50'
              }`}>AirtelTigo<br/><span className="text-xs font-normal">*100#</span></a>
          </div>
        </section>

        {/* STEP 3: Find the Best Bundle */}
        {myNetworks.length > 0 ? (
          <>
            {/* DATA DIET CALCULATOR */}
            <section className="bg-indigo-900/20 border border-indigo-500/30 rounded-2xl p-5 mb-6 shadow-lg">
              <h2 className="text-lg font-semibold text-indigo-300 mb-1">3. Not sure what to buy?</h2>
              <p className="text-xs text-slate-400 mb-4">Tell us your needs and we'll find the cheapest option.</p>
              
              <div className="flex gap-2 mb-3">
                <div className="flex-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Data Needed (GB)</label>
                  <input type="number" placeholder="e.g. 5" value={calcGb} onChange={(e) => setCalcGb(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white mt-1 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">For How Many Days?</label>
                  <input type="number" placeholder="e.g. 7" value={calcDays} onChange={(e) => setCalcDays(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white mt-1 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
              
              <button onClick={handleCalculate} className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-2.5 rounded-lg text-sm transition-colors">
                Calculate Best Deal
              </button>

              {/* RECOMMENDATION RESULT */}
              {recommendation !== undefined && (
                <div className="mt-4 pt-4 border-t border-indigo-500/30">
                  {recommendation ? (
                    <div className="bg-indigo-500/20 border border-indigo-500/50 rounded-xl p-4">
                      <p className="text-xs text-indigo-300 font-bold uppercase mb-1">🏆 Best Deal Found</p>
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-white">{recommendation.name}</h4>
                          <p className="text-sm text-indigo-200">{recommendation.data} · {recommendation.validity}</p>
                        </div>
                        <p className="text-xl font-bold text-white">GH₵ {recommendation.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
                      <p className="text-sm text-red-300">No single bundle matches your needs. You might need to buy a combination of bundles.</p>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* MANUAL FILTERS & FULL LIST */}
            <section className="mb-6 space-y-4">
              <h2 className="text-lg font-semibold text-white mb-1">Or browse all bundles</h2>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Filter by specific network</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {networks.map(net => (
                    <button key={net} onClick={() => setSelectedNetwork(net)} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedNetwork === net ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                    }`}>{net}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Usage Type</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat ? 'bg-slate-200 text-slate-900' : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                    }`}>{cat}</button>
                  ))}
                </div>
              </div>
            </section>

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
                  filteredBundles.map((b) => {
                    const isPrimaryNetwork = myNetworks.includes(b.network);
                    return (
                      <div key={b.id} className={`border p-4 rounded-2xl flex justify-between items-center shadow-sm transition-all relative ${
                          isPrimaryNetwork ? 'bg-slate-800 border-indigo-500/60 shadow-indigo-900/20' : 'bg-slate-800/40 border-slate-700 opacity-60 hover:opacity-100 hover:border-slate-500' 
                        }`}>
                        {isPrimaryNetwork && <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">Your Network</span>}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold uppercase tracking-wide ${isPrimaryNetwork ? 'text-indigo-400' : 'text-slate-400'}`}>{b.network}</span>
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
                    );
                  })
                )}
              </div>
            </section>
          </>
        ) : (
          <div className="text-center py-12 px-6 bg-slate-800/30 rounded-2xl border border-slate-800 border-dashed">
            <p className="text-slate-400 font-medium">👆 Select your network(s) above</p>
            <p className="text-sm text-slate-500 mt-2">Select at least one network to see the best data bundles.</p>
          </div>
        )}

        <footer className="mt-12 text-center text-xs text-slate-600 space-y-1 pb-8">
          <p>Prices are based on current market rates and may change.</p>
          <p>We do not sell data. We just help you keep your money.</p>
        </footer>
      </div>
    </main>
  );
}
