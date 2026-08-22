import React, { useState, useEffect } from 'react';
import { invitesApi } from '../services/api';
import { X, Mail, Check, Calendar, MapPin, DollarSign } from 'lucide-react';

interface InviteInboxModalProps {
  onClose: () => void;
  onInviteAccepted?: () => void;
}

export const InviteInboxModal: React.FC<InviteInboxModalProps> = ({
  onClose,
  onInviteAccepted,
}) => {
  const [inboxItems, setInboxItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<number | null>(null);

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const res = await invitesApi.getInbox();
      setInboxItems(res.data);
    } catch (err) {
      console.error('Failed to load invite inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const handleRespond = async (inviteId: number, action: 'accept' | 'decline') => {
    setRespondingId(inviteId);
    try {
      await invitesApi.respondToInvite(inviteId, { action });
      fetchInbox();
      if (action === 'accept' && onInviteAccepted) {
        onInviteAccepted();
      }
    } catch (err) {
      console.error(`Failed to ${action} invite:`, err);
      alert(`Failed to ${action} invitation.`);
    } finally {
      setRespondingId(null);
    }
  };

  const pendingInvites = inboxItems.filter((i) => i.status === 'pending');
  const pastInvites = inboxItems.filter((i) => i.status !== 'pending');

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-md font-sans">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto animate-scale-up max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 flex-shrink-0">
          <div className="space-y-1">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-extrabold uppercase rounded-full border border-emerald-200 flex items-center space-x-1 w-fit">
              <Mail className="w-3 h-3 mr-1" />
              <span>Invitations Inbox</span>
            </span>
            <h2
              className="text-xl font-serif italic font-bold text-stone-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Trip Invitations & Co-Planning
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {loading ? (
            <div className="py-12 text-center text-stone-400 text-xs font-medium animate-pulse">
              Checking your invitation inbox...
            </div>
          ) : inboxItems.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs italic bg-stone-50 border border-stone-100 rounded-2xl p-6">
              Your inbox is empty. When travel friends invite you to their trips, their invitations will appear here!
            </div>
          ) : (
            <>
              {/* Pending Invitations Section */}
              {pendingInvites.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center justify-between">
                    <span>Pending Invitations ({pendingInvites.length})</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  </h3>

                  <div className="space-y-3">
                    {pendingInvites.map((item) => (
                      <div
                        key={item.id}
                        className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3 shadow-2xs"
                      >
                        {/* Inviter Info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={item.inviter.photo_url}
                              alt={item.inviter.first_name}
                              className="w-8 h-8 rounded-full object-cover border border-stone-200"
                            />
                            <div>
                              <p className="text-xs font-bold text-stone-900 leading-none">
                                {item.inviter.first_name}{' '}
                                <span className="text-stone-400 font-normal text-[11px]">
                                  (@{item.inviter.username})
                                </span>
                              </p>
                              <span className="text-[10px] text-stone-500 font-medium">
                                invited you to join their trip
                              </span>
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full border ${
                              item.role === 'editor'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-stone-100 text-stone-600 border-stone-200'
                            }`}
                          >
                            {item.role === 'editor' ? 'Co-Planner (Edit)' : 'Companion (View)'}
                          </span>
                        </div>

                        {/* Trip Details */}
                        <div className="bg-white p-3 rounded-xl border border-stone-200/80 space-y-1.5">
                          <h4
                            className="text-sm font-serif italic font-bold text-stone-900"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                          >
                            {item.trip_title}
                          </h4>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 font-medium">
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1 text-emerald-700" />
                              {item.city_name || 'Destination'}
                            </span>
                            {item.start_date && (
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1 text-stone-400" />
                                {item.start_date} to {item.end_date}
                              </span>
                            )}
                            <span className="flex items-center font-bold text-emerald-800">
                              <DollarSign className="w-3 h-3 mr-0.5" />
                              ${item.total_budget?.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Accept / Decline Action Buttons */}
                        <div className="flex items-center justify-end space-x-2 pt-1">
                          <button
                            onClick={() => handleRespond(item.id, 'decline')}
                            disabled={respondingId === item.id}
                            className="py-1.5 px-3.5 bg-white hover:bg-stone-100 text-stone-600 font-bold rounded-xl text-xs border border-stone-200 transition"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleRespond(item.id, 'accept')}
                            disabled={respondingId === item.id}
                            className="py-1.5 px-4 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-2xs transition active:scale-[0.98]"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept & Join Trip</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Past / Responded Invitations Section */}
              {pastInvites.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                    Past Invitations ({pastInvites.length})
                  </h3>

                  <div className="space-y-2">
                    {pastInvites.map((item) => (
                      <div
                        key={item.id}
                        className="bg-stone-50/60 border border-stone-200/60 rounded-xl p-3 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-stone-800">{item.trip_title}</p>
                          <p className="text-[11px] text-stone-400">
                            Invited by @{item.inviter.username} • {item.role === 'editor' ? 'Co-Planner' : 'Companion'}
                          </p>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full border ${
                            item.status === 'accepted'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-stone-100 text-stone-500 border-stone-200'
                          }`}
                        >
                          {item.status === 'accepted' ? 'Accepted' : 'Declined'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-stone-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
