import React from 'react';
import { Link } from 'react-router-dom';
import { Binary, Home, Menu, X, HelpCircle } from 'lucide-react';

interface VisualizerHeaderProps {
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  title?: string;
  onOpenHelp?: () => void;
}

export const VisualizerHeader: React.FC<VisualizerHeaderProps> = ({
  mobileSidebarOpen,
  setMobileSidebarOpen,
  title,
  onOpenHelp
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 shadow-xs">
      <div className="flex items-center justify-between max-w-[1600px] mx-auto">
        
        {/* Left Side: Mobile Drawer Toggle + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            aria-label={mobileSidebarOpen ? "Close navigation sidebar" : "Open navigation sidebar"}
            aria-expanded={mobileSidebarOpen}
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-lg p-1"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Binary className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900 hidden sm:flex items-center gap-1">
              DSA <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Visualizer</span>
            </span>
          </Link>

          {title && (
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs font-medium text-slate-500">
              <span className="text-slate-800 font-semibold truncate max-w-[200px] lg:max-w-xs">{title}</span>
            </div>
          )}
        </div>

        {/* Right Side: Return to Home & Contextual Actions */}
        <div className="flex items-center gap-3">
          {onOpenHelp && (
            <button
              onClick={onOpenHelp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              title="Keyboard Shortcuts & Guidance"
            >
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Shortcuts</span>
            </button>
          )}

          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Landing Page</span>
          </Link>
        </div>

      </div>
    </header>
  );
};
