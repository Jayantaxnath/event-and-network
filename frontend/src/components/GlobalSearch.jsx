import { useState, useEffect } from 'react';
import { Search, X, Calendar, Users, Building2, Hash, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getEvents } from '../api/events';
import { getTopics } from '../api/topics';
import { getPeople } from '../api/people';
import { getCompanies } from '../api/companies';
import { filterAndSortByPrefix } from '../utils/prefixSearch';

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    events: [],
    people: [],
    companies: [],
    topics: [],
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen || !query.trim()) {
      return;
    }

    const searchDelay = setTimeout(async () => {
      setLoading(true);

      try {
        const [eventsData, topicsData, peopleData, companiesData] = await Promise.all([
          getEvents().catch(() => []),
          getTopics().catch(() => []),
          getPeople().catch(() => []),
          getCompanies().catch(() => []),
        ]);

        const filteredEvents = filterAndSortByPrefix(eventsData, query, (e) => [
          e.name,
          e.location,
          e.description,
        ]).slice(0, 4);

        const filteredPeople = filterAndSortByPrefix(peopleData, query, (p) => [
          p.person_name,
          p.name,
          p.title,
          p.company_name,
          p.bio,
        ]).slice(0, 4);

        const filteredCompanies = filterAndSortByPrefix(companiesData, query, (c) => [
          c.name,
          c.industry,
        ]).slice(0, 4);

        const filteredTopics = filterAndSortByPrefix(topicsData, query, (t) => [
          t.name,
        ]).slice(0, 4);

        setResults({
          events: filteredEvents,
          people: filteredPeople,
          companies: filteredCompanies,
          topics: filteredTopics,
        });
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(searchDelay);
  }, [query, isOpen]);

  const handleCloseModal = () => {
    setQuery('');
    setResults({ events: [], people: [], companies: [], topics: [] });
    onClose();
  };

  const handleResultClick = (type, id) => {
    handleCloseModal();
    if (type === 'event') {
      navigate(`/events/${id}`);
    } else if (type === 'person') {
      navigate(`/people/${id}`);
    } else if (type === 'company') {
      navigate(`/companies/${id}`);
    } else if (type === 'topic') {
      navigate(`/topics/${id}`);
    }
  };


  if (!isOpen) return null;

  const totalResults =
    results.events.length +
    results.people.length +
    results.companies.length +
    results.topics.length;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-20 z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <Search className="w-5 h-5 text-primary-600" />
            <input
              type="text"
              placeholder="Search across events, people, companies, topics..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-base sm:text-lg bg-transparent focus:outline-none placeholder-slate-400"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 bg-slate-200/60 rounded"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleCloseModal}
              className="p-1.5 hover:bg-slate-200/70 rounded-lg transition-colors text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

          </div>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-4 flex-1">
          {loading ? (
            <div className="text-center py-12 text-slate-500 flex flex-col items-center">
              <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <span className="text-sm font-medium">Searching network graph...</span>
            </div>
          ) : !query.trim() ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Type to search events, people, companies, and topics by prefix
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="font-medium">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-sm text-slate-400 mt-1">Try a different prefix or keyword</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Events Section */}
              {results.events.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                    Events
                  </div>
                  <div className="space-y-1.5">
                    {results.events.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => handleResultClick('event', event.id)}
                        className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between group border border-transparent hover:border-slate-200"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 text-sm group-hover:text-primary-600">
                            {event.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {event.date} &bull; {event.location}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-600 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* People Section */}
              {results.people.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1.5 text-primary-500" />
                    People
                  </div>
                  <div className="space-y-1.5">
                    {results.people.map((person) => {
                      const pid = person.person_id || person.id;
                      const pname = person.person_name || person.name;
                      return (
                        <button
                          key={pid}
                          onClick={() => handleResultClick('person', pid)}
                          className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between group border border-transparent hover:border-slate-200"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-xs">
                              {pname?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-sm group-hover:text-primary-600">
                                {pname}
                              </div>
                              <div className="text-xs text-slate-500">
                                {person.title} {person.company_name ? `at ${person.company_name}` : ''}
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-600 transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Companies Section */}
              {results.companies.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center">
                    <Building2 className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                    Companies
                  </div>
                  <div className="space-y-1.5">
                    {results.companies.map((company) => (
                      <button
                        key={company.id}
                        onClick={() => handleResultClick('company', company.id)}
                        className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between group border border-transparent hover:border-slate-200"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 text-sm group-hover:text-primary-600">
                            {company.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            Industry: {company.industry}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-600 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics Section */}
              {results.topics.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center">
                    <Hash className="w-3.5 h-3.5 mr-1.5 text-green-600" />
                    Topics
                  </div>
                  <div className="space-y-1.5">
                    {results.topics.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => handleResultClick('topic', topic.id)}
                        className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between group border border-transparent hover:border-slate-200"
                      >
                        <div className="font-semibold text-slate-900 text-sm group-hover:text-primary-600">
                          #{topic.name}
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-600 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}