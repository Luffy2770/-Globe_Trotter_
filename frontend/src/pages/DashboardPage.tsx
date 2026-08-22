import React, { useState, useEffect } from 'react';
import { dashboardApi, tripsApi } from '../services/api';
import { Search, Calendar, MapPin, DollarSign, Clock, Compass, PlusCircle } from 'lucide-react';

interface DashboardPageProps {
  onOpenCreateModal: () => void;
  onSelectTripForItinerary: (tripId: number) => void;
  onSelectTripForBudget: (tripId: number) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenCreateModal,
  onSelectTripForItinerary,
  onSelectTripForBudget,
}) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [tripsGrouped, setTripsGrouped] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [dashRes, tripsRes] = await Promise.all([
        dashboardApi.getSummary(),
        tripsApi.getTripsListing({ q: searchTerm, status: statusFilter, sort_by: sortBy }),
      ]);
      setDashboardData(dashRes.data);
      setTripsGrouped(tripsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [searchTerm, statusFilter, sortBy]);

  const renderTripCard = (trip: any) => (
    <div
      key={trip.id}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/50 shadow-lg transition flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
              trip.status === 'ongoing'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : trip.status === 'upcoming'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {trip.status}
          </span>
          <span className="text-xs text-slate-400 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{trip.duration_days} Days</span>
          </span>
        </div>

        <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{trip.title}</h3>
        <p className="text-xs text-slate-400 mb-4 line-clamp-2">{trip.description || 'No description provided.'}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-xs text-slate-300">
            <MapPin className="w-4 h-4 text-emerald-400 mr-2" />
            <span>{trip.city_name || 'Multi-City Destination'} ({trip.stops_count} Stops)</span>
          </div>

          <div className="flex items-center text-xs text-slate-300">
            <Calendar className="w-4 h-4 text-teal-400 mr-2" />
            <span>{trip.start_date || 'TBD'} → {trip.end_date || 'TBD'}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800/80">
            <span className="flex items-center text-slate-400">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400 mr-1" /> Target Budget:
            </span>
            <span className="font-bold text-emerald-400">${trip.total_budget.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800">
        <button
          onClick={() => onSelectTripForItinerary(trip.id)}
          className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
        >
          Itinerary Builder
        </button>
        <button
          onClick={() => onSelectTripForBudget(trip.id)}
          className="py-2 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-xl transition"
        >
          Budget Analytics
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {dashboardData?.banner && (
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />
          <img
            src={dashboardData.banner.image_url}
            alt="Hero Banner"
            className="w-full h-64 object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 z-20 p-8 flex flex-col justify-center max-w-2xl space-y-3">
            <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-full w-fit">
              Screen 3 & 6: Landing & Dashboard
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              {dashboardData.banner.title}
            </h1>
            <p className="text-sm text-slate-300">{dashboardData.banner.subtitle}</p>
            <button
              onClick={onOpenCreateModal}
              className="w-fit mt-2 py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl flex items-center space-x-2 shadow-lg transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Plan a New Trip</span>
            </button>
          </div>
        </div>
      )}

      {dashboardData?.top_regional_selections?.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <span>Top Regional Selections</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {dashboardData.top_regional_selections.map((city: any) => (
              <div
                key={city.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-3 hover:border-emerald-500/40 transition group cursor-pointer"
              >
                <img
                  src={city.image_url}
                  alt={city.name}
                  className="w-full h-24 object-cover rounded-xl mb-2 group-hover:scale-105 transition duration-300"
                />
                <h4 className="text-sm font-bold text-white">{city.name}</h4>
                <p className="text-xs text-slate-400">{city.country} • {city.region}</p>
                <div className="flex items-center justify-between text-xs text-amber-400 mt-2 font-semibold">
                  <span>Rating: {city.popularity_rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search bar...... (Search trip name, destination city, or description)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">Group by / All Statuses</option>
            <option value="ongoing">Ongoing</option>
            <option value="upcoming">Up-coming</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="created_at">Sort by: Recent</option>
            <option value="start_date_asc">Sort by: Start Date (Asc)</option>
            <option value="title">Sort by: Title</option>
            <option value="budget">Sort by: Budget</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading trip itinerary data...</div>
      ) : (
        <div className="space-y-8">
          {(!statusFilter || statusFilter === 'ongoing') && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-emerald-400 flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Ongoing Trips</span>
              </h3>
              {tripsGrouped?.ongoing?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {tripsGrouped.ongoing.map(renderTripCard)}
                </div>
              ) : (
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-500">
                  No active ongoing trips currently.
                </div>
              )}
            </div>
          )}

          {(!statusFilter || statusFilter === 'upcoming') && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-amber-400 flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Up-coming Trips</span>
              </h3>
              {tripsGrouped?.upcoming?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {tripsGrouped.upcoming.map(renderTripCard)}
                </div>
              ) : (
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-500">
                  No upcoming trips scheduled.
                </div>
              )}
            </div>
          )}

          {(!statusFilter || statusFilter === 'completed') && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-300 flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                <span>Completed Trips</span>
              </h3>
              {tripsGrouped?.completed?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {tripsGrouped.completed.map(renderTripCard)}
                </div>
              ) : (
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-500">
                  No past completed trips.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
