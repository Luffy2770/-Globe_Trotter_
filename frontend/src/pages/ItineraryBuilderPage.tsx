import React, { useState, useEffect } from 'react';
import { tripsApi } from '../services/api';
import { Plus, Calendar, DollarSign, Trash2, Edit2, ChevronDown, ChevronUp, Check, Sparkles, AlertTriangle } from 'lucide-react';

export interface SectionActivity {
  id: number;
  name: string;
  cost: number;
  dateISO: string;
}

export interface ItinerarySection {
  id: number;
  sectionNumber: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  activities: SectionActivity[];
}

interface ItineraryBuilderPageProps {
  tripId: number;
}

// Universal Smart Template Generator for ANY trip / city
const generateSmartUniversalSections = (tripObj: any): ItinerarySection[] => {
  const city = tripObj?.city_name || tripObj?.title || 'Destination';
  const start = tripObj?.start_date || '2026-10-01';
  const end = tripObj?.end_date || start;
  const budget = tripObj?.total_budget || 2000;

  // Calculate mid date if multi-day
  const sDate = new Date(start);
  const eDate = new Date(end);
  const diffDays = Math.max(1, Math.ceil((eDate.getTime() - sDate.getTime()) / (1000 * 3600 * 24)));
  const midDays = Math.floor(diffDays / 2);

  const midDateObj = new Date(sDate);
  midDateObj.setDate(midDateObj.getDate() + midDays);
  const midISO = midDateObj.toISOString().split('T')[0];

  return [
    {
      id: 1,
      sectionNumber: 1,
      title: `Section 1: ${city} Arrival & Accommodation Stay`,
      description: `All necessary information for your arrival leg in ${city}. Airport transfers, hotel check-in, and local neighborhood exploration.`,
      startDate: start,
      endDate: diffDays > 1 ? midISO : start,
      budget: Math.round(budget * 0.40),
      activities: [
        { id: 101, name: `${city} Airport Express Transfer & Check-in`, cost: 45, dateISO: start },
        { id: 102, name: `${city} Welcome Dinner & Evening Stroll`, cost: 55, dateISO: start },
      ],
    },
    {
      id: 2,
      sectionNumber: 2,
      title: `Section 2: ${city} Tours, Landmarks & Excursions`,
      description: `All necessary information for guided city tours, historical landmark entries, museum visits, and culinary experiences in ${city}.`,
      startDate: diffDays > 1 ? midISO : start,
      endDate: end,
      budget: Math.round(budget * 0.60),
      activities: [
        { id: 103, name: `Guided ${city} Cultural Heritage Tour`, cost: 65, dateISO: diffDays > 1 ? midISO : start },
        { id: 104, name: `${city} Iconic Viewpoint & Dinner Excursion`, cost: 40, dateISO: end },
      ],
    },
  ];
};

