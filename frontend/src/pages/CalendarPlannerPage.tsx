import React, { useState, useEffect } from 'react';
import { tripsApi } from '../services/api';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Check, MapPin, Sparkles, Clock } from 'lucide-react';

interface CityColorStyle {
  dot: string;
  badge: string;
  border: string;
  bg: string;
  text: string;
}

const CITY_COLOR_PALETTES: CityColorStyle[] = [
  { dot: 'bg-rose-500', badge: 'bg-rose-500 text-white', border: 'border-rose-500', bg: 'bg-rose-50/70', text: 'text-rose-700' },
  { dot: 'bg-emerald-600', badge: 'bg-emerald-600 text-white', border: 'border-emerald-600', bg: 'bg-emerald-50/70', text: 'text-emerald-800' },
  { dot: 'bg-blue-600', badge: 'bg-blue-600 text-white', border: 'border-blue-600', bg: 'bg-blue-50/70', text: 'text-blue-800' },
  { dot: 'bg-amber-500', badge: 'bg-amber-500 text-white', border: 'border-amber-500', bg: 'bg-amber-50/70', text: 'text-amber-800' },
  { dot: 'bg-purple-600', badge: 'bg-purple-600 text-white', border: 'border-purple-600', bg: 'bg-purple-50/70', text: 'text-purple-800' },
  { dot: 'bg-teal-600', badge: 'bg-teal-600 text-white', border: 'border-teal-600', bg: 'bg-teal-50/70', text: 'text-teal-800' },
  { dot: 'bg-indigo-600', badge: 'bg-indigo-600 text-white', border: 'border-indigo-600', bg: 'bg-indigo-50/70', text: 'text-indigo-800' },
];

