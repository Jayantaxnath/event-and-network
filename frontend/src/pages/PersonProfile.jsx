import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Network, Sparkles, ExternalLink } from 'lucide-react';
import { getPerson, getPersonCommonInterests } from '../api/people';
import PersonCard from '../components/PersonCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';

function LinkedInIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25a1.66 1.66 0 0 0-1.66 1.66c0 .92.74 1.66 1.66 1.66a1.66 1.66 0 0 0 1.66-1.66c0-.92-.74-1.66-1.66-1.66Z" />
    </svg>
  );
}

export default function PersonProfile() {
  const { personId } = useParams();
  const [person, setPerson] = useState(null);
  const [similarPeople, setSimilarPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUserId = 'person_1';

  useEffect(() => {
    async function loadPersonData() {
      try {
        setLoading(true);
        setError(null);
        const [personData, similarData] = await Promise.all([
          getPerson(personId).catch(() => null),
          getPersonCommonInterests(personId, 12).catch(() => []),
        ]);

        if (personData) {
          setPerson(personData);
        }
        setSimilarPeople(similarData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPersonData();
  }, [personId]);

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

  if (!person) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmptyState
          icon={Users}
          title="Person not found"
          description="This person doesn't exist in our database."
          action={
            <Link
              to="/people"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Back to People
            </Link>
          }
        />
      </div>
    );
  }

  const isCurrentUser = person.id === currentUserId || person.person_id === currentUserId;
  const personName = person.name || 'Unknown';
  const linkedinUrl = `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(
    personName
  )}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        to="/people"
        className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to People Directory
      </Link>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/20 text-white font-bold text-4xl">
              {personName.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-slate-900">{personName}</h1>
                {isCurrentUser && (
                  <span className="bg-primary-100 text-primary-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                    You (Logged in)
                  </span>
                )}
              </div>
              <p className="text-lg text-slate-600 mb-3">{person.title || 'Professional'}</p>

              {person.bio && (
                <p className="text-slate-700 leading-relaxed max-w-2xl">{person.bio}</p>
              )}
            </div>
          </div>

          {/* Actions: LinkedIn, Network Path, Contact */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-xl font-medium shadow-md shadow-blue-500/10 transition-all text-sm"
            >
              <LinkedInIcon className="w-4 h-4" />
              <span>Connect on LinkedIn</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>

            {!isCurrentUser && (
              <Link
                to={`/network/${currentUserId}/${person.id || person.person_id}`}
                className="flex items-center space-x-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-md shadow-primary-500/20 transition-all text-sm"
              >
                <Network className="w-4 h-4" />
                <span>Explore Network Path</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* People With Similar Interests */}
      {similarPeople.length > 0 ? (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-amber-500" />
                People With Similar Interests
              </h2>
              <p className="text-sm text-slate-500">
                Shared interest graph matching for {personName}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarPeople.map((similar) => {
              const normalizedPerson = {
                person_id: similar.person_id || similar.id,
                person_name: similar.person_name || similar.name,
                title: similar.title,
                bio: similar.bio,
              };
              const sharedTopics = similar.shared_topics || [];
              return (
                <PersonCard
                  key={normalizedPerson.person_id}
                  person={normalizedPerson}
                  showCompany={false}
                  showSharedTopics={true}
                  sharedTopics={sharedTopics}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No shared interest connections found"
          description="This person hasn't matched common topics with other professionals yet."
        />
      )}
    </div>
  );
}