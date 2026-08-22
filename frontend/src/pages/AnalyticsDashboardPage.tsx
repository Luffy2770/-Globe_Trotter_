import React, { useState, useEffect } from 'react';
import { tripsApi } from '../services/api';
import { DollarSign, CheckCircle2, MapPin, TrendingUp, ArrowUpRight, PieChart, Activity, ChevronDown } from 'lucide-react';

interface AnalyticsDashboardPageProps {
  onSelectTripForBudget: (tripId: number) => void;
}

export const AnalyticsDashboardPage: React.FC<AnalyticsDashboardPageProps> = ({ onSelectTripForBudget }) => {
  const [loading, setLoading] = useState(true);
  const [tripsData, setTripsData] = useState<any>(null);
  const [selectedTripId, setSelectedTripId] = useState<number | 'all'>('all');

  useEffect(() => {
    tripsApi
      .getTripsListing({})
      .then((res) => setTripsData(res.data))
      .catch((err) => console.error('Failed to load analytics trips:', err))
      .finally(() => setLoading(false));
  }, []);

  const ongoingTrips = tripsData?.ongoing || [];
  const upcomingTrips = tripsData?.upcoming || [];
  const completedTrips = tripsData?.completed || [];
  const allTrips = [...ongoingTrips, ...upcomingTrips, ...completedTrips];

  // Dynamically calculate total spend from saved itinerary sections across all trips
  let totalCalculatedSpendSum = 0;
  allTrips.forEach((t) => {
    const savedSecsJson = localStorage.getItem(`tripyfy_itinerary_sections_${t.id}`);
    if (savedSecsJson) {
      const secs: any[] = JSON.parse(savedSecsJson);
      secs.forEach((s) => {
        totalCalculatedSpendSum += Number(s.budget) || 0;
        (s.activities || []).forEach((act: any) => {
          totalCalculatedSpendSum += Number(act.cost) || 0;
        });
      });
    } else {
      totalCalculatedSpendSum += t.calculated_total_cost || t.total_budget || 0;
    }
  });

  const selectedTrip = selectedTripId !== 'all' ? allTrips.find((t) => t.id === selectedTripId) : null;

  // Single Trip spend calculation
  let singleTripSpend = 0;
  if (selectedTrip) {
    const savedSecsJson = localStorage.getItem(`tripyfy_itinerary_sections_${selectedTrip.id}`);
    if (savedSecsJson) {
      const secs: any[] = JSON.parse(savedSecsJson);
      secs.forEach((s) => {
        singleTripSpend += Number(s.budget) || 0;
        (s.activities || []).forEach((act: any) => {
          singleTripSpend += Number(act.cost) || 0;
        });
      });
    } else {
      singleTripSpend = selectedTrip.calculated_total_cost || selectedTrip.total_budget || 0;
    }
  }

  const totalTripsCount = allTrips.length;
  const completedCount = completedTrips.length;
  const totalBudgetSum = allTrips.reduce((acc, t) => acc + (t.total_budget || 0), 0);
  const uniqueCitiesCount = new Set(allTrips.map((t) => t.city_name).filter(Boolean)).size;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-scale-up pb-24 font-sans">
      {/* Page Header & Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1
            className="text-3xl font-serif italic font-bold text-stone-900"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Travel Analytics & Budget Dashboard
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Filter analytics by single trip or inspect aggregate travel expenditure breakdowns.
          </p>
        </div>

        {/* Trip Selector Dropdown */}
        <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl border border-stone-200 shadow-xs">
          <label className="text-xs font-bold text-stone-600 pl-2">Filter Analytics:</label>
          <div className="relative">
            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-stone-50 border border-stone-200 rounded-xl pl-3 pr-8 py-1.5 text-xs text-stone-900 font-bold focus:outline-none focus:border-emerald-700 cursor-pointer appearance-none"
            >
              <option value="all">All Trips (Aggregate Summary)</option>
              {allTrips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.city_name})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-stone-400 text-xs font-medium animate-pulse">
          Calculating trip analytics...
        </div>
      ) : selectedTrip ? (
        /* SINGLE TRIP ANALYTICAL VIEW */
        <div className="space-y-6 animate-fade-in">
          {/* Hero Single Trip Summary */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full uppercase border border-emerald-200">
                Single Trip Analytics: {selectedTrip.status}
              </span>
              <h2
                className="text-2xl sm:text-3xl font-serif italic font-bold text-stone-900"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {selectedTrip.title}
              </h2>
              <p className="text-xs text-stone-500 font-medium flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                Destination: {selectedTrip.city_name || 'Multi-City'} • {selectedTrip.duration_days} Days ({selectedTrip.start_date} to {selectedTrip.end_date})
              </p>
            </div>

            <button
              onClick={() => onSelectTripForBudget(selectedTrip.id)}
              className="py-2.5 px-5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center space-x-2 shadow-xs transition"
            >
              <span>Manage Trip Budget</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* 3 Metric Cards for Single Trip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Target Budget</span>
              <p className="text-3xl font-black text-stone-900">${selectedTrip.total_budget?.toLocaleString()}</p>
              <p className="text-[11px] text-stone-500 font-medium">Allocated budget ceiling</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Calculated Spend</span>
              <p className="text-3xl font-black text-emerald-800">${singleTripSpend.toLocaleString()}</p>
              <p className="text-[11px] text-stone-500 font-medium">Sections + itemized activities</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Remaining Balance</span>
              <p className="text-3xl font-black text-stone-900">
                ${Math.max(0, (selectedTrip.total_budget || 0) - singleTripSpend).toLocaleString()}
              </p>
              <p className="text-[11px] text-stone-500 font-medium">Available budget cushion</p>
            </div>
          </div>

          {/* Single Trip Category Distribution & Progress Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center space-x-2">
                <PieChart className="w-4 h-4 text-emerald-800" />
                <span>{selectedTrip.title} Category Split</span>
              </h3>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-stone-700">
                    <span>Accommodations & Hotel Stay (55%)</span>
                    <span>${Math.round(singleTripSpend * 0.55).toLocaleString()}</span>
                  </div>
                  <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-700 rounded-full" style={{ width: '55%' }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-stone-700">
                    <span>Sightseeing & Tours (25%)</span>
                    <span>${Math.round(singleTripSpend * 0.25).toLocaleString()}</span>
                  </div>
                  <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-stone-700">
                    <span>Dining & Culinary (20%)</span>
                    <span>${Math.round(singleTripSpend * 0.20).toLocaleString()}</span>
                  </div>
                  <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '20%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-800" />
                  <span>Budget Utilization Gauge</span>
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  Currently utilized {Math.min(100, Math.round((singleTripSpend / (selectedTrip.total_budget || 1)) * 100))}% of total budget.
                </p>
              </div>

              <div className="space-y-2 py-4">
                <div className="flex justify-between text-sm font-extrabold text-stone-900">
                  <span>Budget Health</span>
                  <span className="text-emerald-800">Healthy & On Track</span>
                </div>
                <div className="w-full h-4 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                  <div
                    className="h-full bg-emerald-700 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((singleTripSpend / (selectedTrip.total_budget || 1)) * 100))}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 text-xs text-stone-400 font-medium">
                Tip: Add section budgets and activities on the Itinerary Builder to update this gauge.
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ALL TRIPS AGGREGATE VIEW */
        <div className="space-y-8 animate-fade-in">
          {/* Top 4 Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Trips Completed</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-stone-900">{completedCount}</p>
              <p className="text-[11px] text-stone-500 font-medium">Out of {totalTripsCount} total planned trips</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Total Travel Spend</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-stone-900">${totalCalculatedSpendSum.toLocaleString()}</p>
              <p className="text-[11px] text-stone-500 font-medium">Total budget sum: ${totalBudgetSum.toLocaleString()}</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Destinations Visited</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-stone-900">{uniqueCitiesCount}</p>
              <p className="text-[11px] text-stone-500 font-medium">Unique global destination cities</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Active & Wishlist</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-stone-900">{ongoingTrips.length + upcomingTrips.length}</p>
              <p className="text-[11px] text-stone-500 font-medium">Upcoming & active vacations</p>
            </div>
          </div>

          {/* Individual Trip Expense Breakdown Table */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3">
              Individual Trip Budget Breakdown
            </h3>

            <div className="space-y-3">
              {allTrips.map((trip) => {
                let tripSpend = 0;
                const savedSecsJson = localStorage.getItem(`tripyfy_itinerary_sections_${trip.id}`);
                if (savedSecsJson) {
                  const secs: any[] = JSON.parse(savedSecsJson);
                  secs.forEach((s) => {
                    tripSpend += Number(s.budget) || 0;
                    (s.activities || []).forEach((act: any) => {
                      tripSpend += Number(act.cost) || 0;
                    });
                  });
                } else {
                  tripSpend = trip.calculated_total_cost || trip.total_budget || 0;
                }

                const percent = Math.min(Math.round((tripSpend / (trip.total_budget || 1)) * 100), 100);

                return (
                  <div
                    key={trip.id}
                    className="p-4 bg-stone-50/70 border border-stone-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-stone-900">{trip.title}</span>
                        <span className="text-[10px] font-bold text-stone-400">({trip.city_name})</span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-medium">
                        Target Budget: ${trip.total_budget?.toLocaleString()} • Calculated Spend: ${tripSpend.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="w-32 space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-stone-600">
                          <span>Spend</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              percent > 90 ? 'bg-amber-500' : 'bg-emerald-700'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedTripId(trip.id)}
                        className="py-2 px-3 bg-white border border-stone-200 hover:border-emerald-700 text-stone-700 text-xs font-bold rounded-xl transition flex items-center space-x-1 shadow-2xs"
                      >
                        <span>Single Trip Analytics</span>
                        <ArrowUpRight className="w-3 h-3 text-stone-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
