import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface TopicBreadcrumbsProps {
  categoryName?: string;
  categoryRoute?: string;
  subtopicName?: string;
}

export const TopicBreadcrumbs: React.FC<TopicBreadcrumbsProps> = ({
  categoryName = 'Fundamentals & Arrays',
  categoryRoute = '/visualizer/arrays',
  subtopicName = 'Array Traversal'
}) => {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 space-x-1.5 py-1">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-slate-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded px-1"
      >
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <span>Home</span>
      </Link>

      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

      {categoryRoute ? (
        <Link
          to={categoryRoute}
          className="hover:text-slate-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded px-1"
        >
          {categoryName}
        </Link>
      ) : (
        <span>{categoryName}</span>
      )}

      {subtopicName && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-indigo-600 font-bold truncate">{subtopicName}</span>
        </>
      )}
    </nav>
  );
};