const getDynamicCityColor = (cityName?: string): CityColorStyle => {
  if (!cityName) return CITY_COLOR_PALETTES[5];
  let hash = 0;
  for (let i = 0; i < cityName.length; i++) {
    hash = cityName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CITY_COLOR_PALETTES.length;
  return CITY_COLOR_PALETTES[index];
};

interface TripDayCard {
  dayNum: number;
  dateISO: string;
  dateDisplay: string;
  dayOfWeek: string;
}

interface TripRow {
  trip: any;
  colorStyle: CityColorStyle;
  days: TripDayCard[];
}

export const CalendarPlannerPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [allTrips, setAllTrips] = useState<any[]>([]);

  // Month offset for upper interactive compact calendar
  const [monthOffset, setMonthOffset] = useState(0);

  const [tripRows, setTripRows] = useState<TripRow[]>([]);
  const [showAddModalDayISO, setShowAddModalDayISO] = useState<string | null>(null);

  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityCategory, setNewActivityCategory] = useState('Sightseeing');
  const [newActivityCost, setNewActivityCost] = useState(30);

  // Persistent activities map in localStorage
  const [dayActivitiesMap, setDayActivitiesMap] = useState<Record<string, any[]>>(() => {
    const saved = localStorage.getItem('tripyfy_calendar_activities');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('tripyfy_calendar_activities', JSON.stringify(dayActivitiesMap));
  }, [dayActivitiesMap]);

  const fetchTripsAndBuildData = async () => {
    setLoading(true);
    try {
      const res = await tripsApi.getTripsListing({});
      const fetchedTrips = [
        ...(res.data.ongoing || []),
        ...(res.data.upcoming || []),
        ...(res.data.completed || []),
      ];
      setAllTrips(fetchedTrips);

      // Build Trip-Wise Rows (ONLY days when there is a trip!)
      const rows: TripRow[] = [];

      fetchedTrips.forEach((trip) => {
        if (!trip.start_date || !trip.end_date) return;

        const start = new Date(trip.start_date);
        const end = new Date(trip.end_date);

        const tripDays: TripDayCard[] = [];
        let dayCounter = 1;

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const dateStr = String(d.getDate()).padStart(2, '0');
          const dateISO = `${y}-${m}-${dateStr}`;

          const dateDisplay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'short' });

          tripDays.push({
            dayNum: dayCounter++,
            dateISO,
            dateDisplay,
            dayOfWeek,
          });
        }

        if (tripDays.length > 0) {
          rows.push({
            trip,
            colorStyle: getDynamicCityColor(trip.city_name),
            days: tripDays,
          });
        }
      });

      setTripRows(rows);
    } catch (err) {
      console.error('Failed to load trips for calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripsAndBuildData();
  }, []);

  const handleAddActivityToDate = (dateISO: string) => {
    if (!newActivityName.trim()) return;

    const newItem = {
      id: Date.now(),
      name: newActivityName.trim(),
      category: newActivityCategory,
      cost: Number(newActivityCost) || 0,
    };

    const currentList = dayActivitiesMap[dateISO] || [];
    const updatedMap = {
      ...dayActivitiesMap,
      [dateISO]: [...currentList, newItem],
    };

    setDayActivitiesMap(updatedMap);
    setNewActivityName('');
    setShowAddModalDayISO(null);
  };

  // Compute current active month for upper interactive calendar
  const displayDate = new Date();
  displayDate.setMonth(displayDate.getMonth() + monthOffset);

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const monthGridCells = [];
  for (let p = 0; p < firstDayOfWeek; p++) {
    monthGridCells.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = String(i).padStart(2, '0');
    const mStr = String(month + 1).padStart(2, '0');
    const dateISO = `${year}-${mStr}-${dStr}`;

    const matchingTrips = allTrips.filter((t) => {
      if (t.start_date && t.end_date) {
        return dateISO >= t.start_date && dateISO <= t.end_date;
      }
      return false;
    });

    monthGridCells.push({ dayNum: i, dateISO, trips: matchingTrips });
  }

  const monthHeader = displayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-scale-up pb-24 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1
            className="text-3xl font-serif italic font-bold text-stone-900"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Trip Itinerary Calendar & Trip-Wise Day Rows
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Interactive month navigation up top, and trip-wise day template rows below showing only active trip dates.
          </p>
        </div>

        {/* Dynamic Color Legend */}
        <div className="flex items-center space-x-3 bg-white p-2.5 rounded-2xl border border-stone-200 text-xs font-semibold">
          {allTrips.slice(0, 4).map((t) => {
            const style = getDynamicCityColor(t.city_name);
            return (
              <span key={t.id} className="flex items-center space-x-1">
                <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                <span>{t.city_name || t.title}</span>
              </span>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-stone-400 text-xs font-medium animate-pulse">
          Fetching trip itineraries & plotting calendar rows...
        </div>
      ) : (
        <div className="space-y-8">
          {/* 1. Interactive Medium Monthly Calendar Up Top */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-emerald-800" />
                <h2 className="text-sm font-bold text-stone-900">{monthHeader}</h2>
              </div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-stone-600">
                <button
                  onClick={() => setMonthOffset((prev) => prev - 1)}
                  className="p-1.5 hover:bg-stone-100 rounded-lg transition"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4 text-stone-700" />
                </button>
                <button
                  onClick={() => setMonthOffset(0)}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md text-[11px]"
                >
                  Current
                </button>
                <button
                  onClick={() => setMonthOffset((prev) => prev + 1)}
                  className="p-1.5 hover:bg-stone-100 rounded-lg transition"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4 text-stone-700" />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-stone-400 uppercase">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Month Cells Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {monthGridCells.map((cell, idx) => {
                if (!cell) {
                  return <div key={idx} className="h-10 rounded-xl bg-stone-50/40 opacity-30" />;
                }

                const hasTrips = cell.trips.length > 0;
                const primaryTrip = cell.trips[0];
                const colorStyle = primaryTrip ? getDynamicCityColor(primaryTrip.city_name) : null;

                return (
                  <div
                    key={cell.dateISO}
                    onClick={() => setShowAddModalDayISO(cell.dateISO)}
                    className={`h-10 rounded-xl border flex flex-col items-center justify-center relative cursor-pointer transition ${
                      hasTrips && colorStyle
                        ? `${colorStyle.bg} ${colorStyle.border} shadow-2xs`
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <span className={`text-xs font-bold ${hasTrips ? 'text-stone-900 font-extrabold' : 'text-stone-700'}`}>
                      {cell.dayNum}
                    </span>

                    {/* Dynamic Color Dot for Trip Date */}
                    {hasTrips && colorStyle && (
                      <span
                        className={`w-2 h-2 rounded-full ${colorStyle.dot} absolute bottom-1 ring-1 ring-white`}
                        title={primaryTrip.title}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Trip-Wise Day Template Rows Below (ONLY Trip Days, Row by Row!) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <h2 className="text-base font-bold text-stone-900 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-800" />
                <span>Trip-Wise Day Templates (Only Active Trip Days)</span>
              </h2>
              <span className="text-xs text-stone-400 font-medium">Grouped row by row for each trip</span>
            </div>

            {tripRows.length > 0 ? (
              tripRows.map((row) => (
                <div key={row.trip.id} className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-4">
                  {/* Trip Row Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-2">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${row.colorStyle.badge}`}>
                        {row.trip.city_name || 'Destination'}
                      </span>
                      <h3
                        className="text-lg font-serif italic font-bold text-stone-900"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {row.trip.title}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-stone-500 font-semibold">
                      <span className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                        {row.trip.city_name}
                      </span>
                      <span>•</span>
                      <span>
                        Dates: {row.trip.start_date} to {row.trip.end_date}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Scroll of ONLY This Trip's Days */}
                  <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar py-2">
                    {row.days.map((dayCard) => {
                      const customActivities = dayActivitiesMap[dayCard.dateISO] || [];

                      return (
                        <div
                          key={dayCard.dateISO}
                          className={`flex-shrink-0 w-52 rounded-2xl p-4 shadow-2xs border-2 transition flex flex-col justify-between space-y-3 bg-white ${row.colorStyle.border}`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${row.colorStyle.badge}`}>
                                Day {dayCard.dayNum}
                              </span>
                              <span className="text-[11px] font-bold text-stone-900">{dayCard.dateDisplay}</span>
                              <span className="text-[10px] text-stone-400 font-semibold uppercase">{dayCard.dayOfWeek}</span>
                            </div>

                            {/* Activities for Day */}
                            <div className="space-y-1.5 min-h-16">
                              {customActivities.length > 0 ? (
                                customActivities.map((act) => (
                                  <div
                                    key={act.id}
                                    className="p-2 bg-stone-50 border border-stone-200 rounded-xl text-[11px] space-y-0.5"
                                  >
                                    <span className="font-bold text-stone-900 block truncate">{act.name}</span>
                                    <div className="flex justify-between text-[10px] text-stone-500 font-medium">
                                      <span>{act.category}</span>
                                      <strong>${act.cost}</strong>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="py-3 text-center text-[10px] text-stone-400 italic">No activity added</div>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => setShowAddModalDayISO(dayCard.dateISO)}
                            className={`w-full py-1.5 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1 border shadow-2xs ${row.colorStyle.badge}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Activity</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white border border-stone-200 rounded-3xl p-8 text-center text-xs text-stone-400 italic">
                No scheduled trip dates currently found. Create a trip with start & end dates to display trip-wise day rows.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {showAddModalDayISO && (
        <div className="fixed inset-0 z-[100] w-screen h-screen flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-md overflow-hidden font-sans">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative my-auto">
            <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-800" />
              <span>Add Activity to Date ({showAddModalDayISO})</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Activity Name</label>
                <input
                  type="text"
                  placeholder="e.g. Shibuya Sky Visit or Louvre Museum Tour"
                  value={newActivityName}
                  onChange={(e) => setNewActivityName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={newActivityCategory}
                    onChange={(e) => setNewActivityCategory(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-700"
                  >
                    <option value="Sightseeing">Sightseeing</option>
                    <option value="Culture">Culture</option>
                    <option value="Culinary">Culinary</option>
                    <option value="Adventure">Adventure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Estimated Cost ($ USD)</label>
                  <input
                    type="number"
                    min="0"
                    value={newActivityCost}
                    onChange={(e) => setNewActivityCost(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-700"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => setShowAddModalDayISO(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddActivityToDate(showAddModalDayISO)}
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Activity</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
