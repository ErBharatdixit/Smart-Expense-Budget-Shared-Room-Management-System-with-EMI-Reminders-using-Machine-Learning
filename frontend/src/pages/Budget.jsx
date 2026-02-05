import React, { useState, useEffect } from 'react';
import {
      PieChart,
      AlertTriangle,
      CheckCircle,
      TrendingUp,
      Edit3,
      X,
      Plus
} from 'lucide-react';
import budgetService from '../services/budgetService';

const Budget = () => {
      const [budgets, setBudgets] = useState([]);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [formData, setFormData] = useState({
            category: 'Food',
            amount: ''
      });

      const fetchBudgets = async () => {
            try {
                  const data = await budgetService.getBudgets();
                  setBudgets(data);
            } catch (error) {
                  console.error("Error fetching budgets:", error);
            }
      };

      useEffect(() => {
            fetchBudgets();
      }, []);

      const handleInputChange = (e) => {
            setFormData({ ...formData, [e.target.name]: e.target.value });
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                  await budgetService.setBudget(formData);
                  setIsModalOpen(false);
                  setFormData({ category: 'Food', amount: '' });
                  fetchBudgets();
            } catch (error) {
                  console.error("Error setting budget:", error);
                  alert("Failed to set budget");
            }
      };

      // Calculations
      const totalBudget = budgets.reduce((acc, curr) => acc + curr.amount, 0);
      const totalSpent = budgets.reduce((acc, curr) => acc + (curr.spent || 0), 0);
      const totalPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

      // Helper for colors
      const getCategoryColor = (category) => {
            switch (category) {
                  case 'Food': return { bg: 'bg-red-500', text: 'text-red-500' };
                  case 'Travel': return { bg: 'bg-blue-500', text: 'text-blue-500' };
                  case 'Entertainment': return { bg: 'bg-purple-500', text: 'text-purple-500' };
                  case 'Bills': return { bg: 'bg-emerald-500', text: 'text-emerald-500' };
                  default: return { bg: 'bg-slate-500', text: 'text-slate-500' };
            }
      };

      return (
            <div className="space-y-8 relative">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                              <h1 className="text-2xl font-bold text-white">Budget Management</h1>
                              <p className="text-slate-400 text-sm mt-1">Track your monthly spending limits.</p>
                        </div>
                        <button
                              onClick={() => setIsModalOpen(true)}
                              className="flex items-center gap-2 px-4 py-2 border border-slate-600 hover:bg-slate-800 text-slate-300 rounded-xl transition-all font-medium text-sm"
                        >
                              <Edit3 size={16} />
                              Set Monthly Budget
                        </button>
                  </div>

                  {/* Main Budget Overview */}
                  <div className="glass-card p-8 rounded-2xl relative overflow-hidden">
                        {/* Background Gradient */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none"></div>

                        <div className="relative z-10">
                              <div className="flex justify-between items-end mb-4">
                                    <div>
                                          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Total Budget Used</p>
                                          <h2 className="text-4xl font-bold text-white">
                                                {totalPercentage}% <span className="text-lg text-slate-500 font-normal">of ₹{totalBudget.toLocaleString()}</span>
                                          </h2>
                                    </div>
                                    <div className="text-right">
                                          <p className="text-xl font-bold text-white">₹{totalSpent.toLocaleString()}</p>
                                          <p className="text-sm text-slate-400">Spent so far</p>
                                    </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="w-full h-4 bg-[#0B1120] rounded-full overflow-hidden shadow-inner">
                                    <div
                                          className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-blue-600 to-purple-600`}
                                          style={{ width: `${Math.min(100, totalPercentage)}%` }}
                                    ></div>
                              </div>

                              <div className="mt-6 flex gap-4">
                                    {totalPercentage > 90 ? (
                                          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium w-full">
                                                <AlertTriangle size={20} />
                                                You have almost utilized your monthly budget!
                                          </div>
                                    ) : (
                                          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium w-full">
                                                <CheckCircle size={20} />
                                                You are well within your budget limits.
                                          </div>
                                    )}
                              </div>
                        </div>
                  </div>

                  {/* Category Budgets Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {budgets.map((budget, index) => {
                              const spent = budget.spent || 0;
                              // If amount is 0, avoid division by zero
                              const catPercent = budget.amount > 0 ? Math.min(100, Math.round((spent / budget.amount) * 100)) : 0;
                              const isDanger = catPercent > 90;
                              const { bg, text } = getCategoryColor(budget.category);

                              return (
                                    <div key={index} className="glass-card p-6 rounded-2xl">
                                          <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                      <div className={`w-3 h-3 rounded-full ${bg}`}></div>
                                                      <h3 className="font-semibold text-white">{budget.category}</h3>
                                                </div>
                                                <span className={`text-xs font-bold px-2 py-1 rounded-lg bg-slate-800 ${isDanger ? 'text-red-500' : 'text-slate-300'}`}>
                                                      {catPercent}%
                                                </span>
                                          </div>

                                          <div className="flex justify-between items-end mb-2">
                                                <p className="text-2xl font-bold text-white">₹{spent.toLocaleString()}</p>
                                                <p className="text-xs text-slate-400">Target: ₹{budget.amount.toLocaleString()}</p>
                                          </div>

                                          <div className="w-full h-2 bg-[#0B1120] rounded-full overflow-hidden">
                                                <div
                                                      className={`h-full rounded-full transition-all duration-1000 ${bg} ${isDanger ? 'animate-pulse' : ''}`}
                                                      style={{ width: `${catPercent}%` }}
                                                ></div>
                                          </div>
                                    </div>
                              );
                        })}

                        {budgets.length === 0 && (
                              <div className="col-span-2 flex flex-col items-center justify-center p-10 text-slate-400 border border-dashed border-slate-700 rounded-2xl">
                                    <p>No budgets set yet.</p>
                                    <button onClick={() => setIsModalOpen(true)} className="text-blue-500 hover:text-blue-400 mt-2 font-medium">Set a Budget</button>
                              </div>
                        )}
                  </div>

                  {/* Set Budget Modal */}
                  {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                              <div className="bg-[#1E293B] w-full max-w-md p-6 rounded-2xl shadow-2xl border border-slate-700 m-4 animate-in fade-in zoom-in duration-200">
                                    <div className="flex justify-between items-center mb-6">
                                          <h2 className="text-xl font-bold text-white">Set Monthly Budget</h2>
                                          <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                                                <X size={24} />
                                          </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                          <div>
                                                <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                                                <select
                                                      name="category"
                                                      value={formData.category}
                                                      onChange={handleInputChange}
                                                      className="w-full bg-[#0B1120] border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none appearance-none"
                                                >
                                                      <option>Food</option>
                                                      <option>Travel</option>
                                                      <option>Entertainment</option>
                                                      <option>Bills</option>
                                                      <option>Shopping</option>
                                                      <option>Health</option>
                                                      <option>Education</option>
                                                      <option>Other</option>
                                                </select>
                                          </div>

                                          <div>
                                                <label className="block text-sm font-medium text-slate-400 mb-1">Budget Amount (₹)</label>
                                                <input
                                                      type="number"
                                                      name="amount"
                                                      value={formData.amount}
                                                      onChange={handleInputChange}
                                                      required
                                                      className="w-full bg-[#0B1120] border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                                                      placeholder="e.g. 5000"
                                                />
                                          </div>

                                          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-600/20 mt-4">
                                                Save Budget
                                          </button>
                                    </form>
                              </div>
                        </div>
                  )}

            </div>
      );
};

export default Budget;
