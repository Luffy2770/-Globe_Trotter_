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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-xl space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Plan a New Trip</h2>
            <p className="text-xs text-slate-500">Configure trip title, destination, dates, and budget</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Trip Title *</label>
            <input
              type="text"
              required
              placeholder="Autumn Trip to Tokyo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Destination City</label>
              <select
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}, {c.country} ({c.region})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Budget ($ USD)</label>
              <input
                type="number"
                min="0"
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Recommended Activities ({cityName})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto">
              {activitySuggestions.map((act) => (
                <div
                  key={act.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col justify-between space-y-1.5"
                >
                  <div>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-600 rounded-md">
                      {act.category}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">{act.name}</h5>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60 pt-1">
                    <span>${act.estimated_cost}</span>
                    <span className="text-amber-500 font-semibold">Rating: {act.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              {loading ? 'Saving...' : 'Save & Plan Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
