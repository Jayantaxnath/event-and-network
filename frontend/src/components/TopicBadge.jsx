import { Hash } from 'lucide-react';

export default function TopicBadge({ topic, size = 'md' }) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <span className={`inline-flex items-center bg-primary-50 text-primary-700 rounded-full ${sizeClasses[size]}`}>
      <Hash className="w-3 h-3 mr-1" />
      {topic.name}
    </span>
  );
}