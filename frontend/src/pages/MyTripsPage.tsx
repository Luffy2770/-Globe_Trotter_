import React, { useState, useEffect } from 'react';
import { tripsApi } from '../services/api';
import { EditTripModal } from './EditTripModal';
import { TripOverviewModal } from './TripOverviewModal';
import { InviteCompanionsModal } from './InviteCompanionsModal';
import { ShareTripModal } from './ShareTripModal';
import { Search, Calendar, MapPin, DollarSign, Clock, Plus, ArrowUpRight, Heart, Trash2, Edit3, Eye, UserPlus, ChevronDown, Share2 } from 'lucide-react';

interface MyTripsPageProps {
  onOpenCreateModal: () => void;
  onSelectTripForItinerary: (tripId: number) => void;
  onSelectTripForBudget: (tripId: number) => void;
  refreshTrigger?: number;
}

export const MyTripsPage: React.FC<MyTripsPageProps> = ({
  onOpenCreateModal,
  onSelectTripForItinerary,
  onSelectTripForBudget,
  refreshTrigger = 0,
}) => {
  const [tripsGrouped, setTripsGrouped] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');

  const [editingTrip, setEditingTrip] = useState<any | null>(null);
  const [overviewTripId, setOverviewTripId] = useState<number | null>(null);
  const [inviteTripId, setInviteTripId] = useState<number | null>(null);
  const [inviteTripTitle, setInviteTripTitle] = useState<string>('');
  const [sharingTrip, setSharingTrip] = useState<any | null>(null);
  const [deletingTripId, setDeletingTripId] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const tripsRes = await tripsApi.getTripsListing({
        q: debouncedSearch,
        status: statusFilter,
        sort_by: sortBy,
      });
      setTripsGrouped(tripsRes.data);
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [debouncedSearch, statusFilter, sortBy, refreshTrigger]);

  const handleDeleteTrip = async (tripId: number, title: string) => {
    if (!window.confirm(`Are you sure you want to remove trip "${title}"?`)) {
      return;
    }

    setDeletingTripId(tripId);
    try {
      await tripsApi.deleteTrip(tripId);
      fetchTrips();
    } catch (err) {
      console.error('Failed to delete trip:', err);
      alert('Failed to remove trip. Please try again.');
    } finally {
      setDeletingTripId(null);
    }
  };

  const renderTripCard = (trip: any, index: number) => (
    <div
      key={trip.id}
      style={{ animationDelay: `${index * 0.06}s` }}
      onClick={() => setOverviewTripId(trip.id)}
      className="group bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-2xs hover:shadow-xl transition duration-300 flex flex-col justify-between cursor-pointer space-y-0 box-border h-[420px]"
    >
      {/* Cover Image Header */}
      <div className="relative h-56 overflow-hidden bg-stone-900 flex-shrink-0">
        <img
          src={
            trip.cover_image_url ||
            'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800'
          }
          alt={trip.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <span
            className={`px-3 py-1 text-[10px] font-extrabold uppercase rounded-full tracking-wider shadow-sm backdrop-blur-md ${
              trip.status === 'ongoing'
                ? 'bg-emerald-800 text-white'
                : trip.status === 'upcoming'
                ? 'bg-amber-500 text-white'
                : 'bg-stone-800 text-stone-200'
            }`}
          >
            {trip.status}
          </span>

          <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-stone-900 text-xs font-extrabold rounded-xl shadow-xs flex items-center">
            <DollarSign className="w-3.5 h-3.5 mr-0.5 text-emerald-800" />
            ${trip.total_budget?.toLocaleString()}
          </span>
        </div>

        {/* Bottom Hero Info & Share/Invite Buttons */}
        <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-widest flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              {trip.city_name || 'Multi-City'} Destination
            </p>

            <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSharingTrip(trip)}
                className="py-1 px-2.5 bg-stone-950/70 hover:bg-stone-950/90 text-white font-bold rounded-xl text-[10px] flex items-center space-x-1 border border-white/20 shadow-2xs backdrop-blur-md transition"
                title="Share Plan with Community"
              >
                <Share2 className="w-3 h-3 text-amber-400" />
                <span>Share</span>
              </button>

              <button
                onClick={() => {
                  setInviteTripId(trip.id);
                  setInviteTripTitle(trip.title);
                }}
                className="py-1 px-2.5 bg-stone-950/70 hover:bg-stone-950/90 text-white font-bold rounded-xl text-[10px] flex items-center space-x-1 border border-white/20 shadow-2xs backdrop-blur-md transition"
                title="Invite Companions"
              >
                <UserPlus className="w-3 h-3 text-emerald-400" />
                <span>Invite</span>
              </button>
            </div>
          </div>

          <h3
            className="text-xl font-serif italic font-bold tracking-tight text-white drop-shadow-xs truncate"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {trip.title}
          </h3>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between bg-white box-border">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 border-b border-stone-100 pb-2.5">
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-emerald-800" />
              {trip.start_date || 'TBD'} to {trip.end_date || 'TBD'}
            </span>
            <span className="flex items-center text-stone-700 font-bold">
              <Clock className="w-3.5 h-3.5 mr-1 text-stone-400" />
              {trip.duration_days} Days
            </span>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed font-medium line-clamp-2">
            {trip.description ||
              `Itinerary planned for ${trip.city_name || 'destinations'} featuring ${trip.stops_count} stops.`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setOverviewTripId(trip.id)}
              title="Inspect Trip Overview"
              className="p-2 text-stone-400 hover:text-emerald-800 rounded-xl hover:bg-emerald-50 transition"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSharingTrip(trip)}
              title="Share Trip Plan"
              className="p-2 text-stone-400 hover:text-emerald-800 rounded-xl hover:bg-emerald-50 transition"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditingTrip(trip)}
              title="Edit Trip Details"
              className="p-2 text-stone-400 hover:text-emerald-800 rounded-xl hover:bg-emerald-50 transition"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteTrip(trip.id, trip.title)}
              disabled={deletingTripId === trip.id}
              title="Remove Trip"
              className="p-2 text-stone-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onSelectTripForItinerary(trip.id)}
              className="py-2 px-3.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition flex items-center space-x-1 box-border h-9"
            >
              <span>Itinerary</span>
              <ArrowUpRight className="w-3 h-3 text-stone-400" />
            </button>
            <button
              onClick={() => onSelectTripForBudget(trip.id)}
              className="py-2 px-3.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs transition flex items-center space-x-1 box-border h-9"
            >
              <span>Budget</span>
              <ArrowUpRight className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-scale-up relative pb-24 font-sans">
      {/* Clean Minimal Hero Banner Header */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-extrabold rounded-full uppercase border border-emerald-200/80">
            Tripyfy Vacations & Itineraries
          </span>
          <h1
            className="text-3xl sm:text-4xl font-serif italic font-bold text-stone-900 tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            My Travel Collection
          </h1>
          <p className="text-xs text-stone-500 font-medium">
            Explore ongoing voyages, upcoming dream vacations, and co-planned companion trips. Click any trip to view details.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="py-3 px-6 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center space-x-2 shadow-2xs transition active:scale-[0.98] flex-shrink-0 h-11"
        >
          <Plus className="w-4 h-4" />
          <span>Plan a New Trip</span>
        </button>
      </div>

      {/* Controls Bar with Rigid Alignment */}
      <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 h-auto md:h-16 box-border">
        <div className="relative flex-1 w-full flex items-center h-10">
          <Search className="w-4 h-4 absolute left-3.5 text-stone-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search trips by title or destination city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-700 transition box-border font-medium"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto h-10">
          <div className="relative flex-1 sm:flex-none h-10">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 bg-stone-50 border border-stone-200 rounded-xl pl-3 pr-8 py-2 text-xs text-stone-700 focus:outline-none focus:border-emerald-700 transition cursor-pointer font-bold appearance-none box-border"
            >
              <option value="">Filter Status (All)</option>
              <option value="ongoing">Current (Ongoing)</option>
              <option value="upcoming">Wishlist / Up-coming</option>
              <option value="completed">Past (Completed)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-3 pointer-events-none" />
          </div>

          <div className="relative flex-1 sm:flex-none h-10">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-10 bg-stone-50 border border-stone-200 rounded-xl pl-3 pr-8 py-2 text-xs text-stone-700 focus:outline-none focus:border-emerald-700 transition cursor-pointer font-bold appearance-none box-border"
            >
              <option value="created_at">Sort: Created Date</option>
              <option value="start_date_asc">Sort: Start Date</option>
              <option value="title">Sort: Title</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-stone-400 text-xs font-medium animate-pulse">
          Loading your travel collection...
        </div>
      ) : (
        <div className="space-y-10">
          {/* Current (Ongoing) Trips Section */}
          {(!statusFilter || statusFilter === 'ongoing') && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-stone-900 flex items-center space-x-2 border-b border-stone-200 pb-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 animate-pulse" />
                <span>Current (Ongoing) Trips</span>
              </h2>
              {tripsGrouped?.ongoing?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tripsGrouped.ongoing.map(renderTripCard)}
                </div>
              ) : (
                <div className="bg-white border border-stone-200 rounded-3xl p-6 text-center text-xs text-stone-400 italic">
                  No active ongoing trips currently.
                </div>
              )}
            </div>
          )}

          {/* Wishlist / Up-coming Trips Section */}
          {(!statusFilter || statusFilter === 'upcoming') && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-stone-900 flex items-center space-x-2 border-b border-stone-200 pb-2.5">
                <Heart className="w-4 h-4 text-amber-500" />
                <span>Wishlist & Up-coming Trips</span>
              </h2>
              {tripsGrouped?.upcoming?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tripsGrouped.upcoming.map(renderTripCard)}
                </div>
              ) : (
                <div className="bg-white border border-stone-200 rounded-3xl p-6 text-center text-xs text-stone-400 italic">
                  No wishlist or upcoming trips scheduled yet.
                </div>
              )}
            </div>
          )}

          {/* Past (Completed) Trips Section */}
          {(!statusFilter || statusFilter === 'completed') && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-stone-900 flex items-center space-x-2 border-b border-stone-200 pb-2.5">
                <Clock className="w-4 h-4 text-stone-400" />
                <span>Past (Completed) Trips</span>
              </h2>
              {tripsGrouped?.completed?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tripsGrouped.completed.map(renderTripCard)}
                </div>
              ) : (
                <div className="bg-white border border-stone-200 rounded-3xl p-6 text-center text-xs text-stone-400 italic">
                  No past completed trips recorded yet.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={onOpenCreateModal}
          className="py-3 px-6 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-full text-xs flex items-center space-x-2 shadow-2xl shadow-emerald-900/30 transition hover:scale-105 active:scale-95 border border-white/20"
        >
          <Plus className="w-4 h-4" />
          <span>Plan a Trip</span>
        </button>
      </div>

      {/* Edit Trip Modal */}
      <EditTripModal
        trip={editingTrip}
        onClose={() => setEditingTrip(null)}
        onTripUpdated={fetchTrips}
      />

      {/* Trip Overview Modal */}
      <TripOverviewModal
        tripId={overviewTripId}
        onClose={() => setOverviewTripId(null)}
        onSelectItinerary={onSelectTripForItinerary}
        onSelectBudget={onSelectTripForBudget}
      />

      {/* Invite Companions Modal */}
      <InviteCompanionsModal
        tripId={inviteTripId}
        tripTitle={inviteTripTitle}
        onClose={() => setInviteTripId(null)}
        onMembersUpdated={fetchTrips}
      />

      {/* Share Trip Modal */}
      {sharingTrip && (
        <ShareTripModal
          trip={sharingTrip}
          onClose={() => setSharingTrip(null)}
        />
      )}
    </div>
  );
};
