import React from 'react';
import { 
  PlayCircle, 
  Eye, 
  Code2, 
  History, 
  TrendingUp, 
  ShieldAlert, 
  Sliders 
} from 'lucide-react';
import { FEATURE_HIGHLIGHTS } from '../data/topicsData';

const iconMap: Record<string, React.ElementType> = {
  PlayCircle,
  Eye,
  Code2,
  History,
  TrendingUp,
  ShieldAlert,
  Sliders
};

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-24 relative bg-slate-50 border-t border-slate-200">
      {/* Background glow */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold uppercase tracking-wider">
            Engine Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Designed for Deep Understanding
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            A look at the interactive features being built into our algorithm visualizer modules.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURE_HIGHLIGHTS.map((feat, idx) => {
            const IconComponent = iconMap[feat.icon] || PlayCircle;

            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 group text-slate-900"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-105 group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-all">
                  <IconComponent className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
