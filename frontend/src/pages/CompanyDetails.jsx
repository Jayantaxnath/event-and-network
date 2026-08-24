import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, Users, ArrowLeft, Search, Briefcase, Hash, X, ChevronDown, ExternalLink } from 'lucide-react';
import { getCompany, getCompanyPeople } from '../api/companies';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { filterAndSortByPrefix } from '../utils/prefixSearch';

function LinkedInIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25a1.66 1.66 0 0 0-1.66 1.66c0 .92.74 1.66 1.66 1.66a1.66 1.66 0 0 0 1.66-1.66c0-.92-.74-1.66-1.66-1.66Z" />
    </svg>
  );
}

const INITIAL_PAGE_SIZE = 12;

export default function CompanyDetails() {
  const { companyId } = useParams();
  const [company, setCompany] = useState(null);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);

  useEffect(() => {
    async function loadCompanyData() {
      try {
        setLoading(true);
        setError(null);
        const [companyData, peopleData] = await Promise.all([
          getCompany(companyId).catch(() => null),
          getCompanyPeople(companyId).catch(() => []),
        ]);

        if (!companyData && (!peopleData || peopleData.length === 0)) {
          throw new Error('Company not found');
        }

        const resolvedCompany = companyData || {
          id: companyId,
          name: peopleData[0]?.company_name || 'Company',
          industry: peopleData[0]?.industry || 'Technology',
        };

        setCompany(resolvedCompany);
        setPeople(peopleData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadCompanyData();
  }, [companyId]);

  const filteredPeople = useMemo(() => {
    if (!searchQuery.trim()) {
      return people;
    }
    return filterAndSortByPrefix(people, searchQuery, (p) => [
      p.person_name,
      p.name,
      p.title,
      p.role,
      p.topics,
    ]);
  }, [searchQuery, people]);

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
        to="/companies"
        className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Companies
      </Link>

      {/* Company Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
            <Building2 className="w-10 h-10 text-white" />
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{company.name}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <div className="flex items-center">
                <Briefcase className="w-4 h-4 mr-1.5 text-primary-600" />
                <span>{company.industry || 'Industry'}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1.5 text-primary-600" />
                <span>{people.length} professionals in network</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Professionals Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Team & Members ({people.length})
          </h2>

          {/* Search bar for company employees */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search team members by prefix..."
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

        {filteredPeople.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-slate-500 font-medium">
              Showing {visiblePeople.length} of {filteredPeople.length} members
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visiblePeople.map((person) => {
                const personId = person.person_id || person.id;
                const personName = person.person_name || person.name;
                const linkedinUrl = `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(
                  personName
                )}`;
                return (
                  <div
                    key={personId}
                    className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-primary-300 transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start space-x-4">
                        <Link to={`/people/${personId}`} className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                            {personName?.charAt(0).toUpperCase() || '?'}
                          </div>
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/people/${personId}`}
                            className="text-base font-semibold text-slate-900 hover:text-primary-600 truncate block transition-colors"
                          >
                            {personName}
                          </Link>
                          <p className="text-sm text-slate-600 mb-1">
                            {person.title || 'Professional'}
                          </p>
                          {person.role && (
                            <span className="inline-block bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded font-medium">
                              Role: {person.role}
                            </span>
                          )}
                        </div>
                      </div>

                      {person.topics && person.topics.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {person.topics.slice(0, 3).map((topic) => (
                            <span
                              key={topic.id}
                              className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full flex items-center"
                            >
                              <Hash className="w-3 h-3 mr-1" />
                              {topic.name}
                            </span>
                          ))}
                          {person.topics.length > 3 && (
                            <span className="text-xs text-slate-500">
                              +{person.topics.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                      <Link
                        to={`/people/${personId}`}
                        className="text-xs font-medium text-primary-600 hover:text-primary-700"
                      >
                        View Profile &rarr;
                      </Link>
                      <div className="flex items-center space-x-2">
                        <a
                          href={linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Connect with ${personName} on LinkedIn`}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] rounded-lg text-xs font-medium transition-colors"
                        >
                          <LinkedInIcon className="w-3.5 h-3.5" />
                          <span>Connect</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {visibleCount < filteredPeople.length && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  className="flex items-center space-x-2 px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-800 rounded-xl font-semibold text-sm shadow-sm transition-all"
                >
                  <span>Load More ({Math.min(12, filteredPeople.length - visibleCount)} remaining)</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={Users}
            title="No professionals found"
            description={`No team members match "${searchQuery}".`}
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
    </div>
  );
}
