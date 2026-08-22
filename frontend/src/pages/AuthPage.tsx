import React, { useState } from 'react';
import { authApi } from '../services/api';
import { TripyfyLogo } from '../components/TripyfyLogo';
import { User, Lock, Mail, Phone, MapPin } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authApi.login({ username_or_email: username, password });
      onLoginSuccess(res.data.user, res.data.access_token);
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.response?.data?.detail || 'Invalid username or password. Check form fields.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        username: username.trim(),
        email: email.trim(),
        password: password,
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
        phone_number: phone.trim() || undefined,
        city: city.trim() || undefined,
        country: country.trim() || undefined,
        additional_info: additionalInfo.trim() || undefined,
      };

      const res = await authApi.register(payload);
      onLoginSuccess(res.data.user, res.data.access_token);
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.detail || 'Registration failed. Check form fields and password rules.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950 via-stone-900 to-zinc-950 opacity-95" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md bg-white border border-stone-200/90 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 animate-scale-up">
        {/* Header Logo */}
        <div className="flex flex-col items-center text-center space-y-2 pb-2">
          <TripyfyLogo size="lg" showText={true} />
          <p className="text-xs text-stone-500 font-medium">
            {isRegisterMode ? 'Create your new Tripyfy account' : 'Sign in to access your travel itineraries'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl animate-fade-in">
            {error}
          </div>
        )}

        {/* Form Selection */}
        {!isRegisterMode ? (
          /* Screen 1: Login Form */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="flex flex-col items-center pb-2">
              <div className="w-16 h-16 rounded-full bg-stone-100 border-2 border-stone-200 text-stone-400 flex items-center justify-center shadow-xs">
                <User className="w-8 h-8" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Username / Email</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="text"
                  required
                  placeholder="Enter username or email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="password"
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Login to Tripyfy'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsRegisterMode(true)}
                className="text-xs font-bold text-emerald-800 hover:underline"
              >
                Need an account? Register Users
              </button>
            </div>
          </form>
        ) : (
          /* Screen 2: Registration Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email *</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">First Name</label>
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Last Name</label>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 chars (Aa1@)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">City</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Country</label>
                <input
                  type="text"
                  placeholder="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Additional Information</label>
              <textarea
                rows={2}
                placeholder="Travel preferences or bio..."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:border-emerald-700"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Register Users'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsRegisterMode(false)}
                className="text-xs font-bold text-emerald-800 hover:underline"
              >
                Already have an account? Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
