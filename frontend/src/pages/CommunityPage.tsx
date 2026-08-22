import React, { useState, useEffect } from 'react';
import { communityApi, tripsApi } from '../services/api';
import {
  Users,
  Search,
  Heart,
  MessageSquare,
  Copy,
  MapPin,
  DollarSign,
  Clock,
  Tag,
  Share2,
  X,
  Send,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

interface CommunityPageProps {
  onTripCloned: (tripId: number) => void;
  currentUser?: any;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({
  onTripCloned,
}) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [sortBy, setSortBy] = useState('popular');

  // Modals state
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedPostForDetails, setSelectedPostForDetails] = useState<any | null>(null);
  const [cloningPostId, setCloningPostId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  // Publish Form State
  const [userTrips, setUserTrips] = useState<any[]>([]);
  const [publishTripId, setPublishTripId] = useState<number | null>(null);
  const [publishTitle, setPublishTitle] = useState('');
  const [publishCity, setPublishCity] = useState('');
  const [publishDuration, setPublishDuration] = useState(5);
  const [publishBudget, setPublishBudget] = useState(1200);
  const [publishTags, setPublishTags] = useState('Foodie, Backpacking, Culture');
  const [publishDesc, setPublishDesc] = useState('');
  const [publishing, setPublishing] = useState(false);

  // Comments inside Details Modal
  const [comments, setComments] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const tagsList = [
    'All',
    'Backpacking',
    'Luxury',
    'Food & Wine',
    'Nature & Trekking',
    'Culture',
    'Budget',
    'Romantic',
    'Solo',
  ];

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await communityApi.getPosts({
        q: searchTerm || undefined,
        tag: selectedTag !== 'All' ? selectedTag : undefined,
        sort_by: sortBy,
      });
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to load community plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [searchTerm, selectedTag, sortBy]);

  // Load user trips for publish modal
  useEffect(() => {
    if (showPublishModal) {
      tripsApi.getTripsListing({ group_by_status: false }).then((res) => {
        setUserTrips(res.data.results || []);
      }).catch((e) => console.error(e));
    }
  }, [showPublishModal]);

  const handleToggleLike = async (postId: number) => {
    try {
      const res = await communityApi.toggleLike(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, has_liked: res.data.liked, likes_count: res.data.likes_count }
            : p
        )
      );
      if (selectedPostForDetails && selectedPostForDetails.id === postId) {
        setSelectedPostForDetails((prev: any) => ({
          ...prev,
          has_liked: res.data.liked,
          likes_count: res.data.likes_count,
        }));
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleClonePlan = async (post: any) => {
    setCloningPostId(post.id);
    try {
      const res = await communityApi.clonePost(post.id);
      setToastMessage(`"${post.title}" has been cloned to your My Trips collection!`);
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, clones_count: p.clones_count + 1 } : p))
      );
      setTimeout(() => {
        setToastMessage('');
        onTripCloned(res.data.id);
      }, 1500);
    } catch (err) {
      console.error('Failed to clone plan:', err);
      alert('Failed to clone community plan. Please try again.');
    } finally {
      setCloningPostId(null);
    }
  };

  const handleOpenDetails = async (post: any) => {
    setSelectedPostForDetails(post);
    try {
      const res = await communityApi.getComments(post.id);
      setComments(res.data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPostForDetails || !commentInput.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await communityApi.addComment(selectedPostForDetails.id, {
        content: commentInput.trim(),
      });
      setComments((prev) => [res.data, ...prev]);
      setCommentInput('');
      setPosts((prev) =>
        prev.map((p) =>
          p.id === selectedPostForDetails.id
            ? { ...p, comments_count: p.comments_count + 1 }
            : p
        )
      );
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishTitle.trim() || !publishCity.trim() || !publishDesc.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    setPublishing(true);
    try {
      await communityApi.publishPost({
        trip_id: publishTripId || undefined,
        title: publishTitle.trim(),
        description: publishDesc.trim(),
        city_name: publishCity.trim(),
        duration_days: Number(publishDuration),
        estimated_budget: Number(publishBudget),
        tags: publishTags.trim(),
      });
      setShowPublishModal(false);
      setToastMessage('Your custom itinerary has been published to the community feed!');
      fetchPosts();
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error('Failed to publish post:', err);
      alert('Failed to publish custom itinerary.');
    } finally {
      setPublishing(false);
    }
  };

  const handleSelectTripToPublish = (tripIdStr: string) => {
    const tId = Number(tripIdStr);
    setPublishTripId(tId);
    const target = userTrips.find((t) => t.id === tId);
    if (target) {
      setPublishTitle(target.title);
      setPublishCity(target.city_name || '');
      setPublishDuration(target.duration_days || 5);
      setPublishBudget(target.total_budget || 1200);
      setPublishDesc(target.description || '');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-scale-up relative pb-28 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-[120] bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-700 flex items-center space-x-2 animate-fade-in text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner Header */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-extrabold rounded-full uppercase border border-emerald-200/80 flex items-center space-x-1.5 w-fit">
            <Users className="w-3.5 h-3.5" />
            <span>Tripyfy Global Travel Community</span>
          </span>
          <h1
            className="text-3xl sm:text-4xl font-serif italic font-bold text-stone-900 tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Community Itineraries & Plans
          </h1>
          <p className="text-xs text-stone-500 font-medium leading-relaxed">
            Discover bespoke itineraries crafted by world travelers, 1-click clone custom plans into your own trips, and publish your personal travel routes.
          </p>
        </div>

        <button
          onClick={() => setShowPublishModal(true)}
          className="py-3 px-6 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center space-x-2 shadow-2xs transition active:scale-[0.98] flex-shrink-0 h-11"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Your Itinerary</span>
        </button>
      </div>

      {/* Tags Filter Pill Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <Tag className="w-4 h-4 text-stone-400 mr-1 flex-shrink-0" />
        {tagsList.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTag(t)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedTag === t
                ? 'bg-emerald-800 text-white shadow-2xs font-bold'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 h-auto md:h-16 box-border">
        <div className="relative flex-1 w-full flex items-center h-10">
          <Search className="w-4 h-4 absolute left-3.5 text-stone-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search community plans by title, city, creator, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-700 transition box-border font-medium"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto h-10">
          <div className="relative flex-1 sm:flex-none h-10">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-10 bg-stone-50 border border-stone-200 rounded-xl pl-3 pr-8 py-2 text-xs text-stone-700 focus:outline-none focus:border-emerald-700 transition cursor-pointer font-bold appearance-none box-border"
            >
              <option value="popular">Sort: Most Popular</option>
              <option value="latest">Sort: Latest Uploads</option>
              <option value="budget_asc">Sort: Budget (Low to High)</option>
              <option value="duration_desc">Sort: Longest Duration</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Community Posts Grid */}
      {loading ? (
        <div className="text-center py-20 text-stone-400 text-xs font-medium animate-pulse">
          Loading traveler community plans...
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, idx) => (
            <div
              key={post.id}
              style={{ animationDelay: `${idx * 0.05}s` }}
              onClick={() => handleOpenDetails(post)}
              className="group bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-2xs hover:shadow-xl transition duration-300 flex flex-col justify-between cursor-pointer space-y-0 box-border"
            >
              <div>
                {/* Author Info Bar */}
                <div className="p-4 flex items-center justify-between border-b border-stone-100 bg-stone-50/50">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={post.author?.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                      alt={post.author?.first_name}
                      className="w-8 h-8 rounded-full object-cover border border-stone-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-stone-900 leading-none">
                        {post.author?.first_name || 'Traveler'}
                      </p>
                      <span className="text-[10px] font-semibold text-stone-400">
                        @{post.author?.username || 'traveler'}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 bg-white border border-stone-200 text-stone-600 text-[10px] font-bold rounded-full uppercase">
                    {post.city_name}
                  </span>
                </div>

                {/* Cover Image */}
                <div className="relative h-48 overflow-hidden bg-stone-900">
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />

                  {/* Top Stats */}
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-stone-900 text-xs font-extrabold rounded-xl shadow-xs flex items-center">
                      <DollarSign className="w-3.5 h-3.5 mr-0.5 text-emerald-800" />
                      ${post.estimated_budget?.toLocaleString()}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold">
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-emerald-300" />
                      {post.duration_days} Days
                    </span>
                    <span className="text-[10px] text-stone-300 font-medium">
                      {post.clones_count} Cloned Trips
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags?.map((t: string, tIdx: number) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-bold rounded-md uppercase"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <h3
                    className="text-base font-serif italic font-bold text-stone-900 leading-snug group-hover:text-emerald-800 transition line-clamp-2"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {post.title}
                  </h3>

                  <p className="text-xs text-stone-500 font-medium line-clamp-2 leading-relaxed">
                    {post.description}
                  </p>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div
                className="p-4 pt-3 border-t border-stone-100 flex items-center justify-between bg-white"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center space-x-3 text-xs text-stone-500 font-semibold">
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    className={`flex items-center space-x-1 transition ${
                      post.has_liked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.has_liked ? 'fill-rose-600' : ''}`} />
                    <span>{post.likes_count}</span>
                  </button>

                  <button
                    onClick={() => handleOpenDetails(post)}
                    className="flex items-center space-x-1 hover:text-stone-900 transition"
                  >
                    <MessageSquare className="w-4 h-4 text-stone-400" />
                    <span>{post.comments_count}</span>
                  </button>
                </div>

                <button
                  onClick={() => handleClonePlan(post)}
                  disabled={cloningPostId === post.id}
                  className="py-1.5 px-3.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs transition flex items-center space-x-1.5 active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{cloningPostId === post.id ? 'Cloning...' : 'Use this Plan'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center text-xs text-stone-400 italic">
          No community itineraries found matching your search. Be the first to share one!
        </div>
      )}

      {/* Details & Comments Modal */}
      {selectedPostForDetails && (
        <div className="fixed inset-0 z-[110] w-screen h-screen flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-md font-sans">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto animate-scale-up max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedPostForDetails.author?.photo_url}
                  alt={selectedPostForDetails.author?.first_name}
                  className="w-10 h-10 rounded-full object-cover border border-stone-200"
                />
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    {selectedPostForDetails.author?.first_name}
                  </h3>
                  <span className="text-xs text-stone-400">
                    @{selectedPostForDetails.author?.username} • {selectedPostForDetails.city_name}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedPostForDetails(null)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
              <div className="space-y-2">
                <h2
                  className="text-xl font-serif italic font-bold text-stone-900"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {selectedPostForDetails.title}
                </h2>

                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-stone-600">
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                    {selectedPostForDetails.city_name}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-stone-400" />
                    {selectedPostForDetails.duration_days} Days
                  </span>
                  <span className="flex items-center text-emerald-800 font-bold">
                    <DollarSign className="w-3.5 h-3.5 mr-0.5" />
                    ${selectedPostForDetails.estimated_budget?.toLocaleString()} Budget
                  </span>
                </div>
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-2">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Travel Route & Notes
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed font-medium">
                  {selectedPostForDetails.description}
                </p>
              </div>

              {/* Comments Section */}
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Traveler Tips & Reviews ({comments.length})</span>
                </h4>

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Leave a review or travel tip..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-700"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !commentInput.trim()}
                    className="py-2 px-4 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1 shadow-xs transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </form>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      className="bg-stone-50 border border-stone-200/60 rounded-xl p-3 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">
                          {c.user?.first_name || c.user?.username}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {c.created_at?.slice(0, 10)}
                        </span>
                      </div>
                      <p className="text-stone-600 font-medium">{c.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between flex-shrink-0">
              <button
                onClick={() => handleToggleLike(selectedPostForDetails.id)}
                className={`flex items-center space-x-1.5 text-xs font-bold px-3 py-2 rounded-xl transition ${
                  selectedPostForDetails.has_liked
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    selectedPostForDetails.has_liked ? 'fill-rose-600' : ''
                  }`}
                />
                <span>{selectedPostForDetails.likes_count} Likes</span>
              </button>

              <button
                onClick={() => {
                  setSelectedPostForDetails(null);
                  handleClonePlan(selectedPostForDetails);
                }}
                className="py-2 px-5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Clone Itinerary to My Trips</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Custom Plan Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-[110] w-screen h-screen flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-md font-sans">
          <div className="bg-white border border-stone-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto animate-scale-up max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 flex-shrink-0">
              <div className="space-y-1">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-extrabold uppercase rounded-full border border-emerald-200 flex items-center space-x-1 w-fit">
                  <Share2 className="w-3 h-3 mr-1" />
                  <span>Publish Itinerary</span>
                </span>
                <h2
                  className="text-xl font-serif italic font-bold text-stone-900"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Share Itinerary with Community
                </h2>
              </div>

              <button
                onClick={() => setShowPublishModal(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
              {userTrips.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Auto-fill from One of Your Trips (Optional)
                  </label>
                  <select
                    onChange={(e) => handleSelectTripToPublish(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-none focus:border-emerald-700"
                  >
                    <option value="">-- Choose a trip to share --</option>
                    {userTrips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.city_name || 'Destination'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Plan Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7-Day Ultimate Kyoto Tea & Bamboo Trek"
                  value={publishTitle}
                  onChange={(e) => setPublishTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kyoto"
                    value={publishCity}
                    onChange={(e) => setPublishCity(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Days</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={publishDuration}
                    onChange={(e) => setPublishDuration(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Budget ($)</label>
                  <input
                    type="number"
                    min={50}
                    value={publishBudget}
                    onChange={(e) => setPublishBudget(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Backpacking, Nature, Foodie, Solo"
                  value={publishTags}
                  onChange={(e) => setPublishTags(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Itinerary Guide & Route Tips *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the best daily highlights, hidden food gems, and schedule tips..."
                  value={publishDesc}
                  onChange={(e) => setPublishDesc(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:border-emerald-700 leading-relaxed font-medium"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-stone-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{publishing ? 'Publishing...' : 'Publish to Feed'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
