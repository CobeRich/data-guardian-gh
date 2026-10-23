"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ✅ Moved outside the component to prevent multiple instances
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type Bundle = {
  id: number;
  network: string;
  name: string;
  price: number;     
  dataGb: number;    
  days: string | number; 
  type: string;      
  ussd_code: string;
  data: string;
  validity: string;
};

const networks = ['All', 'MTN', 'Telecel', 'AirtelTigo'];
const categories = ['All', 'Daily', 'Weekly', 'Monthly', 'Night', 'Social'];

export default function Home() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);

  const [myNetworks, setMyNetworks] = useState<string[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Calculator State
  const [calcGb, setCalcGb] = useState('');
  const [calcDays, setCalcDays] = useState('');
  const [recommendation, setRecommendation] = useState<Bundle | null | undefined>(undefined);
  const [adviceText, setAdviceText] = useState("");
  const [isPerfectMatch, setIsPerfectMatch] = useState(false);

  // Report Form State
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportNetwork, setReportNetwork] = useState('MTN');
  const [reportName, setReportName] = useState('');
  const [reportPrice, setReportPrice] = useState('');
  const [reportData, setReportData] = useState('');
  const [reportRemark, setReportRemark] = useState(''); // NEW: Remark state

  useEffect(() => {
    async function fetchBundles() {
      const { data, error } = await supabase.from("bundles").select("*");
      
      if (error) {
        console.error("Error fetching bundles:", error);
      } else if (data) {
        const formattedData = data.map((item) => {
          const isNumber = !isNaN(Number(item.days));
          
          return {
            ...item,
            price: Number(item.price), 
            dataGb: Number(item.dataGb), 
            days: isNumber ? Number(item.days) : item.days, 
            data: item.dataGb >= 1 ? `${item.dataGb}GB` : `${item.dataGb * 1000}MB`,
            // Using String() to safely compare without TypeScript errors
            validity: String(item.days) === '1' 
              ? '24 hours' 
              : isNumber 
                ? `${item.days} days` 
                : item.days, 
          };
        });
        setBundles(formattedData);
      }
      setLoading(false);
    }

    fetchBundles();
  }, []);

  const toggleNetwork = (network: string) => {
    const isAdding = !myNetworks.includes(network);
    const newNetworks = isAdding ? [...myNetworks, network] : myNetworks.filter(n => n !== network);
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

    const userNetworks = myNetworks.length > 0 ? myNetworks : ['MTN', 'Telecel', 'AirtelTigo'];

    const meetsDaysRequirement = (bundleDays: string | number) => {
      const numericDays = Number(bundleDays);
      if (isNaN(numericDays)) return true; 
      return numericDays >= reqDays;
    };

    const perfectOptions = bundles.filter(b => 
      b.dataGb >= reqGb && meetsDaysRequirement(b.days) && userNetworks.includes(b.network)
    );
    
    if (perfectOptions.length > 0) {
      perfectOptions.sort((a, b) => a.price - b.price);
      const best = perfectOptions[0];
      setRecommendation(best);
      setIsPerfectMatch(true);
      setAdviceText(`Perfect match! This bundle covers your ${reqGb}GB for ${reqDays} days requirement for the lowest price.`);
      return;
    }

    const closestOptions = bundles.filter(b => 
      b.dataGb >= reqGb && userNetworks.includes(b.network)
    );

    if (closestOptions.length > 0) {
      closestOptions.sort((a, b) => a.dataGb - b.dataGb);
      const best = closestOptions[0];
      setRecommendation(best);
      setIsPerfectMatch(false);
      setAdviceText(`No single bundle matches your exact days requirement. However, the ${best.network} ${best.name} gives you ${best.data} which covers your data needs, even if you have to renew it sooner.`);
      return;
    }

    const maxDataBundle = [...bundles].filter(b => userNetworks.includes(b.network)).sort((a, b) => b.dataGb - a.dataGb)[0];
    
    if (maxDataBundle) {
      const bundlesNeeded = Math.ceil(reqGb / maxDataBundle.dataGb);
      const totalCost = bundlesNeeded * maxDataBundle.price;
      
      setRecommendation(null);
      setIsPerfectMatch(false);
      setAdviceText(`No single bundle is big enough for ${reqGb}GB. You would need to buy ${bundlesNeeded} of the ${maxDataBundle.network} ${maxDataBundle.name} (${maxDataBundle.data} each). Total cost: GH₵ ${totalCost.toFixed(2)}.`);
    } else {
      setRecommendation(null);
      setIsPerfectMatch(false);
      setAdviceText("No bundles available for your selected network(s).");
    }
  };

  const handleWhatsAppSubmit = () => {
    const myPhoneNumber = "233243953395"; // ✅ Updated WhatsApp Number
    const message = `*New Bundle Report* 🚨\n\n*Network:* ${reportNetwork}\n*Bundle Name:* ${reportName}\n*Price:* GH₵ ${reportPrice}\n*Data Amount:* ${reportData}\n*Remark:* ${reportRemark || 'None'}\n\n_Sent from Data Guardian GH_`;
    window.open(`https://wa.me/${myPhoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    setIsReportOpen(false);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const myEmail = "achiawkoby@gmail.com"; // ✅ Updated Email
    const subject = `Bundle Report: ${reportNetwork} - ${reportName}`;
    const body = `Network: ${reportNetwork}\nBundle Name: ${reportName}\nPrice: GH₵ ${reportPrice}\nData Amount: ${reportData}\nRemark: ${reportRemark || 'None'}\n\nSent from Data Guardian GH`;
    window.location.href = `mailto:${myEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setIsReportOpen(false);
  };

  const handleCopyReport = () => {
    const message = `*New Bundle Report* 🚨\n\n*Network:* ${reportNetwork}\n*Bundle Name:* ${reportName}\n*Price:* GH₵ ${reportPrice}\n*Data Amount:* ${reportData}\n*Remark:* ${reportRemark || 'None'}\n\n_Sent from Data Guardian GH_`;
    navigator.clipboard.writeText(message);
    alert("Report copied to clipboard! You can now paste it anywhere.");
  };

  const filteredBundles = bundles.filter(b => {
    const matchSelectedNetwork = selectedNetwork === 'All' || b.network === selectedNetwork;
    const matchCategory = selectedCategory === 'All' || b.type === selectedCategory;
    return matchSelectedNetwork && matchCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <p className="animate-pulse">Loading bundles...</p>
      </div>
    );
  }

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
              <button key={net} onClick={() => toggleNetwork(net)} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                myNetworks.includes(net) ? 'bg-indigo-500 text-white shadow-md' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}>
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

        {/* STEP 3: Calculator & List */}
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

              {recommendation !== undefined && (
                <div className="mt-4 pt-4 border-t border-indigo-500/30">
                  {recommendation ? (
                    <div className="bg-indigo-500/20 border border-indigo-500/50 rounded-xl p-4">
                      <p className="text-xs text-indigo-300 font-bold uppercase mb-1">
                        {isPerfectMatch ? '🏆 Perfect Deal Found' : '💡 Closest Match Found'}
                      </p>
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <h4 className="font-bold text-white">{recommendation.name}</h4>
                          <p className="text-sm text-indigo-200">{recommendation.data} · {recommendation.validity}</p>
                        </div>
                        <p className="text-xl font-bold text-white">GH₵ {recommendation.price.toFixed(2)}</p>
                      </div>
                      <div className="bg-indigo-950/50 p-3 rounded-lg border border-indigo-500/30 mb-3">
                        <p className="text-xs text-indigo-200 leading-relaxed">
                          <strong className="text-white">Why this?</strong> {adviceText}
                        </p>
                      </div>
                      
                      <a 
                        href={`tel:${encodeURIComponent(recommendation.ussd_code || '*138#')}`}
                        className="w-full bg-green-600 hover:bg-green-500 text-white text-sm font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        Get Bundle Now
                      </a>
                    </div>
                  ) : (
                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4">
                      <p className="text-xs text-yellow-400 font-bold uppercase mb-2">💡 Bundle Combination Needed</p>
                      <p className="text-sm text-yellow-100/90 leading-relaxed">
                        {adviceText}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* MANUAL FILTERS */}
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
                      <div key={b.id} className={`border p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm transition-all relative ${
                          isPrimaryNetwork ? 'bg-slate-800 border-indigo-500/60 shadow-indigo-900/20' : 'bg-slate-800/40 border-slate-700 opacity-60 hover:opacity-100 hover:border-slate-500' 
                        }`}>
                        {isPrimaryNetwork && <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10">Your Network</span>}
                        
                        <div className="mb-3 sm:mb-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold uppercase tracking-wide ${isPrimaryNetwork ? 'text-indigo-400' : 'text-slate-400'}`}>{b.network}</span>
                            
                            {b.type === 'Night' && (
                              <span className="bg-purple-900/50 text-purple-300 text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1" title="Only valid between 12 AM and 5 AM">
                                🌙 Night (12AM-5AM)
                              </span>
                            )}
                            
                            {b.type === 'Social' && <span className="bg-pink-900/50 text-pink-300 text-[10px] px-2 py-0.5 rounded-full font-medium">📱 Social</span>}
                          </div>
                          <h3 className="font-semibold text-slate-100">{b.name}</h3>
                          <p className="text-sm text-slate-400 mt-0.5">{b.data} · {b.validity}</p>
                        </div>

                        <div className="text-right flex flex-row sm:flex-col justify-between w-full sm:w-auto items-center sm:items-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-700">
                          <p className="text-xl font-bold text-white mb-2 sm:mb-2">GH₵ {b.price.toFixed(2)}</p>
                          
                          <a 
                            href={`tel:${encodeURIComponent(b.ussd_code || (b.network === 'MTN' ? '*138#' : b.network === 'Telecel' ? '*700#' : '*111#'))}`}
                            className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-green-500 transition-colors flex items-center justify-center gap-1"
                          >
                            Get Bundle
                          </a>
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

        {/* 3. DATA SAVER PRO TIP */}
        <section className="mt-8 bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-2">
            💡 Pro Tip: Save Your Data
          </h3>
          <p className="text-xs text-yellow-100/80 leading-relaxed">
            Stop WhatsApp from eating your main data. Go to <strong>Settings &gt; Storage and Data &gt; Media Auto-Download</strong> and turn it off for Mobile Data.
          </p>
        </section>

        {/* CROWDSOURCE LINK */}
        <div className="mt-8 text-center">
          <button onClick={() => setIsReportOpen(true)} className="text-xs font-medium text-indigo-400 hover:text-indigo-300 underline underline-offset-4">
            Missing a bundle or price changed? Report it here
          </button>
        </div>

        <footer className="mt-8 text-center text-xs text-slate-600 space-y-1 pb-8">
          <p>Prices are based on current market rates and may change.</p>
          <p>We do not sell data. We just help you keep your money.</p>
        </footer>
      </div>

      {/* REPORT A PRICE MODAL */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsReportOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
            <h2 className="text-xl font-bold text-white mb-1">Report a Price</h2>
            <p className="text-xs text-slate-400 mb-5">Help keep Data Guardian accurate for everyone.</p>
            
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Network</label>
                <select value={reportNetwork} onChange={(e) => setReportNetwork(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white mt-1 text-sm focus:outline-none focus:border-indigo-500">
                  <option value="MTN">MTN</option>
                  <option value="Telecel">Telecel</option>
                  <option value="AirtelTigo">AirtelTigo</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Bundle Name</label>
                <input required type="text" placeholder="e.g. Mega Bundle" value={reportName} onChange={(e) => setReportName(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white mt-1 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase">Price (GH₵)</label>
                  <input required type="number" step="0.01" placeholder="e.g. 25.00" value={reportPrice} onChange={(e) => setReportPrice(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white mt-1 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase">Data Amount</label>
                  <input required type="text" placeholder="e.g. 10GB" value={reportData} onChange={(e) => setReportData(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white mt-1 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              {/* NEW: Remark Field */}
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Remark (Optional - Max 250 chars)</label>
                <textarea 
                  maxLength={250}
                  rows={3}
                  placeholder="e.g. The price changed on *138# yesterday, it is now GH₵ 6.00" 
                  value={reportRemark} 
                  onChange={(e) => setReportRemark(e.target.value)} 
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white mt-1 text-sm focus:outline-none focus:border-indigo-500 resize-none" 
                />
                <p className="text-[10px] text-slate-500 text-right mt-1">{reportRemark.length}/250</p>
              </div>
              
              <div className="pt-2">
                <button 
                  type="button" 
                  onClick={handleWhatsAppSubmit} 
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 mb-3"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Send via WhatsApp
                </button>
                
                <button 
                  type="button" 
                  onClick={handleEmailSubmit} 
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 mb-3"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  Send via Email
                </button>

                <button 
                  type="button" 
                  onClick={handleCopyReport} 
                  className="w-full text-slate-400 hover:text-white text-xs underline text-center transition-colors"
                >
                  Or copy report to clipboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
