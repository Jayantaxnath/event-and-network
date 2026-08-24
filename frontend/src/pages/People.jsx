import { useState, useEffect, useMemo } from 'react';
import { Users, Search, X, ChevronDown } from 'lucide-react';
import { getPeople } from '../api/people';
import PersonCard from '../components/PersonCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { filterAndSortByPrefix } from '../utils/prefixSearch';

const INITIAL_PAGE_SIZE = 12;

export default function People() {
  const [allPeople, setAllPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);

  useEffect(() => {
    let isMounted = true;
    async function loadPeople() {
      try {
        setLoading(true);
        const people = await getPeople();
        if (isMounted) setAllPeople(people || []);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadPeople();
    return () => { isMounted = false; };
  }, []);

  const filteredPeople = useMemo(() => {
    if (!searchQuery.trim()) {
      return allPeople;
    }
    return filterAndSortByPrefix(allPeople, searchQuery, (person) => [
      person.person_name,
      person.name,
      person.title,
      person.company_name,
      person.bio,
      person.topics,
    ]);
  }, [searchQuery, allPeople]);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setVisibleCount(INITIAL_PAGE_SIZE);
  };

  const visiblePeople = useMemo(() => {
    return filteredPeople.slice(0, visibleCount);
  }, [filteredPeople, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  const handleShowAll = () => {
    setVisibleCount(filteredPeople.length);
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">People Directory</h1>
        <p className="text-slate-600">Discover professionals and potential collaborators in the network</p>
      </div>

      {/* Search */}
      <div className="mb-8 max-w-2xl relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search people by name, title, company, or topic prefix..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <LoadingSkeleton key={i} type="card" />
          ))}
        </div>
      ) : filteredPeople.length > 0 ? (
        <>
          <div className="mb-4 flex items-center justify-between text-sm text-slate-500 font-medium">
            <span>
              Showing {visiblePeople.length} of {filteredPeople.length} professionals
              {searchQuery && ` (filtered from ${allPeople.length})`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visiblePeople.map((person) => (
              <PersonCard key={person.person_id || person.id} person={person} />
            ))}
          </div>

          {/* Load More Controls */}
          {visibleCount < filteredPeople.length && (
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleLoadMore}
                className="flex items-center space-x-2 px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-800 rounded-xl font-semibold text-sm shadow-sm transition-all"
              >
                <span>Load More ({Math.min(12, filteredPeople.length - visibleCount)} remaining)</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>
              <button
                onClick={handleShowAll}
                className="px-4 py-3 text-xs font-semibold text-primary-600 hover:text-primary-800 transition-colors"
              >
                Show All ({filteredPeople.length})
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={Users}
          title="No people found"
          description={`No professionals matched "${searchQuery}".`}
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
  );
}