import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, AlertTriangle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 font-sans text-center">
      <div className="max-w-md w-full rounded-3xl bg-white border border-slate-200 p-8 space-y-6 shadow-xl relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs text-indigo-600 font-bold uppercase tracking-wider">
            404 — Page Not Found
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Topic or Route Does Not Exist
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            The visualization route you requested could not be located in our curriculum catalogue.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors border border-slate-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back Home</span>
          </Link>

          <Link
            to="/visualizer/arrays/traversal"
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Open Array Visualizer</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
