import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
      return (
            <div className="min-h-screen bg-[#0B1120] text-slate-50 relative selection:bg-blue-500/30">
                  {/* Subtle Background Glows */}
                  <div className="fixed top-0 left-0 w-full h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>

                  <Sidebar />
                  <div className="ml-[280px] p-8 min-h-screen relative">
                        <div className="max-w-7xl mx-auto">
                              {children}
                        </div>
                  </div>
            </div>
      );
};

export default Layout;
