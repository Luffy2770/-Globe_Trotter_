import React from 'react';
import { Compass, MapPin, Calendar, PieChart, LogOut, User as UserIcon, PlusCircle, Search } from 'lucide-react';

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
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="bg-emerald-600 p-2 rounded-xl text-white">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              GlobeTrotter
            </span>
            <span className="block text-xs text-slate-400 font-medium">Personalized Travel Planner</span>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">My Trips</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'catalog'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Explore Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('itinerary')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'itinerary'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Itinerary Builder</span>
          </button>

          <button
            onClick={() => setActiveTab('budget')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'budget'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span className="hidden sm:inline">Budget Analytics</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow transition ml-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden md:inline">+ Plan a Trip</span>
          </button>
        </div>

        <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
          <div className="flex items-center space-x-2 text-slate-300 text-sm">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-emerald-400 font-semibold">
              {user?.first_name ? user.first_name[0].toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <span className="hidden lg:inline font-medium text-slate-200">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
            </span>
          </div>

          <button
            onClick={onLogout}
            title="Sign out"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};
