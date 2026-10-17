import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  GitCommit, 
  Layers, 
  ArrowUpDown, 
  Network, 
  Share2, 
  Repeat, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';
import { TOPIC_CATEGORIES } from '../data/topicsData';
import type { TopicCategory } from '../data/topicsData';

const iconMap: Record<string, React.ElementType> = {
  LayoutGrid,
  GitCommit,
  Layers,
  ArrowUpDown,
  Network,
  Share2,
  Repeat,
  Sparkles
};

export const TopicsSection: React.FC = () => {
  const navigate = useNavigate();

  const handleExplore = (route: string) => {
    navigate(route);
  };

  return (
    <section id="explore-topics" className="py-24 relative bg-slate-50">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider">
            Curriculum Catalogue
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Explore the World of DSA
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Choose a topic, explore its building blocks, and learn by watching every step.
          </p>
        </div>

        {/* Responsive Grid of 8 Topic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TOPIC_CATEGORIES.filter((cat) => cat.id !== 'patterns').map((cat: TopicCategory) => {
            const IconComponent = iconMap[cat.iconName] || LayoutGrid;

            return (
              <div
                key={cat.id}
                onClick={() => handleExplore(cat.route)}
                className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer focus-within:ring-2 focus-within:ring-indigo-600"
              >
                {/* Card Top Icon & Info */}
                <div className="relative z-10 space-y-4">
                  {/* Category Icon */}
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-all duration-300 shadow-xs">
                    <IconComponent className="w-6 h-6 text-indigo-600" />
                  </div>

                  {/* Category Title & Description */}
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {cat.category}
                    </h3>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  {/* Topic Labels / Chips */}
                  <div className="pt-2">
                    <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-medium">
                      Topics Included:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.topics.map((t, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 text-xs font-mono rounded-md bg-slate-100 text-slate-700 border border-slate-200 group-hover:border-slate-300 transition-colors"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Link / CTA */}
                <div className="relative z-10 pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1">
                    Explore Topic
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition-all duration-200">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
