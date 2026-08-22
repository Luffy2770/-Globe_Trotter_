import React, { useState, useEffect } from 'react';
import { itineraryApi, citiesApi, activitiesApi } from '../services/api';
import { Plus, Trash2, Calendar } from 'lucide-react';

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
    if (!confirm('Are you sure you want to delete this trip stop?')) return;
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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">
            Screen 5: Relational Itinerary Builder
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-2">Multi-City Trip Stops & Activities</h1>
          <p className="text-xs text-slate-400">Configure city stops, stay budgets, and assign master catalog activities.</p>
        </div>

        <button
          onClick={() => setShowAddStopModal(true)}
          className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm flex items-center space-x-2 shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add City Stop</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading itinerary stops...</div>
      ) : (
        <div className="space-y-6">
          {stops.map((stop, index) => (
            <div key={stop.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{stop.city?.name}, {stop.city?.country}</h3>
                    <p className="text-xs text-slate-400">{stop.city?.region} • Stay Cost: ${stop.stay_cost}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                    <Calendar className="w-3.5 h-3.5 inline mr-1 text-teal-400" />
                    {stop.arrival_date || 'N/A'} → {stop.departure_date || 'N/A'}
                  </div>

                  <button
                    onClick={() => handleDeleteStop(stop.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Scheduled Activities ({stop.activities?.length || 0})
                  </h4>
                  <button
                    onClick={() => openAssignActivityModal(stop)}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Assign Activity from Catalog</span>
                  </button>
                </div>

                {stop.activities?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {stop.activities.map((ta: any) => (
                      <div
                        key={ta.id}
                        className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded-md">
                            {ta.activity?.category}
                          </span>
                          <h5 className="text-sm font-bold text-white">{ta.activity?.name}</h5>
                          <p className="text-xs text-slate-400">
                            Effective Cost: <span className="text-emerald-400 font-semibold">${ta.effective_cost}</span>
                            {ta.notes && ` • ${ta.notes}`}
                          </p>
                        </div>

                        <button
                          onClick={() => handleRemoveActivity(stop.id, ta.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 text-xs text-slate-500 italic">
                    No activities assigned to this stop yet. Click "Assign Activity from Catalog" above.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddStopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Add City Stop to Trip</h3>
            <form onSubmit={handleAddStopSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select City</label>
                <select
                  value={selectedCityId}
                  onChange={(e) => setSelectedCityId(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                >
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}, {c.country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Stay Cost ($ USD)</label>
                <input
                  type="number"
                  min="0"
                  value={stayCost}
                  onChange={(e) => setStayCost(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Arrival Date</label>
                  <input
                    type="date"
                    value={arrivalDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Departure Date</label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddStopModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl">
                  Add Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedStopId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Assign Activity from Master Catalog</h3>
            <form onSubmit={handleAssignActivitySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Activity</label>
                <select
                  value={selectedActivityId || ''}
                  onChange={(e) => setSelectedActivityId(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                >
                  {availableActivities.map((act) => (
                    <option key={act.id} value={act.id}>
                      {act.name} (${act.estimated_cost}) • {act.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cost Override (Optional)</label>
                <input
                  type="number"
                  placeholder="Leave empty to use catalog price"
                  value={costOverride}
                  onChange={(e) => setCostOverride(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedStopId(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl">
                  Assign to Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
