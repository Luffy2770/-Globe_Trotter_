import React, { useState, useEffect } from 'react';
import { citiesApi } from '../services/api';
import { Search, Sparkles, Star, MapPin, Globe, Compass, PlusCircle } from 'lucide-react';

interface ExploreCitiesPageProps {
  onOpenCreateModal: () => void;
}

export const ExploreCitiesPage: React.FC<ExploreCitiesPageProps> = ({ onOpenCreateModal }) => {
  const [cities, setCities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('All');
  const [sortBy, setSortBy] = useState('popularity_desc');
  const [loading, setLoading] = useState(true);

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
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-scale-up pb-24">
      {/* 1. Hero Template Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl group border border-slate-200">
        <img
          src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200"
          alt="Explore Banner"
          className="w-full h-64 sm:h-80 object-cover object-center opacity-40 group-hover:scale-105 transition duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent p-8 md:p-14 lg:p-16 flex flex-col justify-center max-w-2xl space-y-4">
          <span className="px-3.5 py-1 bg-white/20 backdrop-blur-md text-white text-[11px] font-bold rounded-full w-fit flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 mr-1.5 inline" />
            Explore & Plan like a Visit
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Discover Global Cities & Iconic Destinations
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed max-w-lg">
            Browse through 80+ curated world destinations across all continents with rich activity guides and travel details.
          </p>
        </div>
      </div>

      {/* 2. Controls & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search bar (e.g. Paris, Tokyo, Rome, Barcelona...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
          >
            <option value="popularity_desc">Sort: Popularity (High to Low)</option>
            <option value="name_asc">Sort: Name (A-Z)</option>
            <option value="cost_asc">Sort: Cost Index (Low to High)</option>
          </select>
        </div>
      </div>

      {/* 3. Continent Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Compass className="w-4 h-4 text-blue-600" />
            <span>Continents & Regions ({filteredCities.length} Cities)</span>
          </h2>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            <Globe className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
            {continents.map((cont) => (
              <button
                key={cont}
                onClick={() => setSelectedContinent(cont)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedContinent === cont
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cont}
              </button>
            ))}
          </div>
        </div>

        {/* 4. City Templates Grid with Detailed Info */}
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-xs font-medium animate-pulse">
            Loading city templates...
          </div>
        ) : filteredCities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCities.map((city, idx) => (
              <div
                key={city.id}
                style={{ animationDelay: `${idx * 0.04}s` }}
                className="apple-card p-4 flex flex-col justify-between group hover:shadow-lg transition duration-300 animate-fade-in"
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
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition truncate">
                        {city.name}
                      </h3>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase">
                        {city.region}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium flex items-center">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 mr-1 flex-shrink-0" />
                      {city.country}
                    </p>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal pt-1">
                      {city.description || `Iconic destination in ${city.country} featuring top attractions and cultural spots.`}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Cost Index: <strong className="text-slate-900">${city.cost_index}x</strong>
                  </span>
                  <button
                    onClick={onOpenCreateModal}
                    className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1 shadow-xs transition active:scale-[0.97]"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Plan Trip</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-xs text-slate-400 italic">
            No cities found for continent "{selectedContinent}".
          </div>
        )}
      </div>
    </div>
  );
};
