import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Sparkles } from 'lucide-react';

export const CtaSection: React.FC = () => {
  const navigate = useNavigate();

  const handleStartLearning = () => {
    navigate('/visualizer/arrays/traversal');
  };

  return (
    <section className="py-20 relative bg-slate-50 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 border border-indigo-200/90 p-8 sm:p-14 text-center space-y-8 shadow-xl shadow-indigo-500/5 overflow-hidden">
          
          {/* Background Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-800 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ready to Begin?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Make Algorithms Click.
          </h2>

          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Choose your first topic and turn abstract concepts into something you can see.
          </p>

          <div className="pt-2">
            <button
              onClick={handleStartLearning}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              <span>Start Learning</span>
              <Play className="w-4 h-4 fill-current" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
