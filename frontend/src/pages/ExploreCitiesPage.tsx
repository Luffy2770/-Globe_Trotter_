import React, { useState, useEffect } from 'react';
import { citiesApi } from '../services/api';
import { CityDetailModal } from './CityDetailModal';
import { Search, Star, MapPin, Globe, Compass, Plus, Info, Sparkles, Clock, DollarSign, Tag, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { TripyfyLogo } from '../components/TripyfyLogo';

interface PopularActivityItem {
  id: number;
  name: string;
  cityName: string;
  category: string;
  cost: number;
  durationHours: number;
  rating: number;
  imageUrl: string;
  description: string;
}

const POPULAR_ACTIVITIES_CATALOG: PopularActivityItem[] = [
  {
    id: 1,
    name: 'Eiffel Tower Sunset Champagne Experience',
    cityName: 'Paris',
    category: 'Sightseeing & Culinary',
    cost: 85,
    durationHours: 3,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    description: 'Skip-the-line elevator ticket to the Eiffel Tower top deck with champagne toast at golden hour.',
  },
  {
    id: 2,
    name: 'Shinjuku Neon Alley Food & Sake Crawl',
    cityName: 'Tokyo',
    category: 'Culinary & Nightlife',
    cost: 65,
    durationHours: 3.5,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800',
    description: 'Explore hidden Omoide Yokocho izakayas with a local foodie guide tasting yakitori and craft sake.',
  },
  {
    id: 3,
    name: 'Helicopter Flight over Manhattan Skyline',
    cityName: 'New York',
    category: 'Adventure & Sightseeing',
    cost: 220,
    durationHours: 1,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
    description: 'Breathtaking doors-off aerial helicopter tour soaring past the Statue of Liberty and Empire State Building.',
  },
  {
    id: 4,
    name: 'Table Mountain Cable Car & Sunset Picnic',
    cityName: 'Cape Town',
    category: 'Outdoor & Nature',
    cost: 45,
    durationHours: 4,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800',
    description: 'Rotair cable car ride to Table Mountain summit followed by a wine & cheese sunset picnic overlooking Camps Bay.',
  },
  {
    id: 5,
    name: 'Kyoto Arashiyama Bamboo Grove & Tea Ceremony',
    cityName: 'Kyoto',
    category: 'Culture & Heritage',
    cost: 50,
    durationHours: 3,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
    description: 'Early morning quiet walk through Arashiyama bamboo forest followed by a traditional matcha tea ceremony.',
  },
  {
    id: 6,
    name: 'Colosseum & Roman Forum Private Guided Tour',
    cityName: 'Rome',
    category: 'History & Culture',
    cost: 75,
    durationHours: 3,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
    description: 'VIP access into the Gladiator arena floor and ancient Roman Forum with an expert archaeologist.',
  },
  {
    id: 7,
    name: 'Sagrada Familia Fast-Track Tower Tour',
    cityName: 'Barcelona',
    category: 'Architecture & Art',
    cost: 40,
    durationHours: 2,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800',
    description: 'Priority access to Gaudi’s masterpiece cathedral with entrance to Nativity tower panoramic views.',
  },
  {
    id: 8,
    name: 'Sydney Harbor Catamaran Sunset Cruise',
    cityName: 'Sydney',
    category: 'Sailing & Water Sports',
    cost: 95,
    durationHours: 2.5,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
    description: 'Luxury catamaran sailing cruise under Sydney Harbour Bridge past the Opera House with gourmet appetizers.',
  },
];

interface ExploreCitiesPageProps {
  onOpenCreateModalWithCity: (cityId?: number) => void;
}

export const ExploreCitiesPage: React.FC<ExploreCitiesPageProps> = ({ onOpenCreateModalWithCity }) => {
  const [cities, setCities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('All');
  const [sortBy, setSortBy] = useState('popularity_desc');
  const [loading, setLoading] = useState(true);

  // Upper Hero Slide Index: 0 = Cities, 1 = Activities
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  // Lower active content state: Defaults strictly to 'cities' as before
  const [activeCatalogContent, setActiveCatalogContent] = useState<'cities' | 'activities'>('cities');

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

  const filteredActivities = POPULAR_ACTIVITIES_CATALOG.filter((act) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      act.name.toLowerCase().includes(q) ||
      act.cityName.toLowerCase().includes(q) ||
      act.category.toLowerCase().includes(q)
    );
  });

  // Swipe / Slide Handler (Manual Only - Auto moving removed as requested)
  const handleNextSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextIdx = (currentSlideIndex + 1) % 2;
    setCurrentSlideIndex(nextIdx);
    setActiveCatalogContent(nextIdx === 0 ? 'cities' : 'activities');
  };

  const handlePrevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const prevIdx = currentSlideIndex === 0 ? 1 : 0;
    setCurrentSlideIndex(prevIdx);
    setActiveCatalogContent(prevIdx === 0 ? 'cities' : 'activities');
  };

  const handleSelectTabSlide = (index: number) => {
    setCurrentSlideIndex(index);
    setActiveCatalogContent(index === 0 ? 'cities' : 'activities');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-scale-up pb-24 font-sans">
      {/* 1. Upper Hero Showcase Window with Swipe Animation & Top-Right Logo */}
      <div className="relative rounded-3xl overflow-hidden bg-stone-950 text-stone-100 shadow-xl border border-stone-200 group">
        {/* Top-Right Logo Badge */}
        <div className="absolute top-4 right-4 z-20 bg-stone-950/70 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-lg">
          <TripyfyLogo size="sm" showText={true} />
        </div>

        {/* Swipe Animation Carousel Track */}
        <div
          className="flex transition-transform duration-700 ease-in-out w-[200%]"
          style={{ transform: `translateX(-${currentSlideIndex * 50}%)` }}
        >
          {/* SLIDE 0: POPULAR CITIES */}
          <div className="w-1/2 relative h-80 sm:h-96 overflow-hidden flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200"
              alt="Popular Cities"
              className="w-full h-full object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-900/60 to-transparent p-6 sm:p-12 md:p-14 flex flex-col justify-between">
              <div className="space-y-3 max-w-2xl pt-8 sm:pt-4">
                <span className="px-3.5 py-1 bg-emerald-900/50 backdrop-blur-md text-emerald-300 text-[11px] font-bold rounded-full w-fit flex items-center space-x-1 border border-emerald-500/40">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Option 1: Popular Global Destination Cities</span>
                </span>
                <h1
                  className="text-3xl sm:text-5xl font-serif italic font-bold tracking-tight leading-tight"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Discover Iconic World Capitals & Travel Hubs
                </h1>
                <p className="text-xs sm:text-sm text-stone-300 font-medium leading-relaxed max-w-lg">
                  Swipe or click to view daily cost estimates, popular landmark guides, and travel information for Tokyo, Paris, New York, and Cape Town.
                </p>
              </div>
            </div>
          </div>

          {/* SLIDE 1: POPULAR ACTIVITIES */}
          <div className="w-1/2 relative h-80 sm:h-96 overflow-hidden flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200"
              alt="Popular Activities"
              className="w-full h-full object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-900/60 to-transparent p-6 sm:p-12 md:p-14 flex flex-col justify-between">
              <div className="space-y-3 max-w-2xl pt-8 sm:pt-4">
                <span className="px-3.5 py-1 bg-amber-900/50 backdrop-blur-md text-amber-300 text-[11px] font-bold rounded-full w-fit flex items-center space-x-1 border border-amber-500/40">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Option 2: Popular Global Activity Catalog</span>
                </span>
                <h1
                  className="text-3xl sm:text-5xl font-serif italic font-bold tracking-tight leading-tight text-white"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Explore Curated Excursions & Guided Tours
                </h1>
                <p className="text-xs sm:text-sm text-stone-300 font-medium leading-relaxed max-w-lg">
                  Swipe or click to view top activities: Shinjuku Food Crawls, Eiffel Tower Champagne, Helicopter Flights, and Table Mountain Picnics.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Swipe Left / Right Arrow Buttons & Controls */}
        <button
          onClick={handlePrevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-stone-950/70 hover:bg-stone-950/90 text-white backdrop-blur-md flex items-center justify-center border border-white/20 transition shadow-lg hover:scale-110 active:scale-95"
          title="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-stone-950/70 hover:bg-stone-950/90 text-white backdrop-blur-md flex items-center justify-center border border-white/20 transition shadow-lg hover:scale-110 active:scale-95"
          title="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Bottom Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 bg-stone-950/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
          <button
            onClick={() => handleSelectTabSlide(0)}
            className={`w-3 h-3 rounded-full transition ${currentSlideIndex === 0 ? 'bg-emerald-400 scale-115' : 'bg-white/40'}`}
            title="Popular Cities Slide"
          />
          <button
            onClick={() => handleSelectTabSlide(1)}
            className={`w-3 h-3 rounded-full transition ${currentSlideIndex === 1 ? 'bg-amber-400 scale-115' : 'bg-white/40'}`}
            title="Popular Activities Slide"
          />
        </div>
      </div>

      {/* 2. Controls & Search Bar */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input
            type="text"
            placeholder={
              activeCatalogContent === 'cities'
                ? 'Search cities (e.g. Paris, Tokyo, Cape Town, Rome...)'
                : 'Search activity catalog (e.g. Helicopter, Food Crawl, Champagne, Diving...)'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-700 transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button
            onClick={() => handleSelectTabSlide(activeCatalogContent === 'cities' ? 1 : 0)}
            className="py-2 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-800" />
            <span>Switch view to {activeCatalogContent === 'cities' ? 'Activity Catalog' : 'Popular Cities'}</span>
          </button>

          {activeCatalogContent === 'cities' && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700 focus:outline-none focus:border-emerald-700 cursor-pointer font-medium"
            >
              <option value="popularity_desc">Sort: Popularity (High to Low)</option>
              <option value="name_asc">Sort: Name (A-Z)</option>
              <option value="cost_asc">Sort: Cost Index (Low to High)</option>
            </select>
          )}
        </div>
      </div>

      {/* 3. Lower Content Catalog Display (Default: Popular Cities as before) */}
      {activeCatalogContent === 'cities' ? (
        /* ORIGINAL POPULAR CITIES GRID AS BEFORE */
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
            <h2 className="text-base font-bold text-stone-900 flex items-center space-x-2">
              <Compass className="w-4 h-4 text-emerald-800" />
              <span>Popular Destination Cities ({filteredCities.length})</span>
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

          {loading ? (
            <div className="text-center py-16 text-stone-400 text-xs font-medium animate-pulse">
              Loading Tripyfy city catalog...
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
      ) : (
        /* POPULAR ACTIVITIES CATALOG */
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h2 className="text-base font-bold text-stone-900 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Curated Activity Catalog ({filteredActivities.length} Activities)</span>
            </h2>
            <span className="text-xs text-stone-400 font-medium">Hand-picked experiences across top destinations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredActivities.map((act) => (
              <div
                key={act.id}
                className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-stone-900">
                    <img
                      src={act.imageUrl}
                      alt={act.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-amber-500 text-white text-[10px] font-extrabold uppercase rounded-full shadow-md">
                      {act.cityName}
                    </span>
                    <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-white/90 backdrop-blur-md text-stone-900 text-[11px] font-black rounded-md shadow-xs flex items-center">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500 mr-1" />
                      {act.rating}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center space-x-1">
                      <Tag className="w-3 h-3 text-emerald-800" />
                      <span>{act.category}</span>
                    </span>

                    <h3
                      className="text-base font-serif italic font-bold text-stone-900 line-clamp-2 leading-snug"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {act.name}
                    </h3>

                    <p className="text-xs text-stone-500 line-clamp-2 font-medium leading-relaxed">
                      {act.description}
                    </p>

                    <div className="flex items-center justify-between text-xs font-semibold text-stone-600 pt-2 border-t border-stone-100">
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-stone-400" />
                        {act.durationHours} Hours
                      </span>
                      <span className="flex items-center text-emerald-800 font-extrabold">
                        <DollarSign className="w-3.5 h-3.5 mr-0.5" />
                        ${act.cost} / person
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => onOpenCreateModalWithCity()}
                    className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-xs transition flex items-center justify-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Trip Itinerary</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* City Detail Info Modal */}
      <CityDetailModal
        city={selectedCityForModal}
        onClose={() => setSelectedCityForModal(null)}
        onPlanTripForCity={(cityId) => onOpenCreateModalWithCity(cityId)}
      />
    </div>
  );
};
