import React, { useState, useEffect } from 'react';
import { dashboardApi, tripsApi } from '../services/api';
import { MapView } from '../components/MapView';
import { Search, Calendar, MapPin, DollarSign, Clock, Compass, PlusCircle, ArrowUpRight, Sparkles, Map } from 'lucide-react';

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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');

  // Debounce search term by 300ms to avoid unnecessary API queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [dashRes, tripsRes] = await Promise.all([
        dashboardApi.getSummary(),
        tripsApi.getTripsListing({ q: debouncedSearch, status: statusFilter, sort_by: sortBy }),
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
  }, [debouncedSearch, statusFilter, sortBy]);

  const mapMarkers = (dashboardData?.top_regional_selections || []).map((city: any) => ({
    id: city.id,
    name: city.name,
    country: city.country,
    latitude: city.latitude != null ? city.latitude : 20.0,
    longitude: city.longitude != null ? city.longitude : 0.0,
    image_url: city.image_url,
  }));

  const renderTripCard = (trip: any, index: number) => (
    <div
      key={trip.id}
      style={{ animationDelay: `${index * 0.08}s` }}
      className="apple-card p-6 flex flex-col justify-between animate-fade-in group"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <span
            className={`px-3 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider transition ${
              trip.status === 'ongoing'
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : trip.status === 'upcoming'
                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}
          >
            {trip.status}
          </span>
          <span className="text-xs text-slate-400 font-medium flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{trip.duration_days} Days</span>
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition line-clamp-1">
          {trip.title}
        </h3>
        <p className="text-xs text-slate-500 mb-5 line-clamp-2 leading-relaxed">
          {trip.description || 'Personalized trip itinerary.'}
        </p>

        <div className="space-y-2.5 mb-5">
          <div className="flex items-center text-xs text-slate-700 font-medium">
            <MapPin className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
            <span className="truncate">{trip.city_name || 'Destination'} ({trip.stops_count} Stops)</span>
          </div>

          <div className="flex items-center text-xs text-slate-700 font-medium">
            <Calendar className="w-4 h-4 text-teal-500 mr-2 flex-shrink-0" />
            <span>{trip.start_date || 'TBD'} to {trip.end_date || 'TBD'}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-700 pt-3 border-t border-slate-100 font-semibold">
            <span className="text-slate-400 flex items-center">
              <DollarSign className="w-3.5 h-3.5 text-slate-400 mr-0.5" /> Target Budget:
            </span>
            <span className="text-slate-900 font-bold text-sm">${trip.total_budget.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
        <button
          onClick={() => onSelectTripForItinerary(trip.id)}
          className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-2xl border border-slate-200 transition flex items-center justify-center space-x-1 active:scale-[0.97]"
        >
          <span>Itinerary</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
        <button
          onClick={() => onSelectTripForBudget(trip.id)}
          className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 text-xs font-semibold rounded-2xl transition flex items-center justify-center space-x-1 active:scale-[0.97]"
        >
          <span>Budget</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-blue-500" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-10 animate-scale-up">
      {dashboardData?.banner && (
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl group">
          <img
            src={dashboardData.banner.image_url}
            alt="Hero Banner"
            className="w-full h-64 sm:h-72 object-cover object-center opacity-40 group-hover:scale-105 transition duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/70 to-transparent p-10 md:p-14 lg:p-16 flex flex-col justify-center max-w-2xl space-y-4">
            <span className="px-3.5 py-1 bg-white/20 backdrop-blur-md text-white text-[11px] font-bold rounded-full w-fit flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 mr-1.5 inline" />
              Explore & Plan
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {dashboardData.banner.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed max-w-lg">
              {dashboardData.banner.subtitle}
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenCreateModal}
                className="py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-2xl flex items-center space-x-2 shadow-lg shadow-blue-600/25 transition active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Plan Trip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {mapMarkers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Map className="w-4 h-4 text-blue-600" />
              <span>Interactive Destinations Map</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">Click markers to explore cities</span>
          </div>
          <MapView markers={mapMarkers} zoom={2} height="320px" />
        </div>
      )}

      {dashboardData?.top_regional_selections?.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Global Destinations Catalog ({dashboardData.top_regional_selections.length} Cities)</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">Curated world selections</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {dashboardData.top_regional_selections.map((city: any, idx: number) => (
              <div
                key={city.id}
                style={{ animationDelay: `${idx * 0.05}s` }}
                className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer group animate-fade-in"
              >
                <div className="overflow-hidden rounded-xl mb-2.5">
                  <img
                    src={city.image_url}
                    alt={city.name}
                    className="w-full h-28 object-cover group-hover:scale-110 transition duration-500 ease-out"
                  />
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                  {city.name}
                </h4>
                <p className="text-[11px] text-slate-400 font-medium truncate">{city.country} • {city.region}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search trips by title or destination city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 transition cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="ongoing">Ongoing</option>
            <option value="upcoming">Up-coming</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 transition cursor-pointer"
          >
            <option value="created_at">Sort: Recent</option>
            <option value="start_date_asc">Sort: Start Date</option>
            <option value="title">Sort: Title</option>
            <option value="budget">Sort: Budget</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs font-medium animate-pulse">
          Refreshing trip itineraries...
        </div>
      ) : (
        <div className="space-y-8">
          {(!statusFilter || statusFilter === 'ongoing') && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>Ongoing Trips</span>
              </h3>
              {tripsGrouped?.ongoing?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tripsGrouped.ongoing.map(renderTripCard)}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 text-xs text-slate-400 italic">
                  No active ongoing trips.
                </div>
              )}
            </div>
          )}

          {(!statusFilter || statusFilter === 'upcoming') && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Up-coming Trips</span>
              </h3>
              {tripsGrouped?.upcoming?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tripsGrouped.upcoming.map(renderTripCard)}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 text-xs text-slate-400 italic">
                  No upcoming trips scheduled.
                </div>
              )}
            </div>
          )}

          {(!statusFilter || statusFilter === 'completed') && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Completed Trips</span>
              </h3>
              {tripsGrouped?.completed?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tripsGrouped.completed.map(renderTripCard)}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 text-xs text-slate-400 italic">
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
