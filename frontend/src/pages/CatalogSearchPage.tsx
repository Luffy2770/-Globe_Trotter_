import React, { useState, useEffect } from 'react';
import { activitiesApi, tripsApi, itineraryApi } from '../services/api';
import { Search, Star, Clock, MapPin, PlusCircle, Check } from 'lucide-react';

export const CatalogSearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('rating_desc');
  const [groupBy, setGroupBy] = useState('none');

  const [results, setResults] = useState<any[]>([]);
  const [groupedResults, setGroupedResults] = useState<any>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Selection Modal state
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const [userTrips, setUserTrips] = useState<any[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [tripStops, setTripStops] = useState<any[]>([]);
  const [selectedStopId, setSelectedStopId] = useState<number | null>(null);
  const [assignSuccessMessage, setAssignSuccessMessage] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await activitiesApi.searchCatalog({
        q: searchTerm || undefined,
        category: category || undefined,
        sort_by: sortBy,
        group_by: groupBy,
      });
      if (groupBy !== 'none' && res.data.grouped_results) {
        setGroupedResults(res.data.grouped_results);
        setResults([]);
        setTotalCount(0);
      } else {
        setResults(res.data.results || []);
        setTotalCount(res.data.total || 0);
        setGroupedResults(null);
      }
    } catch (err) {
      console.error('Catalog search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [searchTerm, category, sortBy, groupBy]);

  const openAssignModal = async (activity: any) => {
    setSelectedActivity(activity);
    setAssignSuccessMessage('');
    try {
      const res = await tripsApi.getTripsListing({});
      const tripsList = [...(res.data.ongoing || []), ...(res.data.upcoming || [])];
      setUserTrips(tripsList);
      if (tripsList.length > 0) {
        setSelectedTripId(tripsList[0].id);
        const stopsRes = await itineraryApi.getStops(tripsList[0].id);
        setTripStops(stopsRes.data);
        if (stopsRes.data.length > 0) {
          setSelectedStopId(stopsRes.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load user trips for activity assignment:', err);
    }
  };

  const handleTripChange = async (tId: number) => {
    setSelectedTripId(tId);
    try {
      const stopsRes = await itineraryApi.getStops(tId);
      setTripStops(stopsRes.data);
      if (stopsRes.data.length > 0) {
        setSelectedStopId(stopsRes.data[0].id);
      } else {
        setSelectedStopId(null);
      }
    } catch (err) {
      console.error('Failed to fetch stops for trip:', err);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripId || !selectedStopId || !selectedActivity) return;
    setAssignLoading(true);
    setAssignSuccessMessage('');

    try {
      await itineraryApi.assignActivity(selectedTripId, selectedStopId, {
        activity_id: selectedActivity.id,
      });
      setAssignSuccessMessage(`Successfully added "${selectedActivity.name}" to your trip itinerary!`);
      setTimeout(() => {
        setSelectedActivity(null);
        setAssignSuccessMessage('');
      }, 1800);
    } catch (err) {
      console.error('Failed to assign activity to stop:', err);
    } finally {
      setAssignLoading(false);
    }
  };

  const renderOptionCard = (item: any, idx: number) => (
    <div
      key={item.id}
      style={{ animationDelay: `${idx * 0.06}s` }}
      className="apple-card p-6 flex flex-col justify-between animate-fade-in group hover:shadow-lg transition"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 text-[11px] font-bold rounded-full uppercase tracking-wider">
            {item.category}
          </span>
          <span className="text-xs font-bold text-amber-500 flex items-center space-x-1">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{item.rating}</span>
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition line-clamp-1">
          {item.name}
        </h3>
        <p className="text-xs text-slate-500 mb-3 font-medium flex items-center">
          <MapPin className="w-3.5 h-3.5 text-blue-500 mr-1" />
          {item.city_name}, {item.country_name}
        </p>

        <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
          {item.description || 'Option details and full itinerary information.'}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center font-medium">
            <Clock className="w-3.5 h-3.5 text-teal-600 mr-1" />
            {item.duration_minutes} mins
          </span>
          <span className="font-bold text-slate-900 text-sm">${item.estimated_cost}</span>
        </div>

        <button
          onClick={() => openAssignModal(item)}
          className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add to Trip Itinerary</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-scale-up">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-full border border-blue-200">
            Catalog Options & Discovery
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Search Activities & Destinations</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search (e.g. Paragliding, Museum, Tokyo, Food)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="Sightseeing">Sightseeing</option>
            <option value="Culture">Culture</option>
            <option value="Adventure">Adventure</option>
            <option value="History">History</option>
          </select>

          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="none">Group by: None</option>
            <option value="category">Group by: Category</option>
            <option value="city">Group by: City</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer md:col-span-1 sm:col-span-2"
          >
            <option value="rating_desc">Sort: Rating (High to Low)</option>
            <option value="cost_low">Sort: Cost (Low to High)</option>
            <option value="cost_high">Sort: Cost (High to Low)</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs font-medium animate-pulse">
          Searching catalog options...
        </div>
      ) : groupedResults ? (
        <div className="space-y-6">
          {Object.entries(groupedResults).map(([groupKey, groupItems]: [string, any]) => (
            <div key={groupKey} className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">{groupKey}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupItems.map((item: any, idx: number) => renderOptionCard(item, idx))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Results ({totalCount} Options found)</h2>
          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((item, idx) => renderOptionCard(item, idx))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-xs text-slate-400 italic">
              No matching options found for "{searchTerm}". Try searching "Paragliding", "Museum", or "Tokyo".
            </div>
          )}
        </div>
      )}

      {/* Activity Selection Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Add to Trip Itinerary</h3>
            <p className="text-xs text-slate-500 font-medium">
              Assign <strong className="text-slate-900">{selectedActivity.name}</strong> (${selectedActivity.estimated_cost}) to your active trip.
            </p>

            {assignSuccessMessage ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{assignSuccessMessage}</span>
              </div>
            ) : userTrips.length > 0 ? (
              <form onSubmit={handleAssignSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Active Trip</label>
                  <select
                    value={selectedTripId || ''}
                    onChange={(e) => handleTripChange(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    {userTrips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.city_name || 'Destination'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Trip Stop / Section</label>
                  {tripStops.length > 0 ? (
                    <select
                      value={selectedStopId || ''}
                      onChange={(e) => setSelectedStopId(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    >
                      {tripStops.map((s, idx) => (
                        <option key={s.id} value={s.id}>
                          Section {idx + 1}: {s.city?.name || 'Stop'} (${s.stay_cost} stay)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-xs text-rose-500 italic font-medium">
                      No stops found in this trip. Please add a city stop to the trip first.
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedActivity(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assignLoading || !selectedStopId}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-sm disabled:opacity-50"
                  >
                    {assignLoading ? 'Adding...' : 'Confirm & Add to Trip'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 text-center py-4">
                <p className="text-xs text-slate-500 italic">You don't have any active trips scheduled yet.</p>
                <button
                  type="button"
                  onClick={() => setSelectedActivity(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
