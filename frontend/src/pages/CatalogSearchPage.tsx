import React, { useState, useEffect } from 'react';
import { activitiesApi } from '../services/api';
import { Search, Star, Clock, MapPin } from 'lucide-react';

export const CatalogSearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('Paragliding');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('rating_desc');
  const [groupBy, setGroupBy] = useState('none');

  const [results, setResults] = useState<any[]>([]);
  const [groupedResults, setGroupedResults] = useState<any>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

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

  const renderOptionCard = (item: any, idx: number) => (
    <div
      key={item.id}
      style={{ animationDelay: `${idx * 0.06}s` }}
      className="apple-card p-6 flex flex-col justify-between animate-fade-in group"
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

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600">
        <span className="flex items-center font-medium">
          <Clock className="w-3.5 h-3.5 text-teal-600 mr-1" />
          {item.duration_minutes} mins
        </span>
        <span className="font-bold text-slate-900 text-sm">${item.estimated_cost}</span>
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
    </div>
  );
};
