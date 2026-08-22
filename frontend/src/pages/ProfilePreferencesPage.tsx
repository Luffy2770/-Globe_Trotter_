import React, { useState, useEffect } from 'react';
import { tripsApi, profileApi } from '../services/api';
import { Camera, MapPin, Calendar, Settings, Grid, Edit3, Check, Globe } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'trips' | 'settings'>('trips');
  const [userTrips, setUserTrips] = useState<any[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  // Profile Form state
  const [firstName, setFirstName] = useState(user?.first_name || 'Luffy');
  const [lastName, setLastName] = useState(user?.last_name || 'Monkey');
  const [city, setCity] = useState(user?.city || 'Tokyo');
  const [country, setCountry] = useState(user?.country || 'Japan');
  const [photoUrl, setPhotoUrl] = useState(user?.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400');
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(user?.cover_photo_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200');
  const [bio, setBio] = useState(user?.additional_info || 'World traveler exploring iconic cities across the seven seas. 🌊✈️');

  const [saving, setSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    tripsApi
      .getTripsListing({})
      .then((res) => {
        const all = [...(res.data.ongoing || []), ...(res.data.upcoming || []), ...(res.data.completed || [])];
        setUserTrips(all);
      })
      .catch((err) => console.error('Failed to load trips for profile:', err))
      .finally(() => setLoadingTrips(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        city,
        country,
        photo_url: photoUrl,
        cover_photo_url: coverPhotoUrl,
        additional_info: bio,
      };

      const res = await profileApi.updateProfile(payload);
      onUpdateUser({ ...user, ...res.data });
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to save profile preferences.');
    } finally {
      setSaving(false);
    }
  };

  const totalBudgetManaged = userTrips.reduce((acc, t) => acc + (t.total_budget || 0), 0);
  const uniqueCities = new Set(userTrips.map((t) => t.city_name).filter(Boolean)).size;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-scale-up pb-24 font-sans">
      {/* 1. LinkedIn & Instagram Hybrid Hero Header */}
      <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-xs relative">
        {/* Cover Photo Banner (LinkedIn Style) */}
        <div className="h-48 sm:h-64 w-full relative bg-stone-900 overflow-hidden">
          <img
            src={coverPhotoUrl}
            alt="Cover Banner"
            className="w-full h-full object-cover object-center opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />

          {/* Edit Cover Photo Button */}
          <button
            onClick={() => setShowEditModal(true)}
            className="absolute top-4 right-4 py-2 px-3 bg-stone-950/60 hover:bg-stone-950/80 backdrop-blur-md text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition border border-white/20"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Edit Cover Banner</span>
          </button>
        </div>

        {/* Profile Info Row (Instagram Style Overlay) */}
        <div className="px-6 sm:px-8 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            {/* Avatar PFP (Overlaid bottom-left) */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-xl overflow-hidden bg-stone-100">
                <img
                  src={photoUrl}
                  alt={`${firstName} ${lastName}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="absolute bottom-1 right-1 p-2 bg-emerald-800 text-white rounded-full shadow-md hover:bg-emerald-700 transition border-2 border-white"
                title="Change Avatar PFP"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="py-2.5 px-5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-2xl transition flex items-center space-x-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={onLogout}
                className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-2xl transition"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* User Bio & Details */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center space-x-2">
                <h1
                  className="text-2xl sm:text-3xl font-serif italic font-bold text-stone-900"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {firstName} {lastName}
                </h1>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-extrabold rounded-full uppercase border border-emerald-200">
                  Verified Traveler
                </span>
              </div>
              <p className="text-xs font-semibold text-stone-400 mt-0.5">@{user?.username || 'luffy'}</p>
            </div>

            <p className="text-xs text-stone-700 max-w-2xl leading-relaxed font-medium">
              {bio}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-stone-500 pt-1">
              <span className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                {city}, {country}
              </span>
              <span>•</span>
              <span className="flex items-center">
                <Globe className="w-3.5 h-3.5 mr-1 text-blue-600" />
                Tripyfy Explorer
              </span>
            </div>
          </div>

          {/* Instagram-Style Stat Counters Bar */}
          <div className="grid grid-cols-3 gap-4 border-t border-stone-100 pt-5 mt-6 text-center">
            <div className="space-y-0.5">
              <p className="text-xl sm:text-2xl font-black text-stone-900">{userTrips.length}</p>
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Trips Planned</span>
            </div>

            <div className="space-y-0.5 border-x border-stone-100">
              <p className="text-xl sm:text-2xl font-black text-emerald-800">{uniqueCities}</p>
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Cities Visited</span>
            </div>

            <div className="space-y-0.5">
              <p className="text-xl sm:text-2xl font-black text-stone-900">${totalBudgetManaged.toLocaleString()}</p>
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Budget Managed</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Instagram Tab Switcher */}
      <div className="flex items-center justify-center border-b border-stone-200">
        <button
          onClick={() => setActiveTab('trips')}
          className={`flex items-center space-x-2 py-3 px-6 text-xs font-extrabold uppercase tracking-wider border-b-2 transition ${
            activeTab === 'trips'
              ? 'border-emerald-800 text-emerald-800'
              : 'border-transparent text-stone-400 hover:text-stone-700'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>My Trips Feed ({userTrips.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center space-x-2 py-3 px-6 text-xs font-extrabold uppercase tracking-wider border-b-2 transition ${
            activeTab === 'settings'
              ? 'border-emerald-800 text-emerald-800'
              : 'border-transparent text-stone-400 hover:text-stone-700'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings & Preferences</span>
        </button>
      </div>

      {/* 3. Tab Content */}
      {activeTab === 'trips' ? (
        /* Instagram-Style Post Grid for My Trips */
        <div className="space-y-4">
          {loadingTrips ? (
            <div className="py-16 text-center text-stone-400 text-xs font-medium animate-pulse">
              Loading Instagram-style trip grid...
            </div>
          ) : userTrips.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {userTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="group bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition duration-300 flex flex-col justify-between"
                >
                  <div className="relative h-48 overflow-hidden bg-stone-100">
                    <img
                      src={
                        trip.cover_image_url ||
                        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800'
                      }
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-emerald-800/90 backdrop-blur-md text-white text-[10px] font-bold uppercase rounded-full">
                      {trip.city_name || 'Destination'}
                    </span>
                    <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-white/90 backdrop-blur-md text-stone-900 text-[10px] font-extrabold rounded-md">
                      ${trip.total_budget?.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3
                      className="text-base font-serif italic font-bold text-stone-900 truncate"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {trip.title}
                    </h3>

                    <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 pt-1 border-t border-stone-100">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-emerald-700" />
                        {trip.duration_days} Days
                      </span>
                      <span className="capitalize text-emerald-800 font-extrabold">{trip.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center text-xs text-stone-400 italic">
              No trips created yet. Click "Plan Trip" in the navbar to start your travel feed.
            </div>
          )}
        </div>
      ) : (
        /* Settings & Preferences Form */
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 max-w-2xl mx-auto">
          <div className="border-b border-stone-100 pb-3">
            <h2 className="text-lg font-bold text-stone-900">Profile & Preferences Settings</h2>
            <p className="text-xs text-stone-500 font-medium">Update your account name, avatar URL, cover photo URL, and bio.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Avatar PFP Image URL</label>
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">LinkedIn-Style Cover Banner Photo URL</label>
              <input
                type="text"
                value={coverPhotoUrl}
                onChange={(e) => setCoverPhotoUrl(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Profile Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-700"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="py-2.5 px-6 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition"
              >
                <Check className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Profile Quick Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] w-screen h-screen flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-md overflow-hidden font-sans">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative my-auto">
            <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
              Edit Avatar & Cover Banner
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Avatar PFP Image URL</label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Cover Banner Photo URL</label>
                <input
                  type="text"
                  value={coverPhotoUrl}
                  onChange={(e) => setCoverPhotoUrl(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Bio</label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-600 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-800 text-white text-xs font-bold rounded-xl"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
