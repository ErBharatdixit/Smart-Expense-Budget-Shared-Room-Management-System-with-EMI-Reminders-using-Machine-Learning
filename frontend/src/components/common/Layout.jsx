import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
      const [isSidebarOpen, setIsSidebarOpen] = useState(false);

      return (
            <div className="min-h-screen bg-[#0B1120] text-slate-50 relative selection:bg-blue-500/30">
                  {/* Subtle Background Glows */}
                  <div className="fixed top-0 left-0 w-full h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>

                  {/* Mobile Top Header */}
                  <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0B1120]/80 backdrop-blur-md border-b border-[#1E293B] z-[55] flex items-center justify-between px-6">
                        <Link to="/dashboard" className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                                    <Wallet size={16} />
                              </div>
                              <span className="font-bold text-lg text-white">Smart Finance</span>
                        </Link>
                        <button
                              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                              className="p-2 text-slate-400 hover:text-white transition-colors"
                        >
                              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                  </div>

                  <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                  <div className="md:ml-[280px] p-4 md:p-8 pt-20 md:pt-8 min-h-screen relative transition-all duration-300">
                        <div className="max-w-7xl mx-auto">
                              {children}
                        </div>
                  </div>
            </div>
      );
};

export default Layout;

