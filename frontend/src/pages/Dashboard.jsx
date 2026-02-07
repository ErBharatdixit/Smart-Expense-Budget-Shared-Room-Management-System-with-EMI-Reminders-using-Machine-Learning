import React, { useState, useEffect } from 'react';
import {
      TrendingUp,
      TrendingDown,
      Wallet,
      Target,
      Bell,
      Search,
      Calendar,
      Users,
      CheckCircle,
      Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Pie, Line } from 'react-chartjs-2';
import {
      Chart as ChartJS,
      ArcElement,
      Tooltip,
      Legend,
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      Title,
      Filler
} from 'chart.js';
import expenseService from '../services/expenseService';
import budgetService from '../services/budgetService';
import reminderService from '../services/reminderService';
import roomService from '../services/roomService';

ChartJS.register(
      ArcElement,
      Tooltip,
      Legend,
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      Title,
      Filler
);

const Dashboard = () => {
      const { user } = useAuth();
      const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      const [loading, setLoading] = useState(true);
      const [stats, setStats] = useState({
            totalExpense: 0,
            budgetLeft: 0,
            totalBudget: 0,
            upcomingEMI: 0,
            sharedBalance: 0
      });
      const [recentTransactions, setRecentTransactions] = useState([]);
      const [chartData, setChartData] = useState({
            labels: [],
            datasets: [{ data: [], backgroundColor: [] }]
      });
      const [predictedNextMonth, setPredictedNextMonth] = useState(null);
      const [lineChartData, setLineChartData] = useState({
            labels: [],
            datasets: []
      });

      const [insights, setInsights] = useState(null);
      const [showElim10, setShowElim10] = useState(false);
      const [showNotifications, setShowNotifications] = useState(false);
      const [showCalendar, setShowCalendar] = useState(false);
      const [reminders, setReminders] = useState([]);

      useEffect(() => {
            const loadDashboardData = async () => {
                  try {
                        // Fetch all data in parallel
                        const [expensesData, budgetsData, remindersData, roomData, insightsData] = await Promise.all([
                              expenseService.getExpenses(),
                              budgetService.getBudgets(),
                              reminderService.getReminders(),
                              roomService.getMyRoom().catch(() => null),
                              expenseService.getInsights().catch(() => null)
                        ]);

                        if (insightsData) {
                              setInsights(insightsData);
                              setPredictedNextMonth(insightsData.prediction);
                        }

                        setReminders(remindersData);

                        // 1. Calculate Total Expense (This Month)
                        const currentMonth = new Date().getMonth();
                        const currentYear = new Date().getFullYear();

                        const thisMonthExpenses = expensesData.filter(e => {
                              const d = new Date(e.date);
                              return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                        });

                        const totalExpense = thisMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);

                        // 2. Calculate Budget Left
                        // budgetsData returns array of { category, amount, validSpent } (from our controller aggregation if implemented, or we calculate)
                        // The controller returns budgets with a 'spending' field usually if we did aggregation, 
                        // but our budgetController returns { _id, totalSpent } separately or merged.
                        // Let's re-calculate from expenses to be safe or rely on what budgetService returns.
                        // Our budgetController.getBudgets returns [{ ...budgetDoc, spent: x }]

                        const totalBudget = budgetsData.reduce((acc, curr) => acc + curr.amount, 0);
                        const totalBudgetSpent = budgetsData.reduce((acc, curr) => acc + (curr.spent || 0), 0);
                        // Approximate global budget left (Total Budget - Total Spent)
                        const budgetLeft = Math.max(0, totalBudget - totalBudgetSpent);

                        // 3. Upcoming EMI (Next 7 days)
                        const today = new Date();
                        const nextWeek = new Date();
                        nextWeek.setDate(today.getDate() + 7);

                        const upcomingEMI = remindersData
                              .filter(r => !r.isPaid && new Date(r.dueDate) >= today && new Date(r.dueDate) <= nextWeek)
                              .reduce((acc, curr) => acc + curr.amount, 0);

                        // 4. Shared Balance
                        let sharedBalance = 0;
                        if (roomData) {
                              const memberCount = roomData.members.length;
                              const totalRoomExpense = roomData.expenses.reduce((acc, curr) => acc + curr.amount, 0);
                              const perPersonShare = memberCount > 0 ? totalRoomExpense / memberCount : 0;

                              const myPaid = roomData.expenses
                                    .filter(e => e.paidBy._id === user.id || e.paidBy === user.id)
                                    .reduce((acc, curr) => acc + curr.amount, 0);

                              sharedBalance = myPaid - perPersonShare;
                        }

                        setStats({
                              totalExpense,
                              budgetLeft,
                              totalBudget,
                              upcomingEMI,
                              sharedBalance
                        });

                        // 5. Recent Transactions
                        setRecentTransactions(expensesData.slice(0, 5));

                        // 6. Chart Data (Category Split)
                        const categoryTotals = {};
                        thisMonthExpenses.forEach(e => {
                              categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
                        });

                        setChartData({
                              labels: Object.keys(categoryTotals),
                              datasets: [{
                                    data: Object.values(categoryTotals),
                                    backgroundColor: [
                                          'rgba(239, 68, 68, 0.7)',
                                          'rgba(59, 130, 246, 0.7)',
                                          'rgba(245, 158, 11, 0.7)',
                                          'rgba(168, 85, 247, 0.7)',
                                          'rgba(16, 185, 129, 0.7)',
                                          'rgba(236, 72, 153, 0.7)'
                                    ],
                                    borderColor: [
                                          'rgba(239, 68, 68, 1)',
                                          'rgba(59, 130, 246, 1)',
                                          'rgba(245, 158, 11, 1)',
                                          'rgba(168, 85, 247, 1)',
                                          'rgba(16, 185, 129, 1)',
                                          'rgba(236, 72, 153, 1)'
                                    ],
                                    borderWidth: 1,
                              }]
                        });

                        // 7. Monthly Trend for Line Chart (Last 6 Months)
                        const months = [];
                        const last6Months = [];
                        for (let i = 5; i >= 0; i--) {
                              const d = new Date();
                              d.setMonth(d.getMonth() - i);
                              const monthName = d.toLocaleString('default', { month: 'short' });
                              months.push(monthName);
                              last6Months.push({
                                    month: d.getMonth(),
                                    year: d.getFullYear(),
                                    total: 0
                              });
                        }

                        expensesData.forEach(e => {
                              const ed = new Date(e.date);
                              last6Months.forEach(m => {
                                    if (ed.getMonth() === m.month && ed.getFullYear() === m.year) {
                                          m.total += e.amount;
                                    }
                              });
                        });

                        setLineChartData({
                              labels: months,
                              datasets: [
                                    {
                                          label: 'Monthly Expenses',
                                          data: last6Months.map(m => m.total),
                                          fill: true,
                                          borderColor: 'rgba(59, 130, 246, 1)',
                                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                          tension: 0.4,
                                          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                                          pointBorderColor: '#fff',
                                          pointHoverBackgroundColor: '#fff',
                                          pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
                                    }
                              ]
                        });

                        setLoading(false);

                  } catch (error) {
                        console.error("Error loading dashboard data:", error);
                        setLoading(false);
                  }
            };

            loadDashboardData();
      }, [user]);

      const statCards = [
            {
                  label: 'Total Expense',
                  value: `₹${stats.totalExpense.toLocaleString()}`,
                  sub: 'This Month',
                  icon: TrendingDown,
                  color: 'text-red-500',
                  bg: 'bg-red-500/10',
                  border: 'border-red-500/20'
            },
            {
                  label: 'Budget Left',
                  value: `₹${stats.budgetLeft.toLocaleString()}`,
                  sub: `of ₹${stats.totalBudget.toLocaleString()}`,
                  icon: Target,
                  color: 'text-emerald-500',
                  bg: 'bg-emerald-500/10',
                  border: 'border-emerald-500/20'
            },
            {
                  label: 'Upcoming EMI',
                  value: `₹${stats.upcomingEMI.toLocaleString()}`,
                  sub: 'Next 7 Days',
                  icon: Calendar,
                  color: 'text-amber-500',
                  bg: 'bg-amber-500/10',
                  border: 'border-amber-500/20'
            },
            {
                  label: 'Shared Balance',
                  value: `₹${Math.abs(stats.sharedBalance).toFixed(0)}`,
                  sub: stats.sharedBalance >= 0 ? 'You are owed' : 'You owe',
                  icon: Users,
                  color: stats.sharedBalance >= 0 ? 'text-blue-500' : 'text-red-500',
                  bg: stats.sharedBalance >= 0 ? 'bg-blue-500/10' : 'bg-red-500/10',
                  border: stats.sharedBalance >= 0 ? 'border-blue-500/20' : 'border-red-500/20'
            },
      ];

      if (loading) return <div className="text-white text-center py-20">Loading Dashboard...</div>;

      return (
            <div className="space-y-8 animate-in fade-in duration-500">
                  {/* Top Header */}
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                              <h1 className="text-xl md:text-2xl font-bold text-white">
                                    Good Evening, {user?.name?.split(' ')[0]} 👋
                              </h1>
                              <p className="text-slate-400 text-sm mt-1">Here's what's happening with your money.</p>
                        </div>

                        <div className="flex items-center gap-3 md:gap-4 relative">
                              {/* Date / Calendar Icon */}
                              <div className="relative">
                                    <button
                                          onClick={() => { setShowCalendar(!showCalendar); setShowNotifications(false); }}
                                          className="glass-card px-3 md:px-4 py-2 rounded-xl flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                                    >
                                          <Calendar size={16} className="flex-shrink-0" />
                                          <span className="text-xs md:text-sm font-medium hidden sm:inline">{currentDate}</span>
                                    </button>

                                    {showCalendar && (
                                          <div className="absolute top-12 right-0 w-64 glass-card p-4 rounded-xl border border-slate-700 shadow-2xl z-50 animate-in zoom-in-95 duration-200">
                                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Month at a Glance</h4>
                                                <div className="space-y-3">
                                                      <div className="flex justify-between text-sm">
                                                            <span className="text-slate-400">Total Budget</span>
                                                            <span className="text-white font-bold">₹{stats.totalBudget.toLocaleString()}</span>
                                                      </div>
                                                      <div className="flex justify-between text-sm">
                                                            <span className="text-slate-400">Total Spent</span>
                                                            <span className="text-white font-bold text-red-400">₹{stats.totalExpense.toLocaleString()}</span>
                                                      </div>
                                                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                                            <div
                                                                  className="h-full bg-blue-500"
                                                                  style={{ width: `${(stats.totalExpense / (stats.totalBudget || 1)) * 100}%` }}
                                                            ></div>
                                                      </div>
                                                      <p className="text-[10px] text-slate-500 italic">"Keep tracking to stay within limit!"</p>
                                                </div>
                                          </div>
                                    )}
                              </div>

                              {/* Notifications / Bell Icon */}
                              <div className="relative">
                                    <button
                                          onClick={() => { setShowNotifications(!showNotifications); setShowCalendar(false); }}
                                          className="relative p-2.5 rounded-xl glass-card text-slate-300 hover:text-white transition-colors"
                                    >
                                          <Bell size={20} />
                                          {reminders.filter(r => !r.isPaid).length > 0 && (
                                                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-[#0B1120]"></span>
                                          )}
                                    </button>

                                    {showNotifications && (
                                          <div className="absolute top-12 right-0 w-80 glass-card rounded-xl border border-slate-700 shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200 overflow-hidden">
                                                <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/30">
                                                      <h4 className="text-xs font-bold text-white uppercase tracking-widest">Upcoming Bills</h4>
                                                      <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">
                                                            {reminders.filter(r => !r.isPaid).length} New
                                                      </span>
                                                </div>
                                                <div className="max-h-64 overflow-y-auto">
                                                      {reminders.filter(r => !r.isPaid).length === 0 ? (
                                                            <div className="p-8 text-center">
                                                                  <CheckCircle size={32} className="mx-auto text-emerald-500/30 mb-2" />
                                                                  <p className="text-sm text-slate-500">All bills are settled!</p>
                                                            </div>
                                                      ) : (
                                                            reminders.filter(r => !r.isPaid).map((r, i) => (
                                                                  <div key={i} className="p-4 hover:bg-white/5 border-b border-white/5 transition-colors cursor-pointer group">
                                                                        <div className="flex justify-between items-start mb-1">
                                                                              <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{r.title}</p>
                                                                              <p className="text-xs font-bold text-white">₹{r.amount.toLocaleString()}</p>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                                              <Clock size={10} />
                                                                              <span>Due {new Date(r.dueDate).toLocaleDateString()}</span>
                                                                        </div>
                                                                  </div>
                                                            ))
                                                      )}
                                                </div>
                                                <div className="p-3 bg-slate-800/50 text-center">
                                                      <button className="text-[10px] text-blue-400 font-bold uppercase hover:underline">View All Reminders</button>
                                                </div>
                                          </div>
                                    )}
                              </div>
                        </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statCards.map((stat, index) => (
                              <div key={index} className={`glass-card p-6 rounded-2xl border ${stat.border}`}>
                                    <div className="flex justify-between items-start mb-4">
                                          <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                                <stat.icon size={22} />
                                          </div>
                                          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${stat.bg} ${stat.color}`}>
                                                {stat.sub}
                                          </span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                                    <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
                              </div>
                        ))}
                  </div>

                  {insights && (
                        <div className="glass-card p-6 md:p-10 rounded-3xl border border-slate-700 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#020617] relative overflow-hidden animate-in slide-in-from-bottom-6 duration-700 shadow-2xl">
                              {/* Background Decorative Elements */}
                              <div className="absolute -top-32 -right-32 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
                              <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                              <div className="relative z-10">
                                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10 border-b border-slate-800 pb-8">
                                          <div>
                                                <h2 className="text-2xl md:text-3xl font-bold text-white flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                                                      Unified Financial Health Report
                                                      <span className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-500/20 uppercase tracking-widest shadow-lg shadow-purple-500/5">
                                                            AI Powered
                                                      </span>
                                                </h2>
                                                <p className="text-slate-400 mt-2 text-base">Machine learning analysis of your personal and shared financial data.</p>
                                          </div>
                                          <div className="flex flex-wrap items-center gap-4">
                                                <button
                                                      onClick={() => setShowElim10(!showElim10)}
                                                      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border flex items-center gap-2 ${showElim10 ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'glass-card text-blue-400 border-blue-500/20 hover:bg-blue-500/10'}`}
                                                >
                                                      {showElim10 ? '👶 ELI 10 Mode ON' : 'Explain Like I\'m 10'}
                                                </button>

                                                <div className={`px-5 py-2.5 rounded-xl border flex items-center gap-4 ${insights.riskLevel === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                      insights.riskLevel === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                                            'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                      }`}>
                                                      <div className="flex flex-col items-end">
                                                            <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Risk Status</p>
                                                            <p className="text-base font-bold">{insights.riskLevel}</p>
                                                      </div>
                                                      <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] animate-pulse ${insights.riskLevel === 'High' ? 'bg-red-500' :
                                                            insights.riskLevel === 'Medium' ? 'bg-amber-500' :
                                                                  'bg-emerald-500'
                                                            }`}></div>
                                                </div>
                                          </div>
                                    </div>

                                    {showElim10 ? (
                                          <div className="bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 p-8 rounded-3xl animate-in zoom-in duration-300">
                                                <h3 className="text-2xl font-bold text-blue-400 mb-4">{insights.elim10?.summary}</h3>
                                                <p className="text-slate-200 text-xl leading-relaxed mb-6 font-light">{insights.elim10?.comparison}</p>
                                                <div className="p-6 bg-[#0B1120]/80 rounded-2xl border border-slate-700/50">
                                                      <p className="text-slate-300 italic text-lg">"{insights.elim10?.spendingLevel}"</p>
                                                </div>
                                          </div>
                                    ) : (
                                          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                                {/* Prediction & EMI Impact */}
                                                <div className="space-y-6">
                                                      <div className="p-6 bg-[#0B1120]/40 rounded-3xl border border-slate-700/50 hover:border-slate-600 transition-colors group">
                                                            <div className="flex justify-between items-start mb-4">
                                                                  <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                                                                        <TrendingUp size={24} />
                                                                  </div>
                                                                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Forecast</p>
                                                            </div>
                                                            <h3 className="text-3xl font-bold text-white mb-1">₹{predictedNextMonth.toLocaleString()}</h3>
                                                            <p className="text-sm text-slate-400 font-medium">Expected End of Month</p>
                                                      </div>

                                                      <div className="p-6 bg-[#0B1120]/40 rounded-3xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                                                            <div className="flex justify-between items-end mb-4">
                                                                  <div>
                                                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">EMI Pressure</p>
                                                                        <p className="text-2xl font-bold text-white">₹{insights.totalUpcomingEMIs.toLocaleString()}</p>
                                                                  </div>
                                                                  <p className="text-lg font-bold text-blue-400">{insights.emiImpact}%</p>
                                                            </div>
                                                            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                                                                  <div
                                                                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                                        style={{ width: `${insights.emiImpact}%` }}
                                                                  ></div>
                                                            </div>
                                                      </div>
                                                </div>

                                                {/* Personality & Micro-Habits */}
                                                <div className="space-y-6">
                                                      <div className="p-6 bg-[#0B1120]/40 rounded-3xl border border-slate-700/50 hover:border-purple-500/30 transition-colors group h-full flex flex-col justify-between">
                                                            <div>
                                                                  <div className="flex items-center gap-3 mb-4">
                                                                        <span className="text-3xl bg-purple-500/10 p-2 rounded-xl border border-purple-500/20">{insights.personality?.personality.split(' ')[1] || '🎯'}</span>
                                                                        <div>
                                                                              <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">Expense Personality</p>
                                                                              <p className="text-white font-bold text-lg">{insights.personality?.personality}</p>
                                                                        </div>
                                                                  </div>
                                                                  <p className="text-sm text-slate-400 leading-relaxed bg-slate-800/30 p-3 rounded-xl border border-slate-700/30">{insights.personality?.description}</p>
                                                            </div>

                                                            <div className="mt-6 pt-6 border-t border-slate-700/50">
                                                                  <div className="flex items-start gap-3">
                                                                        <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg mt-0.5">
                                                                              <CheckCircle size={14} />
                                                                        </div>
                                                                        <div>
                                                                              <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">Tiny Win Suggestion</p>
                                                                              <p className="text-slate-300 text-sm italic leading-relaxed">
                                                                                    "{insights.microHabits?.[0] || insights.personality?.advice}"
                                                                              </p>
                                                                        </div>
                                                                  </div>
                                                            </div>
                                                      </div>
                                                </div>

                                                {/* Smart Observation */}
                                                <div className="space-y-6">
                                                      <div className="p-6 bg-[#0B1120]/40 rounded-3xl border border-slate-700/50 hover:border-slate-600 transition-colors h-full flex flex-col relative overflow-hidden">
                                                            <div className="absolute top-0 right-0 p-6 opacity-10">
                                                                  <Target size={100} className="text-blue-500" />
                                                            </div>

                                                            <p className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                                                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                                                                  Future Self Warning
                                                            </p>

                                                            <div className="flex-1">
                                                                  <p className="text-slate-200 text-lg leading-relaxed font-light">
                                                                        {insights.riskLevel === 'High' ? "If you continue this spending, you'll have ₹0 left before the month ends. ⏳" :
                                                                              insights.riskLevel === 'Medium' ? "Watch out! Your variable spend is creeping up. Keep an eye on 'Food' and 'Shopping'." :
                                                                                    "You're on track to end the month with a healthy surplus. Great job! 🚀"}
                                                                  </p>
                                                            </div>

                                                            <div className="mt-8">
                                                                  <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-2">
                                                                        <span>Start</span>
                                                                        <span>End of Month</span>
                                                                  </div>
                                                                  <div className="flex gap-1.5 h-2">
                                                                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                                                              <div key={i} className={`flex-1 rounded-full bg-slate-800 relative overflow-hidden`}>
                                                                                    <div className={`absolute inset-0 ${i < 5 ? (insights.riskLevel === 'High' ? 'bg-red-500' : insights.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500 opacity-80') : 'opacity-0'}`}></div>
                                                                              </div>
                                                                        ))}
                                                                  </div>
                                                                  <p className="text-center text-[10px] text-slate-500 mt-2 font-medium">Current Month Safety Runway</p>
                                                            </div>
                                                      </div>
                                                </div>
                                          </div>
                                    )}
                              </div>
                        </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Chart Section */}
                        <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
                              <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-white">Expense Analytics</h3>
                                    <select className="bg-[#0B1120] border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1 outline-none">
                                          <option>Monthly</option>
                                    </select>
                              </div>
                              <div className="h-64 flex items-center justify-center bg-[#0B1120]/50 rounded-xl border border-dashed border-slate-700 p-2">
                                    {lineChartData.labels.length > 0 ? (
                                          <Line
                                                data={lineChartData}
                                                options={{
                                                      maintainAspectRatio: false,
                                                      plugins: {
                                                            legend: { display: false }
                                                      },
                                                      scales: {
                                                            y: {
                                                                  beginAtZero: true,
                                                                  grid: { color: 'rgba(255, 255, 255, 0.05)' },
                                                                  ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { size: 10 } }
                                                            },
                                                            x: {
                                                                  grid: { display: false },
                                                                  ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { size: 10 } }
                                                            }
                                                      }
                                                }}
                                          />
                                    ) : (
                                          <p className="text-slate-500 font-medium">No trend data available</p>
                                    )}
                              </div>
                        </div>

                        {/* Recent Transactions / Categories */}
                        <div className="space-y-6">
                              {/* Category Split */}
                              <div className="glass-card p-6 rounded-2xl">
                                    <h3 className="text-lg font-bold text-white mb-4">Spend by Category</h3>
                                    <div className="h-48 flex items-center justify-center">
                                          {chartData.labels.length > 0 ? (
                                                <Pie data={chartData} options={{ maintainAspectRatio: false }} />
                                          ) : (
                                                <p className="text-slate-500 text-sm">No expenses this month</p>
                                          )}
                                    </div>
                              </div>

                              {/* Recent Transactions List */}
                              <div className="glass-card p-6 rounded-2xl">
                                    <h3 className="text-lg font-bold text-white mb-4">Recent Transactions</h3>
                                    <div className="space-y-4">
                                          {recentTransactions.map((tx, i) => (
                                                <div key={i} className="flex items-center justify-between group">
                                                      <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-[#0B1120] flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform">
                                                                  💰
                                                            </div>
                                                            <div>
                                                                  <p className="text-sm font-semibold text-white">{tx.title}</p>
                                                                  <p className="text-xs text-slate-500">{tx.category} • {new Date(tx.date).toLocaleDateString()}</p>
                                                            </div>
                                                      </div>
                                                      <span className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                                                            -₹{tx.amount}
                                                      </span>
                                                </div>
                                          ))}
                                          {recentTransactions.length === 0 && <p className="text-slate-500 text-sm">No recent transactions.</p>}
                                    </div>
                              </div>
                        </div>
                  </div>
            </div>
      );
};

export default Dashboard;
