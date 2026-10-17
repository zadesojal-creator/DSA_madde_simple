import React from 'react';
import type { TraceStep } from '../../types/trace';
import { BookOpen, Variable, CheckCircle2 } from 'lucide-react';

interface StepExplanationProps {
  currentStep?: TraceStep;
  totalSteps: number;
}

export const StepExplanation: React.FC<StepExplanationProps> = ({ currentStep, totalSteps }) => {
  if (!currentStep) {
    return null;
  }

  const variables = currentStep.variables || {};
  const variableKeys = Object.keys(variables);

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4 shadow-md text-slate-900">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Step Explanation
          </h4>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
          {currentStep.stepIndex + 1} of {totalSteps}
        </span>
      </div>

      {/* Step Title */}
      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          {currentStep.isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{currentStep.title}</span>
        </h3>
        
        {/* Description Paragraph */}
        <p className="text-sm text-slate-600 leading-relaxed pt-1">
          {currentStep.description}
        </p>
      </div>

      {/* Variables Monitor Box */}
      {variableKeys.length > 0 && (
        <div className="pt-3 border-t border-slate-200">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-2 font-medium">
            <Variable className="w-3.5 h-3.5 text-purple-600" />
            <span>Active Variables State</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {variableKeys.map((key) => (
              <div
                key={key}
                className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs font-mono"
              >
                <span className="text-slate-500">{key}:</span>
                <span className="text-indigo-900 font-bold">{String(variables[key])}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
