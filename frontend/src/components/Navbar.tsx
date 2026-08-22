import React from 'react';
import { Compass, Calendar, Search, LogOut, User as UserIcon, PlusCircle } from 'lucide-react';

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
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-6 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('explore')}>
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-xs">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">GlobeTrotter</span>
            <span className="block text-[10px] text-slate-400 font-medium tracking-wide uppercase">Explore & Plan</span>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'explore'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Explore Cities</span>
          </button>

          <button
            onClick={() => setActiveTab('trips')}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'trips'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>My Trips</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenCreateModal}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden md:inline">Plan Trip</span>
          </button>

          <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
            <button
              onClick={() => setActiveTab('profile')}
              title="User Profile & Preferences"
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition ${
                activeTab === 'profile'
                  ? 'border-blue-600 bg-blue-50 text-blue-600 ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-slate-100 text-slate-700 hover:border-slate-300'
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
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
