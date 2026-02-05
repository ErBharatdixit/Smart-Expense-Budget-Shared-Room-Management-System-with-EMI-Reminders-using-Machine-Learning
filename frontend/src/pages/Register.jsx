import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, ArrowRight, Mail, Lock, User, KeyRound } from 'lucide-react';
import authService from '../services/authService';

const Register = () => {
      const [step, setStep] = useState(1); // 1: Register, 2: OTP
      const [formData, setFormData] = useState({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
      });
      const [otp, setOtp] = useState('');
      const [error, setError] = useState(null);
      const [loading, setLoading] = useState(false);
      const navigate = useNavigate();

      const { name, email, password, confirmPassword } = formData;

      const onChange = (e) => {
            setFormData((prevState) => ({
                  ...prevState,
                  [e.target.name]: e.target.value,
            }));
      };

      const handleRegister = async (e) => {
            e.preventDefault();
            setError(null);

            if (password !== confirmPassword) {
                  setError('Passwords do not match');
                  return;
            }

            setLoading(true);
            try {
                  // Call API directly or via authService (which doesn't login yet)
                  await authService.register({ name, email, password });
                  setStep(2);
                  setLoading(false);
            } catch (err) {
                  setError(err.response?.data?.message || 'Registration failed');
                  setLoading(false);
            }
      };

      const handleVerify = async (e) => {
            e.preventDefault();
            setError(null);
            setLoading(true);

            try {
                  const data = await authService.verifyEmail({ email, otp });
                  // Manually set user in context if needed, but usually login/register updates context?
                  // Our AuthContext 'register' function likely called 'authService.register' which used to login.
                  // Now 'authService.register' just returns success.
                  // We need to 'login' the user after verification.
                  // The 'verifyEmail' response returns token and user data.
                  // We might need to reload or update context.
                  // For simplicity, let's redirect to dashboard which should pick up the token from localStorage.
                  // BETTER: Use a 'login' action from context if available, but verifyEmail updates localStorage.
                  // Reloading page or navigate might work if AuthContext reads from localStorage on mount.

                  // Force reload to update context or use a context method if available
                  // Assuming navigate to dashboard triggers re-check or we can just reload
                  window.location.href = '/dashboard';
            } catch (err) {
                  setError(err.response?.data?.message || 'Verification failed');
                  setLoading(false);
            }
      };

      return (
            <div className="min-h-screen flex items-center justify-center bg-[#0B1120] relative overflow-hidden">
                  {/* Abstract Background Shapes */}
                  <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
                  <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>

                  <div className="w-full max-w-md p-8 relative z-10">
                        <div className="glass-card p-10 rounded-2xl">
                              {/* Header */}
                              <div className="text-center mb-8">
                                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                          {step === 1 ? 'Create Account' : 'Verify Email'}
                                    </h1>
                                    <p className="text-slate-400 text-sm mt-2">
                                          {step === 1 ? 'Join Smart Finance today' : `Enter OTP sent to ${email}`}
                                    </p>
                              </div>

                              {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm mb-6 text-center">
                                          {error}
                                    </div>
                              )}

                              {step === 1 ? (
                                    <form onSubmit={handleRegister} className="space-y-4">
                                          <div>
                                                <div className="relative">
                                                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                                            <User size={18} />
                                                      </div>
                                                      <input
                                                            type="text"
                                                            name="name"
                                                            value={name}
                                                            onChange={onChange}
                                                            className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                                                            placeholder="Bharat Dixit"
                                                            required
                                                      />
                                                </div>
                                          </div>

                                          <div>
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
                                                            placeholder="Password"
                                                            required
                                                      />
                                                </div>
                                          </div>

                                          <div>
                                                <div className="relative">
                                                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                                            <Lock size={18} />
                                                      </div>
                                                      <input
                                                            type="password"
                                                            name="confirmPassword"
                                                            value={confirmPassword}
                                                            onChange={onChange}
                                                            className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                                                            placeholder="Confirm Password"
                                                            required
                                                      />
                                                </div>
                                          </div>

                                          <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 group mt-2 disabled:opacity-50"
                                          >
                                                {loading ? 'Sending OTP...' : 'Next'}
                                                {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                                          </button>
                                    </form>
                              ) : (
                                    <form onSubmit={handleVerify} className="space-y-4">
                                          <div>
                                                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 ml-1">
                                                      One-Time Password
                                                </label>
                                                <div className="relative">
                                                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                                            <KeyRound size={18} />
                                                      </div>
                                                      <input
                                                            type="text"
                                                            name="otp"
                                                            value={otp}
                                                            onChange={(e) => setOtp(e.target.value)}
                                                            className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm tracking-widest font-mono text-center text-lg"
                                                            placeholder="123456"
                                                            maxLength={6}
                                                            required
                                                      />
                                                </div>
                                          </div>

                                          <div className="text-center">
                                                <button
                                                      type="button"
                                                      onClick={() => setStep(1)}
                                                      className="text-xs text-blue-400 hover:text-blue-300"
                                                >
                                                      Change Email
                                                </button>
                                          </div>

                                          <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 group mt-2 disabled:opacity-50"
                                          >
                                                {loading ? 'Verifying...' : 'Verify & Login'}
                                                {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                                          </button>
                                    </form>
                              )}

                              <div className="mt-8 text-center">
                                    <p className="text-slate-400 text-sm">
                                          Already have an account?{' '}
                                          <Link to="/login" className="text-blue-500 hover:text-blue-400 font-semibold transition-colors">
                                                Sign In
                                          </Link>
                                    </p>
                              </div>
                        </div>
                  </div>
            </div>
      );
};

export default Register;
