import React, { useState } from 'react';
import { profileApi } from '../services/api';
import { TripyfyLogo } from '../components/TripyfyLogo';
import { User as UserIcon, Mail, Phone, MapPin, Save, LogOut, CheckCircle, Heart, Globe, DollarSign, Bell } from 'lucide-react';

interface ProfilePreferencesPageProps {
  user: any;
  onUpdateUser: (updatedUser: any) => void;
  onLogout: () => void;
}

export const ProfilePreferencesPage: React.FC<ProfilePreferencesPageProps> = ({
  user,
  onUpdateUser,
  onLogout,
}) => {
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [city, setCity] = useState(user?.city || '');
  const [country, setCountry] = useState(user?.country || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photo_url || '');
  const [additionalInfo, setAdditionalInfo] = useState(user?.additional_info || '');

  const [budgetPreference, setBudgetPreference] = useState<string>('Standard');
  const [preferredContinents, setPreferredContinents] = useState<string[]>(['Europe', 'Asia']);
  const [interests, setInterests] = useState<string[]>(['Culture & History', 'Sightseeing']);
  const [currency, setCurrency] = useState<string>('USD ($)');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const continentsList = ['Europe', 'Asia', 'Americas', 'Middle East', 'Africa', 'Oceania'];
  const interestsList = [
    'Culture & History',
    'Adventure & Outdoors',
    'Culinary & Dining',
    'Relaxation & Beach',
    'Sightseeing & Architecture',
  ];

  const toggleContinent = (cont: string) => {
    if (preferredContinents.includes(cont)) {
      setPreferredContinents(preferredContinents.filter((c) => c !== cont));
    } else {
      setPreferredContinents([...preferredContinents, cont]);
    }
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setError('');

    try {
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone_number: phoneNumber.trim() || null,
        city: city.trim() || null,
        country: country.trim() || null,
        photo_url: photoUrl.trim() || null,
        additional_info: additionalInfo.trim() || null,
      };

      const res = await profileApi.updateProfile(payload);
      onUpdateUser(res.data);
      setSuccessMessage('Profile and preferences updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please check form fields.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <TripyfyLogo size="md" showText={true} />

          <button
            onClick={onLogout}
            className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center space-x-1.5 transition"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-8 space-y-6">
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-2xl flex items-center space-x-2 animate-fade-in shadow-xs">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-2xl animate-fade-in shadow-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <UserIcon className="w-5 h-5 text-blue-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
                <p className="text-xs text-slate-500 font-medium">Manage your personal account profile details.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-2">
              <div className="relative">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="User Avatar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-50 border-2 border-blue-200 text-blue-600 flex items-center justify-center font-bold text-2xl shadow-xs">
                    {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
                  </div>
                )}
              </div>

              <div className="space-y-1 text-center sm:text-left">
                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full border border-slate-200 inline-block">
                  @{user?.username || 'traveler'}
                </span>
                <p className="text-xs text-slate-400 font-medium">Unique Account Handle</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. San Francisco"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  placeholder="e.g. USA"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Avatar / Photo URL</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">About / Travel Persona</label>
              <textarea
                rows={3}
                placeholder="Share a short bio or travel description..."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <Heart className="w-5 h-5 text-rose-500" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Travel Preferences</h2>
                <p className="text-xs text-slate-500 font-medium">Customize your preferred travel style and destination choices.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center">
                <DollarSign className="w-3.5 h-3.5 text-teal-600 mr-1" />
                Budget Preference
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['Economy', 'Standard', 'Luxury / Premium'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBudgetPreference(b)}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-semibold border transition ${
                      budgetPreference === b
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center">
                <Globe className="w-3.5 h-3.5 text-blue-500 mr-1" />
                Preferred Continents & Regions
              </label>
              <div className="flex flex-wrap gap-2">
                {continentsList.map((cont) => {
                  const isSelected = preferredContinents.includes(cont);
                  return (
                    <button
                      key={cont}
                      type="button"
                      onClick={() => toggleContinent(cont)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                        isSelected
                          ? 'bg-blue-50 text-blue-600 border-blue-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cont} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Activity Interests</label>
              <div className="flex flex-wrap gap-2">
                {interestsList.map((int) => {
                  const isSelected = interests.includes(int);
                  return (
                    <button
                      key={int}
                      type="button"
                      onClick={() => toggleInterest(int)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                        isSelected
                          ? 'bg-teal-50 text-teal-700 border-teal-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {int} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="GBP (£)">GBP (£)</option>
                  <option value="JPY (¥)">JPY (¥)</option>
                  <option value="INR (₹)">INR (₹)</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-5">
                <span className="text-xs font-semibold text-slate-700 flex items-center">
                  <Bell className="w-3.5 h-3.5 text-amber-500 mr-1.5" />
                  Email Notifications
                </span>
                <button
                  type="button"
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    notificationsEnabled
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {notificationsEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="py-3 px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs flex items-center space-x-2 shadow-md transition active:scale-[0.98] disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile & Preferences'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
