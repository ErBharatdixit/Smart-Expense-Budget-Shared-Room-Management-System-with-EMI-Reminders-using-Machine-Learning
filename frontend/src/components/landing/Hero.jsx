import React from 'react';
import { motion } from 'framer-motion';
import HeroViz from '../../assets/images/hero_dashboard_viz.png';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
      return (
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                  {/* Background Glows */}
                  <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
                  <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px] pointer-events-none" />

                  <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                              {/* Text Content */}
                              <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="flex-1 text-center lg:text-left"
                              >
                                    <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
                                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                <span className="text-xs font-semibold text-green-400 tracking-wide uppercase">AI-Powered Finance</span>
                                          </div>
                                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
                                                <span className="text-[10px] font-bold text-blue-400 tracking-widest uppercase">Zero Bank Connection Promise</span>
                                          </div>
                                    </div>

                                    <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
                                          Master Your Money <br />
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                                                With Intelligence
                                          </span>
                                    </h1>

                                    <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                          ExpenseML isn't just a tracker. It's your personal financial strategist.
                                          From smart budgeting to shared room settlements, take control with
                                          AI-driven insights and premium tools.
                                    </p>

                                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                          <Link
                                                to="/register"
                                                className="w-full sm:w-auto px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shadow-lg shadow-blue-600/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                                          >
                                                Start Free Trial <ArrowRight size={20} />
                                          </Link>
                                          <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-lg backdrop-blur-sm transition-all flex items-center justify-center gap-2 group">
                                                <PlayCircle size={20} className="group-hover:text-blue-400 transition-colors" /> Watch Demo
                                          </button>
                                    </div>

                                    <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-slate-500">
                                          <div className="flex flex-col">
                                                <span className="text-2xl font-bold text-white">10k+</span>
                                                <span className="text-sm">Active Users</span>
                                          </div>
                                          <div className="w-px h-10 bg-white/10" />
                                          <div className="flex flex-col">
                                                <span className="text-2xl font-bold text-white">$2M+</span>
                                                <span className="text-sm">Tracked</span>
                                          </div>
                                          <div className="w-px h-10 bg-white/10" />
                                          <div className="flex flex-col">
                                                <span className="text-2xl font-bold text-white">4.9/5</span>
                                                <span className="text-sm">Rating</span>
                                          </div>
                                    </div>
                              </motion.div>

                              {/* Hero Image/Visual */}
                              <motion.div
                                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    transition={{ duration: 1, delay: 0.2, type: "spring" }}
                                    className="flex-1 relative"
                              >
                                    <div className="relative z-10 w-full rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/40 border border-white/10 bg-slate-900/50 backdrop-blur-xl group">
                                          <img
                                                src={HeroViz}
                                                alt="ExpenseML Instrument"
                                                className="w-full h-auto transform transition-transform duration-700 group-hover:scale-105"
                                          />

                                          {/* Floating UI Elements (Decorative) */}
                                          <motion.div
                                                animate={{ y: [0, -15, 0] }}
                                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                                className="absolute -top-6 -right-6 md:top-10 md:-right-10 bg-slate-800/90 p-4 rounded-xl border border-white/10 shadow-xl backdrop-blur-md"
                                          >
                                                <div className="flex items-center gap-3">
                                                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                                            <span className="text-green-400 text-lg">💰</span>
                                                      </div>
                                                      <div>
                                                            <div className="text-xs text-slate-400">Savings</div>
                                                            <div className="text-lg font-bold text-white">+$1,250</div>
                                                      </div>
                                                </div>
                                          </motion.div>

                                          <motion.div
                                                animate={{ y: [0, 20, 0] }}
                                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                                                className="absolute -bottom-6 -left-6 md:bottom-10 md:-left-10 bg-slate-800/90 p-4 rounded-xl border border-white/10 shadow-xl backdrop-blur-md"
                                          >
                                                <div className="flex items-center gap-3">
                                                      <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                                            <span className="text-red-400 text-lg">📉</span>
                                                      </div>
                                                      <div>
                                                            <div className="text-xs text-slate-400">Expenses</div>
                                                            <div className="text-lg font-bold text-white">-$340</div>
                                                      </div>
                                                </div>
                                          </motion.div>
                                    </div>
                              </motion.div>
                        </div>
                  </div>
            </section>
      );
};

export default Hero;
