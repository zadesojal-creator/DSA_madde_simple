import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Sparkles, ArrowRight, Activity, BookOpen, Clock } from 'lucide-react';
import { HeroPreview } from './HeroPreview';

export const Hero: React.FC = () => {
  const navigate = useNavigate();

  const handleStartVisualizing = () => {
    navigate('/visualizer/arrays/traversal');
  };

  const handleExploreTopics = () => {
    const element = document.getElementById('explore-topics');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-radial-gradient">
      {/* Background Subtle Grid Texture */}
      <div className="absolute inset-0 bg-grid-pattern opacity-70 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline & CTAs */}
          <div className="lg:col-span-6 space-y-8 text-left">
            
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold tracking-wider uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span>LEARN • VISUALIZE • MASTER</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Understand DSA.{' '}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600">
                One Step at a Time.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              Stop memorizing algorithms. Explore data structures, follow every operation, and see exactly how algorithms work through interactive visualizations.
            </p>

            {/* Primary & Secondary Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={handleStartVisualizing}
                className="group flex items-center justify-center gap-2.5 px-7 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                <span>Start Visualizing</span>
                <Play className="w-4 h-4 fill-current group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={handleExploreTopics}
                className="group flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100/80 border border-slate-200 rounded-xl shadow-xs transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                <span>Explore Topics</span>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
              </button>
            </div>

            {/* Compact Benefit Indicators */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2.5 text-slate-700 text-xs sm:text-sm font-medium">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <span>Step-by-step animations</span>
              </div>

              <div className="flex items-center gap-2.5 text-slate-700 text-xs sm:text-sm font-medium">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <span>Clear algorithm explanations</span>
              </div>

              <div className="flex items-center gap-2.5 text-slate-700 text-xs sm:text-sm font-medium">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <span>Time & space complexity</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visualization Preview */}
          <div className="lg:col-span-6 w-full">
            <HeroPreview />
          </div>

        </div>
      </div>
    </section>
  );
};
