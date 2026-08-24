import { Building2, Calendar, Tag, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

function LinkedInIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25a1.66 1.66 0 0 0-1.66 1.66c0 .92.74 1.66 1.66 1.66a1.66 1.66 0 0 0 1.66-1.66c0-.92-.74-1.66-1.66-1.66Z" />
    </svg>
  );
}

export default function AttendeeCard({ attendee }) {
  const personName = attendee.person_name || 'Unknown';
  const linkedinUrl = `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(
    personName
  )}`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-primary-300 transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-start space-x-4">
          <Link to={`/people/${attendee.person_id}`} className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-semibold text-lg group-hover:scale-105 transition-transform shadow-sm">
              {personName.charAt(0).toUpperCase()}
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            <Link
              to={`/people/${attendee.person_id}`}
              className="text-base font-semibold text-slate-900 group-hover:text-primary-600 truncate block transition-colors"
            >
              {personName}
            </Link>
            <p className="text-sm text-slate-600 mb-1.5 truncate">{attendee.title}</p>

            {attendee.company_name && (
              <div className="flex items-center text-xs text-slate-500 mb-2">
                <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                <span className="truncate">{attendee.company_name}</span>
              </div>
            )}

            <div className="flex items-center space-x-3 text-xs text-slate-500">
              {attendee.attendance_role && (
                <div className="flex items-center">
                  <Tag className="w-3 h-3 mr-1 text-primary-500" />
                  <span className="capitalize">{attendee.attendance_role}</span>
                </div>
              )}
              {attendee.attendance_year && (
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1 text-amber-500" />
                  <span>{attendee.attendance_year}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {attendee.topics && attendee.topics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {attendee.topics.slice(0, 3).map((topic) => (
              <span
                key={topic.id}
                className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full"
              >
                {topic.name}
              </span>
            ))}
            {attendee.topics.length > 3 && (
              <span className="text-xs text-slate-500">+{attendee.topics.length - 3} more</span>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <Link
          to={`/people/${attendee.person_id}`}
          className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
        >
          View Profile &rarr;
        </Link>

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
  );
}