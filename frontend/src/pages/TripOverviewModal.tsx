import React, { useState, useEffect } from 'react';
import { tripsApi } from '../services/api';
import { X, DollarSign, MapPin, Clock, ArrowUpRight, Sparkles, Tag } from 'lucide-react';

interface TripOverviewModalProps {
  tripId: number | null;
  onClose: () => void;
  onSelectItinerary: (tripId: number) => void;
  onSelectBudget: (tripId: number) => void;
}

export const TripOverviewModal: React.FC<TripOverviewModalProps> = ({
  tripId,
  onClose,
  onSelectItinerary,
  onSelectBudget,
}) => {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tripId) {
      setLoading(true);
      tripsApi
        .getOverview(tripId)
        .then((res) => setOverview(res.data))
        .catch((err) => console.error('Failed to load trip overview:', err))
        .finally(() => setLoading(false));
    }
  }, [tripId]);

  if (!tripId) return null;

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen flex items-center justify-center p-4 sm:p-6 bg-stone-950/75 backdrop-blur-md overflow-hidden font-sans">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto no-scrollbar">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 z-10 p-2 text-stone-400 hover:text-stone-700 bg-white/80 rounded-full hover:bg-stone-100 transition shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        {loading || !overview ? (
          <div className="py-16 text-center text-stone-400 text-xs font-medium animate-pulse">
            Loading complete trip overview & details...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Hero Cover Image & Badge */}
            <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden shadow-xs border border-stone-200">
              <img
                src={
                  overview.trip.cover_image_url ||
                  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800'
                }
                alt={overview.trip.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                <span className="px-2.5 py-1 bg-emerald-800 text-white text-[10px] font-bold uppercase rounded-full tracking-wider">
                  {overview.trip.status || 'Trip Overview'}
                </span>
                <h2
                  className="text-2xl font-serif italic font-bold tracking-tight drop-shadow-sm"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {overview.trip.title}
                </h2>
                <p className="text-xs text-stone-200 font-medium flex items-center">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                  {overview.trip.city_name || 'Multi-City'} Destination
                </p>
              </div>
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200/80 text-xs font-semibold text-stone-700">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase">Duration</span>
                <p className="text-stone-900 font-extrabold flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                  {overview.trip.duration_days} Days
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase">Total Budget</span>
                <p className="text-stone-900 font-extrabold flex items-center">
                  <DollarSign className="w-3.5 h-3.5 mr-0.5 text-stone-400" />
                  ${overview.trip.total_budget?.toLocaleString()}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase">Current Spend</span>
                <p className="text-emerald-800 font-extrabold flex items-center">
                  <DollarSign className="w-3.5 h-3.5 mr-0.5 text-emerald-700" />
                  ${overview.trip.total_spent?.toLocaleString() || 0}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase">Stops & Cities</span>
                <p className="text-stone-900 font-extrabold flex items-center">
                  <Tag className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  {overview.trip.stops_count || 1} Destinations
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Trip Description & Itinerary Plan</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-medium bg-stone-50/50 p-3 rounded-xl border border-stone-100">
                {overview.trip.description ||
                  `Itinerary for ${overview.trip.city_name || 'travel destinations'}. Scheduled for ${overview.trip.start_date || 'TBD'} to ${overview.trip.end_date || 'TBD'}.`}
              </p>
            </div>

            {/* Scheduled Stops & Activities Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-800" />
                <span>Scheduled Trip Stops ({overview.stops?.length || 0})</span>
              </h3>

              {overview.stops?.length > 0 ? (
                <div className="space-y-2">
                  {overview.stops.map((stop: any, idx: number) => (
                    <div key={stop.id} className="p-3 bg-white border border-stone-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-900">
                          Stop {idx + 1}: {stop.city?.name || overview.trip.city_name || 'City'}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Stay Cost: ${stop.stay_cost}
                        </span>
                      </div>

                      {stop.activities?.length > 0 ? (
                        <div className="space-y-1 pl-2 border-l-2 border-emerald-600">
                          {stop.activities.map((act: any) => (
                            <div key={act.id} className="flex items-center justify-between text-[11px] text-stone-600">
                              <span>• {act.activity?.name || 'Scheduled Activity'}</span>
                              <strong className="text-stone-900">${act.cost_override || act.activity?.estimated_cost || 0}</strong>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-stone-400 italic">No specific activities assigned to this stop yet.</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-stone-400 italic bg-stone-50 rounded-xl border border-stone-100">
                  No stops configured yet. Use "Build Itinerary" to add stops and activities.
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-100">
              <button
                onClick={() => {
                  onClose();
                  onSelectItinerary(overview.trip.id);
                }}
                className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition flex items-center space-x-1"
              >
                <span>Edit Itinerary Builder</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  onSelectBudget(overview.trip.id);
                }}
                className="py-2.5 px-4 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1"
              >
                <span>View Full Analytics</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
