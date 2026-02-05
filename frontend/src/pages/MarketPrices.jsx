import React, { useState, useEffect } from 'react';
import {
      TrendingUp,
      TrendingDown,
      Minus,
      ChevronRight,
      Search,
      Filter,
      Info,
      LineChart,
      AlertTriangle,
      BarChart3,
      RefreshCw
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import marketService from '../services/marketService';
import { toast } from 'react-hot-toast'; // Assuming toast is used for notifications
import {
      Chart as ChartJS,
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      Title,
      Tooltip,
      Legend,
      Filler
} from 'chart.js';

ChartJS.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      Title,
      Tooltip,
      Legend,
      Filler
);

const MarketPrices = () => {
      const [products, setProducts] = useState([]);
      const [loading, setLoading] = useState(true);
      const [searchTerm, setSearchTerm] = useState('');
      const [selectedCategory, setSelectedCategory] = useState('All');
      const [selectedProduct, setSelectedProduct] = useState(null);
      const [history, setHistory] = useState([]);
      const [prediction, setPrediction] = useState(null);
      const [predictionLoading, setPredictionLoading] = useState(false);
      const [syncing, setSyncing] = useState(false);

      const fetchData = async () => {
            try {
                  let data = await marketService.getProducts();
                  if (Array.isArray(data) && data.length === 0) {
                        // Auto-seed if first time
                        await marketService.seedData();
                        data = await marketService.getProducts();
                  }

                  if (Array.isArray(data)) {
                        setProducts(data);
                  } else {
                        console.error("Market data is not an array:", data);
                        setProducts([]);
                  }
            } catch (error) {
                  console.error("Error fetching market data:", error);
            } finally {
                  setLoading(false);
            }
      };

      const handleSync = async () => {
            setSyncing(true);
            try {
                  const res = await marketService.syncData();
                  toast.success(res.message);
                  await fetchData();
            } catch (error) {
                  console.error("Sync error:", error);
                  toast.error("Failed to sync with Government API");
            } finally {
                  setSyncing(false);
            }
      };

      useEffect(() => {
            fetchData();
      }, []);

      const viewDetails = async (product) => {
            setSelectedProduct(product);
            setPrediction(null);
            setPredictionLoading(true);
            try {
                  const hist = await marketService.getHistory(product._id);
                  setHistory(hist);
                  const pred = await marketService.getPrediction(product._id);
                  setPrediction(pred);
            } catch (error) {
                  console.error("Error fetching details:", error);
            } finally {
                  setPredictionLoading(false);
            }
      };

      const categories = ['All', 'Kitchen Essentials', 'Vegetables', 'Bathroom / Daily Care'];

      const filteredProducts = (Array.isArray(products) ? products : []).filter(p => {
            const matchesSearch = p.name ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
            const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
            return matchesSearch && matchesCategory;
      });

      const getTrendIcon = (trend) => {
            switch (trend) {
                  case 'Increasing': return <TrendingUp className="text-red-500" size={16} />;
                  case 'Decreasing': return <TrendingDown className="text-emerald-500" size={16} />;
                  default: return <Minus className="text-slate-400" size={16} />;
            }
      };

      const chartData = {
            labels: history.map(h => new Date(h.date).toLocaleDateString()),
            datasets: [
                  {
                        label: 'Market Price (₹)',
                        data: history.map(h => h.price),
                        fill: true,
                        borderColor: 'rgba(59, 130, 246, 1)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                  }
            ]
      };

      if (loading) return <div className="text-white text-center py-20">Analyzing market trends...</div>;

      return (
            <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                              <h1 className="text-2xl font-bold text-white">Daily-Use Market Analyzer</h1>
                              <p className="text-slate-400 text-sm mt-1">Smart price tracking & ML-based trend prediction for daily items.</p>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                              <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                          type="text"
                                          placeholder="Search product..."
                                          className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white focus:border-blue-500 outline-none transition-all"
                                          value={searchTerm}
                                          onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                              </div>
                              <select
                                    className="bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                              >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>

                              <button
                                    onClick={handleSync}
                                    disabled={syncing}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${syncing
                                          ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                                          : 'bg-blue-600/10 border-blue-500/20 text-blue-400 hover:bg-blue-600 hover:text-white border-blue-600'
                                          }`}
                              >
                                    <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                                    <span className="font-medium text-sm hidden sm:inline">
                                          {syncing ? 'Syncing...' : 'Sync Live'}
                                    </span>
                              </button>
                        </div>
                  </div>

                  {/* Market Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                              <div
                                    key={product._id}
                                    className="glass-card p-6 rounded-2xl border border-slate-700/50 hover:border-blue-500/30 transition-all group cursor-pointer"
                                    onClick={() => viewDetails(product)}
                              >
                                    <div className="flex justify-between items-start mb-4">
                                          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-2xl">
                                                {product.name === 'Milk' ? '🥛' :
                                                      product.name === 'Rice' ? '🍚' :
                                                            product.name === 'Onion' ? '🧅' :
                                                                  product.name === 'Tomato' ? '🍅' :
                                                                        product.name === 'Potato' ? '🥔' : '📦'}
                                          </div>
                                          <div className={`p-1.5 rounded-lg bg-slate-800/50`}>
                                                {getTrendIcon(product.trend)}
                                          </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-1">{product.name}</h3>
                                    <p className="text-xs text-slate-500 mb-4">{product.category} • {product.unit}</p>

                                    <div className="flex justify-between items-end">
                                          <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Rate</p>
                                                <p className="text-xl font-bold text-white">₹{product.currentPrice.toFixed(1)}</p>
                                          </div>
                                          <div className="flex items-center gap-1 text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                Analyze <ChevronRight size={16} />
                                          </div>
                                    </div>
                              </div>
                        ))}
                  </div>

                  {/* Prediction Modal / Detail Modal */}
                  {selectedProduct && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                              <div className="bg-[#0B1120] border border-slate-700 w-full max-w-4xl p-8 rounded-3xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
                                    <button
                                          onClick={() => setSelectedProduct(null)}
                                          className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
                                    >
                                          ✕
                                    </button>

                                    <div className="flex flex-col md:flex-row gap-8">
                                          {/* Left Info Column */}
                                          <div className="md:w-1/3 space-y-6">
                                                <div>
                                                      <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest">
                                                            {selectedProduct.category}
                                                      </span>
                                                      <h2 className="text-3xl font-bold text-white mt-4">{selectedProduct.name}</h2>
                                                      <p className="text-slate-400 mt-1">Market Trend Analysis</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Current</p>
                                                            <p className="text-xl font-bold text-white">₹{selectedProduct.currentPrice.toFixed(1)}</p>
                                                      </div>
                                                      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Unit</p>
                                                            <p className="text-xl font-bold text-slate-300">1 {selectedProduct.unit}</p>
                                                      </div>
                                                </div>

                                                {predictionLoading ? (
                                                      <div className="p-6 bg-blue-600/5 rounded-2xl border border-blue-600/20 text-center">
                                                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                                            <p className="text-sm text-blue-400">ML Engine Predicting...</p>
                                                      </div>
                                                ) : prediction && (
                                                      <div className="p-6 bg-purple-600/5 rounded-2xl border border-purple-600/20 relative overflow-hidden group">
                                                            <div className="absolute top-0 right-0 p-2 opacity-20"><LineChart size={40} /></div>
                                                            <p className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                                                  <BarChart3 size={14} /> AI Forecast (Next Week)
                                                            </p>
                                                            <div className="flex items-end gap-2 mb-2">
                                                                  <p className="text-3xl font-bold text-white">₹{prediction.prediction.toFixed(1)}</p>
                                                                  <span className={`text-sm font-bold flex items-center gap-1 ${prediction.trend === 'Increasing' ? 'text-red-400' : 'text-emerald-400'}`}>
                                                                        {prediction.trend} {prediction.trend === 'Increasing' ? '↑' : '↓'}
                                                                  </span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 leading-relaxed">
                                                                  Based on historical market rates and weighted seasonal trends.
                                                            </p>
                                                      </div>
                                                )}

                                                <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 flex gap-3">
                                                      <AlertTriangle className="text-amber-500 flex-shrink-0" size={20} />
                                                      <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                                            *Data sourced from open market simulations mimicking Government mandis. Rates may vary slightly in local retail.
                                                      </p>
                                                </div>
                                          </div>

                                          {/* Right Chart Column */}
                                          <div className="md:flex-1">
                                                <div className="h-[400px] w-full">
                                                      <Line
                                                            data={chartData}
                                                            options={{
                                                                  maintainAspectRatio: false,
                                                                  scales: {
                                                                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } },
                                                                        x: { grid: { display: false }, ticks: { color: '#64748b' } }
                                                                  },
                                                                  plugins: {
                                                                        legend: { display: false }
                                                                  }
                                                            }}
                                                      />
                                                </div>
                                          </div>
                                    </div>
                              </div>
                        </div>
                  )}
            </div>
      );
};

export default MarketPrices;
