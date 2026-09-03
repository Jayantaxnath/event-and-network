import { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, Users, Building2, Hash, ArrowRight, X, CheckCircle, TrendingUp, Calendar as CalendarIcon, Server } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getEvents, getEventRecommendations } from '../api/events';
import { getTopics } from '../api/topics';
import { getPeople } from '../api/people';
import { getCompanies } from '../api/companies';
import { getHealth, getCachedData, isServerKnownAwake } from '../api/client';
import EventCard from '../components/EventCard';
import StatCard from '../components/StatCard';
import TopicBadge from '../components/TopicBadge';
import RecommendationCard from '../components/RecommendationCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import SearchBar from '../components/SearchBar';
import GlobalSearch from '../components/GlobalSearch';

// Server wakeup overlay component
function ServerWakeupOverlay({ elapsedSeconds }) {
  const dots = '.'.repeat((Math.floor(elapsedSeconds) % 3) + 1);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm transition-opacity duration-500">
      <div className="text-center px-8 py-10 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl max-w-md mx-4">
        {/* Animated server icon */}
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-500/30 to-indigo-500/30 animate-ping" />
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 shadow-lg shadow-primary-500/30">
            <Server className="w-9 h-9 text-white animate-pulse" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mb-2">
          Waking up the server{dots}
        </h2>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          The backend is hosted on a free tier and sleeps after inactivity.
          <br />
          This usually takes <span className="font-semibold text-white">30–50 seconds</span>.
        </p>

        {/* Progress bar */}
        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-400 to-indigo-400 transition-all duration-1000 ease-linear"
            style={{ width: `${Math.min((elapsedSeconds / 50) * 100, 95)}%` }}
          />
        </div>

        <p className="text-xs text-slate-400 mt-3">
          {elapsedSeconds < 10
            ? 'Connecting to server…'
            : elapsedSeconds < 30
              ? 'Server is spinning up…'
              : 'Almost there, hang tight…'}
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  // Default demo user
  const currentUserId = 'person_1';

  // Read initial data from cache for instant 0ms rendering
  const initialCachedEvents = getCachedData('/events');
  const initialCachedTopics = getCachedData('/topics');
  const initialCachedPeople = getCachedData('/people');
  const initialCachedCompanies = getCachedData('/companies');
  const hasCachedData = Boolean(initialCachedEvents && initialCachedEvents.length > 0);

  const initialFirstEventId = initialCachedEvents?.[0]?.id || initialCachedEvents?.[0]?.event_id;
  const initialCachedRecs = initialFirstEventId
    ? getCachedData(`/events/${initialFirstEventId}/recommendations?user_id=${currentUserId}&limit=3`)
    : null;

  const [events, setEvents] = useState(() => (initialCachedEvents ? initialCachedEvents.slice(0, 6) : []));
  const [topics, setTopics] = useState(() => (initialCachedTopics ? initialCachedTopics.slice(0, 16) : []));
  const [recommendations, setRecommendations] = useState(() => initialCachedRecs || []);
  const [stats, setStats] = useState(() => ({
    events: initialCachedEvents?.length || 0,
    people: initialCachedPeople?.length || (hasCachedData ? 300 : 0),
    companies: initialCachedCompanies?.length || (hasCachedData ? 50 : 0),
    topics: initialCachedTopics?.length || 0,
  }));
  const [loading, setLoading] = useState(!hasCachedData);
  const [error, setError] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [showWhyModal, setShowWhyModal] = useState(false);

  // Server wakeup state
  const [serverWaking, setServerWaking] = useState(false);
  const [wakeupElapsed, setWakeupElapsed] = useState(0);
  const timerRef = useRef(null);
  const wakeupTriggerTimeoutRef = useRef(null);

  const clearWakeupTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (wakeupTriggerTimeoutRef.current) {
      clearTimeout(wakeupTriggerTimeoutRef.current);
      wakeupTriggerTimeoutRef.current = null;
    }
  }, []);

  const startWakeupTracking = useCallback(() => {
    setServerWaking(true);
    setWakeupElapsed(0);
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setWakeupElapsed((prev) => prev + 1);
      }, 1000);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      // If we don't have cached data and the server isn't confirmed awake,
      // prepare to show the wakeup overlay if fetching takes more than 1.8s
      if (!hasCachedData && !isServerKnownAwake()) {
        wakeupTriggerTimeoutRef.current = setTimeout(() => {
          if (!cancelled) {
            startWakeupTracking();
          }
        }, 1800);
      }

      try {
        if (!hasCachedData) {
          setLoading(true);
        }

        const [eventsData, topicsData, peopleData, companiesData] = await Promise.all([
          getEvents().catch(() => []),
          getTopics().catch(() => []),
          getPeople().catch(() => []),
          getCompanies().catch(() => []),
        ]);

        if (cancelled) return;

        // Clear any wakeup timers once requests succeed
        clearWakeupTimer();
        setServerWaking(false);

        if (eventsData && eventsData.length > 0) {
          setEvents(eventsData.slice(0, 6));
        }
        if (topicsData && topicsData.length > 0) {
          setTopics(topicsData.slice(0, 16));
        }
        setStats({
          events: eventsData?.length || (hasCachedData ? stats.events : 0),
          people: peopleData?.length || 300,
          companies: companiesData?.length || 50,
          topics: topicsData?.length || (hasCachedData ? stats.topics : 0),
        });

        // Get recommendations for the first event if available
        if (eventsData && eventsData.length > 0) {
          const firstEventId = eventsData[0].id || eventsData[0].event_id;
          const recs = await getEventRecommendations(firstEventId, currentUserId, 3).catch(() => []);
          if (!cancelled && recs && recs.length > 0) {
            setRecommendations(recs);
          }
        }
      } catch (err) {
        if (cancelled) return;
        // If data load failed and server wasn't confirmed awake, retry with health check loop
        if (!isServerKnownAwake()) {
          startWakeupTracking();
          let recovered = false;
          while (!recovered && !cancelled) {
            await new Promise((r) => setTimeout(r, 3000));
            try {
              const res = await getHealth();
              if (res?.status === 'ok') {
                recovered = true;
              }
            } catch {
              // still waking up
            }
          }
          if (recovered && !cancelled) {
            clearWakeupTimer();
            setServerWaking(false);
            // Retry loading data now that server is up
            return loadData();
          }
        } else {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
      clearWakeupTimer();
    };
  }, [hasCachedData, clearWakeupTimer, startWakeupTracking]);

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
      {/* Server Wakeup Overlay */}
      {serverWaking && <ServerWakeupOverlay elapsedSeconds={wakeupElapsed} />}

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