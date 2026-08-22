import React, { useState, useEffect } from 'react';
import { tripsApi, citiesApi } from '../services/api';
import { X, Calendar, DollarSign, Save, ChevronDown } from 'lucide-react';

interface EditTripModalProps {
  trip: any | null;
  onClose: () => void;
  onTripUpdated: () => void;
}

export const EditTripModal: React.FC<EditTripModalProps> = ({ trip, onClose, onTripUpdated }) => {
  const [title, setTitle] = useState('');
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number>(1);
  const [selectedCityName, setSelectedCityName] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalBudget, setTotalBudget] = useState<number>(2000);
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (trip) {
      setTitle(trip.title || '');
      setSelectedCityId(trip.city_id || 1);
      setSelectedCityName(trip.city_name || '');
      setStartDate(trip.start_date || '');
      setEndDate(trip.end_date || '');
      setTotalBudget(trip.total_budget || 2000);
      setDescription(trip.description || '');

      citiesApi.search().then((res) => {
        setCities(res.data);
      });
    }
  }, [trip]);

  if (!trip) return null;

  const handleCityChange = (cityId: number) => {
    setSelectedCityId(cityId);
    const found = cities.find((c) => c.id === cityId);
    if (found) {
      setSelectedCityName(found.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Trip title is required.');
      return;
    }

    if (startDate && endDate && endDate < startDate) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        title: title.trim(),
        city_id: selectedCityId,
        city_name: selectedCityName,
        start_date: startDate || null,
        end_date: endDate || null,
        total_budget: Number(totalBudget),
        description: description.trim() || null,
      };

      await tripsApi.updateTrip(trip.id, payload);
      onTripUpdated();
      onClose();
    } catch (err: any) {
      console.error('Failed to update trip:', err);
      setError('Failed to update trip. Please check form fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen flex items-center justify-center p-4 sm:p-6 bg-stone-950/75 backdrop-blur-md overflow-hidden font-sans">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto no-scrollbar">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-stone-100 pb-4">
          <h2
            className="text-2xl font-serif italic font-bold text-stone-900 tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Edit Trip Details
          </h2>
          <p className="text-xs text-stone-500 font-medium mt-1">Update title, destination city, target budget, and date range.</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Trip Name / Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-emerald-700 font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Destination City</label>
              <div className="relative">
                <select
                  value={selectedCityId}
                  onChange={(e) => handleCityChange(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-emerald-700 appearance-none cursor-pointer"
                >
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}, {c.country} ({c.region})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Target Budget ($ USD)</label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                <input
                  type="number"
                  min="0"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8 pr-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Start Date</label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate && e.target.value > endDate) setEndDate(e.target.value);
                  }}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">End Date</label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                <input
                  type="date"
                  min={startDate || undefined}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Trip Description</label>
            <textarea
              rows={3}
              placeholder="Notes or itinerary description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-md transition active:scale-[0.98] disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
