import { Calendar, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EventCard({ event }) {
  const eventId = event.event_id || event.id;
  
  return (
    <Link to={`/events/${eventId}`} className="block">
      <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-primary-300 transition-all duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
              {event.name}
            </h3>
            <div className="flex items-center text-sm text-slate-600 space-x-4">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {event.date}
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {event.location}
              </div>
            </div>
          </div>
        </div>
        
        {event.description && (
          <p className="text-sm text-slate-600 line-clamp-2 mb-4">
            {event.description}
          </p>
        )}
        
        {event.attendee_count && (
          <div className="flex items-center text-sm text-slate-500">
            <Users className="w-4 h-4 mr-1" />
            {event.attendee_count} people attending
          </div>
        )}
      </div>
    </Link>
  );
}