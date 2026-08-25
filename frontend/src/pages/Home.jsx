import { useState, useEffect } from 'react';
import { Calendar, Users, Building2, Hash, ArrowRight, X, CheckCircle, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getEvents, getEventRecommendations } from '../api/events';
import { getTopics } from '../api/topics';
import { getPeople } from '../api/people';
import { getCompanies } from '../api/companies';
import EventCard from '../components/EventCard';
import StatCard from '../components/StatCard';
import TopicBadge from '../components/TopicBadge';
import RecommendationCard from '../components/RecommendationCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import SearchBar from '../components/SearchBar';
import GlobalSearch from '../components/GlobalSearch';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [topics, setTopics] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState({ events: 0, people: 0, companies: 0, topics: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [showWhyModal, setShowWhyModal] = useState(false);

  // Default demo user
  const currentUserId = 'person_1';

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [eventsData, topicsData, peopleData, companiesData] = await Promise.all([
          getEvents().catch(() => []),
          getTopics().catch(() => []),
          getPeople().catch(() => []),
          getCompanies().catch(() => []),
        ]);

        setEvents(eventsData.slice(0, 6));
        setTopics(topicsData.slice(0, 16));
        setStats({
          events: eventsData.length,
          people: peopleData.length || 300,
          companies: companiesData.length || 50,
          topics: topicsData.length,
        });

        // Get recommendations for the first event if available
        if (eventsData.length > 0) {
          const firstEventId = eventsData[0].id || eventsData[0].event_id;
          const recs = await getEventRecommendations(firstEventId, currentUserId, 3).catch(() => []);
          setRecommendations(recs);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleWhyClick = (recommendation) => {
    setSelectedRecommendation(recommendation);
    setShowWhyModal(true);
  };

  const handleSearchTrigger = () => {
    setIsSearchOpen(true);
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Discover events.
          <br />
          <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
            Meet the right people.
          </span>
        </h1>
        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
          Uncover high-relevance professional connections powered by shortest path and common interest graph analysis.
        </p>

        <div className="max-w-2xl mx-auto" onClick={handleSearchTrigger}>
          <SearchBar
            className="py-4 text-lg cursor-pointer"
            onSearchTrigger={handleSearchTrigger}
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <StatCard label="Events" value={stats.events || '12+'} icon={Calendar} color="primary" />
        <StatCard label="People" value={stats.people || '300+'} icon={Users} color="green" />
        <StatCard label="Companies" value={stats.companies || '50+'} icon={Building2} color="blue" />
        <StatCard label="Topics" value={stats.topics || '25+'} icon={Hash} color="purple" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[...Array(6)].map((_, i) => (
            <LoadingSkeleton key={i} type="event" />
          ))}
        </div>
      ) : (
        <>
          {/* Featured Events */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Featured Events</h2>
                <p className="text-sm text-slate-500">Upcoming conferences, workshops, and meetups</p>
              </div>
              <Link
                to="/events"
                className="flex items-center text-primary-600 hover:text-primary-700 font-semibold text-sm"
              >
                View all
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard key={event.id || event.event_id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">No events available</div>
            )}
          </div>

          {/* People You Should Meet */}
          {recommendations.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">People You Should Meet</h2>
                  <p className="text-sm text-slate-500">AI & Graph recommendations tailored for you ({currentUserId})</p>
                </div>
                <Link
                  to="/events"
                  className="flex items-center text-primary-600 hover:text-primary-700 font-semibold text-sm"
                >
                  Explore more
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
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

          {/* Explore Topics */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Explore Topics</h2>
                <p className="text-sm text-slate-500">Browse by industry domains and technology sectors</p>
              </div>
              <Link
                to="/topics"
                className="flex items-center text-primary-600 hover:text-primary-700 font-semibold text-sm"
              >
                All Topics &rarr;
              </Link>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {topics.map((topic) => (
                <Link key={topic.id} to={`/topics/${topic.id}`}>
                  <TopicBadge topic={topic} size="lg" />
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

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
                    <CalendarIcon className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="font-semibold text-slate-900">
                      {selectedRecommendation.shared_events} shared events
                    </h4>
                  </div>
                  <p className="text-sm text-slate-600">
                    You have attended or signed up for overlapping events.
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
                      ? 'You have direct mutual colleagues or event overlaps.'
                      : `Separated by ${selectedRecommendation.path_length} hops in the network graph.`}
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
                  View Graph Path
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}