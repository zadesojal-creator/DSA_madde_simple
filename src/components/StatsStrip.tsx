import React from 'react';
import { MousePointerClick, Activity, Gauge, BookOpen } from 'lucide-react';

export const StatsStrip: React.FC = () => {
  const principles = [
    {
      title: "Interactive Learning",
      description: "Direct hands-on interaction with elements and step state controls.",
      icon: MousePointerClick,
      color: "text-indigo-600",
      bg: "bg-indigo-50 border-indigo-200"
    },
    {
      title: "Trace-Based Visualizations",
      description: "Follow precise execution traces and state changes frame by frame.",
      icon: Activity,
      color: "text-violet-600",
      bg: "bg-violet-50 border-violet-200"
    },
    {
      title: "Complexity Insights",
      description: "Understand Big-O space and time bounds as algorithms run.",
      icon: Gauge,
      color: "text-purple-600",
      bg: "bg-purple-50 border-purple-200"
    },
    {
      title: "Beginner-Friendly",
      description: "Clear, plain-English explanations accompanying every active step.",
      icon: BookOpen,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200"
    }
  ];

  return (
    <div className="relative z-20 border-y border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {principles.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index}
                className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-all duration-200"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${item.bg}`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">{item.title}</h2>
                  <p className="text-xs text-slate-600 mt-0.5 leading-snug">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
