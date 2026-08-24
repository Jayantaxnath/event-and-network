import { Search } from 'lucide-react';
import { useState } from 'react';

export default function SearchBar({ className = '', size = 'md', onSearchTrigger }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && onSearchTrigger) {
      onSearchTrigger(query);
    }
  };

  const sizeClasses = {
    sm: 'py-2 text-sm pl-10',
    md: 'py-3 text-base pl-12',
    lg: 'py-4 text-lg pl-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4 left-3',
    md: 'w-5 h-5 left-4',
    lg: 'w-5 h-5 left-4',
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search className={`absolute top-1/2 transform -translate-y-1/2 text-slate-400 ${iconSizes[size]}`} />
      <input
        type="text"
        placeholder="Search events, people, companies, topics..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={`${sizeClasses[size]} pr-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full shadow-sm`}
      />
    </form>
  );
}