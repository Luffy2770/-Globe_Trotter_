import React, { useState, useEffect } from 'react';
import { tripsApi } from '../services/api';
import { ShareTripModal } from './ShareTripModal';
import { Plus, Calendar, DollarSign, Trash2, Edit2, ChevronDown, ChevronUp, Check, AlertTriangle, Share2 } from 'lucide-react';

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
  const [showShareModal, setShowShareModal] = useState(false);

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

  // Update activeTripId if initialTripId changes
  useEffect(() => {
    if (initialTripId) {
      setActiveTripId(initialTripId);
    }
  }, [initialTripId]);

  // Load trip overview and sanitize section data
  useEffect(() => {
    if (!activeTripId) return;
    setLoading(true);
    tripsApi
      .getOverview(activeTripId)
      .then((res) => {
        const tripData = res.data.trip;
        setTrip(tripData);

        // Check if sections already saved in localStorage for this trip
        const storageKey = `tripyfy_itinerary_sections_${activeTripId}`;
        const saved = localStorage.getItem(storageKey);

        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            // Verify if parsed sections match current trip destination & date
            const isMatchingDestination = parsed[0]?.title?.toLowerCase().includes(tripData.city_name?.toLowerCase());
            const isMatchingDate = parsed[0]?.startDate === tripData.start_date;

            if (isMatchingDestination && isMatchingDate) {
              setSections(parsed);
              setExpandedSectionId(parsed[0]?.id || 1);
            } else {
              // Sanitize with universal smart template
              const smartSections = generateSmartUniversalSections(tripData);
              setSections(smartSections);
              setExpandedSectionId(smartSections[0].id);
              localStorage.setItem(storageKey, JSON.stringify(smartSections));
            }
          } catch (e) {
            const smartSections = generateSmartUniversalSections(tripData);
            setSections(smartSections);
            setExpandedSectionId(smartSections[0].id);
            localStorage.setItem(storageKey, JSON.stringify(smartSections));
          }
        } else {
          // Generate fresh smart template
          const smartSections = generateSmartUniversalSections(tripData);
          setSections(smartSections);
          setExpandedSectionId(smartSections[0].id);
          localStorage.setItem(storageKey, JSON.stringify(smartSections));
        }
      })
      .catch((err) => console.error('Failed to load trip overview:', err))
      .finally(() => setLoading(false));
  }, [activeTripId]);

  // Save sections to localStorage and update real-time spend
  const persistSections = (updated: ItinerarySection[]) => {
    setSections(updated);
    if (activeTripId) {
      localStorage.setItem(`tripyfy_itinerary_sections_${activeTripId}`, JSON.stringify(updated));

      // Calculate total spend (section budgets + all itemized activities)
      const totalSectionBudgets = updated.reduce((acc, s) => acc + (Number(s.budget) || 0), 0);
      const totalActivitiesSpend = updated.reduce(
        (acc, s) => acc + s.activities.reduce((a, act) => a + (Number(act.cost) || 0), 0),
        0
      );
      const grandTotalSpend = totalSectionBudgets + totalActivitiesSpend;

      // Broadcast spend update
      localStorage.setItem(`tripyfy_trip_spend_${activeTripId}`, grandTotalSpend.toString());
      window.dispatchEvent(new Event('storage'));
    }
  };

  // Add new section
  const handleAddSection = () => {
    const nextNum = sections.length + 1;
    const start = trip?.start_date || '2026-10-01';
    const end = trip?.end_date || start;
    const city = trip?.city_name || 'Destination';

    const newSec: ItinerarySection = {
      id: Date.now(),
      sectionNumber: nextNum,
      title: `Section ${nextNum}: ${city} Exploration Leg`,
      description: `All necessary information for activities, dining, and scenic routes during leg ${nextNum}.`,
      startDate: start,
      endDate: end,
      budget: 350,
      activities: [
        { id: Date.now() + 1, name: `${city} Highlight Tour`, cost: 40, dateISO: start },
      ],
    };

    const updated = [...sections, newSec];
    persistSections(updated);
    setExpandedSectionId(newSec.id);
  };

  // Delete section
  const handleDeleteSection = (id: number) => {
    if (sections.length <= 1) {
      alert('An itinerary must have at least one section.');
      return;
    }
    const filtered = sections.filter((s) => s.id !== id).map((s, idx) => ({
      ...s,
      sectionNumber: idx + 1,
      title: s.title.replace(/^Section \d+:/, `Section ${idx + 1}:`),
    }));
    persistSections(filtered);
  };

  // Save section edits (Title, Description, Dates, Budget)
  const handleSaveSectionEdit = (updatedSec: ItinerarySection) => {
    const updated = sections.map((s) => (s.id === updatedSec.id ? updatedSec : s));
    persistSections(updated);
    setEditingSection(null);
  };

  // Add activity to a section (Strictly bounded by trip start & end dates)
  const handleAddActivity = (sectionId: number) => {
    setActivityError('');
    if (!newActivityName.trim()) {
      setActivityError('Activity title is required.');
      return;
    }

    const tripStart = trip?.start_date || '2000-01-01';
    const tripEnd = trip?.end_date || '2099-12-31';

    let scheduledDate = newActivityDate;
    if (!scheduledDate) {
      // Default to section startDate or trip start_date
      const targetSec = sections.find((s) => s.id === sectionId);
      scheduledDate = targetSec?.startDate || tripStart;
    }

    // STRICT DATE BOUNDS VALIDATION
    if (scheduledDate < tripStart || scheduledDate > tripEnd) {
      setActivityError(
        `Activity date must be within the trip range: ${tripStart} to ${tripEnd}.`
      );
      return;
    }

    const newAct: SectionActivity = {
      id: Date.now(),
      name: newActivityName.trim(),
      cost: Number(newActivityCost) || 0,
      dateISO: scheduledDate,
    };

    const updated = sections.map((s) => {
      if (s.id === sectionId) {
        return {
          ...s,
          activities: [...s.activities, newAct],
        };
      }
      return s;
    });

    persistSections(updated);
    setNewActivityName('');
    setNewActivityCost(30);
    setNewActivityDate('');
    setActivityError('');
  };

  // Remove activity from a section
  const handleRemoveActivity = (sectionId: number, activityId: number) => {
    const updated = sections.map((s) => {
      if (s.id === sectionId) {
        return {
          ...s,
          activities: s.activities.filter((a) => a.id !== activityId),
        };
      }
      return s;
    });
    persistSections(updated);
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

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowShareModal(true)}
            className="py-3 px-5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-2xl text-xs flex items-center space-x-1.5 transition border border-stone-200"
            title="Share Itinerary with Community"
          >
            <Share2 className="w-4 h-4 text-amber-500" />
            <span>Share Plan</span>
          </button>

          <button
            onClick={handleAddSection}
            className="py-3 px-6 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center space-x-2 shadow-md transition active:scale-[0.98] flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add another Section</span>
          </button>
        </div>
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
                    <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      {sec.sectionNumber}
                    </div>

                    {editingSection?.id === sec.id ? (
                      <input
                        type="text"
                        value={editingSection.title}
                        onChange={(e) =>
                          setEditingSection({ ...editingSection, title: e.target.value })
                        }
                        className="text-base sm:text-lg font-bold text-stone-900 bg-stone-50 border border-stone-300 rounded-xl px-3 py-1 focus:outline-none focus:border-emerald-700 font-serif"
                      />
                    ) : (
                      <h2
                        className="text-base sm:text-lg font-serif italic font-bold text-stone-900"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {sec.title}
                      </h2>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {editingSection?.id === sec.id ? (
                      <button
                        onClick={() => handleSaveSectionEdit(editingSection)}
                        className="py-1 px-3 bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingSection(sec)}
                        className="p-1.5 text-stone-400 hover:text-emerald-800 rounded-lg hover:bg-emerald-50 transition"
                        title="Edit Section Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteSection(sec.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Remove Section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setExpandedSectionId(isExpanded ? null : sec.id)}
                      className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Section Meta Badges (Dates & Budget) */}
                <div className="flex flex-wrap items-center gap-3">
                  {editingSection?.id === sec.id ? (
                    <div className="flex flex-wrap items-center gap-2 w-full pt-1">
                      <div className="flex items-center space-x-1 bg-stone-50 px-2 py-1 rounded-xl border border-stone-200">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <input
                          type="date"
                          min={trip?.start_date}
                          max={trip?.end_date}
                          value={editingSection.startDate}
                          onChange={(e) =>
                            setEditingSection({ ...editingSection, startDate: e.target.value })
                          }
                          className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none"
                        />
                        <span className="text-stone-400">to</span>
                        <input
                          type="date"
                          min={editingSection.startDate || trip?.start_date}
                          max={trip?.end_date}
                          value={editingSection.endDate}
                          onChange={(e) =>
                            setEditingSection({ ...editingSection, endDate: e.target.value })
                          }
                          className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center space-x-1 bg-stone-50 px-2 py-1 rounded-xl border border-stone-200">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-800" />
                        <span className="text-xs text-stone-500">Base Budget:</span>
                        <input
                          type="number"
                          value={editingSection.budget}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              budget: Number(e.target.value),
                            })
                          }
                          className="w-20 bg-transparent text-xs font-bold text-emerald-800 focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="px-3 py-1 bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl flex items-center border border-stone-200">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-emerald-700" />
                        {sec.startDate} to {sec.endDate}
                      </span>

                      <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl flex items-center border border-emerald-200">
                        <DollarSign className="w-3.5 h-3.5 mr-0.5 text-emerald-700" />
                        Section Budget: ${sec.budget}
                      </span>

                      <span className="px-3 py-1 bg-stone-50 text-stone-600 text-xs font-medium rounded-xl border border-stone-200">
                        Total Leg Spend: <strong>${totalSecSpend}</strong>
                      </span>
                    </>
                  )}
                </div>

                {/* Section Description Box (Matching Screen 5) */}
                {editingSection?.id === sec.id ? (
                  <textarea
                    rows={2}
                    value={editingSection.description}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, description: e.target.value })
                    }
                    className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-3 text-xs text-stone-800 font-medium focus:outline-none focus:border-emerald-700 leading-relaxed"
                  />
                ) : (
                  <p className="text-xs text-stone-600 leading-relaxed font-medium bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200/60">
                    {sec.description}
                  </p>
                )}

                {/* Collapsible Activities Section */}
                {isExpanded && (
                  <div className="pt-3 border-t border-stone-100 space-y-4 animate-fade-in">
                    <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center justify-between">
                      <span>Assigned Leg Activities ({sec.activities.length})</span>
                      <span className="text-[11px] text-stone-400 font-normal">
                        Itemized: ${secActivitiesCost}
                      </span>
                    </h3>

                    {/* Activity List */}
                    <div className="space-y-2">
                      {sec.activities.map((act) => (
                        <div
                          key={act.id}
                          className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs"
                        >
                          <div className="space-y-0.5">
                            <p className="font-bold text-stone-900">{act.name}</p>
                            <p className="text-[11px] text-stone-500 flex items-center space-x-2">
                              <span>Scheduled: <strong className="text-stone-700">{act.dateISO}</strong></span>
                              <span>•</span>
                              <span className="text-emerald-800 font-extrabold">${act.cost}</span>
                            </p>
                          </div>

                          <button
                            onClick={() => handleRemoveActivity(sec.id, act.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                            title="Remove Activity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Activity Input (With Strict Date Bounds Enforcement) */}
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                      <h4 className="text-xs font-bold text-stone-800 flex items-center space-x-1.5">
                        <Plus className="w-3.5 h-3.5 text-emerald-800" />
                        <span>Add New Activity to {sec.title.split(':')[0]}</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Activity title (e.g. Louvre Museum Guided Tour)"
                            value={newActivityName}
                            onChange={(e) => setNewActivityName(e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-700"
                          />
                        </div>

                        <div>
                          <input
                            type="date"
                            min={trip?.start_date}
                            max={trip?.end_date}
                            value={newActivityDate || sec.startDate}
                            onChange={(e) => setNewActivityDate(e.target.value)}
                            title={`Date must be between ${trip?.start_date} and ${trip?.end_date}`}
                            className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-2 text-xs text-stone-800 focus:outline-none focus:border-emerald-700 font-medium"
                          />
                        </div>

                        <div className="flex space-x-2">
                          <div className="relative flex-1">
                            <span className="absolute left-2.5 top-2 text-stone-400 text-xs">$</span>
                            <input
                              type="number"
                              min={0}
                              placeholder="Cost"
                              value={newActivityCost}
                              onChange={(e) => setNewActivityCost(Number(e.target.value))}
                              className="w-full bg-white border border-stone-200 rounded-xl pl-6 pr-2 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-700 font-bold"
                            />
                          </div>

                          <button
                            onClick={() => handleAddActivity(sec.id)}
                            className="py-2 px-3.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex-shrink-0"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Error Message for Out-of-Bounds Dates */}
                      {activityError && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                          <span>{activityError}</span>
                        </div>
                      )}

                      <p className="text-[11px] text-stone-400 italic">
                        Date selection is bounded strictly within trip dates ({trip?.start_date} to {trip?.end_date}).
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Share Trip Modal */}
      {showShareModal && trip && (
        <ShareTripModal
          trip={trip}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};
