import { useState, useEffect, useMemo } from 'react';
import { Building2, Search, X, ChevronDown } from 'lucide-react';
import { getCompanies } from '../api/companies';
import CompanyCard from '../components/CompanyCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { filterAndSortByPrefix } from '../utils/prefixSearch';

const INITIAL_PAGE_SIZE = 12;

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);

  useEffect(() => {
    async function loadCompanies() {
      try {
        setLoading(true);
        const data = await getCompanies();
        setCompanies(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadCompanies();
  }, []);

  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) {
      return companies;
    }
    return filterAndSortByPrefix(companies, searchQuery, (company) => [
      company.name,
      company.industry,
    ]);
  }, [searchQuery, companies]);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setVisibleCount(INITIAL_PAGE_SIZE);
  };

  const visibleCompanies = useMemo(() => {
    return filteredCompanies.slice(0, visibleCount);
  }, [filteredCompanies, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 12);
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Companies Directory</h1>
        <p className="text-slate-600">Explore organizations and teams in the event networking graph</p>
      </div>

      {/* Page-Specific Search Bar for Companies */}
      <div className="mb-8 max-w-2xl relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search companies by name or industry prefix..."
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
      ) : filteredCompanies.length > 0 ? (
        <>
          <div className="mb-4 text-sm text-slate-500 font-medium">
            Showing {visibleCompanies.length} of {filteredCompanies.length} companies
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>

          {visibleCount < filteredCompanies.length && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={handleLoadMore}
                className="flex items-center space-x-2 px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-800 rounded-xl font-semibold text-sm shadow-sm transition-all"
              >
                <span>Load More ({Math.min(12, filteredCompanies.length - visibleCount)} remaining)</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={Building2}
          title="No companies found"
          description={`No companies matched "${searchQuery}".`}
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