import React from 'react';
import { motion } from 'framer-motion';
import IconSmart from '../../assets/images/icon_smart_tracking.png';
import IconShared from '../../assets/images/icon_shared_room.png';
import IconEMI from '../../assets/images/icon_emi_reminders.png';

const features = [
      {
            title: "Smart Expense Tracking",
            desc: "AI-powered categorization and insights to understand where every penny goes.",
            icon: IconSmart,
            color: "from-purple-500 to-indigo-500"
      },
      {
            title: "Shared Room Manager",
            desc: "Split bills, manage chores, and settle debts with roommates effortlessly.",
            icon: IconShared,
            color: "from-blue-500 to-cyan-500"
      },
      {
            title: "EMI & Debt Reminders",
            desc: "Never miss a payment again with intelligent, timely reminders and alerts.",
            icon: IconEMI,
            color: "from-orange-500 to-amber-500"
      },
      {
            title: "Privacy First (Zero-Link)",
            desc: "We never ask for your bank login. Your data stays localized and secure. 🛡️",
            icon: IconSmart,
            color: "from-emerald-500 to-teal-500"
      }
];

const Features = () => {
      return (
            <section id="features" className="py-24 bg-slate-900/50 relative overflow-hidden">
                  <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="text-center max-w-3xl mx-auto mb-20">
                              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                                    Everything You Need to <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                          Build Wealth
                                    </span>
                              </h2>
                              <p className="text-slate-400 text-lg">
                                    Power-packed features designed for modern financial lives.
                                    Simple enough for beginners, powerful enough for pros.
                              </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                              {features.map((feature, idx) => (
                                    <motion.div
                                          key={idx}
                                          initial={{ opacity: 0, y: 30 }}
                                          whileInView={{ opacity: 1, y: 0 }}
                                          viewport={{ once: true }}
                                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                                          className="group relative p-8 rounded-3xl bg-slate-800/40 border border-white/5 hover:border-white/10 transition-all duration-300 hover:bg-slate-800/60"
                                    >
                                          {/* Hover Glow */}
                                          <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                                          <div className="h-48 flex items-center justify-center mb-8 relative">
                                                <div className={`absolute inset-0 bg-gradient-to-tr ${feature.color} opacity-0 blur-[60px] group-hover:opacity-20 transition-opacity duration-500`} />
                                                <img
                                                      src={feature.icon}
                                                      alt={feature.title}
                                                      className="h-full w-auto object-contain transform group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl"
                                                />
                                          </div>

                                          <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                                                {feature.title}
                                          </h3>
                                          <p className="text-slate-400 leading-relaxed">
                                                {feature.desc}
                                          </p>
                                    </motion.div>
                              ))}
                        </div>
                  </div>
            </section>
      );
};

export default Features;
