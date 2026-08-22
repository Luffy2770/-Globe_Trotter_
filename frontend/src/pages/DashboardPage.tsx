import React, { useState, useEffect } from 'react';
import { dashboardApi, tripsApi } from '../services/api';
import { Search, Calendar, MapPin, DollarSign, Clock, Compass, PlusCircle, ArrowUpRight, Sparkles, Globe } from 'lucide-react';

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
  const [selectedContinent, setSelectedContinent] = useState('All');
  const [groupBy, setGroupBy] = useState('none');
  const [sortBy, setSortBy] = useState('created_at');

  const continents = ['All', 'Europe', 'Asia', 'Americas', 'Middle East', 'Africa', 'Oceania'];

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

  const filteredSelections = (dashboardData?.top_regional_selections || []).filter((city: any) => {
    if (selectedContinent === 'All') return true;
    return city.region?.toLowerCase() === selectedContinent.toLowerCase();
  });

  const renderTripCard = (trip: any, index: number) => (
    <div
      key={trip.id}
      style={{ animationDelay: `${index * 0.08}s` }}
      className="apple-card p-6 flex flex-col justify-between animate-fade-in group hover:shadow-lg transition flex-shrink-0 w-80 sm:w-96"
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
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-scale-up relative pb-24">
      
      {/* 1. Large Hero Banner Image Container */}
      {dashboardData?.banner && (
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl group border border-slate-200">
          <img
            src={dashboardData.banner.image_url}
            alt="Banner Image"
            className="w-full h-64 sm:h-80 object-cover object-center opacity-45 group-hover:scale-105 transition duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent p-10 md:p-14 lg:p-16 flex flex-col justify-center max-w-2xl space-y-4">
            <span className="px-3.5 py-1 bg-white/20 backdrop-blur-md text-white text-[11px] font-bold rounded-full w-fit flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 mr-1.5 inline" />
              Explore & Plan
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              {dashboardData.banner.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed max-w-lg">
              {dashboardData.banner.subtitle}
            </p>
          </div>
        </div>
      )}

      {/* 2. Search & Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search bar ....."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 transition cursor-pointer font-medium"
          >
            <option value="none">Group by</option>
            <option value="status">Group by Status</option>
            <option value="city">Group by Destination</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 transition cursor-pointer font-medium"
          >
            <option value="">Filter (All)</option>
            <option value="ongoing">Ongoing</option>
            <option value="upcoming">Up-coming</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 transition cursor-pointer font-medium"
          >
            <option value="created_at">Sort by...</option>
            <option value="start_date_asc">Sort: Start Date</option>
            <option value="title">Sort: Title</option>
            <option value="budget">Sort: Budget</option>
          </select>
        </div>
      </div>

      {/* 3. Top Regional Selections Section (Single Horizontally Scrollable Row with ALL Destinations) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Compass className="w-4 h-4 text-blue-600" />
            <span>Top Regional Selections ({filteredSelections.length} Destinations)</span>
          </h2>

          {/* Continent Filter Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            <Globe className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
            {continents.map((cont) => (
              <button
                key={cont}
                onClick={() => setSelectedContinent(cont)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedContinent === cont
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cont}
              </button>
            ))}
          </div>
        </div>

        {filteredSelections.length > 0 ? (
          /* Single Horizontally Scrollable Row */
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300 snap-x">
            {filteredSelections.map((city: any, idx: number) => (
              <div
                key={city.id}
                style={{ animationDelay: `${idx * 0.03}s` }}
                className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer group animate-fade-in flex-shrink-0 w-48 snap-start"
              >
                <div className="overflow-hidden rounded-xl mb-2.5">
                  <img
                    src={city.image_url}
                    alt={city.name}
                    className="w-full h-32 object-cover group-hover:scale-110 transition duration-500 ease-out"
                  />
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                  {city.name}
                </h4>
                <p className="text-[11px] text-slate-400 font-medium truncate">{city.country} • {city.region}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-400 italic">
            No destination cities available for continent "{selectedContinent}".
          </div>
        )}
      </div>

      {/* 4. Previous Trips Section (Single Horizontally Scrollable Row) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Previous Trips</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">All recorded trips</span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs font-medium animate-pulse">
            Loading previous trips...
          </div>
        ) : (
          <div className="space-y-6">
            {(!statusFilter || statusFilter === 'ongoing') && tripsGrouped?.ongoing?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span>Ongoing Trips</span>
                </h3>
                <div className="flex space-x-4 overflow-x-auto pb-4 snap-x">
                  {tripsGrouped.ongoing.map(renderTripCard)}
                </div>
              </div>
            )}

            {(!statusFilter || statusFilter === 'upcoming') && tripsGrouped?.upcoming?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Up-coming Trips</span>
                </h3>
                <div className="flex space-x-4 overflow-x-auto pb-4 snap-x">
                  {tripsGrouped.upcoming.map(renderTripCard)}
                </div>
              </div>
            )}

            {(!statusFilter || statusFilter === 'completed') && tripsGrouped?.completed?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>Completed Trips</span>
                </h3>
                <div className="flex space-x-4 overflow-x-auto pb-4 snap-x">
                  {tripsGrouped.completed.map(renderTripCard)}
                </div>
              </div>
            )}

            {!tripsGrouped?.ongoing?.length && !tripsGrouped?.upcoming?.length && !tripsGrouped?.completed?.length && (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-xs text-slate-400 italic">
                No trips matching search query. Click "+ Plan a trip" below to create a new trip itinerary.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Floating Bottom-Right Action Button (+ Plan a trip) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={onOpenCreateModal}
          className="py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full text-xs flex items-center space-x-2 shadow-2xl shadow-blue-600/40 transition hover:scale-105 active:scale-95 border border-white/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Plan a trip</span>
        </button>
      </div>
    </div>
  );
};
