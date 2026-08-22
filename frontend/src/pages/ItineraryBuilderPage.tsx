import React, { useState, useEffect } from 'react';
import { itineraryApi, citiesApi, activitiesApi } from '../services/api';
import { Plus, Trash2, Calendar, DollarSign, Tag } from 'lucide-react';

interface ItineraryBuilderPageProps {
  tripId: number;
}

export const ItineraryBuilderPage: React.FC<ItineraryBuilderPageProps> = ({ tripId }) => {
  const [stops, setStops] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddStopModal, setShowAddStopModal] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<number>(1);
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [stayCost, setStayCost] = useState(500);

  const [selectedStopId, setSelectedStopId] = useState<number | null>(null);
  const [availableActivities, setAvailableActivities] = useState<any[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [costOverride, setCostOverride] = useState<number | ''>('');

  const fetchStops = async () => {
    setLoading(true);
    try {
      const res = await itineraryApi.getStops(tripId);
      setStops(res.data);
    } catch (err) {
      console.error('Failed to fetch trip stops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStops();
    citiesApi.search().then((res) => setCities(res.data));
  }, [tripId]);

  const handleAddStopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (arrivalDate && departureDate && departureDate < arrivalDate) {
      alert('Departure date cannot be earlier than arrival date.');
      return;
    }

    try {
      const payload = {
        city_id: Number(selectedCityId),
        arrival_date: arrivalDate || null,
        departure_date: departureDate || null,
        stay_cost: Number(stayCost),
      };
      await itineraryApi.addStop(tripId, payload);
      setShowAddStopModal(false);
      fetchStops();
    } catch (err) {
      console.error('Failed to add stop:', err);
    }
  };

  const handleDeleteStop = async (stopId: number) => {
    if (!confirm('Are you sure you want to delete this trip section?')) return;
    try {
      await itineraryApi.deleteStop(tripId, stopId);
      fetchStops();
    } catch (err) {
      console.error('Failed to delete stop:', err);
    }
  };

  const openAssignActivityModal = async (stop: any) => {
    setSelectedStopId(stop.id);
    try {
      const res = await activitiesApi.getSuggestions({ city_id: stop.city_id, limit: 10 });
      setAvailableActivities(res.data);
      if (res.data.length > 0) setSelectedActivityId(res.data[0].id);
    } catch (err) {
      console.error('Failed to fetch catalog activities:', err);
    }
  };

  const handleAssignActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStopId || !selectedActivityId) return;
    try {
      const payload = {
        activity_id: selectedActivityId,
        cost_override: costOverride !== '' ? Number(costOverride) : null,
      };
      await itineraryApi.assignActivity(tripId, selectedStopId, payload);
      setSelectedStopId(null);
      fetchStops();
    } catch (err) {
      console.error('Failed to assign activity:', err);
    }
  };

  const handleRemoveActivity = async (stopId: number, activityItemId: number) => {
    try {
      await itineraryApi.removeActivity(tripId, stopId, activityItemId);
      fetchStops();
    } catch (err) {
      console.error('Failed to remove activity:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-scale-up">
      {/* Screen 5 Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-full border border-blue-200">
            Build Itinerary Screen (Screen 5)
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Trip Sections & Itinerary Builder</h1>
          <p className="text-xs text-slate-500 font-medium">All necessary information about trip sections, travel, hotel stay, and activities.</p>
        </div>

        <button
          onClick={() => setShowAddStopModal(true)}
          className="py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs flex items-center space-x-2 shadow-sm transition active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add another Section</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs font-medium animate-pulse">
          Loading itinerary sections...
        </div>
      ) : (
        <div className="space-y-6">
          {stops.map((stop, index) => {
            const totalSectionActivitiesCost = (stop.activities || []).reduce((acc: number, ta: any) => acc + (ta.effective_cost || 0), 0);
            const totalSectionBudget = (stop.stay_cost || 0) + totalSectionActivitiesCost;

            return (
              <div
                key={stop.id}
                style={{ animationDelay: `${index * 0.1}s` }}
                className="apple-card p-6 shadow-xs hover:shadow-md transition animate-fade-in space-y-5"
              >
                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 font-extrabold text-xs rounded-xl border border-blue-200">
                      Section {index + 1}:
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      {stop.city?.name || 'Destination'}, {stop.city?.country || 'Region'}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleDeleteStop(stop.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Section Details Paragraph (Matching Wireframe) */}
                <div className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-4 rounded-2xl border border-slate-100 font-medium">
                  All the necessary information about this section. This includes travel details for {stop.city?.name || 'this stop'}, hotel stay budget, and scheduled activities.
                </div>

                {/* Scheduled Activities */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                      <Tag className="w-3.5 h-3.5 text-blue-500 mr-1" />
                      <span>Activities & Events ({stop.activities?.length || 0})</span>
                    </h4>
                    <button
                      onClick={() => openAssignActivityModal(stop)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-500 flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Activity to Section</span>
                    </button>
                  </div>

                  {stop.activities?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {stop.activities.map((ta: any) => (
                        <div
                          key={ta.id}
                          className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between hover:border-blue-200 transition"
                        >
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-600 rounded-md">
                              {ta.activity?.category}
                            </span>
                            <h5 className="text-xs font-bold text-slate-900 mt-1">{ta.activity?.name}</h5>
                            <p className="text-[11px] text-slate-500 font-medium">
                              Cost: <span className="text-slate-900 font-bold">${ta.effective_cost}</span>
                            </p>
                          </div>

                          <button
                            onClick={() => handleRemoveActivity(stop.id, ta.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200/60 rounded-2xl p-3.5 text-xs text-slate-400 italic">
                      No activities assigned to this section yet.
                    </div>
                  )}
                </div>

                {/* Wireframe Control Buttons Row: Date Range & Section Budget */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-700 flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>Date Range: <strong className="text-slate-900">{stop.arrival_date || 'TBD'} to {stop.departure_date || 'TBD'}</strong></span>
                  </div>

                  <div className="bg-blue-50/80 border border-blue-200 rounded-2xl px-4 py-3 text-xs font-semibold text-blue-700 flex items-center justify-between">
                    <span className="flex items-center">
                      <DollarSign className="w-4 h-4 text-blue-600 mr-1 flex-shrink-0" />
                      Budget of this section:
                    </span>
                    <span className="text-blue-950 font-extrabold text-sm">${totalSectionBudget.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Bottom Add Section Button */}
          <div className="text-center pt-4">
            <button
              onClick={() => setShowAddStopModal(true)}
              className="py-3.5 px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs inline-flex items-center space-x-2 shadow-md transition active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add another Section</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Section Modal */}
      {showAddStopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Add another Section</h3>
            <form onSubmit={handleAddStopSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Destination City</label>
                <select
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}, {c.country} ({c.region})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Stay / Accommodation Cost ($ USD)</label>
                <input
                  type="number"
                  min="0"
                  value={stayCost}
                  onChange={(e) => setStayCost(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Arrival Date</label>
                  <input
                    type="date"
                    value={arrivalDate}
                    onChange={(e) => {
                      setArrivalDate(e.target.value);
                      if (departureDate && e.target.value > departureDate) setDepartureDate(e.target.value);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Departure Date</label>
                  <input
                    type="date"
                    min={arrivalDate || undefined}
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddStopModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-sm">
                  Add Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Activity Modal */}
      {selectedStopId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Assign Activity to Section</h3>
            <form onSubmit={handleAssignActivitySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Activity</label>
                <select
                  value={selectedActivityId || ''}
                  onChange={(e) => setSelectedActivityId(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  {availableActivities.map((act) => (
                    <option key={act.id} value={act.id}>
                      {act.name} (${act.estimated_cost}) • {act.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Override (Optional)</label>
                <input
                  type="number"
                  placeholder="Leave empty to use catalog price"
                  value={costOverride}
                  onChange={(e) => setCostOverride(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedStopId(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-sm">
                  Assign to Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
