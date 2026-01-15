import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
            <div className="flex justify-center items-center h-[80vh]">
                  <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Login</h1>
                        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
                        <form onSubmit={onSubmit}>
                              <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                                    <input
                                          type="email"
                                          name="email"
                                          value={email}
                                          onChange={onChange}
                                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          required
                                    />
                              </div>
                              <div className="mb-6">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                                    <input
                                          type="password"
                                          name="password"
                                          value={password}
                                          onChange={onChange}
                                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          required
                                    />
                              </div>
                              <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                              >
                                    Login
                              </button>
                        </form>
                        <p className="mt-4 text-center">
                              Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
                        </p>
                  </div>
            </div>
      );
};

export default Login;
