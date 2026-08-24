import { Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CompanyCard({ company }) {
  return (
    <Link to={`/companies/${company.id}`} className="block">
      <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-primary-300 transition-all duration-200">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-slate-900 truncate">
              {company.name}
            </h3>
            <p className="text-sm text-slate-600">
              {company.industry}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}