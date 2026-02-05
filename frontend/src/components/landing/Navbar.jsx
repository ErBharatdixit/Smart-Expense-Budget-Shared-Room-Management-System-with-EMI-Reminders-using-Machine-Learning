import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight } from 'lucide-react';

const Navbar = () => {
      const [scrolled, setScrolled] = useState(false);
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

      useEffect(() => {
            const handleScroll = () => {
                  setScrolled(window.scrollY > 20);
            };
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
      }, []);

      return (
            <nav
                  className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/80 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
                        }`}
            >
                  <div className="max-w-7xl mx-auto px-6">
                        <div className="flex items-center justify-between h-20">
                              {/* Logo */}
                              <div className="flex-shrink-0">
                                    <Link to="/" className="flex items-center gap-2">
                                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                                                E
                                          </div>
                                          <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                                ExpenseML
                                          </span>
                                    </Link>
                              </div>

                              {/* Desktop Menu */}
                              <div className="hidden md:flex items-center gap-8">
                                    {['Features', 'Testimonials', 'Pricing'].map((item) => (
                                          <a
                                                key={item}
                                                href={`#${item.toLowerCase()}`}
                                                className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group"
                                          >
                                                {item}
                                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full" />
                                          </a>
                                    ))}
                              </div>

                              {/* Desktop Actions */}
                              <div className="hidden md:flex items-center gap-4">
                                    <Link
                                          to="/login"
                                          className="text-sm font-semibold text-white hover:text-blue-400 transition-colors"
                                    >
                                          Log In
                                    </Link>
                                    <Link
                                          to="/register"
                                          className="group relative px-6 py-2.5 rounded-full bg-white text-slate-900 text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden"
                                    >
                                          <span className="relative z-10 flex items-center gap-1">
                                                Get Started <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                          </span>
                                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                                    </Link>
                              </div>

                              {/* Mobile Menu Button */}
                              <div className="md:hidden">
                                    <button
                                          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                          className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                                    </button>
                              </div>
                        </div>
                  </div>

                  {/* Mobile Menu */}
                  <AnimatePresence>
                        {mobileMenuOpen && (
                              <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="md:hidden bg-slate-900 border-b border-white/10"
                              >
                                    <div className="px-6 py-8 flex flex-col gap-6">
                                          {['Features', 'Testimonials', 'Pricing'].map((item) => (
                                                <a
                                                      key={item}
                                                      href={`#${item.toLowerCase()}`}
                                                      onClick={() => setMobileMenuOpen(false)}
                                                      className="text-lg font-medium text-slate-300 hover:text-white"
                                                >
                                                      {item}
                                                </a>
                                          ))}
                                          <hr className="border-white/10" />
                                          <Link
                                                to="/login"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="text-lg font-medium text-white hover:text-blue-400"
                                          >
                                                Log In
                                          </Link>
                                          <Link
                                                to="/register"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-center shadow-lg active:scale-95 transition-all"
                                          >
                                                Get Started
                                          </Link>
                                    </div>
                              </motion.div>
                        )}
                  </AnimatePresence>
            </nav>
      );
};

export default Navbar;
