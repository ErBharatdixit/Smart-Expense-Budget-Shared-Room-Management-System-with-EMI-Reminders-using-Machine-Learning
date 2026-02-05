import React, { useState, useEffect } from 'react';
import {
      ArrowLeftRight,
      Send,
      CheckCircle2,
      Sparkles
} from 'lucide-react';
import roomService from '../services/roomService';
import { useAuth } from '../context/AuthContext';

const Settlements = () => {
      const { user } = useAuth();
      const [room, setRoom] = useState(null);
      const [loading, setLoading] = useState(true);

      const fetchRoom = async () => {
            try {
                  const data = await roomService.getMyRoom();
                  setRoom(data);
            } catch (error) {
                  console.error("Error fetching room:", error);
            } finally {
                  setLoading(false);
            }
      };

      useEffect(() => {
            fetchRoom();
      }, []);

      if (loading) return <div className="text-white">Loading...</div>;

      if (!room) {
            return <div className="text-white text-center py-20">You need to join a room first via the 'Rooms' page to see settlements.</div>;
      }

      // Settlement Logic
      const totalExpense = room.expenses.reduce((acc, curr) => acc + curr.amount, 0);
      const memberCount = room.members.length;
      const perPersonShare = memberCount > 0 ? totalExpense / memberCount : 0;

      // Calculate balances for each member
      // Balance = Paid - Share. 
      // Positive = Owed to them. Negative = They owe.
      const memberBalances = room.members.map(member => {
            const paidByMember = room.expenses
                  .filter(e => (e.paidBy?._id?.toString() || e.paidBy?.toString()) === (member._id?.toString() || member.id?.toString()))
                  .reduce((acc, curr) => acc + curr.amount, 0);

            const balance = paidByMember - perPersonShare;

            return {
                  ...member,
                  paid: paidByMember,
                  balance: balance
            };
      });

      const myBalanceObj = memberBalances.find(m => (m._id?.toString() || m.id?.toString()) === (user._id?.toString() || user.id?.toString()));
      const myBalance = myBalanceObj ? myBalanceObj.balance : 0;

      // Show everyone in the list to avoid "disappearing" user section, but sort so user or those with balance are prominent
      const allMembersSorted = [...memberBalances].sort((a, b) => {
            // Put those with highest balance first, or user first?
            // Let's just keep everyone visible.
            if ((a._id?.toString() || a.id?.toString()) === (user._id?.toString() || user.id?.toString())) return -1;
            if ((b._id?.toString() || b.id?.toString()) === (user._id?.toString() || user.id?.toString())) return 1;
            return Math.abs(b.balance) - Math.abs(a.balance);
      });

      return (
            <div className="space-y-8">
                  <div className="flex justify-between items-center">
                        <div>
                              <h1 className="text-2xl font-bold text-white">Settlements</h1>
                              <p className="text-slate-400 text-sm mt-1">Calculated for Room: <span className="text-white font-medium">{room.name}</span></p>
                        </div>
                  </div>

                  {/* Global Status Card */}
                  <div className={`p-6 rounded-3xl border transition-all duration-300 shadow-xl ${myBalance > 1
                        ? 'bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5'
                        : myBalance < -1
                              ? 'bg-red-500/10 border-red-500/20 shadow-red-500/5'
                              : 'bg-blue-500/10 border-blue-500/20 shadow-blue-500/5'
                        }`}>
                        <div className="flex items-center gap-3 mb-2">
                              {myBalance > 1 ? (
                                    <Sparkles className="text-emerald-500" size={24} />
                              ) : myBalance < -1 ? (
                                    <ArrowLeftRight className="text-red-500" size={24} />
                              ) : (
                                    <CheckCircle2 className="text-blue-500" size={24} />
                              )}
                              <h2 className="text-xl font-bold text-white">
                                    {myBalance > 1
                                          ? "💰 Paisa Aayega! (Vasooli Mode)"
                                          : myBalance < -1
                                                ? "💸 Pocket Khali! (Udhaar Chuka Do)"
                                                : "🤝 Hisaab Barabar! (No Tension)"}
                              </h2>
                        </div>
                        <p className={`text-5xl font-black tracking-tight ${myBalance > 1 ? 'text-emerald-500' : myBalance < -1 ? 'text-red-500' : 'text-blue-500'
                              }`}>
                              ₹{Math.abs(myBalance).toFixed(0)}
                        </p>
                        <p className="text-xs text-slate-400 mt-3 font-medium uppercase tracking-wider">
                              Total Room Expense: ₹{totalExpense.toLocaleString()} • Your Share: ₹{perPersonShare.toFixed(0)}
                        </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Member Status List */}
                        {allMembersSorted.map(member => {
                              const isCurrentUser = (member._id?.toString() || member.id?.toString()) === (user._id?.toString() || user.id?.toString());

                              return (
                                    <div key={member._id} className={`glass-card p-6 rounded-3xl border ${isCurrentUser ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/10'} hover:border-white/20 transition-all group relative overflow-hidden`}>
                                          <div className={`absolute top-0 left-0 w-1 h-full ${member.balance < 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>

                                          <div className="flex justify-between items-start mb-6">
                                                <div>
                                                      <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                                                            {member.name} {isCurrentUser && <span className="text-blue-400 text-xs normal-case ml-2 font-medium">(You)</span>}
                                                      </h3>
                                                      <div className="flex items-center gap-2 mt-1">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${member.balance >= 0
                                                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                                  : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                                                  }`}>
                                                                  {member.balance >= 0 ? '💎 Financier (Investor)' : '🕒 Pending (Hisaab Baaki)'}
                                                            </span>
                                                      </div>
                                                </div>
                                                <div className="text-right">
                                                      <p className={`text-2xl font-black ${member.balance >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                                                            ₹{Math.abs(member.balance).toFixed(0)}
                                                      </p>
                                                      <p className="text-[10px] text-slate-500 font-bold uppercase">
                                                            {member.balance >= 0 ? "Extra Pay Kiya" : "Hisaab Bacha Hai"}
                                                      </p>
                                                </div>
                                          </div>

                                          <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                <div className="flex gap-4">
                                                      <div className="text-center">
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Paid</p>
                                                            <p className="text-xs text-white font-bold">₹{member.paid.toLocaleString()}</p>
                                                      </div>
                                                      <div className="text-center border-l border-white/10 pl-4">
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Share</p>
                                                            <p className="text-xs text-white font-bold">₹{perPersonShare.toFixed(0)}</p>
                                                      </div>
                                                </div>

                                                {member.balance < 0 && !isCurrentUser && (
                                                      <button
                                                            onClick={() => {
                                                                  const text = `Oye ${member.name.split(' ')[0]}, room expenses ka hisaab! Your pending share is ₹${Math.abs(member.balance).toFixed(0)}. Jaldi settle kar de bhai! 🙏`;
                                                                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                                            }}
                                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all text-xs font-bold"
                                                      >
                                                            <Send size={14} />
                                                            Remind
                                                      </button>
                                                )}
                                          </div>
                                    </div>
                              );
                        })}
                  </div>

                  <div className="text-center text-slate-500 text-xs mt-10">
                        *Settlements are calculated by splitting total expenses equally among all {memberCount} members.
                  </div>
            </div>
      );
};

export default Settlements;
