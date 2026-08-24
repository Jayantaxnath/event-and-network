import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Calendar, X, ChevronDown } from 'lucide-react';
import { getEvents } from '../api/events';
import EventCard from '../components/EventCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { filterAndSortByPrefix } from '../utils/prefixSearch';

const INITIAL_PAGE_SIZE = 9;

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);

  useEffect(() => {
    let isMounted = true;
    async function loadEvents() {
      try {
        setLoading(true);
        const data = await getEvents();
        if (isMounted) setEvents(data || []);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadEvents();
    return () => { isMounted = false; };
  }, []);

  const handleQueryChange = (val) => {
    setSearchQuery(val);
    setVisibleCount(INITIAL_PAGE_SIZE);
    if (val.trim()) {
      setSearchParams({ q: val }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) {
      return events;
    }
    return filterAndSortByPrefix(events, searchQuery, (event) => [
      event.name,
      event.location,
      event.description,
    ]);
  }, [searchQuery, events]);

  const visibleEvents = useMemo(() => {
    return filteredEvents.slice(0, visibleCount);
  }, [filteredEvents, visibleCount]);


  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 9);
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Events Directory</h1>
        <p className="text-slate-600">Discover professional events, conferences, and meetups</p>
      </div>

      {/* Page-Specific Search Bar */}
      <div className="mb-8 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search events by name, location, or topic prefix..."
            value={searchQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-800 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => handleQueryChange('')}
              className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <LoadingSkeleton key={i} type="event" />
          ))}
        </div>
      ) : filteredEvents.length > 0 ? (
        <>
          <div className="mb-4 text-sm text-slate-500 font-medium">
            Showing {visibleEvents.length} of {filteredEvents.length} events
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleEvents.map((event) => (
              <EventCard key={event.id || event.event_id} event={event} />
            ))}
          </div>

          {visibleCount < filteredEvents.length && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={handleLoadMore}
                className="flex items-center space-x-2 px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-800 rounded-xl font-semibold text-sm shadow-sm transition-all"
              >
                <span>Load More ({Math.min(9, filteredEvents.length - visibleCount)} remaining)</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No events found"
          description={`No events matching "${searchQuery}". Try a different search term or prefix.`}
          action={
            <button
              onClick={() => handleQueryChange('')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              Clear search
            </button>
          }
        />
      )}
    </div>
  );
}