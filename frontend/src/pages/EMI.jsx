import React, { useState, useEffect } from 'react';
import {
      CalendarClock,
      Plus,
      CheckCircle,
      AlertCircle,
      Smartphone,
      Shield,
      Zap,
      Clock,
      AlertOctagon,
      Trash2,
      X
} from 'lucide-react';
import reminderService from '../services/reminderService';

const EMI = () => {
      const [reminders, setReminders] = useState([]);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [formData, setFormData] = useState({
            title: '',
            amount: '',
            dueDate: '',
            category: 'Other'
      });

      const fetchReminders = async () => {
            try {
                  const data = await reminderService.getReminders();
                  setReminders(data);
            } catch (error) {
                  console.error("Error fetching reminders:", error);
            }
      };

      useEffect(() => {
            fetchReminders();
      }, []);

      const handleInputChange = (e) => {
            setFormData({ ...formData, [e.target.name]: e.target.value });
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                  await reminderService.createReminder(formData);
                  setIsModalOpen(false);
                  setFormData({
                        title: '',
                        amount: '',
                        dueDate: '',
                        category: 'Other'
                  });
                  fetchReminders();
            } catch (error) {
                  console.error("Error creating reminder:", error);
                  alert("Failed to create reminder");
            }
      };

      const markAsPaid = async (id) => {
            try {
                  await reminderService.updateReminder(id, { isPaid: true });
                  fetchReminders();
            } catch (error) {
                  console.error("Error updating reminder:", error);
            }
      };

      const handleDelete = async (id) => {
            if (window.confirm("Delete this reminder?")) {
                  try {
                        await reminderService.deleteReminder(id);
                        fetchReminders();
                  } catch (error) {
                        console.error("Error deleting reminder:", error);
                  }
            }
      }

      // Calculations
      const dueThisWeek = reminders
            .filter(r => !r.isPaid)
            .reduce((acc, curr) => acc + curr.amount, 0); // Simplified logic for demo, ideally check dates

      const paidThisMonth = reminders
            .filter(r => r.isPaid)
            .reduce((acc, curr) => acc + curr.amount, 0);

      const getStatus = (reminder) => {
            if (reminder.isPaid) return 'Paid';
            const due = new Date(reminder.dueDate);
            const today = new Date();
            if (due < today) return 'Overdue';
            return 'Due Soon';
      };

      const getStatusStyle = (status) => {
            switch (status) {
                  case 'Paid':
                        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
                  case 'Due Soon':
                        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
                  case 'Overdue':
                        return 'bg-red-500/10 text-red-500 border-red-500/20 animate-shake';
                  default:
                        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            }
      };

      const getIcon = (category) => {
            switch (category) {
                  case 'EMI': return Smartphone;
                  case 'Insurance': return Shield;
                  case 'Bill': return Zap;
                  default: return CalendarClock;
            }
      };

      return (
            <div className="space-y-8 relative">
                  {/* Header */}
                  <div className="flex justify-between items-center">
                        <div>
                              <h1 className="text-2xl font-bold text-white">EMI & Reminders</h1>
                              <p className="text-slate-400 text-sm mt-1">Never miss a payment due date.</p>
                        </div>
                        <button
                              onClick={() => setIsModalOpen(true)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20 font-medium"
                        >
                              <Plus size={18} />
                              <span>Add Reminder</span>
                        </button>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card p-6 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
                              <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500">
                                          <Clock size={20} />
                                    </div>
                                    <p className="text-slate-300 font-medium">Total Pending</p>
                              </div>
                              <p className="text-2xl font-bold text-white">₹{dueThisWeek.toLocaleString()}</p>
                        </div>

                        <div className="glass-card p-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
                              <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-500">
                                          <CheckCircle size={20} />
                                    </div>
                                    <p className="text-slate-300 font-medium">Paid (Total)</p>
                              </div>
                              <p className="text-2xl font-bold text-white">₹{paidThisMonth.toLocaleString()}</p>
                        </div>

                        <div className="glass-card p-6 rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent">
                              <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-red-500/20 text-red-500">
                                          <AlertOctagon size={20} />
                                    </div>
                                    <p className="text-slate-300 font-medium">Action Needed</p>
                              </div>
                              <p className="text-2xl font-bold text-white">{reminders.filter(r => !r.isPaid).length} Items</p>
                        </div>
                  </div>

                  {/* Reminders List */}
                  <div className="glass-card rounded-2xl overflow-hidden p-6 min-h-[400px]">
                        <h3 className="text-lg font-bold text-white mb-6">Upcoming Payments</h3>
                        {reminders.length === 0 ? (
                              <div className="text-center text-slate-500 py-10">No reminders set. Add one to get started!</div>
                        ) : (
                              <div className="space-y-4">
                                    {reminders.map((item) => {
                                          const status = getStatus(item);
                                          const Icon = getIcon(item.category);

                                          return (
                                                <div key={item._id} className={`flex flex-col md:flex-row items-center justify-between p-4 rounded-2xl border transition-all hover:bg-slate-800/30 ${status === 'Overdue' ? 'border-red-500/30 bg-red-500/5' : 'border-slate-700/50 bg-[#0B1120]/50'}`}>
                                                      <div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
                                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg bg-slate-800 text-slate-300 border border-slate-700`}>
                                                                  <Icon size={24} />
                                                            </div>
                                                            <div>
                                                                  <h4 className="font-bold text-white text-lg">{item.title}</h4>
                                                                  <p className={`text-sm font-medium ${status === 'Overdue' ? 'text-red-400' : 'text-slate-400'}`}>
                                                                        Due: {new Date(item.dueDate).toLocaleDateString()}
                                                                  </p>
                                                            </div>
                                                      </div>

                                                      <div className="flex items-center justify-between w-full md:w-auto gap-8">
                                                            <div className="text-right">
                                                                  <p className="text-xl font-bold text-white">₹{item.amount.toLocaleString()}</p>
                                                            </div>

                                                            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusStyle(status)}`}>
                                                                  {status}
                                                            </div>

                                                            <div className="flex gap-2">
                                                                  {!item.isPaid && (
                                                                        <button
                                                                              onClick={() => markAsPaid(item._id)}
                                                                              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-lg shadow-emerald-600/20"
                                                                              title="Mark as Paid"
                                                                        >
                                                                              <CheckCircle size={18} />
                                                                        </button>
                                                                  )}
                                                                  <button
                                                                        onClick={() => handleDelete(item._id)}
                                                                        className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                                                                  >
                                                                        <Trash2 size={18} />
                                                                  </button>
                                                            </div>
                                                      </div>
                                                </div>
                                          )
                                    })}
                              </div>
                        )}
                  </div>

                  {/* Add Reminder Modal */}
                  {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                              <div className="bg-[#1E293B] w-full max-w-md p-6 rounded-2xl shadow-2xl border border-slate-700 m-4 animate-in fade-in zoom-in duration-200">
                                    <div className="flex justify-between items-center mb-6">
                                          <h2 className="text-xl font-bold text-white">Add Reminder</h2>
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
                                                      placeholder="e.g. Car EMI"
                                                />
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
                                                            <option>EMI</option>
                                                            <option>Bill</option>
                                                            <option>Subscription</option>
                                                            <option>Insurance</option>
                                                            <option>Other</option>
                                                      </select>
                                                </div>
                                          </div>

                                          <div>
                                                <label className="block text-sm font-medium text-slate-400 mb-1">Due Date</label>
                                                <input
                                                      type="date"
                                                      name="dueDate"
                                                      value={formData.dueDate}
                                                      onChange={handleInputChange}
                                                      required
                                                      className="w-full bg-[#0B1120] border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                                                />
                                          </div>

                                          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-600/20 mt-4">
                                                Add Reminder
                                          </button>
                                    </form>
                              </div>
                        </div>
                  )}

                  <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
            </div>
      );
};

export default EMI;
