import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { TOPIC_CATEGORIES } from '../data/topicsData';
import { ArrowLeft, Cpu, Construction, Play } from 'lucide-react';

export const WorkspacePlaceholder: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();

  const topicObj = TOPIC_CATEGORIES.find(
    (t) => t.id === topicId || t.route.includes(topicId || '')
  );

  const title = topicObj ? topicObj.category : topicId ? topicId.replace('-', ' ') : 'Algorithm';

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col justify-center items-center">
        
        <div className="w-full max-w-3xl rounded-3xl bg-slate-900/60 border border-slate-800 p-8 sm:p-12 shadow-2xl space-y-8 text-center relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Icon Header */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Cpu className="w-8 h-8" />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Construction className="w-3.5 h-3.5" />
              <span>Workspace Engine Under Development</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white capitalize">
              {title} Workspace
            </h1>

            <p className="text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
              You are navigating to the planned <span className="text-indigo-400 font-semibold">{title}</span> visualization engine. The step-by-step trace engine for this module is currently being crafted.
            </p>
          </div>

          {/* Planned Operations Info Box */}
          {topicObj && (
            <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-5 text-left space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Planned Engine Scope & Included Modules:
              </span>
              <div className="flex flex-wrap gap-2">
                {topicObj.topics.map((t, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-900 rounded-lg text-xs font-mono text-indigo-300 border border-slate-800">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-colors border border-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Landing Page</span>
            </Link>

            <Link
              to="/"
              state={{ scrollTo: 'explore-topics' }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <span>Explore Other Topics</span>
              <Play className="w-3.5 h-3.5 fill-current" />
            </Link>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
};
