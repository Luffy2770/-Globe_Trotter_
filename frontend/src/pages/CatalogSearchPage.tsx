import React, { useState, useEffect } from 'react';
import { activitiesApi } from '../services/api';
import { Search, Star, Clock, MapPin } from 'lucide-react';

export const CatalogSearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('Paragliding');
  const [category] = useState('');
  const [sortBy, setSortBy] = useState('rating_desc');
  const [groupBy, setGroupBy] = useState('none');

  const [results, setResults] = useState<any[]>([]);
  const [groupedResults, setGroupedResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await activitiesApi.searchCatalog({
        q: searchTerm,
        category: category || undefined,
        sort_by: sortBy,
        group_by: groupBy,
      });
      if (groupBy !== 'none' && res.data.grouped_results) {
        setGroupedResults(res.data.grouped_results);
        setResults([]);
      } else {
        setResults(res.data.results || []);
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

  const renderOptionCard = (item: any) => (
    <div
      key={item.id}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/40 shadow-lg transition flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-full uppercase tracking-wider">
            {item.category}
          </span>
          <span className="text-xs font-bold text-amber-400 flex items-center space-x-1">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{item.rating}</span>
          </span>
        </div>

        <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{item.name}</h3>
        <p className="text-xs text-slate-400 mb-3 flex items-center">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 mr-1" />
          {item.city_name}, {item.country_name}
        </p>

        <p className="text-xs text-slate-400 mb-4 line-clamp-2">{item.description || 'Option details and full itinerary information.'}</p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-300">
        <span className="flex items-center">
          <Clock className="w-3.5 h-3.5 text-teal-400 mr-1" />
          {item.duration_minutes} mins
        </span>
        <span className="font-extrabold text-emerald-400 text-sm">${item.estimated_cost}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">
            Screen 8: Activity Search Pages / City Search Page
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-2">Master Catalog Options & Discovery</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search bar...... (e.g. Paragliding, Museum, Tokyo, Food)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="none">Group by: None</option>
            <option value="category">Group by: Category</option>
            <option value="city">Group by: City</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="rating_desc">Sort by: Rating (High to Low)</option>
            <option value="cost_low">Sort by: Cost (Low to High)</option>
            <option value="cost_high">Sort by: Cost (High to Low)</option>
            <option value="name">Sort by: Name</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Searching catalog options...</div>
      ) : groupedResults ? (
        <div className="space-y-6">
          {Object.entries(groupedResults).map(([groupKey, groupItems]: [string, any]) => (
            <div key={groupKey} className="space-y-3">
              <h3 className="text-lg font-bold text-emerald-400 border-b border-slate-800 pb-2">{groupKey}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {groupItems.map(renderOptionCard)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white">Results ({results.length} Options found)</h2>
          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.map(renderOptionCard)}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
              No matching options found for "{searchTerm}". Try searching "Paragliding", "Museum", or "Tokyo".
            </div>
          )}
        </div>
      )}
    </div>
  );
};
