import React, { useState, useEffect } from 'react';
import { citiesApi } from '../services/api';
import { CityDetailModal } from './CityDetailModal';
import { Search, Star, MapPin, Globe, Compass, Plus, Info } from 'lucide-react';

interface ExploreCitiesPageProps {
  onOpenCreateModalWithCity: (cityId?: number) => void;
}

export const ExploreCitiesPage: React.FC<ExploreCitiesPageProps> = ({ onOpenCreateModalWithCity }) => {
  const [cities, setCities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('All');
  const [sortBy, setSortBy] = useState('popularity_desc');
  const [loading, setLoading] = useState(true);

  const [selectedCityForModal, setSelectedCityForModal] = useState<any | null>(null);

  const continents = ['All', 'Europe', 'Asia', 'Americas', 'Middle East', 'Africa', 'Oceania'];

  const fetchCities = async () => {
    setLoading(true);
    try {
      const res = await citiesApi.search({ q: searchTerm || undefined, sort_by: sortBy });
      setCities(res.data);
    } catch (err) {
      console.error('Failed to load cities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, [searchTerm, sortBy]);

  const filteredCities = cities.filter((c) => {
    if (selectedContinent === 'All') return true;
    return c.region?.toLowerCase() === selectedContinent.toLowerCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-scale-up pb-24 font-sans">
      {/* 1. Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-stone-900 text-stone-100 shadow-xl group border border-stone-200">
        <img
          src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200"
          alt="Tripyfy Curated Destinations"
          className="w-full h-72 sm:h-88 object-cover object-center opacity-35 group-hover:scale-105 transition duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-900/60 to-transparent p-8 md:p-14 lg:p-16 flex flex-col justify-center max-w-2xl space-y-4">
          <span className="px-3.5 py-1 bg-emerald-900/40 backdrop-blur-md text-emerald-300 text-[11px] font-bold rounded-full w-fit flex items-center space-x-1 border border-emerald-500/30">
            Curated City Collection
          </span>
          <h1
            className="text-3xl sm:text-5xl font-serif italic font-bold tracking-tight leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Discover Extraordinary Global Destinations
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 font-medium leading-relaxed max-w-lg">
            Click any city template to explore rich travel guides, average daily costs, landmark places, and activity suggestions.
          </p>
        </div>
      </div>

      {/* 2. Controls & Search Bar */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Search bar (e.g. Paris, Tokyo, Rome, Barcelona...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-700 transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700 focus:outline-none focus:border-emerald-700 cursor-pointer font-medium"
          >
            <option value="popularity_desc">Sort: Popularity (High to Low)</option>
            <option value="name_asc">Sort: Name (A-Z)</option>
            <option value="cost_asc">Sort: Cost Index (Low to High)</option>
          </select>
        </div>
      </div>

      {/* 3. Continent Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center space-x-2">
            <Compass className="w-4 h-4 text-emerald-800" />
            <span>Continents & Regions ({filteredCities.length} Cities)</span>
          </h2>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            <Globe className="w-3.5 h-3.5 text-stone-400 mr-1 flex-shrink-0" />
            {continents.map((cont) => (
              <button
                key={cont}
                onClick={() => setSelectedContinent(cont)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedContinent === cont
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {cont}
              </button>
            ))}
          </div>
        </div>

        {/* 4. City Templates Grid */}
        {loading ? (
          <div className="text-center py-16 text-stone-400 text-xs font-medium animate-pulse">
            Loading Tripyfy city templates...
          </div>
        ) : filteredCities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCities.map((city, idx) => {
              const avgDailyCost = Math.round((city.cost_index || 2.0) * 75);
              return (
                <div
                  key={city.id}
                  style={{ animationDelay: `${idx * 0.04}s` }}
                  onClick={() => setSelectedCityForModal(city)}
                  className="apple-card p-4 flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition duration-300 animate-fade-in cursor-pointer border border-stone-200/90 bg-white"
                >
                  <div>
                    <div className="overflow-hidden rounded-2xl mb-3 relative">
                      <img
                        src={city.image_url}
                        alt={city.name}
                        className="w-full h-44 object-cover group-hover:scale-105 transition duration-500 ease-out"
                      />
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-white/90 backdrop-blur-md text-amber-600 text-[11px] font-bold rounded-full flex items-center shadow-xs">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-1" />
                        {city.popularity_rating}
                      </span>
                    </div>

                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center justify-between">
                        <h3
                          className="text-base font-serif italic font-bold text-stone-900 group-hover:text-emerald-800 transition truncate"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {city.name}
                        </h3>
                        <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-bold rounded-md uppercase">
                          {city.region}
                        </span>
                      </div>

                      <p className="text-xs text-stone-500 font-medium flex items-center justify-between">
                        <span className="flex items-center">
                          <MapPin className="w-3.5 h-3.5 text-emerald-700 mr-1 flex-shrink-0" />
                          {city.country}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-800">
                          ~${avgDailyCost}/day
                        </span>
                      </p>

                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-normal pt-1">
                        {city.description || `Iconic travel destination in ${city.country}.`}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between mt-2">
                    <span className="text-[11px] font-semibold text-stone-500 flex items-center">
                      <Info className="w-3 h-3 text-emerald-700 mr-1" /> View Guide Info
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCreateModalWithCity(city.id);
                      }}
                      className="py-1.5 px-3 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1 shadow-xs transition active:scale-[0.97]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Plan Trip</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-3xl p-8 text-center text-xs text-stone-400 italic">
            No cities found for continent "{selectedContinent}".
          </div>
        )}
      </div>

      {/* City Detail Info Modal */}
      <CityDetailModal
        city={selectedCityForModal}
        onClose={() => setSelectedCityForModal(null)}
        onPlanTripForCity={(cityId) => onOpenCreateModalWithCity(cityId)}
      />
    </div>
  );
};
