import React, { useState, useEffect } from 'react';
import { TripyfyLogo } from './TripyfyLogo';
import { invitesApi } from '../services/api';
import { InviteInboxModal } from '../pages/InviteInboxModal';
import { Calendar, Search, LogOut, User as UserIcon, Plus, BarChart3, CalendarDays, Layers, Mail, Users } from 'lucide-react';

interface NavbarProps {
  user: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onOpenCreateModal: () => void;
  onTripDataChanged?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  onOpenCreateModal,
  onTripDataChanged,
}) => {
  const [showInboxModal, setShowInboxModal] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchInboxCount = async () => {
    try {
      const res = await invitesApi.getInbox();
      const pending = res.data.filter((i: any) => i.status === 'pending').length;
      setPendingCount(pending);
    } catch (err) {
      // ignore if unauthenticated
    }
  };

  useEffect(() => {
    fetchInboxCount();
    const interval = setInterval(fetchInboxCount, 15000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50 px-6 py-2.5 shadow-2xs font-sans">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-10">
          {/* Left Logo */}
          <div onClick={() => setActiveTab('explore')} className="cursor-pointer flex items-center h-full">
            <TripyfyLogo size="md" showText={true} />
          </div>

          {/* Center Tabs Bar */}
          <div className="flex items-center space-x-1 bg-stone-100/80 p-1 rounded-2xl border border-stone-200/60 h-10 box-border">
            <button
              onClick={() => setActiveTab('explore')}
              className={`h-8 flex items-center space-x-2 px-3.5 rounded-xl text-xs font-semibold transition box-border ${
                activeTab === 'explore'
                  ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Explore</span>
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className={`h-8 flex items-center space-x-2 px-3.5 rounded-xl text-xs font-semibold transition box-border ${
                activeTab === 'community'
                  ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Community</span>
            </button>

            <button
              onClick={() => setActiveTab('trips')}
              className={`h-8 flex items-center space-x-2 px-3.5 rounded-xl text-xs font-semibold transition box-border ${
                activeTab === 'trips'
                  ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>My Trips</span>
            </button>

            <button
              onClick={() => setActiveTab('itinerary')}
              className={`h-8 flex items-center space-x-2 px-3.5 rounded-xl text-xs font-semibold transition box-border ${
                activeTab === 'itinerary'
                  ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Itinerary</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`h-8 flex items-center space-x-2 px-3.5 rounded-xl text-xs font-semibold transition box-border ${
                activeTab === 'calendar'
                  ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`h-8 flex items-center space-x-2 px-3.5 rounded-xl text-xs font-semibold transition box-border ${
                activeTab === 'analytics'
                  ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
          </div>

          {/* Right Actions, Inbox & Profile */}
          <div className="flex items-center space-x-3 h-full">
            {/* Invite Inbox Button */}
            <button
              onClick={() => setShowInboxModal(true)}
              title="Trip Invitations Inbox"
              className="relative h-8 px-2.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition flex items-center space-x-1.5 box-border"
            >
              <Mail className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden sm:inline text-[11px] font-bold">Inbox</span>
              {pendingCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-700 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenCreateModal}
              className="h-8 flex items-center space-x-1.5 px-3.5 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-white shadow-2xs transition active:scale-[0.98] box-border"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Plan Trip</span>
            </button>

            <div className="flex items-center space-x-2 border-l border-stone-200 pl-3 h-full">
              <button
                onClick={() => setActiveTab('profile')}
                title="User Profile & Preferences"
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition box-border ${
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
                className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 transition flex items-center justify-center"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Invite Inbox Modal */}
      {showInboxModal && (
        <InviteInboxModal
          onClose={() => {
            setShowInboxModal(false);
            fetchInboxCount();
          }}
          onInviteAccepted={() => {
            fetchInboxCount();
            if (onTripDataChanged) onTripDataChanged();
          }}
        />
      )}
    </>
  );
};
