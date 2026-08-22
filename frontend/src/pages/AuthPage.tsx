import React, { useState } from 'react';
import { authApi } from '../services/api';
import { User, Lock, Mail, Phone, MapPin, Globe, Sparkles, AlertCircle, ArrowRight, Camera } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    username_or_email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    photo_url: '',
    city: '',
    country: '',
    additional_info: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    setGeneralError('');
  };

  const validateRegistrationPassword = (pwd: string): string | null => {
    if (pwd.length < 6) return 'Password must be at least 6 characters long.';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter (A-Z).';
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number (0-9).';
    if (!/[@$!%*?&#]/.test(pwd)) return 'Password must contain at least one special character (e.g. @, $, #, !).';
    return null;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGeneralError('');
    setFieldErrors({});

    try {
      const payload = {
        username_or_email: formData.username_or_email || formData.username,
        password: formData.password,
      };
      const res = await authApi.login(payload);
      if (res.data && res.data.access_token) {
        localStorage.setItem('token', res.data.access_token);
        onLoginSuccess(res.data.user, res.data.access_token);
      } else {
        setGeneralError('Invalid response from server.');
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        if (detail.toLowerCase().includes('password')) {
          setFieldErrors({ password: 'Incorrect password entered. Please check and try again.' });
        } else if (detail.toLowerCase().includes('username') || detail.toLowerCase().includes('user')) {
          setFieldErrors({ username_or_email: 'Account not found with this username or email.' });
        } else {
          setGeneralError(detail);
        }
      } else {
        setGeneralError('Authentication failed. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGeneralError('');
    setFieldErrors({});

    const pwdError = validateRegistrationPassword(formData.password);
    if (pwdError) {
      setFieldErrors({ password: pwdError });
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.register(formData);
      if (res.data && res.data.access_token) {
        localStorage.setItem('token', res.data.access_token);
        onLoginSuccess(res.data.user, res.data.access_token);
      } else {
        setGeneralError('Registration completed. Please sign in.');
        setIsLogin(true);
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        if (detail.toLowerCase().includes('username')) {
          setFieldErrors({ username: 'This username is already taken. Please choose another.' });
        } else if (detail.toLowerCase().includes('email')) {
          setFieldErrors({ email: 'An account with this email address already exists.' });
        } else {
          setGeneralError(detail);
        }
      } else if (Array.isArray(detail)) {
        const errors: { [key: string]: string } = {};
        detail.forEach((item: any) => {
          const loc = item.loc?.[item.loc.length - 1];
          if (loc) errors[loc] = item.msg;
        });
        setFieldErrors(errors);
      } else {
        setGeneralError('Registration failed. Please check form fields.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setGeneralError('');
    setFieldErrors({});
    try {
      const res = await authApi.demoLogin();
      if (res.data && res.data.access_token) {
        localStorage.setItem('token', res.data.access_token);
        onLoginSuccess(res.data.user, res.data.access_token);
      }
    } catch (err: any) {
      setGeneralError('Demo login unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 flex items-center justify-center p-4">
      <div className={`w-full ${isLogin ? 'max-w-md' : 'max-w-xl'} bg-white border border-slate-200 rounded-3xl shadow-xl transition-all duration-300 overflow-hidden`}>
        
        {/* Top Header & Demo Login Bar */}
        <div className="p-6 text-center bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">GlobeTrotter</h1>
            <p className="text-[11px] text-slate-500 font-medium">Travel Planning Platform</p>
          </div>
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>1-Click Demo Login</span>
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Wireframe Circular Photo Placeholder */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-300 flex flex-col items-center justify-center text-slate-400 overflow-hidden relative shadow-xs">
              {formData.photo_url ? (
                <img src={formData.photo_url} alt="Photo" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera className="w-6 h-6 text-slate-400 mb-0.5" />
                  <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">Photo</span>
                </>
              )}
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {isLogin ? 'Login Screen (Screen 1)' : 'Registration Screen (Screen 2)'}
            </h2>
          </div>

          {generalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium rounded-xl flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{generalError}</span>
            </div>
          )}

          {isLogin ? (
            /* Screen 1: Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    name="username_or_email"
                    required
                    placeholder="Enter Username"
                    value={formData.username_or_email}
                    onChange={handleChange}
                    className={`w-full bg-slate-50 border ${
                      fieldErrors.username_or_email ? 'border-rose-400' : 'border-slate-200'
                    } rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white`}
                  />
                </div>
                {fieldErrors.username_or_email && (
                  <p className="mt-1 text-[11px] text-rose-500 font-medium">{fieldErrors.username_or_email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="Enter Password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full bg-slate-50 border ${
                      fieldErrors.password ? 'border-rose-400' : 'border-slate-200'
                    } rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white`}
                  />
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-[11px] text-rose-500 font-medium">{fieldErrors.password}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-sm transition active:scale-[0.98]"
                >
                  <span>{loading ? 'Logging in...' : 'Login Button'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setIsLogin(false); setGeneralError(''); setFieldErrors({}); }}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Don't have an account? Register Users
                </button>
              </div>
            </form>
          ) : (
            /* Screen 2: Registration Form (Matching Wireframe Grid) */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      placeholder="First Name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      placeholder="Last Name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full bg-white border ${
                          fieldErrors.email ? 'border-rose-400' : 'border-slate-200'
                        } rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500`}
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="mt-1 text-[11px] text-rose-500 font-medium">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        name="phone_number"
                        placeholder="Phone Number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                    <div className="relative">
                      <Globe className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        name="country"
                        placeholder="Country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    name="username"
                    required
                    placeholder="Choose Username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full bg-white border ${
                      fieldErrors.username ? 'border-rose-400' : 'border-slate-200'
                    } rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500`}
                  />
                  {fieldErrors.username && (
                    <p className="mt-1 text-[11px] text-rose-500 font-medium">{fieldErrors.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password * (Min 6 chars, uppercase, number, & special char @, $, #)
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="Enter Password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full bg-white border ${
                      fieldErrors.password ? 'border-rose-400' : 'border-slate-200'
                    } rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500`}
                  />
                  {fieldErrors.password && (
                    <p className="mt-1 text-[11px] text-rose-500 font-medium">{fieldErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Information ....</label>
                  <textarea
                    name="additional_info"
                    rows={3}
                    placeholder="Additional Information ...."
                    value={formData.additional_info}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs shadow-sm transition active:scale-[0.98]"
                >
                  {loading ? 'Registering...' : 'Register Users'}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setIsLogin(true); setGeneralError(''); setFieldErrors({}); }}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Already have an account? Login Screen
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
