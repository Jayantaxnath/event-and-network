import { TrendingUp, ArrowRight, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecommendationCard({ recommendation, onWhyClick }) {
  const matchPercentage = Math.min(100, Math.round((recommendation.score / 15) * 100));
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-lg">
              {recommendation.person_name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {recommendation.person_name}
            </h3>
            <p className="text-sm text-slate-600">
              {recommendation.title}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-1 text-green-600 font-semibold">
            <TrendingUp className="w-4 h-4" />
            <span>{matchPercentage}% Match</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <div className="font-semibold text-slate-900">{recommendation.shared_topics}</div>
          <div className="text-slate-600 text-xs">Shared interests</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <div className="font-semibold text-slate-900">{recommendation.shared_events}</div>
          <div className="text-slate-600 text-xs">Shared events</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <div className="font-semibold text-slate-900">{recommendation.path_length}°</div>
          <div className="text-slate-600 text-xs">Connection</div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Link
          to={`/people/${recommendation.person_id}`}
          className="flex-1 flex items-center justify-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <span>View Profile</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <button
          onClick={() => onWhyClick(recommendation)}
          className="flex items-center space-x-2 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Why?</span>
        </button>
      </div>
    </div>
  );
}