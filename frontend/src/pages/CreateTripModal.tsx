import React, { useState, useEffect } from 'react';
import { tripsApi, citiesApi, activitiesApi } from '../services/api';
import { X, Calendar, DollarSign, PlusCircle, Check, Star } from 'lucide-react';

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
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number>(1);
  const [selectedCityName, setSelectedCityName] = useState<string>('Paris');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalBudget, setTotalBudget] = useState<number>(2000);
  const [suggestedActivities, setSuggestedActivities] = useState<any[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      citiesApi.search().then((res) => {
        setCities(res.data);
        if (res.data.length > 0) {
          setSelectedCityId(res.data[0].id);
          setSelectedCityName(res.data[0].name);
        }
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedCityId) {
      activitiesApi.getSuggestions({ city_id: selectedCityId, limit: 6 }).then((res) => {
        setSuggestedActivities(res.data);
      });
    }
  }, [selectedCityId]);

  if (!isOpen) return null;

  const handleCityChange = (cityId: number) => {
    setSelectedCityId(cityId);
    const found = cities.find((c) => c.id === cityId);
    if (found) setSelectedCityName(found.name);
  };

  const toggleActivity = (actId: number) => {
    if (selectedActivities.includes(actId)) {
      setSelectedActivities(selectedActivities.filter((id) => id !== actId));
    } else {
      setSelectedActivities([...selectedActivities, actId]);
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
      };

      await tripsApi.createTrip(payload);
      onTripCreated();
      onClose();
    } catch (err: any) {
      console.error('Failed to create trip:', err);
      setError('Failed to create trip itinerary. Please check form fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create a new Trip</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Configure dates, destination, and select recommended activities.</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Plan a new trip</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Trip Name / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. European Vacation 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select a Place :</label>
                  <select
                    value={selectedCityId}
                    onChange={(e) => handleCityChange(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}, {c.country} ({c.region})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Budget ($ USD)</label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      value={totalBudget}
                      onChange={(e) => setTotalBudget(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date:</label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        if (endDate && e.target.value > endDate) setEndDate(e.target.value);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date:</label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="date"
                      min={startDate || undefined}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">
              Suggestion for Places to Visit / Activities to perform ({selectedCityName})
            </h3>

            {suggestedActivities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {suggestedActivities.map((act) => {
                  const isSelected = selectedActivities.includes(act.id);
                  return (
                    <div
                      key={act.id}
                      onClick={() => toggleActivity(act.id)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded-md">
                            {act.category}
                          </span>
                          <span className="text-[11px] font-bold text-amber-500 flex items-center">
                            <Star className="w-3 h-3 fill-amber-500 mr-0.5" />
                            {act.rating}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{act.name}</h4>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2 text-[11px]">
                        <span className="font-semibold text-slate-600">${act.estimated_cost}</span>
                        {isSelected ? (
                          <span className="text-blue-600 font-bold flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5" /> Selected
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">+ Add</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-400 italic">
                No suggested places available for this location.
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-sm transition active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{loading ? 'Creating Trip...' : 'Create New Trip'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
