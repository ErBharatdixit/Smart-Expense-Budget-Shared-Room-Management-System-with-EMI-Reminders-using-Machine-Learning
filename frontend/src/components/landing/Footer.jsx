import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Github, Linkedin, Facebook, Instagram, MessageCircle } from 'lucide-react';

const Footer = () => {
      const contactInfo = {
            name: "Bharat Dixit",
            email: "bharat010703@gmail.com",
            phone: "+91 70688 76861",
            whatsapp: "+91 70688 76861",
            socials: [
                  { name: 'GitHub', icon: Github, url: 'https://github.com/ErBharatdixit' },
                  { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com/in/bharat-dixit-8a3555296/' },
                  { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/panditbharatdixit/' },
                  { name: 'Facebook', icon: Facebook, url: 'https://www.facebook.com/bharat.dixit.5872/' },
            ]
      };

      return (
            <footer className="py-16 bg-slate-950 border-t border-white/5 relative overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent blur-sm" />

                  <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8">

                              {/* Brand & Description */}
                              <div className="lg:w-1/3">
                                    <div className="flex items-center gap-2 mb-6">
                                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-900/20">
                                                E
                                          </div>
                                          <span className="text-2xl font-bold text-white">ExpenseML</span>
                                    </div>
                                    <p className="text-slate-400 leading-relaxed mb-6">
                                          Simplifying financial management with AI-driven insights.
                                          Track, budget, and settle expenses effortlessly.
                                    </p>
                                    <div className="text-sm text-slate-500">
                                          © {new Date().getFullYear()} ExpenseML. All rights reserved.
                                    </div>
                              </div>

                              {/* Developer Contact */}
                              <div className="lg:w-1/3">
                                    <h3 className="text-white font-semibold text-lg mb-6">Connect with Developer</h3>
                                    <div className="space-y-4">
                                          <div className="flex items-start gap-3">
                                                <div className="mt-1 min-w-[20px] text-blue-500">
                                                      <span className="w-2 h-2 rounded-full bg-blue-500 block" />
                                                </div>
                                                <div>
                                                      <p className="text-white font-medium">{contactInfo.name}</p>
                                                      <p className="text-slate-400 text-sm">Full Stack Developer</p>
                                                </div>
                                          </div>

                                          <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
                                                <Mail size={18} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                                                <span>{contactInfo.email}</span>
                                          </a>

                                          <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
                                                <Phone size={18} className="text-slate-500 group-hover:text-green-400 transition-colors" />
                                                <span>{contactInfo.phone}</span>
                                          </a>

                                          <a href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
                                                <MessageCircle size={18} className="text-slate-500 group-hover:text-green-500 transition-colors" />
                                                <span>WhatsApp</span>
                                          </a>
                                    </div>
                              </div>

                              {/* Social Links & Legal */}
                              <div className="lg:w-1/3 flex flex-col justify-between">
                                    <div>
                                          <h3 className="text-white font-semibold text-lg mb-6">Social Profiles</h3>
                                          <div className="flex flex-wrap gap-4 mb-8">
                                                {contactInfo.socials.map((social) => (
                                                      <a
                                                            key={social.name}
                                                            href={social.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white hover:border-blue-500/30 transition-all hover:scale-110"
                                                            title={social.name}
                                                      >
                                                            <social.icon size={20} />
                                                      </a>
                                                ))}
                                          </div>
                                    </div>

                                    <div className="flex flex-wrap gap-6 text-sm text-slate-500">
                                          <Link to="#" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
                                          <Link to="#" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
                                          <Link to="#" className="hover:text-slate-300 transition-colors">Support</Link>
                                    </div>
                              </div>
                        </div>
                  </div>
            </footer>
      );
};

export default Footer;
