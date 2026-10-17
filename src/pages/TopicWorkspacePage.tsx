import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { VisualizerLayout } from '../components/workspace/VisualizerLayout';
import { TopicBreadcrumbs } from '../components/workspace/TopicBreadcrumbs';
import { ArraysVisualizerPage } from './ArraysVisualizerPage';
import { SearchingVisualizerPage } from './SearchingVisualizerPage';
import { SortingVisualizerPage } from './SortingVisualizerPage';
import { StacksQueuesVisualizerPage } from './StacksQueuesVisualizerPage';
import { NAVIGATION_CATEGORIES } from '../data/navigationData';
import { Cpu, Play, Construction, CheckCircle2, ArrowRight } from 'lucide-react';

export const TopicWorkspacePage: React.FC = () => {
  const { categoryId, subtopicId } = useParams<{ categoryId: string; subtopicId?: string }>();

  if (categoryId === 'arrays') {
    return <ArraysVisualizerPage />;
  }
  if (categoryId === 'searching') {
    return <SearchingVisualizerPage />;
  }
  if (categoryId === 'sorting') {
    return <SortingVisualizerPage />;
  }
  if (categoryId === 'stacks-queues') {
    return <StacksQueuesVisualizerPage />;
  }

  const categoryObj = NAVIGATION_CATEGORIES.find((c) => c.id === categoryId);
  const subtopicObj = categoryObj?.subtopics.find((s) => s.id === subtopicId);

  const categoryTitle = categoryObj ? categoryObj.title : categoryId ? categoryId.replace('-', ' ') : 'Visualizer';
  const subtopicTitle = subtopicObj ? subtopicObj.title : subtopicId ? subtopicId.replace('-', ' ') : 'Module';
  const description = subtopicObj?.description || categoryObj?.description || 'Step-by-step trace visualization module under construction.';

  return (
    <VisualizerLayout activeTitle={subtopicTitle}>
      <div className="space-y-6 text-slate-900">
        
        {/* Breadcrumbs Header */}
        <div className="space-y-1 border-b border-slate-200 pb-4">
          <TopicBreadcrumbs
            categoryName={categoryTitle}
            categoryRoute={categoryObj ? categoryObj.routePrefix : undefined}
            subtopicName={subtopicTitle}
          />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3 capitalize">
            <span>{subtopicTitle}</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold flex items-center gap-1">
              <Construction className="w-3 h-3 text-amber-600" />
              <span>In Development</span>
            </span>
          </h1>
          <p className="text-sm text-slate-600">
            {description}
          </p>
        </div>

        {/* Coming Soon Canvas Workspace Card */}
        <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-lg">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Cpu className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl font-bold text-slate-900">
              {subtopicTitle} Visualizer Coming Soon
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We are building the step-by-step trace generation engine for <span className="text-indigo-700 font-semibold">{subtopicTitle}</span>. In the meantime, try our fully working <span className="text-indigo-700 font-semibold">Array Traversal</span> interactive demonstration.
            </p>
          </div>

          {/* Featured Working Demo Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/visualizer/arrays/traversal"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Try Working Array Traversal Demo</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {/* Module Specs Grid */}
          <div className="pt-8 border-t border-slate-200 max-w-xl mx-auto text-left space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Planned Engine Features for {subtopicTitle}:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Frame-by-frame state trace</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Interactive playback speed</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Synchronized pseudocode</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Time & space complexity</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </VisualizerLayout>
  );
};
