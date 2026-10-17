import React from 'react';
import { HOW_IT_WORKS_STEPS } from '../data/topicsData';
import { Compass, PlaySquare, Eye } from 'lucide-react';

const stepIcons = [Compass, PlaySquare, Eye];

export const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 relative bg-slate-100/60 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold uppercase tracking-wider">
            3-Step Workflow
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            From Input to Insight
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            A simple, intuitive process designed to help you master algorithms visually.
          </p>
        </div>

        {/* 3 Steps: Horizontal on Desktop, Vertical on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200 -translate-y-8 z-0 opacity-60"></div>

          {HOW_IT_WORKS_STEPS.map((stepItem, idx) => {
            const IconComponent = stepIcons[idx] || Compass;

            return (
              <div
                key={idx}
                className="relative z-10 flex flex-col p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-300 group text-slate-900"
              >
                {/* Step Number Badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                    {stepItem.step}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>

                {/* Step Title */}
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                  {stepItem.title}
                </h3>

                {/* Step Description */}
                <p className="text-sm text-slate-600 leading-relaxed">
                  {stepItem.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
