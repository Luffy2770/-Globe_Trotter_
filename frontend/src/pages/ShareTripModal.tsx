import React, { useState } from 'react';
import { communityApi } from '../services/api';
import { X, Share2, Globe, Link, Copy, Check, MapPin, DollarSign, Clock, CheckCircle2 } from 'lucide-react';

interface ShareTripModalProps {
  trip: any;
  onClose: () => void;
  onSharedSuccess?: () => void;
}

export const ShareTripModal: React.FC<ShareTripModalProps> = ({
  trip,
  onClose,
  onSharedSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'community' | 'link'>('community');
  const [title, setTitle] = useState(trip?.title || '');
  const [cityName, setCityName] = useState(trip?.city_name || 'Destination');
  const [tags, setTags] = useState('Backpacking, Foodie, Exploration');
  const [description, setDescription] = useState(trip?.description || 'Custom itinerary plan with curated activities and recommended stops.');
  const [publishing, setPublishing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  if (!trip) return null;

  const shareableUrl = `${window.location.origin}/trips?shared=${trip.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setSuccessToast('Trip link copied to clipboard!');
    setTimeout(() => {
      setCopiedLink(false);
      setSuccessToast('');
    }, 2500);
  };

  const handlePublishToCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !cityName.trim() || !description.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    setPublishing(true);
    try {
      await communityApi.publishPost({
        trip_id: trip.id,
        title: title.trim(),
        description: description.trim(),
        city_name: cityName.trim(),
        cover_image_url: trip.cover_image_url,
        duration_days: trip.duration_days || 5,
        estimated_budget: trip.total_budget || 1200,
        tags: tags.trim(),
      });
      setSuccessToast('Your trip plan is now published on the global Community Feed!');
      if (onSharedSuccess) onSharedSuccess();
      setTimeout(() => {
        setSuccessToast('');
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to publish trip to community:', err);
      alert('Failed to publish trip plan.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] w-screen h-screen flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-md font-sans">
      <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto animate-scale-up max-h-[90vh] flex flex-col">
        {/* Toast */}
        {successToast && (
          <div className="absolute top-4 left-6 right-6 z-30 bg-emerald-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-emerald-700 flex items-center space-x-2 text-xs font-bold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 flex-shrink-0">
          <div className="space-y-1">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-extrabold uppercase rounded-full border border-emerald-200 flex items-center space-x-1 w-fit">
              <Share2 className="w-3 h-3 mr-1" />
              <span>Share Travel Plan</span>
            </span>
            <h2
              className="text-xl font-serif italic font-bold text-stone-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Share "{trip.title}"
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector (Community Feed vs Direct Link) */}
        <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-2xl border border-stone-200 flex-shrink-0">
          <button
            onClick={() => setActiveTab('community')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
              activeTab === 'community'
                ? 'bg-white text-emerald-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Publish to Community</span>
          </button>

          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
              activeTab === 'link'
                ? 'bg-white text-emerald-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Copy Direct Link</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Trip Summary Card Preview */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-center space-x-3.5">
            <img
              src={
                trip.cover_image_url ||
                'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400'
              }
              alt={trip.title}
              className="w-16 h-16 rounded-xl object-cover border border-stone-200 flex-shrink-0"
            />
            <div className="space-y-1 min-w-0">
              <h4 className="text-xs font-bold text-stone-900 truncate">{trip.title}</h4>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500 font-medium">
                <span className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                  {trip.city_name || 'Destination'}
                </span>
                <span className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-stone-400" />
                  {trip.duration_days || 5} Days
                </span>
                <span className="flex items-center text-emerald-800 font-bold">
                  <DollarSign className="w-3.5 h-3.5 mr-0.5" />
                  ${trip.total_budget?.toLocaleString() || '1,200'}
                </span>
              </div>
            </div>
          </div>

          {activeTab === 'community' ? (
            /* Publish to Community Form */
            <form onSubmit={handlePublishToCommunity} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Community Post Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 5-Day European Renaissance Grand Tour"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Destination City *
                  </label>
                  <input
                    type="text"
                    required
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    placeholder="e.g. Paris"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Category Tags
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. Foodie, Luxury, Solo"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-700 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Insider Guide & Route Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share recommendations, hidden spots, and best timing for other travelers..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:border-emerald-700 leading-relaxed font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={publishing}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-[0.98] flex items-center justify-center space-x-1.5"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{publishing ? 'Publishing to Community...' : 'Publish to Global Community'}</span>
              </button>
            </form>
          ) : (
            /* Direct Link Sharing */
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  Shareable Trip Plan Link
                </label>
                <p className="text-[11px] text-stone-500">
                  Anyone with this link can inspect your scheduled days, stops, and activities.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareableUrl}
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono text-stone-700 focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-2 px-4 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5 flex-shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-stone-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