export const ItineraryBuilderPage: React.FC<ItineraryBuilderPageProps> = ({ tripId: initialTripId }) => {
  const [allUserTrips, setAllUserTrips] = useState<any[]>([]);
  const [activeTripId, setActiveTripId] = useState<number>(initialTripId);

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Section list state
  const [sections, setSections] = useState<ItinerarySection[]>([]);
  const [expandedSectionId, setExpandedSectionId] = useState<number | null>(null);

  // Form state
  const [editingSection, setEditingSection] = useState<ItinerarySection | null>(null);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityCost, setNewActivityCost] = useState(30);
  const [newActivityDate, setNewActivityDate] = useState('');
  const [activityError, setActivityError] = useState('');

  // Fetch user trips listing for dropdown
  useEffect(() => {
    tripsApi.getTripsListing({}).then((res) => {
      const flat = [...(res.data.ongoing || []), ...(res.data.upcoming || []), ...(res.data.completed || [])];
      setAllUserTrips(flat);
      if (flat.length > 0 && (!activeTripId || !flat.find((t) => t.id === activeTripId))) {
        setActiveTripId(flat[0].id);
      }
    });
  }, []);

  // Persist sections in localStorage and calculate total spend
  useEffect(() => {
    if (activeTripId && sections.length > 0) {
      localStorage.setItem(`tripyfy_itinerary_sections_${activeTripId}`, JSON.stringify(sections));

      let totalSpent = 0;
      sections.forEach((sec) => {
        totalSpent += Number(sec.budget) || 0;
        sec.activities.forEach((act) => {
          totalSpent += Number(act.cost) || 0;
        });
      });

      localStorage.setItem(`tripyfy_trip_spend_${activeTripId}`, String(totalSpent));
    }
  }, [sections, activeTripId]);

  useEffect(() => {
    if (!activeTripId) return;
    setLoading(true);

    tripsApi
      .getOverview(activeTripId)
      .then((res) => {
        const fetchedTrip = res.data.trip;
        setTrip(fetchedTrip);
        const tripStart = fetchedTrip.start_date || '2026-10-01';
        const tripEnd = fetchedTrip.end_date || tripStart;
        setNewActivityDate(tripStart);

        const saved = localStorage.getItem(`tripyfy_itinerary_sections_${activeTripId}`);
        if (saved) {
          try {
            const parsed: ItinerarySection[] = JSON.parse(saved);

            // SANITIZE CHECK: Validate that saved sections belong to THIS trip's date range and city!
            const isValidForTrip = parsed.every((sec) => {
              const inDateRange = sec.startDate >= tripStart && sec.endDate <= tripEnd;
              const matchesCity = sec.title.toLowerCase().includes((fetchedTrip.city_name || '').toLowerCase()) ||
                sec.title.toLowerCase().includes('section');
              return inDateRange && matchesCity;
            });

            if (isValidForTrip && parsed.length > 0) {
              setSections(parsed);
              setExpandedSectionId(parsed[0]?.id || null);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error('Failed to parse saved itinerary sections:', e);
          }
        }

        // Generate fresh, perfectly synchronized sections for this trip!
        const dynamicSections = generateSmartUniversalSections(fetchedTrip);
        setSections(dynamicSections);
        setExpandedSectionId(dynamicSections[0]?.id || null);
        localStorage.setItem(`tripyfy_itinerary_sections_${activeTripId}`, JSON.stringify(dynamicSections));
      })
      .catch((err) => console.error('Failed to load trip itinerary:', err))
      .finally(() => setLoading(false));
  }, [activeTripId]);

  const handleAddSection = () => {
    const nextNumber = sections.length + 1;
    const sDate = trip?.start_date || '2026-10-01';
    const eDate = trip?.end_date || sDate;
    const city = trip?.city_name || 'Destination';

    const newSec: ItinerarySection = {
      id: Date.now(),
      sectionNumber: nextNumber,
      title: `Section ${nextNumber}: ${city} Travel Leg ${nextNumber}`,
      description: `All necessary information about this leg in ${city}. Add hotel accommodations, sightseeing excursions, or scheduled activities here.`,
      startDate: sDate,
      endDate: eDate,
      budget: 400,
      activities: [],
    };
    const updated = [...sections, newSec];
    setSections(updated);
    setExpandedSectionId(newSec.id);
  };

  const handleDeleteSection = (id: number) => {
    if (sections.length <= 1) {
      alert('Itinerary must have at least 1 section.');
      return;
    }
    const updated = sections.filter((s) => s.id !== id).map((s, idx) => ({
      ...s,
      sectionNumber: idx + 1,
    }));
    setSections(updated);
  };

  const handleAddActivityToSection = (sectionId: number) => {
    setActivityError('');
    if (!newActivityName.trim()) return;

    let targetDate = newActivityDate || trip?.start_date;

    // Strict Date Bounds Validation (Must be strictly between trip.start_date and trip.end_date!)
    if (trip?.start_date && trip?.end_date) {
      if (targetDate < trip.start_date || targetDate > trip.end_date) {
        setActivityError(`Activity date must be strictly within trip range (${trip.start_date} to ${trip.end_date}).`);
        return;
      }
    }

    const updated = sections.map((sec) => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          activities: [
            ...sec.activities,
            {
              id: Date.now(),
              name: newActivityName.trim(),
              cost: Number(newActivityCost) || 0,
              dateISO: targetDate,
            },
          ],
        };
      }
      return sec;
    });
    setSections(updated);
    setNewActivityName('');
    setActivityError('');
  };

  const handleSaveSectionEdit = (updatedSec: ItinerarySection) => {
    const updated = sections.map((s) => (s.id === updatedSec.id ? updatedSec : s));
    setSections(updated);
    setEditingSection(null);
  };

  // Calculate total current calculated spend for this trip
  const currentTotalCalculatedSpend = sections.reduce((acc, sec) => {
    const actSum = sec.activities.reduce((a, act) => a + (Number(act.cost) || 0), 0);
    return acc + (Number(sec.budget) || 0) + actSum;
  }, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-scale-up pb-24 font-sans">
      {/* Header Banner & Trip Selector */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full uppercase border border-emerald-200">
              Build Itinerary Screen (Screen 5)
            </span>

            {/* Trip Selector Dropdown */}
            {allUserTrips.length > 0 && (
              <div className="relative">
                <select
                  value={activeTripId}
                  onChange={(e) => setActiveTripId(Number(e.target.value))}
                  className="bg-stone-50 border border-stone-200 rounded-xl pl-3 pr-8 py-1.5 text-xs text-stone-900 font-bold focus:outline-none focus:border-emerald-700 cursor-pointer appearance-none shadow-2xs"
                >
                  {allUserTrips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.city_name})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            )}
          </div>

          <h1
            className="text-2xl sm:text-3xl font-serif italic font-bold text-stone-900 pt-1"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {trip?.title || 'Trip Itinerary Builder'}
          </h1>
          <p className="text-xs text-stone-500 font-medium flex flex-wrap items-center gap-2">
            <span>Destination: <strong className="text-stone-800">{trip?.city_name || 'Global'}</strong></span>
            <span>•</span>
            <span>Trip Range: <strong className="text-stone-800">{trip?.start_date || 'TBD'} to {trip?.end_date || 'TBD'}</strong></span>
            <span>•</span>
            <span className="text-emerald-800 font-bold">Total Spend: ${currentTotalCalculatedSpend.toLocaleString()}</span>
          </p>
        </div>

        <button
          onClick={handleAddSection}
          className="py-3 px-6 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center space-x-2 shadow-md transition active:scale-[0.98] flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add another Section</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-stone-400 text-xs font-medium animate-pulse">
          Generating synchronized itinerary for {trip?.city_name || 'destination'}...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Wireframe (Screen 5) Section List */}
          {sections.map((sec) => {
            const isExpanded = expandedSectionId === sec.id;
            const secActivitiesCost = sec.activities.reduce((acc, a) => acc + (Number(a.cost) || 0), 0);
            const totalSecSpend = sec.budget + secActivitiesCost;

            return (
              <div
                key={sec.id}
                className="bg-white border-2 border-stone-200 hover:border-emerald-700/60 rounded-3xl p-6 sm:p-8 shadow-xs transition duration-300 space-y-4"
              >
                {/* Section Title Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-3">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {sec.sectionNumber}
                    </span>
                    <h3 className="text-lg font-bold text-stone-900">{sec.title}</h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingSection(sec)}
                      className="p-1.5 text-stone-400 hover:text-emerald-800 rounded-lg hover:bg-emerald-50 transition"
                      title="Edit Section Info & Budget"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteSection(sec.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Remove Section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setExpandedSectionId(isExpanded ? null : sec.id)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Section Description / Info Box */}
                <p className="text-xs text-stone-600 leading-relaxed font-medium bg-stone-50/70 p-4 rounded-2xl border border-stone-100">
                  {sec.description}
                </p>

                {/* Date Range & Budget Badges */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="py-2 px-4 bg-stone-100 border border-stone-200 text-stone-800 rounded-2xl text-xs font-bold flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Date Range: {sec.startDate} to {sec.endDate}</span>
                  </div>

                  <div className="py-2 px-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center space-x-2">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Budget of this section: ${totalSecSpend.toLocaleString()}</span>
                  </div>
                </div>

                {/* Expandable Itemized Activities with Restricted Date Picker */}
                {isExpanded && (
                  <div className="pt-4 border-t border-stone-100 space-y-3 animate-fade-in">
                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center space-x-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-800" />
                      <span>Itemized Section Activities with Scheduled Dates ({sec.activities.length})</span>
                    </h4>

                    {activityError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        <span>{activityError}</span>
                      </div>
                    )}

                    {sec.activities.length > 0 ? (
                      <div className="space-y-2">
                        {sec.activities.map((act) => (
                          <div
                            key={act.id}
                            className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between text-xs font-semibold"
                          >
                            <div className="space-y-0.5">
                              <span className="text-stone-900 font-bold block">• {act.name}</span>
                              <span className="text-[10px] text-stone-500 font-medium">Scheduled Date: {act.dateISO || trip?.start_date}</span>
                            </div>
                            <span className="text-emerald-800 font-black">${act.cost}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-stone-400 italic">No line-item activities scheduled in this section yet.</p>
                    )}

                    {/* Add Activity Input with STRICT MIN/MAX RESTRICTED DATE PICKER */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Activity name (e.g. Cable Car Sightseeing Tour)..."
                        value={newActivityName}
                        onChange={(e) => setNewActivityName(e.target.value)}
                        className="sm:col-span-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-700"
                      />
                      <input
                        type="date"
                        min={trip?.start_date || undefined}
                        max={trip?.end_date || undefined}
                        value={newActivityDate}
                        onChange={(e) => setNewActivityDate(e.target.value)}
                        className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-700 font-semibold cursor-pointer"
                        title={`Select date within trip range (${trip?.start_date} to ${trip?.end_date})`}
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          placeholder="Cost $"
                          value={newActivityCost}
                          onChange={(e) => setNewActivityCost(Number(e.target.value))}
                          className="w-20 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-700"
                        />
                        <button
                          onClick={() => handleAddActivityToSection(sec.id)}
                          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1 flex-1 justify-center"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Large Bottom Wireframe Button: [+ Add another Section] */}
          <button
            onClick={handleAddSection}
            className="w-full py-4 bg-white hover:bg-emerald-50 border-2 border-dashed border-stone-300 hover:border-emerald-700 text-stone-700 hover:text-emerald-800 font-bold text-sm rounded-3xl transition flex items-center justify-center space-x-2 shadow-2xs"
          >
            <Plus className="w-5 h-5 text-emerald-800" />
            <span>Add another Section</span>
          </button>
        </div>
      )}

      {/* Edit Section Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-[100] w-screen h-screen flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-md overflow-hidden font-sans">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative my-auto">
            <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
              Edit {editingSection.title}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Section Title</label>
                <input
                  type="text"
                  value={editingSection.title}
                  onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Section Information & Notes</label>
                <textarea
                  rows={3}
                  value={editingSection.description}
                  onChange={(e) => setEditingSection({ ...editingSection, description: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    min={trip?.start_date || undefined}
                    max={trip?.end_date || undefined}
                    value={editingSection.startDate}
                    onChange={(e) => setEditingSection({ ...editingSection, startDate: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">End Date</label>
                  <input
                    type="date"
                    min={trip?.start_date || undefined}
                    max={trip?.end_date || undefined}
                    value={editingSection.endDate}
                    onChange={(e) => setEditingSection({ ...editingSection, endDate: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Section Budget ($ USD)</label>
                <input
                  type="number"
                  min="0"
                  value={editingSection.budget}
                  onChange={(e) => setEditingSection({ ...editingSection, budget: Number(e.target.value) })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-700"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 bg-stone-100 text-stone-600 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveSectionEdit(editingSection)}
                className="px-5 py-2 bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Section</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
