import React, { useState, useEffect } from 'react';
import { activitiesApi } from '../services/api';
import { X, Star, MapPin, Compass, Plus, Clock, Tag } from 'lucide-react';

interface CityDetailModalProps {
  city: any | null;
  onClose: () => void;
  onOpenCreateModal: () => void;
}

export const CityDetailModal: React.FC<CityDetailModalProps> = ({
  city,
  onClose,
  onOpenCreateModal,
}) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (city?.id) {
      setLoading(true);
      activitiesApi
        .getSuggestions({ city_id: city.id, limit: 8 })
        .then((res) => setActivities(res.data))
        .catch((err) => console.error('Failed to fetch city activities:', err))
        .finally(() => setLoading(false));
    }
  }, [city]);

  if (!city) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-fade-in overflow-y-auto font-sans">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 z-10 p-2 bg-white/80 hover:bg-white text-stone-700 rounded-full shadow-sm backdrop-blur-md transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image & Overlay */}
        <div className="relative rounded-2xl overflow-hidden bg-stone-900 h-64 sm:h-72 -mx-2 -mt-2">
          <img
            src={city.image_url}
            alt={city.name}
            className="w-full h-full object-cover object-center opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/30 to-transparent p-6 flex flex-col justify-end">
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-3 py-1 bg-emerald-800/90 text-white text-[11px] font-bold rounded-full uppercase tracking-wider backdrop-blur-xs">
                {city.region}
              </span>
              <span className="px-3 py-1 bg-white/20 text-white text-[11px] font-bold rounded-full backdrop-blur-xs flex items-center">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-1" />
                {city.popularity_rating} Rating
              </span>
            </div>
            <h2
              className="text-3xl sm:text-4xl font-serif italic font-bold text-white tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {city.name}
            </h2>
            <p className="text-xs sm:text-sm text-stone-200 font-medium flex items-center mt-1">
              <MapPin className="w-4 h-4 text-emerald-400 mr-1.5" />
              {city.country} • Cost Index: ${city.cost_index}x
            </p>
          </div>
        </div>

        {/* City Information & Description */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center">
            <Compass className="w-4 h-4 text-emerald-800 mr-1.5" />
            <span>About {city.name}</span>
          </h3>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium bg-stone-50 p-4 rounded-2xl border border-stone-100">
            {city.description ||
              `${city.name} is a premier global destination in ${city.country}, offering world-renowned architecture, vibrant local culture, and landmark travel experiences.`}
          </p>
        </div>

        {/* Suggested Activities & Places to Visit */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center">
            <Tag className="w-4 h-4 text-emerald-700 mr-1.5" />
            <span>Top Recommended Places & Activities in {city.name}</span>
          </h3>

          {loading ? (
            <div className="text-center py-8 text-stone-400 text-xs font-medium animate-pulse">
              Loading recommended places...
            </div>
          ) : activities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 bg-white border border-stone-200 rounded-2xl flex items-center justify-between hover:border-emerald-300 transition"
                >
                  <div className="space-y-0.5">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-800 rounded-md">
                      {act.category}
                    </span>
                    <h4 className="text-xs font-bold text-stone-900 mt-1 line-clamp-1">{act.name}</h4>
                    <p className="text-[11px] text-stone-500 font-medium flex items-center">
                      <Clock className="w-3 h-3 text-stone-400 mr-1" />
                      {act.duration_minutes} mins • <strong className="text-stone-900 ml-1">${act.estimated_cost}</strong>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs text-stone-400 italic">
              No specific activities listed yet. Click "Plan a Trip" to customize itinerary activities.
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold rounded-xl transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCreateModal();
            }}
            className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-md transition active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Plan a Trip to {city.name}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
