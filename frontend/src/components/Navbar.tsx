import React from 'react';
import { TripyfyLogo } from './TripyfyLogo';
import { Calendar, Search, LogOut, User as UserIcon, Plus } from 'lucide-react';

interface NavbarProps {
  user: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onOpenCreateModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  onOpenCreateModal,
}) => {
  return (
    <nav className="bg-[#f8f9fa]/90 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-50 px-6 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div onClick={() => setActiveTab('explore')}>
          <TripyfyLogo size="md" showText={true} />
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 bg-stone-200/50 p-1 rounded-2xl border border-stone-300/40">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'explore'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Explore Cities</span>
          </button>

          <button
            onClick={() => setActiveTab('trips')}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'trips'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>My Trips</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenCreateModal}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Plan Trip</span>
          </button>

          <div className="flex items-center space-x-2 border-l border-stone-200 pl-3">
            <button
              onClick={() => setActiveTab('profile')}
              title="User Profile & Preferences"
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition ${
                activeTab === 'profile'
                  ? 'border-emerald-700 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600/20'
                  : 'border-stone-200 bg-stone-100 text-stone-700 hover:border-stone-300'
              }`}
            >
              {user?.photo_url ? (
                <img src={user.photo_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : user?.first_name ? (
                user.first_name[0].toUpperCase()
              ) : (
                <UserIcon className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={onLogout}
              title="Sign out"
              className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
