import React, { useState, useEffect } from 'react';
import { tripsApi, activitiesApi, citiesApi } from '../services/api';
import { X, Sparkles } from 'lucide-react';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripCreated: () => void;
}

export const CreateTripModal: React.FC<CreateTripModalProps> = ({
  isOpen,
  onClose,
  onTripCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description] = useState('');
  const [cityName, setCityName] = useState('Tokyo');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalBudget, setTotalBudget] = useState(2500);

  const [cities, setCities] = useState<any[]>([]);
  const [activitySuggestions, setActivitySuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      citiesApi.search().then((res) => setCities(res.data));
    }
  }, [isOpen]);

  useEffect(() => {
    if (cityName) {
      activitiesApi.getSuggestions({ city_name: cityName, limit: 6 }).then((res) => {
        setActivitySuggestions(res.data);
      });
    }
  }, [cityName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title,
        description,
        city_name: cityName,
        start_date: startDate || null,
        end_date: endDate || null,
        total_budget: Number(totalBudget),
      };
      await tripsApi.createTrip(payload);
      onTripCreated();
      onClose();
    } catch (err) {
      console.error('Failed to create trip:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Create a new Trip (Screen 4)</h2>
            <p className="text-xs text-slate-400">Plan a new trip & explore activity suggestions</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Trip Name / Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Autumn Trip to Tokyo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select a Place / Destination</label>
              <select
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}, {c.country} ({c.region})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Budget ($ USD)</label>
              <input
                type="number"
                min="0"
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Suggestion for Places to Visit / Activities to perform ({cityName})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-1">
              {activitySuggestions.map((act) => (
                <div
                  key={act.id}
                  className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5 flex flex-col justify-between space-y-2"
                >
                  <div>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 rounded-md">
                      {act.category}
                    </span>
                    <h5 className="text-xs font-bold text-white mt-1 line-clamp-1">{act.name}</h5>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-700/50 pt-1.5">
                    <span>${act.estimated_cost}</span>
                    <span className="text-amber-400 font-semibold">★ {act.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow transition"
            >
              {loading ? 'Creating...' : 'Save & Plan Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
