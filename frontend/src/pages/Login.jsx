import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, ArrowRight, Mail, Lock } from 'lucide-react';

const Login = () => {
      const [formData, setFormData] = useState({
            email: '',
            password: '',
      });
      const [error, setError] = useState(null);
      const { login } = useAuth();
      const navigate = useNavigate();

      const { email, password } = formData;

      const onChange = (e) => {
            setFormData((prevState) => ({
                  ...prevState,
                  [e.target.name]: e.target.value,
            }));
      };

      const onSubmit = async (e) => {
            e.preventDefault();
            setError(null);
            try {
                  await login(formData);
                  navigate('/dashboard');
            } catch (err) {
                  setError(err.response?.data?.message || 'Login failed');
            }
      };

      return (
            <div className="min-h-screen flex items-center justify-center bg-[#0B1120] relative overflow-hidden">
                  {/* Abstract Background Shapes */}
                  <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
                  <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]"></div>

                  <div className="w-full max-w-md px-4 md:px-8 py-8 relative z-10">
                        <div className="glass-card p-6 md:p-10 rounded-2xl">
                              {/* Logo & Header */}
                              <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/20 text-blue-500 mb-4">
                                          <Wallet size={28} />
                                    </div>
                                    <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                          Smart Finance
                                    </h1>
                                    <p className="text-slate-400 text-sm mt-2 font-medium">
                                          for Smarter Living
                                    </p>
                              </div>

                              {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm mb-6 text-center">
                                          {error}
                                    </div>
                              )}

                              <form onSubmit={onSubmit} className="space-y-5">
                                    <div>
                                          <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 ml-1">
                                                Email Address
                                          </label>
                                          <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                                      <Mail size={18} />
                                                </div>
                                                <input
                                                      type="email"
                                                      name="email"
                                                      value={email}
                                                      onChange={onChange}
                                                      className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                                                      placeholder="bharat@gmail.com"
                                                      required
                                                />
                                          </div>
                                    </div>

                                    <div>
                                          <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 ml-1">
                                                Password
                                          </label>
                                          <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                                      <Lock size={18} />
                                                </div>
                                                <input
                                                      type="password"
                                                      name="password"
                                                      value={password}
                                                      onChange={onChange}
                                                      className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                                                      placeholder="••••••••"
                                                      required
                                                />
                                          </div>
                                    </div>

                                    <button
                                          type="submit"
                                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 group"
                                    >
                                          Sign In
                                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                              </form>

                              <div className="mt-8 text-center">
                                    <p className="text-slate-400 text-sm">
                                          Don't have an account?{' '}
                                          <Link to="/register" className="text-blue-500 hover:text-blue-400 font-semibold transition-colors">
                                                Create account
                                          </Link>
                                    </p>
                              </div>
                        </div>
                  </div>
            </div>
      );
};

export default Login;
