import React, { useState, useEffect } from 'react';
import { tripsApi } from '../services/api';
import { Search, Calendar, MapPin, DollarSign, Clock, Plus, ArrowUpRight, Heart } from 'lucide-react';

interface MyTripsPageProps {
  onOpenCreateModal: () => void;
  onSelectTripForItinerary: (tripId: number) => void;
  onSelectTripForBudget: (tripId: number) => void;
}

export const MyTripsPage: React.FC<MyTripsPageProps> = ({
  onOpenCreateModal,
  onSelectTripForItinerary,
  onSelectTripForBudget,
}) => {
  const [tripsGrouped, setTripsGrouped] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');

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
  }, [debouncedSearch, statusFilter, sortBy]);

  const renderTripCard = (trip: any, index: number) => (
    <div
      key={trip.id}
      style={{ animationDelay: `${index * 0.08}s` }}
      className="apple-card p-6 border border-stone-200/90 rounded-3xl shadow-xs hover:shadow-md transition animate-fade-in space-y-4 bg-white"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-2">
        <div className="flex items-center space-x-3">
          <span
            className={`px-3 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider ${
              trip.status === 'ongoing'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : trip.status === 'upcoming'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-stone-100 text-stone-500 border border-stone-200'
            }`}
          >
            {trip.status}
          </span>
          <h3
            className="text-lg font-serif italic font-bold text-stone-900"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {trip.title}
          </h3>
        </div>

        <div className="flex items-center space-x-2 text-xs text-stone-500 font-medium">
          <Clock className="w-3.5 h-3.5 text-stone-400" />
          <span>Duration: {trip.duration_days} Days</span>
        </div>
      </div>

      <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-100 space-y-2">
        <p className="text-xs text-stone-600 leading-relaxed font-medium">
          {trip.description || `Trip itinerary for ${trip.city_name || 'destinations'} featuring ${trip.stops_count} trip stops and scheduled activities.`}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-stone-700 font-semibold">
          <div className="flex items-center">
            <MapPin className="w-3.5 h-3.5 text-emerald-700 mr-1.5" />
            <span>Destination: {trip.city_name || 'Multi-City'} ({trip.stops_count} Stops)</span>
          </div>

          <div className="flex items-center">
            <Calendar className="w-3.5 h-3.5 text-teal-700 mr-1.5" />
            <span>Dates: {trip.start_date || 'TBD'} to {trip.end_date || 'TBD'}</span>
          </div>

          <div className="flex items-center">
            <DollarSign className="w-3.5 h-3.5 text-stone-500 mr-0.5" />
            <span>Target Budget: ${trip.total_budget.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-1">
        <button
          onClick={() => onSelectTripForItinerary(trip.id)}
          className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition flex items-center space-x-1"
        >
          <span>Build Itinerary</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
        </button>
        <button
          onClick={() => onSelectTripForBudget(trip.id)}
          className="py-2.5 px-4 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1"
        >
          <span>View Budget Analytics</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-scale-up relative pb-24 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1
            className="text-2xl font-serif italic font-bold text-stone-900"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            My Trips & Vacation Plans
          </h1>
          <p className="text-xs text-stone-500 font-medium">Manage current ongoing trips, past completed trips, and wishlist vacations.</p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="py-2.5 px-5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center space-x-2 shadow-xs transition active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Plan a New Trip</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Search trips by title or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-700 transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700 focus:outline-none focus:border-emerald-700 transition cursor-pointer font-medium"
          >
            <option value="">Filter Status (All)</option>
            <option value="ongoing">Current (Ongoing)</option>
            <option value="upcoming">Wishlist / Up-coming</option>
            <option value="completed">Past (Completed)</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700 focus:outline-none focus:border-emerald-700 transition cursor-pointer font-medium"
          >
            <option value="created_at">Sort: Created Date</option>
            <option value="start_date_asc">Sort: Start Date</option>
            <option value="title">Sort: Title</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-stone-400 text-xs font-medium animate-pulse">
          Loading your trip itineraries...
        </div>
      ) : (
        <div className="space-y-8">
          {/* Current (Ongoing) Trips Section */}
          {(!statusFilter || statusFilter === 'ongoing') && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-stone-900 flex items-center space-x-2 border-b border-stone-200 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 animate-pulse" />
                <span>Current (Ongoing) Trips</span>
              </h2>
              {tripsGrouped?.ongoing?.length > 0 ? (
                <div className="space-y-4">
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
              <h2 className="text-base font-bold text-stone-900 flex items-center space-x-2 border-b border-stone-200 pb-2">
                <Heart className="w-4 h-4 text-amber-500" />
                <span>Wishlist & Up-coming Trips</span>
              </h2>
              {tripsGrouped?.upcoming?.length > 0 ? (
                <div className="space-y-4">
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
              <h2 className="text-base font-bold text-stone-900 flex items-center space-x-2 border-b border-stone-200 pb-2">
                <Clock className="w-4 h-4 text-stone-400" />
                <span>Past (Completed) Trips</span>
              </h2>
              {tripsGrouped?.completed?.length > 0 ? (
                <div className="space-y-4">
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

      {/* Floating Action Button (+ Plan a trip) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={onOpenCreateModal}
          className="py-3 px-6 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-full text-xs flex items-center space-x-2 shadow-2xl shadow-emerald-900/30 transition hover:scale-105 active:scale-95 border border-white/20"
        >
          <Plus className="w-4 h-4" />
          <span>Plan a trip</span>
        </button>
      </div>
    </div>
  );
};
