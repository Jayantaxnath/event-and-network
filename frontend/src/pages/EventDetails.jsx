import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowLeft, Search, X, CheckCircle, TrendingUp, CalendarDays, ChevronDown } from 'lucide-react';
import { getEventDetails, getEventAttendees, getEventRecommendations } from '../api/events';
import TopicBadge from '../components/TopicBadge';
import RecommendationCard from '../components/RecommendationCard';
import AttendeeCard from '../components/AttendeeCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { filterAndSortByPrefix } from '../utils/prefixSearch';

const INITIAL_PAGE_SIZE = 12;

export default function EventDetails() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);

  // For demo purposes, use a fixed user ID
  const currentUserId = 'person_1';

  useEffect(() => {
    async function loadEventData() {
      try {
        setLoading(true);
        const [eventData, attendeesData, recommendationsData] = await Promise.all([
          getEventDetails(eventId),
          getEventAttendees(eventId).catch(() => []),
          getEventRecommendations(eventId, currentUserId, 10).catch(() => []),
        ]);

        setEvent(eventData);
        setAttendees(attendeesData || []);
        setRecommendations(recommendationsData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadEventData();
  }, [eventId]);

  const filteredAttendees = useMemo(() => {
    if (!searchQuery.trim()) {
      return attendees;
    }
    return filterAndSortByPrefix(attendees, searchQuery, (a) => [
      a.person_name,
      a.title,
      a.company_name,
      a.attendance_role,
      a.topics,
    ]);
  }, [searchQuery, attendees]);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setVisibleCount(INITIAL_PAGE_SIZE);
  };

  const visibleAttendees = useMemo(() => {
    return filteredAttendees.slice(0, visibleCount);
  }, [filteredAttendees, visibleCount]);


  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  const handleWhyClick = (recommendation) => {
    setSelectedRecommendation(recommendation);
    setShowWhyModal(true);
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <LoadingSkeleton type="card" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <LoadingSkeleton key={i} type="card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        to="/events"
        className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Events
      </Link>

      {/* Event Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">{event.name}</h1>

        <div className="flex flex-wrap gap-6 mb-6 text-slate-600 text-sm">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-primary-600" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-primary-600" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-primary-600" />
            <span>{event.attendee_count || attendees.length} people attending</span>
          </div>
        </div>

        {event.description && (
          <p className="text-slate-700 leading-relaxed mb-6">{event.description}</p>
        )}

        {/* Topics */}
        {event.topics && event.topics.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Event Topics</h3>
            <div className="flex flex-wrap gap-2">
              {event.topics.map((topic) => (
                <Link key={topic.id} to={`/topics/${topic.id}`}>
                  <TopicBadge topic={topic} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* People You Should Meet */}
      {recommendations.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">People You Should Meet</h2>
              <p className="text-sm text-slate-500">
                AI matchmaking based on shared topics and network proximity
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.person_id}
                recommendation={rec}
                onWhyClick={handleWhyClick}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Attendees */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Registered Attendees ({attendees.length})
            </h2>
            <p className="text-sm text-slate-500">Professionals attending this event</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search attendees by prefix..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

          </div>
        </div>

        {filteredAttendees.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-slate-500 font-medium">
              Showing {visibleAttendees.length} of {filteredAttendees.length} attendees
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleAttendees.map((attendee) => (
                <AttendeeCard key={attendee.person_id} attendee={attendee} />
              ))}
            </div>

            {visibleCount < filteredAttendees.length && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  className="flex items-center space-x-2 px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-800 rounded-xl font-semibold text-sm shadow-sm transition-all"
                >
                  <span>Load More ({Math.min(12, filteredAttendees.length - visibleCount)} remaining)</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={Users}
            title="No attendees found"
            description={`No attendees match "${searchQuery}".`}
            action={
              searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Clear search
                </button>
              )
            }
          />
        )}
      </div>

      {/* Why Modal */}
      {showWhyModal && selectedRecommendation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  Why {selectedRecommendation.person_name}?
                </h3>
                <button
                  onClick={() => setShowWhyModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center mb-1">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-slate-900">
                      {selectedRecommendation.shared_topics} shared interests
                    </h4>
                  </div>
                  <p className="text-sm text-slate-600">
                    You both share interests in the same technical domains.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-1">
                    <CalendarDays className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="font-semibold text-slate-900">
                      {selectedRecommendation.shared_events} shared events
                    </h4>
                  </div>
                  <p className="text-sm text-slate-600">
                    You've both attended similar events.
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center mb-1">
                    <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                    <h4 className="font-semibold text-slate-900">
                      {selectedRecommendation.path_length}° connection distance
                    </h4>
                  </div>
                  <p className="text-sm text-slate-600">
                    {selectedRecommendation.path_length === 2
                      ? 'This is a 2nd degree connection with mutual acquaintances.'
                      : `Separated by ${selectedRecommendation.path_length} hops in the network.`}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowWhyModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                >
                  Close
                </button>
                <Link
                  to={`/network/${currentUserId}/${selectedRecommendation.person_id}`}
                  onClick={() => setShowWhyModal(false)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  View Network Path
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}