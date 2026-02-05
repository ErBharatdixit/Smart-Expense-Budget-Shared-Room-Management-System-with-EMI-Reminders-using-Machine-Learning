import React, { useState, useEffect } from 'react';
import {
      Plus,
      Search,
      Filter,
      Download,
      Trash2,
      FileText,
      X
} from 'lucide-react';
import expenseService from '../services/expenseService';

const Expenses = () => {
      const [expenses, setExpenses] = useState([]);
      const [filter, setFilter] = useState('All');
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [formData, setFormData] = useState({
            title: '',
            amount: '',
            category: 'Food',
            date: new Date().toISOString().split('T')[0]
      });

      const fetchExpenses = async () => {
            try {
                  const data = await expenseService.getExpenses();
                  setExpenses(data);
            } catch (error) {
                  console.error("Error fetching expenses:", error);
            }
      };

      useEffect(() => {
            fetchExpenses();
      }, []);

      const handleInputChange = (e) => {
            setFormData({ ...formData, [e.target.name]: e.target.value });
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                  await expenseService.createExpense(formData);
                  setIsModalOpen(false);
                  setFormData({
                        title: '',
                        amount: '',
                        category: 'Food',
                        date: new Date().toISOString().split('T')[0]
                  });
                  fetchExpenses(); // Refresh list
            } catch (error) {
                  console.error("Error creating expense:", error);
                  alert("Failed to add expense");
            }
      };

      const handleDelete = async (id) => {
            if (window.confirm("Are you sure you want to delete this expense?")) {
                  try {
                        await expenseService.deleteExpense(id);
                        fetchExpenses();
                  } catch (error) {
                        console.error("Error deleting expense:", error);
                  }
            }
      }

      // Filtered Expenses
      const filteredExpenses = filter === 'All'
            ? expenses
            : expenses.filter(exp => exp.category === filter);

      // Helper to get Icon based on category
      const getCategoryIcon = (category) => {
            switch (category) {
                  case 'Food': return '🍲';
                  case 'Chai/Sutta': return '☕';
                  case 'Travel': return '🚕';
                  case 'Auto/Rapido': return '🏍️';
                  case 'Entertainment': return '🎬';
                  case 'Bills': return '💡';
                  case 'Recharge/Data': return '📱';
                  case 'Shopping': return '🛍️';
                  case 'Health': return '🏥';
                  case 'Education': return '📚';
                  case 'Festival': return '🎆';
                  default: return '📝';
            }
      };

      return (
            <div className="space-y-8 relative">
                  {/* Header & Actions */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                              <h1 className="text-2xl font-bold text-white">Expenses</h1>
                              <p className="text-slate-400 text-sm mt-1">Manage and track your daily spending.</p>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                              <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20 font-medium"
                              >
                                    <Plus size={18} />
                                    <span>Add Expense</span>
                              </button>

                              <button className="flex items-center gap-2 px-4 py-2 glass-card text-slate-300 hover:text-white rounded-xl transition-all font-medium">
                                    <Download size={18} />
                                    <span className="hidden sm:inline">Export</span>
                              </button>
                        </div>
                  </div>

                  {/* Filters & Search */}
                  <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                              <input
                                    type="text"
                                    placeholder="Search expenses..."
                                    className="w-full bg-[#0B1120] border border-slate-700 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
                              />
                        </div>

                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                              {['All', 'Food', 'Chai/Sutta', 'Travel', 'Auto/Rapido', 'Bills', 'Recharge/Data', 'Shopping', 'Entertainment', 'Health', 'Festival', 'Other'].map((cat) => (
                                    <button
                                          key={cat}
                                          onClick={() => setFilter(cat)}
                                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${filter === cat
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                                : 'text-slate-400 hover:bg-[#0B1120] hover:text-slate-200'
                                                }`}
                                    >
                                          {cat}
                                    </button>
                              ))}
                        </div>
                  </div>

                  {/* Expense List */}
                  <div className="glass-card rounded-2xl overflow-hidden min-h-[400px]">
                        {filteredExpenses.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400">
                                    <FileText size={48} className="mb-4 opacity-20" />
                                    <p>No expenses found. Start adding some!</p>
                              </div>
                        ) : (
                              <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                          <thead>
                                                <tr className="border-b border-slate-700/50 text-slate-400 text-xs uppercase tracking-wider">
                                                      <th className="p-6 font-semibold">Expense</th>
                                                      <th className="p-6 font-semibold">Category</th>
                                                      <th className="p-6 font-semibold">Date</th>
                                                      <th className="p-6 font-semibold">Amount</th>
                                                      <th className="p-6 font-semibold text-right">Actions</th>
                                                </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-700/50">
                                                {filteredExpenses.map((expense) => (
                                                      <tr key={expense._id} className="group hover:bg-slate-800/30 transition-colors">
                                                            <td className="p-6">
                                                                  <div className="flex items-center gap-4">
                                                                        <div className="w-10 h-10 rounded-xl bg-[#0B1120] flex items-center justify-center text-lg">
                                                                              {getCategoryIcon(expense.category)}
                                                                        </div>
                                                                        <div>
                                                                              <p className="font-semibold text-white">{expense.title}</p>
                                                                        </div>
                                                                  </div>
                                                            </td>
                                                            <td className="p-6">
                                                                  <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                                                                        {expense.category}
                                                                  </span>
                                                            </td>
                                                            <td className="p-6 text-slate-400 text-sm">
                                                                  {new Date(expense.date).toLocaleDateString()}
                                                            </td>
                                                            <td className="p-6 font-bold text-white">
                                                                  ₹{expense.amount}
                                                            </td>
                                                            <td className="p-6 text-right">
                                                                  <button
                                                                        onClick={() => handleDelete(expense._id)}
                                                                        className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-slate-500"
                                                                  >
                                                                        <Trash2 size={18} />
                                                                  </button>
                                                            </td>
                                                      </tr>
                                                ))}
                                          </tbody>
                                    </table>
                              </div>
                        )}
                  </div>

                  {/* Add Expense Modal */}
                  {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                              <div className="bg-[#1E293B] w-full max-w-md p-6 rounded-2xl shadow-2xl border border-slate-700 m-4 animate-in fade-in zoom-in duration-200">
                                    <div className="flex justify-between items-center mb-6">
                                          <h2 className="text-xl font-bold text-white">Add New Expense</h2>
                                          <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                                                <X size={24} />
                                          </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                          <div>
                                                <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                                                <input
                                                      type="text"
                                                      name="title"
                                                      value={formData.title}
                                                      onChange={handleInputChange}
                                                      required
                                                      className="w-full bg-[#0B1120] border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                                                      placeholder="e.g. Grocery Shopping"
                                                />
                                                <button
                                                      type="button"
                                                      onClick={async () => {
                                                            if (!formData.title) return alert("Please enter a title first");
                                                            try {
                                                                  const data = await expenseService.predictCategory(formData.title);
                                                                  setFormData({ ...formData, category: data.category });
                                                            } catch (err) {
                                                                  console.error(err);
                                                                  alert("Could not predict category");
                                                            }
                                                      }}
                                                      className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                                                >
                                                      ✨ Auto-Categorize
                                                </button>
                                          </div>

                                          <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                      <label className="block text-sm font-medium text-slate-400 mb-1">Amount (₹)</label>
                                                      <input
                                                            type="number"
                                                            name="amount"
                                                            value={formData.amount}
                                                            onChange={handleInputChange}
                                                            required
                                                            className="w-full bg-[#0B1120] border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                                                            placeholder="0.00"
                                                      />
                                                </div>
                                                <div>
                                                      <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                                                      <select
                                                            name="category"
                                                            value={formData.category}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-[#0B1120] border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none appearance-none"
                                                      >
                                                            <option>Food</option>
                                                            <option>Chai/Sutta</option>
                                                            <option>Travel</option>
                                                            <option>Auto/Rapido</option>
                                                            <option>Entertainment</option>
                                                            <option>Bills</option>
                                                            <option>Recharge/Data</option>
                                                            <option>Shopping</option>
                                                            <option>Health</option>
                                                            <option>Education</option>
                                                            <option>Festival</option>
                                                            <option>Other</option>
                                                      </select>
                                                </div>
                                          </div>

                                          <div>
                                                <label className="block text-sm font-medium text-slate-400 mb-1">Date</label>
                                                <input
                                                      type="date"
                                                      name="date"
                                                      value={formData.date}
                                                      onChange={handleInputChange}
                                                      required
                                                      className="w-full bg-[#0B1120] border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                                                />
                                          </div>

                                          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-600/20 mt-4">
                                                Add Expense
                                          </button>
                                    </form>
                              </div>
                        </div>
                  )}

            </div>
      );
};

export default Expenses;
