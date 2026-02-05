import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import chatService from '../services/chatService';
import { useAuth } from '../context/AuthContext';

const AIChat = () => {
      const { user } = useAuth();
      const navigate = useNavigate();
      const [messages, setMessages] = useState([
            {
                  role: 'bot',
                  content: `Namaste ${user?.name?.split(' ')[0]}! 🙏 Main hoon aapka ExpenseML Buddy. Kaise help karu aaj?`,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
      ]);
      const [input, setInput] = useState('');
      const [loading, setLoading] = useState(false);
      const messagesEndRef = useRef(null);

      const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      };

      useEffect(() => {
            scrollToBottom();
      }, [messages]);

      const handleSend = async (e) => {
            e.preventDefault();
            if (!input.trim() || loading) return;

            const userMessage = {
                  role: 'user',
                  content: input,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev, userMessage]);
            setInput('');
            setLoading(true);

            try {
                  const response = await chatService.getChatResponse(input, messages);
                  const botMessage = {
                        role: 'bot',
                        content: response.reply,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  };
                  setMessages(prev => [...prev, botMessage]);
            } catch (error) {
                  const errorMessage = {
                        role: 'bot',
                        content: "Bhai, server mein thodi dikat aa rahi hai. Ek baar check kar lo?",
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  };
                  setMessages(prev => [...prev, errorMessage]);
            } finally {
                  setLoading(false);
            }
      };

      return (
            <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Chat Header */}
                  <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between backdrop-blur-md">
                        <div className="flex items-center gap-4">
                              <button
                                    onClick={() => navigate(-1)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                              >
                                    <ArrowLeft size={20} />
                              </button>
                              <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                          <Bot size={24} className="text-white" />
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0B1120]"></span>
                              </div>
                              <div>
                                    <h3 className="font-bold text-white leading-tight">ExpenseML Buddy</h3>
                                    <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Active Now</p>
                              </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                              <Sparkles size={14} className="text-blue-400" />
                              <span className="text-[10px] font-bold text-blue-400 uppercase">AI Powered</span>
                        </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        <AnimatePresence initial={false}>
                              {messages.map((msg, index) => (
                                    <motion.div
                                          key={index}
                                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                          animate={{ opacity: 1, y: 0, scale: 1 }}
                                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                          <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-700' : 'bg-blue-600'
                                                      }`}>
                                                      {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
                                                </div>
                                                <div className={`relative px-4 py-3 rounded-2xl shadow-sm ${msg.role === 'user'
                                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                                            : 'bg-white/10 text-slate-200 border border-white/5 rounded-tl-none'
                                                      }`}>
                                                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                                      <span className={`text-[9px] mt-1 block opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                                            {msg.time}
                                                      </span>
                                                </div>
                                          </div>
                                    </motion.div>
                              ))}
                              {loading && (
                                    <motion.div
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          className="flex justify-start"
                                    >
                                          <div className="flex gap-3 items-center bg-white/5 px-4 py-3 rounded-2xl border border-white/5">
                                                <Bot size={16} className="text-blue-400 animate-pulse" />
                                                <div className="flex gap-1">
                                                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                                                </div>
                                          </div>
                                    </motion.div>
                              )}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-4 bg-white/5 border-t border-white/10 backdrop-blur-md">
                        <form
                              onSubmit={handleSend}
                              className="flex gap-3 items-center bg-white/5 p-2 pr-2 pl-4 rounded-2xl border border-white/10 focus-within:border-blue-500/50 transition-all shadow-inner"
                        >
                              <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Bhai se pucho: 'Is mahine budget bachega?'"
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-white text-sm placeholder:text-slate-500"
                              />
                              <button
                                    type="submit"
                                    disabled={!input.trim() || loading}
                                    className={`p-2.5 rounded-xl transition-all shadow-lg ${input.trim() && !loading
                                                ? 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 active:scale-95'
                                                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                          }`}
                              >
                                    <Send size={18} />
                              </button>
                        </form>
                        <p className="text-[10px] text-center text-slate-500 mt-2">
                              ExpenseML Buddy can make mistakes. Check important info.
                        </p>
                  </div>
            </div>
      );
};

export default AIChat;
