import React, { useState, useEffect } from 'react';
import { invitesApi } from '../services/api';
import { X, UserPlus, Trash2, AlertCircle, CheckCircle2, Users } from 'lucide-react';

interface InviteCompanionsModalProps {
  tripId: number | null;
  tripTitle?: string;
  onClose: () => void;
  onMembersUpdated?: () => void;
}

export const InviteCompanionsModal: React.FC<InviteCompanionsModalProps> = ({
  tripId,
  tripTitle,
  onClose,
  onMembersUpdated,
}) => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usernameInput, setUsernameInput] = useState('');
  const [roleInput, setRoleInput] = useState<'editor' | 'viewer'>('editor');

  const [inviting, setInviting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchMembers = async () => {
    if (!tripId) return;
    setLoading(true);
    try {
      const res = await invitesApi.getMembers(tripId);
      setMembers(res.data);
    } catch (err) {
      console.error('Failed to load trip members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [tripId]);

  if (!tripId) return null;

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanUser = usernameInput.trim().replace(/^@/, '');
    if (!cleanUser) {
      setErrorMsg('Please enter a valid username.');
      return;
    }

    setInviting(true);
    try {
      await invitesApi.inviteUser(tripId, { username: cleanUser, role: roleInput });
      setSuccessMsg(`Successfully invited @${cleanUser} as a ${roleInput === 'editor' ? 'Co-Planner (Editor)' : 'Companion (Viewer)'}!`);
      setUsernameInput('');
      fetchMembers();
      if (onMembersUpdated) onMembersUpdated();
    } catch (err: any) {
      console.error('Failed to send invite:', err);
      const detail = err.response?.data?.detail || 'Failed to send invite. Check if username exists.';
      setErrorMsg(detail);
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (inviteId: number, name: string) => {
    if (inviteId === 0) return; // Cannot remove owner
    if (!window.confirm(`Remove ${name} from this trip?`)) return;

    try {
      await invitesApi.removeMember(tripId, inviteId);
      fetchMembers();
      if (onMembersUpdated) onMembersUpdated();
    } catch (err) {
      console.error('Failed to remove member:', err);
      alert('Failed to remove member.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-md font-sans">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="space-y-1">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-extrabold uppercase rounded-full border border-emerald-200 flex items-center space-x-1 w-fit">
              <Users className="w-3 h-3 mr-1" />
              <span>Trip Companions & Co-Planning</span>
            </span>
            <h2
              className="text-xl font-serif italic font-bold text-stone-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Invite Partner to {tripTitle || 'Trip'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form to Invite by Username & Select Authorization Role */}
        <form onSubmit={handleSendInvite} className="space-y-3">
          <label className="block text-xs font-extrabold text-stone-900 uppercase tracking-wider">
            Invite Companion by Username
          </label>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-stone-400 font-bold text-xs">@</span>
              <input
                type="text"
                placeholder="username (e.g. zoro, nami, luffy)..."
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-emerald-700 transition"
              />
            </div>

            {/* Authorization / Role Selector */}
            <select
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value as any)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-700 focus:outline-none focus:border-emerald-700 transition cursor-pointer"
            >
              <option value="editor">Co-Planner (Editor)</option>
              <option value="viewer">Companion (Viewer)</option>
            </select>

            <button
              type="submit"
              disabled={inviting}
              className="py-2 px-5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-xs transition active:scale-[0.98] flex-shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{inviting ? 'Inviting...' : 'Send Invite'}</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </form>

        {/* Member & Companion Roster List */}
        <div className="space-y-3 pt-2 border-t border-stone-100">
          <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center justify-between">
            <span>Current Trip Companions ({members.length})</span>
            <span className="text-[10px] text-stone-400 font-medium">Inviter sets authorizations</span>
          </h3>

          {loading ? (
            <div className="py-6 text-center text-stone-400 text-xs font-medium animate-pulse">
              Loading travel companions...
            </div>
          ) : members.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={member.photo_url}
                      alt={member.first_name}
                      className="w-9 h-9 rounded-full object-cover border border-stone-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-stone-900 leading-none">{member.first_name}</p>
                      <span className="text-[10px] font-semibold text-stone-400">@{member.username}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full border ${
                        member.role === 'owner'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : member.role === 'editor'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-stone-100 text-stone-600 border-stone-200'
                      }`}
                    >
                      {member.role === 'owner' ? 'Trip Owner' : member.role === 'editor' ? 'Co-Planner (Edit)' : 'Viewer'}
                    </span>

                    {member.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveMember(member.id, member.first_name)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        title="Remove Companion"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-400 italic py-2">No companions invited yet.</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-stone-100">
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
