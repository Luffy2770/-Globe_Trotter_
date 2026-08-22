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
      className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span
            className={`px-3 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider ${
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
            <Clock className="w-3.5 h-3.5" />
            <span>{trip.duration_days} Days</span>
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">{trip.title}</h3>
        <p className="text-xs text-slate-500 mb-4 line-clamp-2">{trip.description || 'Personalized trip itinerary.'}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-xs text-slate-600 font-medium">
            <MapPin className="w-3.5 h-3.5 text-blue-500 mr-2" />
            <span>{trip.city_name || 'Destination'} ({trip.stops_count} Stops)</span>
          </div>

          <div className="flex items-center text-xs text-slate-600 font-medium">
            <Calendar className="w-3.5 h-3.5 text-teal-500 mr-2" />
            <span>{trip.start_date || 'TBD'} → {trip.end_date || 'TBD'}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-slate-100 font-semibold">
            <span className="text-slate-400 flex items-center">
              <DollarSign className="w-3.5 h-3.5 text-slate-400 mr-0.5" /> Target Budget:
            </span>
            <span className="text-slate-900">${trip.total_budget.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
        <button
          onClick={() => onSelectTripForItinerary(trip.id)}
          className="py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-2xl border border-slate-200 transition"
        >
          Itinerary
        </button>
        <button
          onClick={() => onSelectTripForBudget(trip.id)}
          className="py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 text-xs font-semibold rounded-2xl transition"
        >
          Budget
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {dashboardData?.banner && (
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl">
          <img
            src={dashboardData.banner.image_url}
            alt="Hero Banner"
            className="w-full h-56 object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 p-8 flex flex-col justify-center max-w-xl space-y-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[11px] font-bold rounded-full w-fit">
              Explore & Plan
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {dashboardData.banner.title}
            </h1>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">{dashboardData.banner.subtitle}</p>
            <button
              onClick={onOpenCreateModal}
              className="w-fit mt-3 py-2.5 px-5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-2xl flex items-center space-x-2 shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Plan a New Trip</span>
            </button>
          </div>
        </div>
      )}

      {dashboardData?.top_regional_selections?.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Compass className="w-4 h-4 text-blue-600" />
            <span>Top Destinations</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {dashboardData.top_regional_selections.map((city: any) => (
              <div
                key={city.id}
                className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm hover:shadow-md transition cursor-pointer group"
              >
                <img
                  src={city.image_url}
                  alt={city.name}
                  className="w-full h-24 object-cover rounded-xl mb-2 group-hover:scale-[1.02] transition"
                />
                <h4 className="text-xs font-bold text-slate-900">{city.name}</h4>
                <p className="text-[11px] text-slate-400 font-medium">{city.country}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search trip name, destination city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="ongoing">Ongoing</option>
            <option value="upcoming">Up-coming</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="created_at">Sort: Recent</option>
            <option value="start_date_asc">Sort: Start Date</option>
            <option value="title">Sort: Title</option>
            <option value="budget">Sort: Budget</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs font-medium">Loading trips...</div>
      ) : (
        <div className="space-y-8">
          {(!statusFilter || statusFilter === 'ongoing') && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Ongoing Trips</span>
              </h3>
              {tripsGrouped?.ongoing?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {tripsGrouped.ongoing.map(renderTripCard)}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs text-slate-400 italic">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {tripsGrouped.upcoming.map(renderTripCard)}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs text-slate-400 italic">
                  No upcoming trips.
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {tripsGrouped.completed.map(renderTripCard)}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs text-slate-400 italic">
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
