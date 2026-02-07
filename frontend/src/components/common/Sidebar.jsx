import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
      LayoutDashboard,
      Receipt,
      PiggyBank,
      CalendarClock,
      Users,
      ArrowLeftRight,
      LogOut,
      Wallet,
      Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
      const { logout, user } = useAuth();
      const navigate = useNavigate();

      const handleLogout = () => {
            logout();
            navigate('/login');
      };

      const navItems = [
            { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/expenses', label: 'Expenses', icon: Receipt },
            { path: '/budget', label: 'Budget', icon: PiggyBank },
            { path: '/emi', label: 'EMI Reminders', icon: CalendarClock },
            { path: '/rooms', label: 'Shared Rooms', icon: Users },
            { path: '/settlements', label: 'Settlements', icon: ArrowLeftRight },
            { path: '/market', label: 'Market Analysis', icon: Wallet },
            { path: '/chat', label: 'AI Finance Buddy', icon: Sparkles, isNew: true },
      ];

      return (
            <>
                  {/* Mobile Overlay */}
                  {isOpen && (
                        <div
                              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden transition-opacity duration-300"
                              onClick={onClose}
                        />
                  )}

                  <div className={`h-screen w-[280px] bg-[#0B1120] border-r border-[#1E293B] flex flex-col fixed left-0 top-0 z-[70] transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                        }`}>
                        {/* Brand */}
                        <div className="p-6 flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                                    <Wallet size={20} />
                              </div>
                              <div>
                                    <h1 className="text-lg font-bold text-white leading-tight">
                                          Smart Finance
                                    </h1>
                                    <p className="text-xs text-slate-400 font-medium">Smarter Living</p>
                              </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                              <div className="px-2 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Menu
                              </div>
                              {navItems.map((item) => (
                                    <NavLink
                                          key={item.path}
                                          to={item.path}
                                          onClick={() => onClose && onClose()}
                                          className={({ isActive }) =>
                                                `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${isActive
                                                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                                      : 'text-slate-400 hover:bg-[#1E293B] hover:text-white'
                                                }`
                                          }
                                    >
                                          {({ isActive }) => (
                                                <>
                                                      <item.icon
                                                            size={20}
                                                            className={
                                                                  isActive ? 'text-white' : 'group-hover:text-blue-400 transition-colors'
                                                            }
                                                      />
                                                      <span className="font-medium text-sm">{item.label}</span>
                                                      {item.isNew && (
                                                            <span className="ml-auto text-[9px] font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase">
                                                                  New
                                                            </span>
                                                      )}
                                                </>
                                          )}
                                    </NavLink>
                              ))}
                        </nav>

                        {/* User Profile & Logout */}
                        <div className="p-4 border-t border-[#1E293B]">
                              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1E293B]/50 mb-3 border border-[#1E293B]">
                                    <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 font-bold border border-blue-500/20">
                                          {user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                          <p className="text-sm font-semibold text-white truncate">
                                                {user?.name || 'User'}
                                          </p>
                                          <p className="text-xs text-slate-400 truncate">
                                                {user?.email || 'user@example.com'}
                                          </p>
                                    </div>
                              </div>
                              <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#1E293B] text-slate-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all duration-200 group"
                              >
                                    <LogOut size={18} className="group-hover:stroke-red-500" />
                                    <span className="font-medium text-sm">Sign Out</span>
                              </button>
                        </div>
                  </div>
            </>
      );
};

export default Sidebar;

