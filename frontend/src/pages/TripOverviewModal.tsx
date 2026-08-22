import React, { useState, useEffect } from 'react';
import { tripsApi } from '../services/api';
import { InviteCompanionsModal } from './InviteCompanionsModal';
import { ShareTripModal } from './ShareTripModal';
import { X, Calendar, MapPin, DollarSign, Clock, ArrowUpRight, Layers, UserPlus, Share2 } from 'lucide-react';

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
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (!tripId) return;
    setLoading(true);
    tripsApi
      .getOverview(tripId)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => console.error('Failed to load trip overview:', err))
      .finally(() => setLoading(false));
  }, [tripId]);

  if (!tripId) return null;

  const trip = data?.trip;
  const stops = data?.stops || [];

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative my-auto animate-scale-up max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-stone-950/60 hover:bg-stone-950/80 text-white rounded-full backdrop-blur-md transition border border-white/20"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="py-24 text-center text-stone-400 text-xs font-medium animate-pulse">
            Loading trip overview...
          </div>
        ) : trip ? (
          <div className="flex-1 overflow-y-auto space-y-6">
            {/* Hero Cover Header */}
            <div className="relative h-64 sm:h-72 w-full bg-stone-900 overflow-hidden">
              <img
                src={
                  trip.cover_image_url ||
                  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200'
                }
                alt={trip.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-3 py-1 bg-emerald-800/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase rounded-full tracking-wider border border-white/20">
                    {trip.status} • {trip.city_name || 'Destination'}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="py-1.5 px-3 bg-stone-950/70 hover:bg-stone-950/90 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 border border-white/20 shadow-md backdrop-blur-md transition"
                    >
                      <Share2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Share Plan</span>
                    </button>

                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="py-1.5 px-3 bg-stone-950/70 hover:bg-stone-950/90 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 border border-white/20 shadow-md backdrop-blur-md transition"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Invite Companions</span>
                    </button>
                  </div>
                </div>

                <h1
                  className="text-2xl sm:text-4xl font-serif italic font-bold tracking-tight text-white drop-shadow-md"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {trip.title}
                </h1>
              </div>
            </div>

            <div className="px-6 sm:px-8 space-y-6 pb-8">
              {/* Key Quick Stats */}
              <div className="grid grid-cols-3 gap-3 border-b border-stone-100 pb-5">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Duration</span>
                  <p className="text-sm font-extrabold text-stone-900 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                    {trip.duration_days} Days
                  </p>
                </div>

                <div className="space-y-1 border-x border-stone-100 px-3">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Target Budget</span>
                  <p className="text-sm font-extrabold text-emerald-800 flex items-center">
                    <DollarSign className="w-3.5 h-3.5 mr-0.5 text-emerald-700" />
                    ${trip.total_budget?.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-1 pl-3">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Date Range</span>
                  <p className="text-xs font-bold text-stone-700 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-stone-400" />
                    {trip.start_date} to {trip.end_date}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Trip Description & Notes</h3>
                <p className="text-xs text-stone-600 leading-relaxed font-medium bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  {trip.description || `Custom trip planned for ${trip.city_name || 'destinations'}.`}
                </p>
              </div>

              {/* Itinerary Stops */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-emerald-800" />
                  <span>Itinerary Destinations & Scheduled Stops ({stops.length})</span>
                </h3>

                <div className="space-y-3">
                  {stops.map((stop: any, idx: number) => (
                    <div key={stop.id || idx} className="p-4 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                        <span className="flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                          Stop {idx + 1}: {stop.city?.name || trip.city_name}
                        </span>
                        <span className="text-emerald-800">Stay Budget: ${stop.stay_cost}</span>
                      </div>

                      {stop.activities?.length > 0 && (
                        <div className="space-y-1 pt-1 border-t border-stone-200/50">
                          {stop.activities.map((act: any) => (
                            <div key={act.id} className="flex justify-between text-[11px] text-stone-600 font-medium">
                              <span>• {act.activity?.name || 'Assigned Activity'}</span>
                              <strong className="text-stone-900">${act.cost_override || 25}</strong>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-2xl transition flex items-center space-x-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>Share Plan</span>
                  </button>

                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-2xl transition flex items-center space-x-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Invite Companions</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      onClose();
                      onSelectItinerary(trip.id);
                    }}
                    className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-2xl transition flex items-center space-x-1"
                  >
                    <span>Itinerary Builder</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-stone-400" />
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onSelectBudget(trip.id);
                    }}
                    className="py-2.5 px-5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md transition flex items-center space-x-1"
                  >
                    <span>Budget & Spend</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Invite Companions Modal */}
      {showInviteModal && trip && (
        <InviteCompanionsModal
          tripId={trip.id}
          tripTitle={trip.title}
          onClose={() => setShowInviteModal(false)}
        />
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
