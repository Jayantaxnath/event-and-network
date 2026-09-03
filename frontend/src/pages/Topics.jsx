import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Hash, Calendar, Users, Search, X, ChevronDown } from 'lucide-react';
import { getTopics, getTopicPeople, getTopicEvents } from '../api/topics';
import { getCachedData } from '../api/client';
import TopicBadge from '../components/TopicBadge';
import PersonCard from '../components/PersonCard';
import EventCard from '../components/EventCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { filterAndSortByPrefix } from '../utils/prefixSearch';

const INITIAL_PAGE_SIZE = 12;

export default function Topics() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const initialCached = getCachedData('/topics');
  const [topics, setTopics] = useState(() => initialCached || []);
  const [selectedTopic, setSelectedTopic] = useState(() => {
    if (topicId && initialCached && initialCached.length > 0) {
      return initialCached.find((t) => t.id === topicId) || null;
    }
    return null;
  });
  const [topicPeople, setTopicPeople] = useState([]);
  const [topicEvents, setTopicEvents] = useState([]);
  const [loading, setLoading] = useState(!initialCached);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visiblePeopleCount, setVisiblePeopleCount] = useState(INITIAL_PAGE_SIZE);
  const [visibleEventsCount, setVisibleEventsCount] = useState(INITIAL_PAGE_SIZE);

  useEffect(() => {
    async function loadTopics() {
      try {
        if (!initialCached) {
          setLoading(true);
        }
        const data = await getTopics();
        setTopics(data || []);

        if (topicId && data && data.length > 0) {
          const match = data.find((t) => t.id === topicId);
          if (match) {
            setSelectedTopic(match);
          } else {
            setSelectedTopic({ id: topicId, name: topicId.replace(/^topic_/, '').replace(/_/g, ' ') });
          }
        } else if (data && data.length > 0) {
          setSelectedTopic(data[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadTopics();
  }, [topicId]);

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) {
      return topics;
    }
    return filterAndSortByPrefix(topics, searchQuery, (topic) => [topic.name]);
  }, [searchQuery, topics]);

  useEffect(() => {
    async function loadTopicDetails() {
      if (!selectedTopic) return;

      try {
        setDetailsLoading(true);
        setVisiblePeopleCount(INITIAL_PAGE_SIZE);
        setVisibleEventsCount(INITIAL_PAGE_SIZE);
        const [peopleData, eventsData] = await Promise.all([
          getTopicPeople(selectedTopic.id).catch(() => []),
          getTopicEvents(selectedTopic.id).catch(() => []),
        ]);

        setTopicPeople(peopleData || []);
        setTopicEvents(eventsData || []);
      } catch (err) {
        console.error('Failed to load topic details:', err);
        setTopicPeople([]);
        setTopicEvents([]);
      } finally {
        setDetailsLoading(false);
      }
    }

    loadTopicDetails();
  }, [selectedTopic]);

  const visiblePeople = useMemo(() => {
    return topicPeople.slice(0, visiblePeopleCount);
  }, [topicPeople, visiblePeopleCount]);

  const visibleEvents = useMemo(() => {
    return topicEvents.slice(0, visibleEventsCount);
  }, [topicEvents, visibleEventsCount]);

  const handleSelectTopic = (topic) => {
    setSelectedTopic(topic);
    navigate(`/topics/${topic.id}`, { replace: true });
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Topic Knowledge Graph</h1>
        <p className="text-slate-600">
          Explore technical domains and connect with interested professionals & focused events
        </p>
      </div>

      {/* Page-Specific Search Bar for Topics */}
      <div className="mb-6 max-w-2xl relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Filter topics by name prefix (e.g. 'art', 'mac', 'clo')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-200 rounded-full animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Topics Badges Grid */}
          <div className="mb-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                All Topics ({filteredTopics.length})
              </h2>
              {selectedTopic && (
                <span className="text-xs text-primary-600 font-medium">
                  Active: #{selectedTopic.name}
                </span>
              )}
            </div>

            {filteredTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {filteredTopics.map((topic) => {
                  const isSelected = selectedTopic?.id === topic.id;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => handleSelectTopic(topic)}
                      className={`transition-all rounded-full ${
                        isSelected
                          ? 'ring-2 ring-primary-600 ring-offset-2 scale-105 shadow-md shadow-primary-500/20'
                          : 'hover:scale-105 opacity-85 hover:opacity-100'
                      }`}
                    >
                      <TopicBadge topic={topic} size="lg" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-slate-500 py-4 text-center">
                No topics matching &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>

          {/* Selected Topic Details */}
          {selectedTopic && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-primary-900 to-indigo-900 rounded-2xl p-8 text-white shadow-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
                    <Hash className="w-6 h-6 text-primary-300" />
                  </div>
                  <div>
                    <span className="text-primary-200 text-xs font-semibold uppercase tracking-wider">
                      Topic Details
                    </span>
                    <h2 className="text-3xl font-bold">{selectedTopic.name}</h2>
                  </div>
                </div>
                <p className="text-primary-100 text-sm max-w-xl">
                  Showing all professionals expressing interest and events featuring &ldquo;
                  {selectedTopic.name}&rdquo; in their agenda.
                </p>
              </div>

              {detailsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <LoadingSkeleton key={i} type="card" />
                  ))}
                </div>
              ) : (
                <>
                  {/* People interested in this topic */}
                  {topicPeople.length > 0 && (
                    <div>
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center">
                          <Users className="w-5 h-5 mr-2 text-primary-600" />
                          People Interested in {selectedTopic.name} ({topicPeople.length})
                        </h3>
                        <p className="text-sm text-slate-500">
                          Members who have marked interest in this domain
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {visiblePeople.map((person) => {
                          const normalizedPerson = {
                            person_id: person.person_id || person.id,
                            person_name: person.person_name || person.name,
                            title: person.title,
                            bio: person.bio,
                          };
                          return (
                            <PersonCard
                              key={normalizedPerson.person_id}
                              person={normalizedPerson}
                              showCompany={false}
                            />
                          );
                        })}
                      </div>

                      {visiblePeopleCount < topicPeople.length && (
                        <div className="mt-8 flex justify-center">
                          <button
                            onClick={() => setVisiblePeopleCount((prev) => prev + 12)}
                            className="flex items-center space-x-2 px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl font-semibold text-xs shadow-sm transition-all"
                          >
                            <span>Load More People ({Math.min(12, topicPeople.length - visiblePeopleCount)} remaining)</span>
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Events focused on this topic */}
                  {topicEvents.length > 0 && (
                    <div>
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center">
                          <Calendar className="w-5 h-5 mr-2 text-amber-500" />
                          Events Focused on {selectedTopic.name} ({topicEvents.length})
                        </h3>
                        <p className="text-sm text-slate-500">
                          Events with tracks or sessions dedicated to this topic
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {visibleEvents.map((event) => {
                          const normalizedEvent = {
                            id: event.event_id || event.id,
                            name: event.name,
                            date: event.date,
                            location: event.location,
                            description: event.description,
                            attendee_count: event.attendee_count,
                          };
                          return (
                            <EventCard key={normalizedEvent.id} event={normalizedEvent} />
                          );
                        })}
                      </div>

                      {visibleEventsCount < topicEvents.length && (
                        <div className="mt-8 flex justify-center">
                          <button
                            onClick={() => setVisibleEventsCount((prev) => prev + 12)}
                            className="flex items-center space-x-2 px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl font-semibold text-xs shadow-sm transition-all"
                          >
                            <span>Load More Events ({Math.min(12, topicEvents.length - visibleEventsCount)} remaining)</span>
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {topicPeople.length === 0 && topicEvents.length === 0 && (
                    <EmptyState
                      icon={Hash}
                      title="No associated people or events yet"
                      description={`Currently no attendees or events are linked to #${selectedTopic.name}.`}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}